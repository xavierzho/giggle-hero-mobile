import { useEffect, useState, useCallback, useRef } from 'react'
import { useAccount, useChainId } from 'wagmi'
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
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { handleLogin, loading } = useLogin()
  const userInfo = useAuthStore((state) => state.userInfo)
  const logout = useAuthStore((state) => state.logout)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const pendingLoginRef = useRef(false)

  const switchToBsc = useCallback(async () => {
      if (isSwitchingNetwork) {
        return false
      }

      const ethereum =
        typeof window !== 'undefined'
          ? (window as typeof window & {
              ethereum?: {
                request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>
              }
            }).ethereum
          : undefined

      if (!ethereum || typeof ethereum.request !== 'function') {
        console.error('未检测到可用的钱包提供者')
        toast.custom(
          () => <ConnectErrorToast message="未检测到钱包，请安装或打开钱包应用" />,
          { duration: 3000 },
        )
        return false
      }

      const targetChainIdHex = `0x${bsc.id.toString(16)}`

      setIsSwitchingNetwork(true)

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainIdHex }],
        })
        return true
      } catch (switchError) {
        const error = switchError as { code?: number }
        console.error('切换至 BSC 网络失败:', error)

        if (error?.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: targetChainIdHex,
                  chainName: 'Binance Smart Chain',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18,
                  },
                  rpcUrls: ['https://bsc-dataseed.binance.org'],
                  blockExplorerUrls: ['https://bscscan.com'],
                },
              ],
            })

            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetChainIdHex }],
            })

            return true
          } catch (addError) {
            const addErrorCode = (addError as { code?: number })?.code
            console.error('添加 BSC 网络失败:', addError)

            if (addErrorCode !== 4001) {
              toast.custom(
                () => <ConnectErrorToast message="添加 BSC 网络失败，请稍后再试" />,
                { duration: 3000 },
              )
            }

            return false
          }
        }

        if (error?.code === 4001) {
          return false
        }

        toast.custom(
          () => <ConnectErrorToast message="切换网络失败，请在钱包中手动切换至 BSC" />,
          { duration: 3000 },
        )

        return false
      } finally {
        setIsSwitchingNetwork(false)
      }
    },
    [isSwitchingNetwork],
  )

  const performLogin = useCallback(async () => {
    if (loading) {
      pendingLoginRef.current = false
      return
    }

    if (userInfo) {
      pendingLoginRef.current = false
      return
    }

    try {
      const params = new URLSearchParams(window.location.search)
      const inviteCodeParam = params.get('inviteCode') ?? params.get('invite')

      if (inviteCodeParam) {
        console.log('📨 检测到邀请码:', inviteCodeParam)
      }

      await handleLogin(inviteCodeParam || undefined)

      toast.custom(() => <ConnectSuccessToast />, { duration: 2000 })
    } catch (err) {
      console.error('登录过程出错:', err)
      const errorMsg = err instanceof Error ? err.message : '登录失败'
      toast.custom(() => <ConnectErrorToast message={errorMsg} />, { duration: 3000 })
    } finally {
      pendingLoginRef.current = false
    }
  }, [loading, userInfo, handleLogin])

  const attemptSwitchAndLogin = useCallback(async () => {
    const switched = await switchToBsc()

    if (!switched) {
      pendingLoginRef.current = false
      return
    }

    await performLogin()
  }, [switchToBsc, performLogin])

  const handlePrimaryAction = useCallback(
    async (openConnectModal: () => void) => {
      if (loading || isSwitchingNetwork) {
        return
      }

      const hasEligibility =
        !!(userInfo?.inviteCode && String(userInfo.inviteCode).trim().length > 0)

      if (userInfo) {
        if (!hasEligibility) {
          setShowDialog(true)
        }
        return
      }

      pendingLoginRef.current = true

      if (!isConnected) {
        openConnectModal()
        return
      }

      if (chainId == null) {
        return
      }

      if (chainId !== bsc.id) {
        await attemptSwitchAndLogin()
        return
      }

      await performLogin()
    },
    [
      loading,
      isSwitchingNetwork,
      userInfo,
      setShowDialog,
      isConnected,
      chainId,
      attemptSwitchAndLogin,
      performLogin,
    ],
  )

  useEffect(() => {
    if (!pendingLoginRef.current) {
      return
    }

    if (!isConnected) {
      return
    }

    if (loading || isSwitchingNetwork) {
      return
    }

    if (userInfo) {
      pendingLoginRef.current = false
      return
    }

    if (chainId == null) {
      return
    }

    if (chainId !== bsc.id) {
      void attemptSwitchAndLogin()
      return
    }

    void performLogin()
  }, [
    isConnected,
    chainId,
    loading,
    isSwitchingNetwork,
    userInfo,
    attemptSwitchAndLogin,
    performLogin,
  ])

  // 钱包断开时清理用户信息
  useEffect(() => {
    if (!isConnected) {
      pendingLoginRef.current = false
      setIsSwitchingNetwork(false)

      if (userInfo) {
        console.log('🔌 钱包已断开，清理用户信息')
        logout()
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
  const switchingChain = isSwitchingNetwork
  const notConnected = !isConnected
  const needsLogin = isConnected && !wrongChain && !userInfo
  const notEligible = isConnected && !wrongChain && userInfo && !eligible
  const inviteLink =
    eligible && userInfo?.inviteCode
      ? `${origin.replace(/\/$/, '')}?inviteCode=${userInfo.inviteCode}`
      : null
  const statusColor = (() => {
    if (notConnected) return '#FCD635'
    if (wrongChain) return '#F97950'
    if (switchingChain) return '#FCD635'
    if (loading) return '#FCD635'
    if (needsLogin) return '#FCD635'
    if (notEligible) return '#F97950'
    return '#89E333'
  })()
  const statusMessage = (() => {
    if (notConnected) return '连接钱包后生成邀请链接！'
    if (wrongChain) return '请切换至 BSC 链后重试'
    if (switchingChain) return '正在切换至 BSC 网络...'
    if (loading) return '正在请求签名授权...'
    if (needsLogin) return '点击下方按钮完成签名授权'
    if (notEligible) return '⚠️ 很抱歉～您还未满足需求！⚠️'
    return '🎉 恭喜您～获得邀请好友资格！'
  })()
  const secondaryMessage = (() => {
    if (switchingChain) return '请在钱包中确认网络切换'
    if (loading) return '请在钱包中确认签名'
    if (needsLogin) return '签名后即可生成邀请链接'
    return null
  })()
  const buttonLabel = (() => {
    if (switchingChain) return '切换中...'
    if (loading) return '授权中...'
    if (notConnected) return '连接钱包'
    if (wrongChain) return '切换到BSC'
    if (needsLogin) return '签名授权'
    if (notEligible) return '获取资格'
    return '已连接'
  })()
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
            {({ openConnectModal }) => (
              <Button
                onClick={() => handlePrimaryAction(openConnectModal)}
                variant="yellow"
                className="w-full h-14 text-lg"
                disabled={loading || switchingChain}
              >
                {buttonLabel}
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
