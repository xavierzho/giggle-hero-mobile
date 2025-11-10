import { useEffect, useState, useRef } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useLogin } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { QualificationDialog } from '@/components/QualificationDialog'
import {
  CopyToastSuccess,
  CopyToastError,
  ConnectSuccessToast,
  ConnectErrorToast,
  DisconnectToast
} from '@/components/CopyToast'

export function WalletCard() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { handleLogin, loading } = useLogin()
  const userInfo = useAuthStore((state) => state.userInfo)
  const logout = useAuthStore((state) => state.logout)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const prevConnectedRef = useRef(false) // 记录上一次的连接状态

  // 监听钱包连接状态变化，仅在从未连接变为已连接时触发登录
  useEffect(() => {
    const wasConnected = prevConnectedRef.current
    const isNowConnected = isConnected

    // 更新连接状态记录
    prevConnectedRef.current = isNowConnected

    // 只在状态从 false -> true 时触发登录
    if (!wasConnected && isNowConnected && address && !userInfo && !isLoggingIn) {
      console.log('🔐 钱包刚连接，触发登录流程...', { address })

      const autoLogin = async () => {
        setIsLoggingIn(true)

        try {
          // 获取 URL 中的邀请码
          const params = new URLSearchParams(window.location.search)
          const inviteCode = params.get('invite')

          if (inviteCode) {
            console.log('📨 检测到邀请码:', inviteCode)
          }

          console.log('🚀 开始调用 handleLogin...')

          // 弹出签名确认 (handleLogin 内部会自动调用 store.setUserInfo)
          await handleLogin(inviteCode || undefined)

          // 登录成功提示
          toast.custom(() => <ConnectSuccessToast />, { duration: 2000 })
        } catch (err) {
          console.error('❌ 登录过程出错:', err)
          // 出错时断开钱包并显示错误提示
          disconnect()
          const errorMsg = err instanceof Error ? err.message : '登录失败'
          toast.custom(() => <ConnectErrorToast message={errorMsg} />, { duration: 3000 })
        } finally {
          setIsLoggingIn(false)
        }
      }

      autoLogin()
    }
  }, [isConnected, address, userInfo, isLoggingIn, handleLogin, disconnect])

  // 钱包断开时清理用户信息和登录状态
  useEffect(() => {
    if (!isConnected && userInfo) {
      console.log('🔌 钱包已断开，清理用户信息')
      logout()
      setIsLoggingIn(false)
      toast.custom(() => <DisconnectToast />, { duration: 2000 })
    }
  }, [isConnected, userInfo, logout])
// ✅ 只有非空字符串才算有资格
  const eligible = !!(userInfo?.inviteCode && String(userInfo.inviteCode).trim().length > 0);
  const origin =
    typeof window !== 'undefined' && window.location
      ? window.location.origin
      : 'https://gigglehero.io';
  const notConnected = !isConnected;
  const notEligible = isConnected && userInfo && !eligible;
  const inviteLink =
    eligible && userInfo?.inviteCode
      ? `${origin.replace(/\/$/, '')}?invite=${userInfo.inviteCode}`
      : null;
  // 已连接且已登录(有 inviter)显示邀请信息
  if (isConnected && userInfo && eligible) {
    return (
      <div className="fixed bottom-[6.25rem] left-0 right-0 z-30 px-4 pb-4">
        <div className="container mx-auto max-w-2xl">
          <div
            className="rounded-[1.5rem] p-6 shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(24, 26, 33, 0.95) 0%, rgba(24, 26, 33, 0.98) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* 提示文字 */}
            <div className="text-center mb-4">
              <p
                className="text-lg font-semibold"
                style={{ color: '#89E333' }}
              >
                🎉  恭喜您～获得邀请好友资格！  🎉
              </p>
            </div>

            {/* 邀请人地址和复制按钮 */}
            <div className="flex w-full items-center gap-3">
              <div className="flex-1 min-w-0 rounded-[2rem] bg-[rgba(34,37,45,0.92)] px-5 py-4 text-left text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm tracking-wide text-white">
                  {inviteLink ?? '--'}
                </div>
              </div>
              <Button
                onClick={async () => {
                  if (!inviteLink) return
                  try {
                    await navigator.clipboard.writeText(inviteLink)
                    toast.custom(() => <CopyToastSuccess link={inviteLink} />, { duration: 2800 })
                  } catch (err) {
                    console.error('复制邀请链接失败', err)
                    toast.custom(() => <CopyToastError />, { duration: 2500 })
                  }
                }}
                variant="yellow"
                className="h-11 flex-shrink-0 rounded-[1.75rem] px-6 text-base"
              >
                复制
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-[6.25rem] left-0 right-0 z-30 px-4 pb-4">
      <div className="container mx-auto max-w-2xl">
        <div
          className="rounded-[1.5rem] p-6 shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(24, 26, 33, 0.95) 0%, rgba(24, 26, 33, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* 提示文字 */}
          <div className="text-center mb-4">
            <p
              className="text-lg font-semibold"
              style={{ color: notConnected ? '#FCD635' : notEligible ? '#F97950' : '#89E333' }}
            >
              {notConnected
                ? '连接钱包后生成邀请链接！'
                : notEligible
                  ? '⚠️ 很抱歉～您还未满足需求！⚠️'
                  : (loading || isLoggingIn ? '正在请求签名授权...' : '🎉 恭喜您～获得邀请好友资格！')}
            </p>

            {(loading || isLoggingIn) && (
              <p className="text-gray-400 text-sm mt-2">请在钱包中确认签名</p>
            )}
          </div>

          {/* 连接钱包按钮 */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button
                onClick={() => {
                  if (notConnected) return openConnectModal();
                  if (notEligible) return setShowDialog(true); // 打开“获取资格”弹窗
                }}
                variant="yellow"
                className="w-full h-14 text-lg"
                disabled={loading || isLoggingIn}
              >
                {notConnected
                  ? '连接钱包'
                  : notEligible
                    ? '获取资格'
                    : (loading || isLoggingIn ? '授权中...' : '已连接')}
              </Button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>

      {/* 获取资格弹窗 */}
      <QualificationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </div>
  )
}
