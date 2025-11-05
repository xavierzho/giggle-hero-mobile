import { useEffect, useState, useRef } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { useLogin, useUserInfo } from '@/hooks/useAuth'

export function WalletCard() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { handleLogin, loading, error } = useLogin()
  const { userInfo, updateUserInfo, clearUserInfo } = useUserInfo()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
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
          
          // 弹出签名确认
          const result = await handleLogin(inviteCode || undefined)
          
          if (result) {
            console.log('✅ 登录成功，保存用户信息')
            updateUserInfo(result)
          } else {
            console.log('❌ 登录失败或被取消')
          }
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
  }, [isConnected, address, userInfo, isLoggingIn, handleLogin, disconnect, updateUserInfo])

  // 钱包断开时清理用户信息和登录状态
  useEffect(() => {
    if (!isConnected) {
      console.log('🔌 钱包已断开，清理用户信息')
      clearUserInfo()
      setIsLoggingIn(false)
      loginAttempted.current = false // 重置登录尝试标记
    }
  }, [isConnected, clearUserInfo])

  // 已连接且已登录则不显示此卡片
  if (isConnected && userInfo) {
    return null
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
            <p className="text-brand-yellow text-lg font-semibold">
              {loading || isLoggingIn ? '正在请求签名授权...' : '连接钱包后生成邀请连接！'}
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
                onClick={openConnectModal}
                variant="yellow"
                className="w-full h-14 text-lg"
                disabled={loading || isLoggingIn}
              >
                {loading || isLoggingIn ? '授权中...' : '连接钱包'}
              </Button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  )
}
