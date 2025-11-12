import { useState, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { login, generateNonce, getLoginMessage, type LoginData } from "@/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * 用户登录 Hook
 */
export function useLogin() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);

  /**
   * 执行登录
   * @param inviteCode 可选的邀请码
   * @returns 登录结果，失败时抛出错误
   */
  const handleLogin = useCallback(
    async (inviteCode?: string) => {
      if (!address) {
        throw new Error("请先连接钱包");
      }

      setLoading(true);

      try {
        // 稍微延迟,确保钱包连接稳定
        await new Promise(resolve => setTimeout(resolve, 500));

        // 1. 生成 nonce
        const nonce = generateNonce();

        // 2. 生成待签名消息
        const message = getLoginMessage(nonce);

        console.log("📝 准备请求签名...");
        console.log("📝 消息内容:", message);
        console.log("📝 钱包地址:", address);

        // 3. 请求用户签名 (会弹出钱包确认框)
        let signature: `0x${string}`;
        try {
          console.log("⏳ 调用 signMessageAsync...");
          signature = await signMessageAsync({ message });
          console.log("✅ 签名成功:", signature);
        } catch (signError: unknown) {
          // 用户取消签名或签名失败
          console.error("❌ 签名失败:", signError);
          const errorMsg = signError instanceof Error ? signError.message : "用户取消签名";
          throw new Error(errorMsg);
        }

        // 4. 调用登录 API
        console.log("📡 调用登录 API...");
        const response = await login({
          address,
          signature,
          nonce,
          inviteCode,
        });

        // 5. 处理响应
        if (response.code === 0) {
          const loginData = (response as { data: LoginData }).data;
          console.log("✅ 登录成功:", loginData);

          // 保存到 store (会自动处理 localStorage 和背景图片)
          useAuthStore.getState().setUserInfo(loginData);

          return loginData;
        } else {
          // API 返回错误
          console.error("❌ 登录失败:", response.msg);
          throw new Error(response.msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [address, signMessageAsync]
  );

  return {
    handleLogin,
    loading,
  };
}

/**
 * 用户信息管理 Hook
 */
export function useUserInfo() {
  const userInfo = useAuthStore(state => state.userInfo);
  const logout = useAuthStore(state => state.logout);
  const setUserInfo = useAuthStore(state => state.setUserInfo);

  return {
    userInfo,
    isLoading: false,
    isError: false,
    error: null,
    clearUserInfo: logout,
    updateUserInfo: setUserInfo,
  };
}
