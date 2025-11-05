import { useState, useCallback } from 'react'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'
import { login, generateNonce, getLoginMessage, type LoginData } from '@/api'

/**
 * 用户登录 Hook
 */
export function useLogin() {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { disconnect } = useDisconnect()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 执行登录
   * @param inviteCode 可选的邀请码
   * @returns 登录结果，失败时返回 null
   */
  const handleLogin = useCallback(async (inviteCode?: string) => {
    if (!address) {
      setError('请先连接钱包')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // 稍微延迟,确保钱包连接稳定
      await new Promise(resolve => setTimeout(resolve, 500))

      // 1. 生成 nonce
      const nonce = generateNonce()

      // 2. 生成待签名消息
      const message = getLoginMessage(nonce)

      console.log('📝 准备请求签名...')
      console.log('📝 消息内容:', message)
      console.log('📝 钱包地址:', address)

      // 3. 请求用户签名 (会弹出钱包确认框)
      let signature: `0x${string}`
      try {
        console.log('⏳ 调用 signMessageAsync...')
        signature = await signMessageAsync({ message })
        console.log('✅ 签名成功:', signature)
      } catch (signError: any) {
        // 用户取消签名或签名失败
        console.error('❌ 签名失败:', signError)
        console.error('错误类型:', signError?.name)
        console.error('错误消息:', signError?.message)
        
        disconnect()
        setError(signError?.message || '用户取消签名')
        return null
      }

      // 4. 调用登录 API
      console.log('📡 调用登录 API...')
      const response = await login({
        address,
        signature,
        nonce,
        inviteCode,
      })

      // 5. 处理响应
      if (response.code === 0) {
        const loginData = (response as { data: LoginData }).data
        console.log('✅ 登录成功:', loginData)
        
        // 保存到 localStorage
        localStorage.setItem('userInfo', JSON.stringify(loginData))
        localStorage.setItem('userAddress', address.toLowerCase())
        
        return loginData
      } else {
        // API 返回错误
        console.error('❌ 登录失败:', response.msg)
        setError(response.msg)
        disconnect()
        return null
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '登录失败'
      setError(errorMsg)
      console.error('❌ 登录错误:', err)
      disconnect()
      return null
    } finally {
      setLoading(false)
    }
  }, [address, signMessageAsync, disconnect])

  return {
    handleLogin,
    loading,
    error,
  }
}

/**
 * 用户信息管理 Hook
 */
export function useUserInfo() {
  const { address } = useAccount()
  const [userInfo, setUserInfo] = useState<LoginData | null>(() => {
    // 从 localStorage 读取用户信息
    const saved = localStorage.getItem('userInfo')
    const savedAddress = localStorage.getItem('userAddress')
    
    // 只有地址匹配时才返回缓存的用户信息
    if (saved && savedAddress === address?.toLowerCase()) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })

  const clearUserInfo = useCallback(() => {
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userAddress')
    setUserInfo(null)
  }, [])

  const updateUserInfo = useCallback((data: LoginData) => {
    setUserInfo(data)
    localStorage.setItem('userInfo', JSON.stringify(data))
    if (address) {
      localStorage.setItem('userAddress', address.toLowerCase())
    }
  }, [address])

  return {
    userInfo,
    isLoading: false,
    isError: false,
    error: null,
    clearUserInfo,
    updateUserInfo,
  }
}
