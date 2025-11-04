import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'

export function WalletCard() {
  const { isConnected } = useAccount()

  if (isConnected) {
    return null // 已连接则不显示卡片
  }

  return (
    <div className="fixed bottom-[6.25rem] left-0 right-0 z-30 px-4 pb-4">
      <div className="container mx-auto max-w-2xl">
        <div 
          className="rounded-[1.5rem] p-6 shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(24, 26, 33, 0.95) 0%, rgba(24, 26, 33, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* 提示文字 */}
          <div className="text-center mb-4">
            <p className="text-brand-yellow text-lg font-semibold">
              连接钱包后生成邀请连接！
            </p>
          </div>

          {/* 连接钱包按钮 */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button 
                onClick={openConnectModal}
                variant="yellow"
                className="w-full h-14 text-lg"
              >
                连接钱包
              </Button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  )
}
