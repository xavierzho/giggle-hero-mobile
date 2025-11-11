import { useEffect, useState, useRef, useCallback } from 'react'
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
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
import { bsc } from 'wagmi/chains'

export function WalletCard() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain()
  const { handleLogin, loading } = useLogin()
  const userInfo = useAuthStore((state) => state.userInfo)
  const logout = useAuthStore((state) => state.logout)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const loginAttemptedRef = useRef(false)
  const hasAttemptedSwitchRef = useRef(false)
  const chainModalRef = useRef<(() => void) | null>(null)
  const chainModalOpenedRef = useRef(false)
  const switchChainToastShownRef = useRef(false)
  const showManualSwitchPrompt = useCallback(() => {
    if (!switchChainToastShownRef.current) {
      toast.custom(() => <ConnectErrorToast message="请在钱包中切换到 BSC 网络后继续" />, { duration: 3000 })
      switchChainToastShownRef.current = true
    }

    if (!chainModalOpenedRef.current) {
      chainModalOpenedRef.current = true
      setTimeout(() => {
        chainModalRef.current?.()
      }, 0)
    }
  }, [])

  // 检查并强制切换到 BSC 网络
  useEffect(() => {
    if (!isConnected) {
      hasAttemptedSwitchRef.current = false
      chainModalOpenedRef.current = false
      switchChainToastShownRef.current = false
      setIsSwitchingNetwork(false)
      return
    }

    if (chainId == null) {
      return
    }

    if (chainId === bsc.id) {
      hasAttemptedSwitchRef.current = false
      chainModalOpenedRef.current = false
      switchChainToastShownRef.current = false
      setIsSwitchingNetwork(false)
      return
    }

    if (hasAttemptedSwitchRef.current) {
      return
    }

    hasAttemptedSwitchRef.current = true

    if (!switchChainAsync) {
      showManualSwitchPrompt()
      setIsSwitchingNetwork(false)
      return
    }

    const enforceChain = async () => {
      setIsSwitchingNetwork(true)

      try {
        await switchChainAsync({ chainId: bsc.id })
      } catch (error) {
        console.error('❌ 切换到 BSC 网络失败:', error)
        showManualSwitchPrompt()
      } finally {
        setIsSwitchingNetwork(false)
      }
    }

    enforceChain()
  }, [isConnected, chainId, switchChainAsync, showManualSwitchPrompt])

  // 监听钱包连接状态变化，仅在满足条件时触发登录
  useEffect(() => {
    if (!isConnected || !address) {
      loginAttemptedRef.current = false
      return
    }

    if (chainId != null && chainId !== bsc.id) {
      return
    }

    if (isSwitchingNetwork || isSwitchingChain) {
      return
    }

    if (userInfo || isLoggingIn || loginAttemptedRef.current) {
      return
    }

    loginAttemptedRef.current = true

    const autoLogin = async () => {
      setIsLoggingIn(true)

      try {
        const params = new URLSearchParams(window.location.search)
        const inviteCodeParam = params.get('inviteCode') ?? params.get('invite')

        if (inviteCodeParam) {
          console.log('📨 检测到邀请码:', inviteCodeParam)
        }

        console.log('🚀 开始调用 handleLogin...')

        await handleLogin(inviteCodeParam || undefined)

        toast.custom(() => <ConnectSuccessToast />, { duration: 2000 })
      } catch (err) {
        console.error('❌ 登录过程出错:', err)
        disconnect()
        const errorMsg = err instanceof Error ? err.message : '登录失败'
        toast.custom(() => <ConnectErrorToast message={errorMsg} />, { duration: 3000 })
      } finally {
        setIsLoggingIn(false)
        loginAttemptedRef.current = false
      }
    }

    autoLogin()
  }, [
    isConnected,
    address,
    chainId,
    userInfo,
    isLoggingIn,
    isSwitchingNetwork,
    isSwitchingChain,
    handleLogin,
    disconnect,
  ])

  // 钱包断开时清理用户信息和登录状态
  useEffect(() => {
    if (!isConnected) {
      loginAttemptedRef.current = false
      hasAttemptedSwitchRef.current = false
      chainModalOpenedRef.current = false
      switchChainToastShownRef.current = false
      setIsSwitchingNetwork(false)

      if (userInfo) {
        console.log('🔌 钱包已断开，清理用户信息')
        logout()
        setIsLoggingIn(false)
        toast.custom(() => <DisconnectToast />, { duration: 2000 })
      }
    }
  }, [isConnected, userInfo, logout])
  // ✅ 只有非空字符串才算有资格
  const eligible = !!(userInfo?.inviteCode && String(userInfo.inviteCode).trim().length > 0)
  const origin =
    typeof window !== 'undefined' && window.location
      ? window.location.origin
      : 'https://gigglehero.io'
  const wrongChain = isConnected && chainId != null && chainId !== bsc.id
  const switchingChain = isSwitchingNetwork || isSwitchingChain
  const notConnected = !isConnected
  const notEligible = isConnected && !wrongChain && userInfo && !eligible
  const inviteLink =
    eligible && userInfo?.inviteCode
      ? `${origin.replace(/\/$/, '')}?inviteCode=${userInfo.inviteCode}`
      : null
  const statusColor = (() => {
    if (notConnected) return '#FCD635'
    if (wrongChain) return '#F97950'
    if (switchingChain) return '#FCD635'
    if (notEligible) return '#F97950'
    return '#89E333'
  })()
  const statusMessage = (() => {
    if (notConnected) return '连接钱包后生成邀请链接！'
    if (wrongChain) return '请切换至 BSC 链后重试'
    if (switchingChain) return '正在切换至 BSC 网络...'
    if (loading || isLoggingIn) return '正在请求签名授权...'
    if (notEligible) return '⚠️ 很抱歉～您还未满足需求！⚠️'
    return '🎉 恭喜您～获得邀请好友资格！'
  })()
  const secondaryMessage = (() => {
    if (switchingChain) return '请在钱包中确认网络切换'
    if (loading || isLoggingIn) return '请在钱包中确认签名'
    return null
  })()
  const buttonLabel = (() => {
    if (notConnected) return '连接钱包'
    if (switchingChain) return '切换中...'
    if (wrongChain) return '切换到BSC'
    if (notEligible) return '获取资格'
    if (loading || isLoggingIn) return '授权中...'
    return '已连接'
  })()
  const handlePrimaryAction = async (openConnectModal: () => void, openChainModal?: () => void) => {
    if (notConnected) {
      openConnectModal()
      return
    }

    if (switchingChain) {
      return
    }

    if (wrongChain) {
      if (switchChainAsync) {
        try {
          await switchChainAsync({ chainId: bsc.id })
          return
        } catch (error) {
          console.error('❌ 切换到 BSC 网络失败:', error)
        }
      }

      if (openChainModal) {
        chainModalRef.current = openChainModal
      }

      chainModalOpenedRef.current = false
      switchChainToastShownRef.current = false
      showManualSwitchPrompt()
      return
    }

    if (notEligible) {
      setShowDialog(true)
    }
  }
  // 已连接且已登录(有 inviter)显示邀请信息
  if (isConnected && !wrongChain && userInfo && eligible) {
    return (
      <div
        className="fixed left-0 right-0 z-30 px-4 pb-4"
        style={{ bottom: 'calc(var(--safe-area-bottom) + 6.25rem)' }}
      >
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
    <div
      className="fixed left-0 right-0 z-30 px-4 pb-4"
      style={{ bottom: 'calc(var(--safe-area-bottom) + 6.25rem)' }}
    >
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
            <p className="text-lg font-semibold" style={{ color: statusColor }}>
              {statusMessage}
            </p>

            {secondaryMessage && (
              <p className="mt-2 text-sm text-gray-400">{secondaryMessage}</p>
            )}
          </div>

          {/* 连接钱包按钮 */}
          <ConnectButton.Custom>
            {({ openConnectModal, openChainModal }) => {
              chainModalRef.current = openChainModal

              return (
                <Button
                  onClick={() => handlePrimaryAction(openConnectModal, openChainModal)}
                  variant="yellow"
                  className="w-full h-14 text-lg"
                  disabled={loading || isLoggingIn || switchingChain}
                >
                  {buttonLabel}
                </Button>
              )
            }}
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
