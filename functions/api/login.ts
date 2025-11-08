import {createPublicClient, formatEther, http, isAddress, parseEther, verifyMessage} from "viem";
import {bsc} from "viem/chains";
const evm = createPublicClient({
  chain:bsc,
  transport: http()
})
const erc20abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
]
export interface UserRow {
  address: string;          // 小写地址
  inviter: string | null;   // 可能为空
  invite_code: string;
  created_at: string;       // ISO
  balance?: number;
}
export interface CountRow {
  cnt: number;
}
/** ==== D1 查询工具（强类型） ==== */
async function queryOne<T>(
  db: D1Database,
  sql: string,
  binds: unknown[] = []
): Promise<T | null> {
  const stmt = db.prepare(sql).bind(...binds as unknown[]);
  const row = await stmt.first<T>(); // 返回 null | T
  return (row ?? null) as T | null;
}

async function exec(
  db: D1Database,
  sql: string,
  binds: unknown[] = []
): Promise<void> {
  await db.prepare(sql).bind(...binds as unknown[]).run();
}

interface LoginReq {
  address: `0x${string}`;
  signature: `0x${string}`;
  nonce: string;
  inviteCode?: string;
}
type ApiOk<T> = { code: 0; msg: string; data: T };
type ApiErr = { code: number; msg: string; error?: string };
type ApiResp<T> = ApiOk<T> | ApiErr;
function json<T>(data: ApiResp<T>, status = 200): Response {
  return Response.json(data, {status});
}
interface LoginData {
  address: `0x${string}`;
  inviter: `0x${string}` | null;
  isNew: boolean;
  count?: number;
  inviteCode?: string;
}
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const {request, env} = context;
  try {
    const body = await request.json<LoginReq>()
    const { address, signature, nonce, inviteCode } = body;
    if (!address || !signature || !nonce || !isAddress(address)) {
      return json<LoginData>({ code: 400, msg: "缺少参数" }, 400);
    }
    const resp: LoginData = {
      address: body.address.toLowerCase() as `0x${string}`,
      isNew: false,
      count: 0,
      inviter: null
    }
    // 1) 验证签名（message 需与前端完全一致）
    const verified = await verifyMessage({
      address,
      message: `Login with ${nonce}`,
      signature,
      // chainId 可不写；若你固定 BSC，可加 chainId: 56
    });
    if (!verified) {
      return json<LoginData>({ code: 401, msg: "签名验证失败" }, 401);
    }

    const addrLower = address.toLowerCase();

    // 检查 users 表是否存在 balance 字段（兼容旧 schema）
    const columnInfo = await env.gigglehero
      .prepare("PRAGMA table_info(users)")
      .all<{ name: string }>();
    const columnResults = columnInfo?.results ?? [];
    const hasBalanceColumn = columnResults.some((col) => col.name === "balance");

    // 2) 查现有用户（强类型）
    type UserRowBase = Pick<UserRow, "address" | "inviter" | "invite_code" | "created_at">;
    let userRow: (UserRowBase & { balance?: number }) | null = null;

    if (hasBalanceColumn) {
      userRow = await queryOne<UserRow>(
        env.gigglehero,
        "SELECT address, inviter, invite_code, created_at, balance FROM users WHERE address = ?",
        [addrLower]
      );
    } else {
      userRow = await queryOne<UserRowBase>(
        env.gigglehero,
        "SELECT address, inviter, invite_code, created_at FROM users WHERE address = ?",
        [addrLower]
      );
    }

    if (userRow) {
      // 已存在，统计下级数量（强类型）
      const countRow = await queryOne<CountRow>(
        env.gigglehero,
        "SELECT COUNT(*) AS cnt FROM users WHERE inviter = ?",
        [userRow.inviter?.toLowerCase() ?? ""]
      );
      // console.log(countRow);
      resp.count = countRow?.cnt ?? 0;
      const existingBalance = Number(userRow.balance ?? 0);
      if ((userRow.inviter && isAddress(userRow.inviter)) || existingBalance > 0) {
        resp.inviter = userRow.inviter as `0x${string}`;
        resp.inviteCode = userRow.invite_code
      }
      return json<LoginData>({
        code: 0,
        msg: "登录成功",
        data: resp,
      });
    }

    // 3) 新用户：通过邀请码查邀请人
    let inviter: `0x${string}` | null = null;
    if (inviteCode) {
      const inviterRow = await queryOne<Pick<UserRow, "address">>(
        env.gigglehero,
        "SELECT address FROM users WHERE invite_code = ?",
        [inviteCode]
      );
      inviter = inviterRow ? inviterRow.address.toLowerCase() as `0x${string}`: null;
    }

    // 4) 写入新用户（生成新邀请码）
    const newInviteCode = crypto.randomUUID().slice(0, 8);
    resp.isNew = true;
    let canInvite = false;
    let balance: bigint = 0n;
    const tokenAddress = env.TOKEN as `0x${string}` | undefined;
    if (!inviter) {
      if (!tokenAddress) {
        console.warn('[login] 环境变量 TOKEN 缺失，跳过余额校验');
      } else {
        try {
          balance = await evm.readContract({
            abi: erc20abi,
            address: tokenAddress,
            functionName: "balanceOf",
            args: [addrLower as `0x${string}`],
          }) as bigint;
          if (balance >= parseEther('1')) {
            canInvite = true;
          }
        } catch (error) {
          console.error('[login] 读取代币余额失败', error);
        }
      }
    } else {
      canInvite = true;
    }
    if (canInvite) {
      resp.inviteCode = newInviteCode;
      resp.inviter = inviter
    }

    if (hasBalanceColumn) {
      await exec(
        env.gigglehero,
        "INSERT INTO users (address, inviter, invite_code, created_at, balance) VALUES (?, ?, ?, ?, ?)",
        [addrLower, inviter, newInviteCode, new Date().toISOString(), formatEther(balance)]
      );
    } else {
      await exec(
        env.gigglehero,
        "INSERT INTO users (address, inviter, invite_code, created_at) VALUES (?, ?, ?, ?)",
        [addrLower, inviter, newInviteCode, new Date().toISOString()]
      );
    }
    return json<LoginData>({
      code: 0,
      msg: "注册并登录成功",
      data: resp,
    });
  } catch (err: unknown) {
    return json<LoginData>(
      { code: 500, msg: "服务器异常", error: String(err) },
      500
    );
  }


}
