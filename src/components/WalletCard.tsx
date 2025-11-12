import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { watchChainId } from '@wagmi/core'
import { useAccount, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  ConnectErrorToast,
  ConnectSuccessToast,
  CopyToastError,
  CopyToastSuccess,
} from '@/components/CopyToast'
import { config as wagmiConfig } from '@/config/wagmi'
import { bsc } from 'wagmi/chains'
import { useLogin } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { QualificationDialog } from '@/components/QualificationDialog'

export function WalletCard() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { handleLogin, loading: loginLoading } = useLogin()
  const userInfo = useAuthStore((state) => state.userInfo)
  const [status, setStatus] = useState('连接钱包后生成邀请链接！')
  const [secondary, setSecondary] = useState<string | null>('请点击下方按钮连接钱包')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState(false)
  const successToastShownRef = useRef(false)
  const manualToastShownRef = useRef(false)
  const lastChainIdRef = useRef<number | null>(null)
  const loginInProgressRef = useRef(false)
  const [showDialog, setShowDialog] = useState(false)
  const isBscChain = chainId != null && Number(chainId) === bsc.id
  const isWrongSupportedChain = chainId != null && Number(chainId) !== bsc.id
  const wrongChain = isConnected && isWrongSupportedChain
  const notConnected = !isConnected
  const signingOrLoading = isSigning || loginLoading
  const trimmedInviteCode = userInfo?.inviteCode != null ? String(userInfo.inviteCode).trim() : ''
  const eligible = trimmedInviteCode.length > 0
  const needsLogin = isConnected && isBscChain && !userInfo
  const notEligible = isConnected && isBscChain && !!userInfo && !eligible
  const hasInviteQualification = isConnected && !wrongChain && !!userInfo && eligible
  const origin =
    typeof window !== 'undefined' && window.location
      ? window.location.origin
      : 'https://gigglehero.io'
  const inviteLink = hasInviteQualification
    ? `${origin.replace(/\/$/, '')}?inviteCode=${trimmedInviteCode}`
    : null

  const performLogin = useCallback(async () => {
    if (loginInProgressRef.current) {
      console.log('[WalletCard] 登录流程已在进行中，忽略重复触发')
      return
    }

    loginInProgressRef.current = true
    setIsSigning(true)
    setLoginError(null)
    setStatus('正在请求签名授权...')
    setSecondary('请在钱包中确认签名')

    try {
      const params = new URLSearchParams(window.location.search)
      const inviteCodeParam = params.get('inviteCode') ?? params.get('invite')

      if (inviteCodeParam) {
        console.log('[WalletCard] 检测到邀请码参数:', inviteCodeParam)
      }

      await handleLogin(inviteCodeParam || undefined)

      console.log('[WalletCard] 签名登录成功')
      toast.custom(() => <ConnectSuccessToast />, { duration: 2000 })
      successToastShownRef.current = true
      manualToastShownRef.current = false
      setStatus('钱包已连接，当前网络为 BSC')
      setSecondary(null)
      setLoginError(null)
    } catch (err) {
      console.error('[WalletCard] 登录流程出错:', err)
      const message = err instanceof Error ? err.message : '登录失败'
      setLoginError(message)
      toast.custom(() => <ConnectErrorToast message={message} />, { duration: 3000 })
    } finally {
      loginInProgressRef.current = false
      setIsSigning(false)
    }
  }, [handleLogin])

  useEffect(() => {
    lastChainIdRef.current = chainId ?? null
  }, [chainId])

  useEffect(() => {
    const unwatch = watchChainId(wagmiConfig, {
      onChange(newChainId) {
        console.log('[WalletCard] 监听到链变化:', lastChainIdRef.current, '=>', newChainId)
        successToastShownRef.current = false
        manualToastShownRef.current = false
        lastChainIdRef.current = newChainId ?? null
        setStatus('检测到网络变更')
        setSecondary('正在同步链信息...')
      },
    })

    return () => {
      unwatch()
    }
  }, [])

  useEffect(() => {
    if (!isConnected) {
      setStatus('连接钱包后生成邀请链接！')
      setSecondary('请点击下方按钮连接钱包')
      if (loginError !== null) {
        setLoginError(null)
      }
      if (isSigning) {
        setIsSigning(false)
      }
      loginInProgressRef.current = false
      successToastShownRef.current = false
      manualToastShownRef.current = false
      return
    }

    if (chainId == null) {
      setStatus('正在获取当前网络...')
      setSecondary('请稍候，正在同步链信息')
      return
    }

    if (isBscChain) {
      manualToastShownRef.current = false

      if (userInfo) {
        setStatus('钱包已连接，当前网络为 BSC')
        setSecondary(null)

        if (!successToastShownRef.current) {
          console.log('[WalletCard] 当前链 ID 为 BSC，展示成功提示')
          toast.custom(() => <ConnectSuccessToast />, { duration: 2000 })
          successToastShownRef.current = true
        }

        if (loginError !== null) {
          setLoginError(null)
        }

        return
      }

      if (isSigning || loginInProgressRef.current || loginLoading) {
        setStatus('正在请求签名授权...')
        setSecondary('请在钱包中确认签名')
        return
      }

      if (loginError) {
        setStatus('签名授权未完成')
        setSecondary(`请重试：${loginError}`)
        return
      }

      setStatus('即将发起签名，请稍候')
      setSecondary('如未弹出签名，请点击下方按钮重试')
      return
    }

    console.log('[WalletCard] 检测到非 BSC 网络，提醒用户手动切换 ->', chainId)
    setStatus('检测到非 BSC 网络')
    setSecondary('请手动切换至 BSC 网络后继续')
    successToastShownRef.current = false

    if (isSigning) {
      setIsSigning(false)
    }

    loginInProgressRef.current = false

    if (loginError !== null) {
      setLoginError(null)
    }

    if (!manualToastShownRef.current) {
      toast.custom(() => <ConnectErrorToast message="请在钱包中切换到 BSC 网络" />, {
        duration: 3000,
      })
      manualToastShownRef.current = true
    }
  }, [isConnected, chainId, userInfo, isSigning, loginError, loginLoading, isBscChain])

  useEffect(() => {
    if (!isConnected) {
      return
    }

    if (!isBscChain) {
      return
    }

    if (userInfo) {
      return
    }

    if (loginError) {
      console.warn('[WalletCard] 存在未处理的登录错误，暂不自动重试')
      return
    }

    if (isSigning || loginInProgressRef.current || loginLoading) {
      return
    }

    void performLogin()
  }, [isConnected, isBscChain, userInfo, loginError, performLogin, isSigning, loginLoading])

  useEffect(() => {
    if (showDialog && !notEligible) {
      setShowDialog(false)
    }
  }, [showDialog, notEligible])

  const handlePrimaryAction = useCallback(
    async (openConnectModal: () => void, openChainModal?: () => void) => {
      if (!isConnected) {
        console.log('[WalletCard] 用户点击连接钱包，打开连接弹窗')
        openConnectModal()
        return
      }

      if (wrongChain) {
        console.log('[WalletCard] 用户在非 BSC 网络下点击按钮，提示手动切换')
        toast.custom(() => <ConnectErrorToast message="请在钱包中切换到 BSC 网络后重试" />, {
          duration: 3000,
        })
        openChainModal?.()
        return
      }

      if (notEligible) {
        console.log('[WalletCard] 用户暂未具备邀请资格，展示获取资格弹窗')
        setShowDialog(true)
        return
      }

      if (needsLogin) {
        console.log('[WalletCard] 用户在 BSC 网络下点击按钮，触发签名登录流程')
        await performLogin()
        return
      }
    },
    [isConnected, wrongChain, notEligible, needsLogin, performLogin],
  )

  const handleCopyInviteLink = useCallback(async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.custom(() => <CopyToastSuccess link={inviteLink} />, { duration: 2800 })
    } catch (err) {
      console.error('[WalletCard] 复制邀请链接失败', err)
      toast.custom(() => <CopyToastError />, { duration: 2500 })
    }
  }, [inviteLink])

  const statusColor = useMemo(() => {
    if (notConnected) return '#FCD635'
    if (wrongChain) return '#F97950'
    if (signingOrLoading) return '#FCD635'
    if (needsLogin) return '#FCD635'
    if (notEligible) return '#F97950'
    if (hasInviteQualification) return '#89E333'
    return '#FCD635'
  }, [notConnected, wrongChain, signingOrLoading, needsLogin, notEligible, hasInviteQualification])

  const statusMessage = useMemo(() => {
    if (notConnected) return '连接钱包后生成邀请链接！'
    if (wrongChain) return '请切换至 BSC 链后重试'
    if (signingOrLoading) return '正在请求签名授权...'
    if (notEligible) return '⚠️ 很抱歉～您还未满足需求！⚠️'
    if (needsLogin) {
      if (loginError) {
        return status
      }
      return '点击下方按钮完成签名授权'
    }
    if (hasInviteQualification) return '🎉 恭喜您～获得邀请好友资格！'
    return status
  }, [
    notConnected,
    wrongChain,
    signingOrLoading,
    notEligible,
    needsLogin,
    hasInviteQualification,
    loginError,
    status,
  ])

  const secondaryMessage = useMemo(() => {
    if (signingOrLoading) return '请在钱包中确认签名'
    if (loginError) return secondary
    if (needsLogin) return '签名后即可生成邀请链接'
    return secondary
  }, [signingOrLoading, loginError, needsLogin, secondary])

  const buttonLabel = useMemo(() => {
    if (signingOrLoading) return '授权中...'
    if (notConnected) return '连接钱包'
    if (wrongChain) return '切换到BSC'
    if (needsLogin) return loginError ? '重新签名' : '签名授权'
    if (notEligible) return '获取资格'
    return '连接中'
  }, [signingOrLoading, notConnected, wrongChain, needsLogin, loginError, notEligible])

  if (hasInviteQualification) {
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
            <div className="text-center mb-4">
              <p className="text-lg font-semibold" style={{ color: '#89E333' }}>
                🎉 恭喜您～获得邀请好友资格！
              </p>
            </div>

            <div className="flex w-full items-center gap-3">
              <div className="flex-1 min-w-0 rounded-[2rem] bg-[rgba(34,37,45,0.92)] px-5 py-4 text-left text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm tracking-wide text-white">
                  {inviteLink ?? '--'}
                </div>
              </div>
              <Button
                onClick={handleCopyInviteLink}
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
          <div className="text-center mb-4">
            <p className="text-lg font-semibold" style={{ color: statusColor }}>
              {statusMessage}
            </p>
            {secondaryMessage && <p className="mt-2 text-sm text-gray-400">{secondaryMessage}</p>}
          </div>

          <ConnectButton.Custom>
            {({ openConnectModal, openChainModal }) => (
              <Button
                variant="yellow"
                className="w-full h-14 text-lg"
                onClick={() => handlePrimaryAction(openConnectModal, openChainModal)}
                disabled={signingOrLoading}
              >
                {buttonLabel}
              </Button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>

      <QualificationDialog isOpen={showDialog} onClose={() => setShowDialog(false)} />
    </div>
  )
}
