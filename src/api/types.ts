/**
 * API 类型定义
 */

/** 用户信息 */
export interface UserRow {
  address: string          // 小写地址
  inviter: string | null   // 邀请人地址
  invite_code: string      // 邀请码
  created_at: string       // ISO 时间戳
}

/** 登录请求参数 */
export interface LoginRequest {
  address: `0x${string}`      // 钱包地址
  signature: `0x${string}`    // 签名
  nonce: string               // 随机数
  inviteCode?: string         // 可选：邀请码
}

/** 登录响应数据 */
export interface LoginData {
  address: `0x${string}`           // 用户地址
  inviter: `0x${string}` | null    // 邀请人地址
  isNew: boolean                   // 是否新用户
  count: number                    // 邀请人数
  inviteCode: string | null        // 用户的邀请码，未开放则为 null
}

/** API 成功响应 */
export interface ApiSuccess<T> {
  code: 0
  msg: string
  data: T
}

/** API 错误响应 */
export interface ApiError {
  code: number
  msg: string
  error?: string
}

/** API 响应联合类型 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError
