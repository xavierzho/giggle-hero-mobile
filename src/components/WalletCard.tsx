import { useEffect, useState, useRef, type CSSProperties } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogin } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { QualificationDialog } from '@/components/QualificationDialog'

export function WalletCard() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { handleLogin, loading, error } = useLogin()
  const userInfo = useAuthStore((state) => state.userInfo)
  const logout = useAuthStore((state) => state.logout)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const loginAttempted = useRef(false) // 使用 ref 避免重复触发

  // 钱包连接后自动触发登录流程
  useEffect(() => {
    const autoLogin = async () => {
      // 检查条件：已连接、有地址、未登录、未在登录中、未尝试过登录
      if (isConnected && address && !userInfo && !isLoggingIn && !loginAttempted.current) {
        console.log('🔐 钱包已连接，触发登录流程...', { address })
        loginAttempted.current = true // 标记已尝试登录
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
        } catch (err) {
          console.error('❌ 登录过程出错:', err)
          // 出错时断开钱包
          disconnect()
        } finally {
          setIsLoggingIn(false)
        }
      }
    }

    autoLogin()
  }, [isConnected, address, userInfo, isLoggingIn, handleLogin, disconnect])

  // 钱包断开时清理用户信息和登录状态
  useEffect(() => {
    if (!isConnected) {
      console.log('🔌 钱包已断开，清理用户信息')
      logout()
      setIsLoggingIn(false)
      loginAttempted.current = false // 重置登录尝试标记
    }
  }, [isConnected, logout])
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
      ? `${origin.replace(/\/$/, '')}/${userInfo.inviteCode}`
      : null;
  const toastContainerStyle: CSSProperties = {
    width: 'min(420px, calc(100vw - 2.5rem))',
  }
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
                    toast.custom(() => (
                      <div
                        className="rounded-2xl bg-[#1f222c] p-4 text-left text-white shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
                        style={toastContainerStyle}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2fbf71] text-white">
                            <Check className="h-5 w-5" strokeWidth={3} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-base font-semibold">邀请链接已复制</div>
                            <div className="mt-1 truncate text-xs text-white/65">{inviteLink}</div>
                          </div>
                        </div>
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="toast-progress h-full w-full rounded-full bg-[#FCD635]"
                            style={{ '--toast-progress-duration': '2800ms' } as CSSProperties}
                          />
                        </div>
                      </div>
                    ), { duration: 2800 })
                  } catch (err) {
                    console.error('复制邀请链接失败', err)
                    toast.custom(() => (
                      <div
                        className="rounded-2xl bg-[#2a1f21] p-4 text-left text-white shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
                        style={toastContainerStyle}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F25F5C] text-white">
                            <X className="h-5 w-5" strokeWidth={3} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-base font-semibold text-[#FCD635]">复制失败，请重试</div>
                          </div>
                        </div>
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="toast-progress h-full w-full rounded-full bg-[#FCD635]"
                            style={{ '--toast-progress-duration': '2500ms' } as CSSProperties}
                          />
                        </div>
                      </div>
                    ), { duration: 2500 })
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

  // 显示错误提示
  if (error) {
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
            <div className="text-center mb-4">
              <p className="text-red-500 text-lg font-semibold">
                {error}
              </p>
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
