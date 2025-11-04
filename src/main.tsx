import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import type { Theme } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'

import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

// 自定义 RainbowKit 主题
const customTheme: Theme = darkTheme({
  accentColor: '#FCD635',
  accentColorForeground: '#181A21',
  borderRadius: 'large',
  overlayBlur: 'small',
})

// 覆盖主题颜色
customTheme.colors.modalBackground = '#181A21'
customTheme.colors.modalBorder = '#2A2D35'
customTheme.colors.modalText = '#FFFFFF'
customTheme.colors.modalTextSecondary = '#9CA3AF'
customTheme.colors.closeButton = '#6B7280'
customTheme.colors.closeButtonBackground = '#2A2D35'
customTheme.radii.modal = '1rem'
customTheme.radii.modalMobile = '1rem'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={customTheme}
          modalSize="compact"
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
