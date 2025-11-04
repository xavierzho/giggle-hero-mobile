import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import logo from '@/assets/logo.png'

export function Navbar() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent py-3 px-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-[3.4375rem] w-[3.4375rem] object-contain" />
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button 
                  onClick={openConnectModal}
                  variant="default"
                >
                  连接钱包
                </Button>
              )}
            </ConnectButton.Custom>
          ) : (
            <div className="flex items-center gap-2">
              <div className="rounded-[1rem] py-2 px-4 bg-brand-secondary">
                <span className="text-sm font-medium text-white">
                  {formatAddress(address!)}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => disconnect()}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
