import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'

// 获取 WalletConnect Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c2a20bfa84a9d441f2b0bfef94244bd5'

// 调试信息
console.log('🔑 WalletConnect Project ID:', projectId)

export const config = getDefaultConfig({
  appName: 'Giggle DApp',
  projectId,
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
