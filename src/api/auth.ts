import type { LoginRequest, LoginData, ApiResponse } from './types'

/**
 * API 基础配置
 * 开发环境使用 Vite 代理 /api
 * 生产环境使用完整 URL
 */
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // 开发环境：通过 Vite 代理
  : import.meta.env.VITE_API_BASE_URL || '/api'  // 生产环境：完整 URL

/**
 * POST 请求函数
 */
async function postRequest<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    return {
      code: 500,
      msg: '网络请求失败',
      error: String(error),
    }
  }
}

/**
 * 用户登录/注册
 * @param params 登录参数
 * @returns 用户信息
 */
export async function login(params: LoginRequest): Promise<ApiResponse<LoginData>> {
  return postRequest<LoginData>('/login', params)
}

/**
 * 使用 SWR 获取用户信息
 * @deprecated 暂时不使用,用户信息通过 login 接口返回后保存在本地
 */
export function useUserInfo() {
  return {
    userInfo: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refresh: () => Promise.resolve(),
  }
}

/**
 * 使用 SWR 获取邀请人数
 * @deprecated 邀请人数在 login 接口返回的数据中
 */
export function useInviteCount() {
  return {
    count: 0,
    isLoading: false,
    isError: false,
    error: null,
    refresh: () => Promise.resolve(),
  }
}

/**
 * 生成登录消息
 * @param nonce 随机数
 * @returns 待签名的消息
 */
export function getLoginMessage(nonce: string): string {
  return `Login with ${nonce}`
}

/**
 * 生成随机 nonce
 * @returns 随机字符串
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
