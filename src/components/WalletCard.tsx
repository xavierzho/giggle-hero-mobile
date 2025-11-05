import { useEffect, useState, useRef } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
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

  // 已连接且已登录(有 inviter)显示邀请信息
  if (isConnected && userInfo && userInfo.inviter !== null) {
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
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-lg px-4 py-3 text-white text-sm font-mono overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                {userInfo.inviter}
              </div>
              <Button
                onClick={() => {
                  if (userInfo.inviteCode) {
                    const inviteUrl = `${window.location.origin}?invite=${userInfo.inviteCode}`
                    navigator.clipboard.writeText(inviteUrl)
                    // TODO: 显示复制成功提示
                    console.log('复制邀请链接:', inviteUrl)
                  }
                }}
                variant="yellow"
                className="px-6 h-auto text-base"
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
              style={{
                color: userInfo?.inviteCode === null ? '#F97950' : '#FCD635'
              }}
            >
              {userInfo?.inviteCode === null
                ? '⚠️ 很抱歉～您还未满足需求！⚠️'
                : (loading || isLoggingIn ? '正在请求签名授权...' : '连接钱包后生成邀请连接！')
              }
            </p>
            {(loading || isLoggingIn) && (
              <p className="text-gray-400 text-sm mt-2">
                请在钱包中确认签名
              </p>
            )}
          </div>

          {/* 连接钱包按钮 */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button
                onClick={() => {
                  if (userInfo?.inviteCode === null) {
                    setShowDialog(true)
                  } else {
                    openConnectModal()
                  }
                }}
                variant="yellow"
                className="w-full h-14 text-lg"
                disabled={loading || isLoggingIn}
              >
                {userInfo?.inviteCode === null
                  ? '获取资格'
                  : (loading || isLoggingIn ? '授权中...' : '连接钱包')
                }
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
