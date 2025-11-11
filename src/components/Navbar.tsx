import { ConnectButton } from '@rainbow-me/rainbowkit'
import logo from '@/assets/logo.png'

export function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-transparent px-4"
      style={{
        paddingTop: 'calc(var(--safe-area-top) + 0.75rem)',
        paddingBottom: '0.75rem',
      }}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-[3.4375rem] w-[3.4375rem] object-contain" />
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center gap-3">
          <ConnectButton 
            chainStatus="none"
            showBalance={true}
            label="连接钱包"
          />
        </div>
      </div>
    </nav>
  )
}
