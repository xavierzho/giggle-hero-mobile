import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { watchChainId } from '@wagmi/core'
import { useAccount, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConnectErrorToast, ConnectSuccessToast } from '@/components/CopyToast'
import { config as wagmiConfig } from '@/config/wagmi'
import { bsc } from 'wagmi/chains'
import { useLogin } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'

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
  const isBscChain = chainId != null && Number(chainId) === bsc.id
  const isWrongSupportedChain = chainId != null && Number(chainId) !== bsc.id

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

  const handlePrimaryAction = useCallback(
    async (openConnectModal: () => void, openChainModal?: () => void) => {
      if (!isConnected) {
        console.log('[WalletCard] 用户点击连接钱包，打开连接弹窗')
        openConnectModal()
        return
      }

      if (isBscChain) {
        if (userInfo) {
          console.log('[WalletCard] 已在 BSC 且已完成登录，无需重复授权')
          return
        }

        console.log('[WalletCard] 用户在 BSC 网络下点击按钮，触发签名登录流程')
        await performLogin()
        return
      }

      if (isWrongSupportedChain) {
        console.log('[WalletCard] 用户在非 BSC 网络下点击按钮，提示手动切换')
        toast.custom(() => <ConnectErrorToast message="请在钱包中切换到 BSC 网络后重试" />, {
          duration: 3000,
        })
        openChainModal?.()
        return
      }
    },
    [isConnected, isBscChain, isWrongSupportedChain, userInfo, performLogin],
  )

  const buttonLabel = useMemo(() => {
    if (!isConnected) return '连接钱包'
    if (isBscChain && !userInfo) {
      if (isSigning || loginLoading) return '授权中...'
      if (loginError) return '重新签名'
      return '签名授权'
    }
    if (isWrongSupportedChain) return '切换到BSC'
    return '已连接'
  }, [isConnected, isBscChain, isWrongSupportedChain, userInfo, isSigning, loginLoading, loginError])

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
            <p className="text-lg font-semibold" style={{ color: '#FCD635' }}>
              {status}
            </p>
            {secondary && <p className="mt-2 text-sm text-gray-400">{secondary}</p>}
          </div>

          <ConnectButton.Custom>
            {({ openConnectModal, openChainModal }) => (
              <Button
                variant="yellow"
                className="w-full h-14 text-lg"
                onClick={() => handlePrimaryAction(openConnectModal, openChainModal)}
                disabled={isSigning || loginLoading}
              >
                {buttonLabel}
              </Button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  )
}
