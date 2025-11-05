import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { useUserInfo } from '@/hooks/useAuth'

// ERC20 ABI
const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export function UserInfoCard() {
  const { address, isConnected, chain } = useAccount()
  const { userInfo, isLoading } = useUserInfo()

  // 获取 BNB 余额
  const { data: bnbBalance } = useBalance({
    address,
  })

  // 获取 Token 余额
  const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS as `0x${string}` | undefined
  const { data: tokenBalance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    },
  })

  if (!isConnected || !address) {
    return null
  }

  if (isLoading) {
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
            <p className="text-center text-white">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (balance: bigint | undefined, decimals: number = 18) => {
    if (!balance) return '0'
    const formatted = formatUnits(balance, decimals)
    return parseFloat(formatted).toFixed(4)
  }

  return (
    <div className="fixed bottom-[6.25rem] left-0 right-0 z-30 px-4 pb-4">
      <div className="container mx-auto max-w-2xl">
        <div 
          className="rounded-[1.5rem] p-6 shadow-2xl space-y-4"
          style={{
            background: 'linear-gradient(180deg, rgba(24, 26, 33, 0.95) 0%, rgba(24, 26, 33, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* 地址 */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">钱包地址</p>
            <p className="text-white font-mono text-lg">{formatAddress(address)}</p>
            <p className="text-gray-400 text-xs mt-1">{chain?.name || 'BSC'}</p>
          </div>

          {/* 余额信息 */}
          <div className="grid grid-cols-2 gap-4">
            {/* BNB 余额 */}
            <div className="bg-brand-secondary rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">BNB 余额</p>
              <p className="text-white text-xl font-bold">
                {formatBalance(bnbBalance?.value)}
              </p>
            </div>

            {/* Token 余额 */}
            <div className="bg-brand-secondary rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Token 余额</p>
              <p className="text-brand-yellow text-xl font-bold">
                {formatBalance(tokenBalance as bigint)}
              </p>
            </div>
          </div>

          {/* 邀请信息 */}
          {userInfo && (
            <div className="border-t border-gray-700 pt-4 space-y-2">
              {userInfo.inviteCode && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">我的邀请码:</span>
                  <span className="text-brand-yellow font-mono font-semibold">
                    {userInfo.inviteCode}
                  </span>
                </div>
              )}
              
              {userInfo.inviter && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">邀请人:</span>
                  <span className="text-white font-mono text-sm">
                    {formatAddress(userInfo.inviter)}
                  </span>
                </div>
              )}

              {typeof userInfo.count === 'number' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">已邀请人数:</span>
                  <span className="text-brand-yellow font-semibold text-lg">
                    {userInfo.count}
                  </span>
                </div>
              )}

              {userInfo.isNew && (
                <div className="text-center mt-2">
                  <span className="inline-block bg-brand-yellow text-brand-dark px-3 py-1 rounded-full text-sm font-semibold">
                    🎉 新用户
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
