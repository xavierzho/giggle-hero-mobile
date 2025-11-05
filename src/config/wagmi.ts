import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  bitgetWallet,
  metaMaskWallet,
  okxWallet,
  tokenPocketWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { bsc, bscTestnet } from 'wagmi/chains'

// 获取 WalletConnect Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c2a20bfa84a9d441f2b0bfef94244bd5'

// 调试信息
console.log('🔑 WalletConnect Project ID:', projectId)

export const config = getDefaultConfig({
  appName: 'Giggle DApp',
  projectId,
  chains: [bsc, bscTestnet], // 使用 BSC 链
  ssr: false,
  wallets: [
    {
      groupName: '移动钱包',
      wallets: [
        okxWallet,
        bitgetWallet,
        metaMaskWallet,
        (params) => {
          const wallet = tokenPocketWallet(params)
          return {
            ...wallet,
            name: 'TokenPocket (TP)',
          }
        },
      ],
    },
  ],
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
