import useSWR from 'swr'

// 通用 fetcher 函数
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

// 使用示例: 获取 ETH 价格
export function useEthPrice() {
  const { data, error, isLoading } = useSWR(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    fetcher,
    {
      refreshInterval: 30000, // 每30秒刷新一次
      revalidateOnFocus: false,
    }
  )

  return {
    price: data?.ethereum?.usd,
    isLoading,
    isError: error,
  }
}

// 获取代币余额的 hook (使用 SWR)
export function useTokenBalance(address: string | undefined, tokenAddress: string) {
  const shouldFetch = address && tokenAddress
  
  const { data, error, isLoading } = useSWR(
    shouldFetch ? `/api/balance/${address}/${tokenAddress}` : null,
    fetcher,
    {
      refreshInterval: 10000, // 每10秒刷新
    }
  )

  return {
    balance: data?.balance,
    isLoading,
    isError: error,
  }
}

// 获取交易历史的 hook
export function useTransactionHistory(address: string | undefined) {
  const { data, error, isLoading } = useSWR(
    address ? `/api/transactions/${address}` : null,
    fetcher
  )

  return {
    transactions: data?.transactions || [],
    isLoading,
    isError: error,
  }
}

// 获取 NFT 集合的 hook
export function useNFTCollection(address: string | undefined) {
  const { data, error, isLoading } = useSWR(
    address ? `/api/nfts/${address}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 60秒内不重复请求
    }
  )

  return {
    nfts: data?.nfts || [],
    isLoading,
    isError: error,
  }
}
