# Web3 Mobile App - AI Agent 开发指南

## 项目概述

这是一个基于 React + TypeScript + Vite 构建的 Web3 移动端 DApp 应用，集成了 RainbowKit、wagmi、viem 等 Web3 技术栈，支持多链多钱包连接，并优化了移动端体验。

### 核心特性
- 🌐 多链支持: Ethereum、Polygon、Optimism、Arbitrum、Base
- 👛 多钱包集成: MetaMask、WalletConnect、Coinbase Wallet
- 📱 移动端优化: Deep Link 钱包唤起、响应式设计
- 🎨 现代 UI: Tailwind CSS + shadcn/ui 组件
- 🔄 数据管理: SWR 自动数据获取与缓存
- ⚡ 快速开发: Vite + HMR + TypeScript

## 技术栈

### 核心框架
- **React 19.1.1**: UI 框架
- **TypeScript 5.9.3**: 类型安全
- **Vite 7.1.7**: 构建工具和开发服务器

### Web3 集成
- **wagmi 2.19.2**: React Hooks for Ethereum
- **viem 2.38.6**: TypeScript Ethereum library
- **@rainbow-me/rainbowkit 2.2.9**: 钱包连接 UI 组件
- **@tanstack/react-query 5.90.6**: 数据同步和缓存

### 样式与 UI
- **Tailwind CSS 3.4.18**: 原子化 CSS 框架
- **shadcn/ui**: 基于 Radix UI 的组件库
- **lucide-react**: 图标库
- **class-variance-authority**: 组件变体管理
- **tailwind-merge**: 样式合并工具

### 数据获取
- **SWR 2.3.6**: 数据获取和缓存策略

### 代码质量
- **ESLint 9.36.0**: 代码检查
- **TypeScript ESLint**: TypeScript 规则
- **React Hooks ESLint Plugin**: React Hooks 规则

## 项目结构

```
web3-mobile-app/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 图片、字体等资源
│   ├── components/        # React 组件
│   │   └── ui/           # shadcn/ui 组件
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── config/            # 配置文件
│   │   └── wagmi.ts      # wagmi/RainbowKit 配置
│   ├── hooks/             # 自定义 Hooks
│   │   └── useApi.ts     # SWR API Hooks
│   ├── lib/               # 工具函数
│   │   └── utils.ts      # 通用工具
│   ├── App.tsx            # 主应用组件
│   ├── App.css            # 应用样式
│   ├── main.tsx           # 应用入口
│   └── index.css          # 全局样式
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.app.json      # App TypeScript 配置
├── tsconfig.node.json     # Node TypeScript 配置
├── tailwind.config.js     # Tailwind CSS 配置
├── postcss.config.js      # PostCSS 配置
├── eslint.config.js       # ESLint 配置
├── package.json           # 依赖管理
└── README.md              # 项目文档
```

## 开发规范

### 1. 代码风格

#### TypeScript
- ✅ 使用严格模式 (`strict: true`)
- ✅ 明确定义函数返回类型
- ✅ 避免使用 `any`，使用 `unknown` 或具体类型
- ✅ 使用接口(`interface`)定义对象类型
- ✅ 使用类型别名(`type`)定义联合类型和工具类型

```typescript
// ✅ 好的示例
interface WalletInfo {
  address: string
  balance: bigint
  chainId: number
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// ❌ 避免
function formatData(data: any) {
  return data.something
}
```

#### React 组件
- ✅ 使用函数组件 + Hooks
- ✅ 组件名使用 PascalCase
- ✅ Props 接口使用 `ComponentNameProps` 命名
- ✅ 使用解构获取 props
- ✅ 将复杂逻辑提取到自定义 Hooks

```typescript
// ✅ 好的示例
interface WalletCardProps {
  address: string
  balance: string
  onDisconnect: () => void
}

function WalletCard({ address, balance, onDisconnect }: WalletCardProps) {
  const formattedAddress = formatAddress(address)
  
  return (
    <Card>
      <CardHeader>{formattedAddress}</CardHeader>
      <CardContent>{balance}</CardContent>
    </Card>
  )
}
```

### 2. Web3 开发规范

#### Wagmi Hooks 使用
```typescript
// ✅ 正确使用 wagmi hooks
import { useAccount, useBalance, useDisconnect } from 'wagmi'

function WalletInfo() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()
  
  // 组件逻辑...
}
```

#### 错误处理
```typescript
// ✅ 处理 Web3 错误
const { data, error, isLoading } = useBalance({ address })

if (error) {
  console.error('获取余额失败:', error)
  return <ErrorDisplay message="无法获取余额" />
}

if (isLoading) {
  return <LoadingSpinner />
}
```

#### 地址验证
```typescript
import { isAddress } from 'viem'

// ✅ 验证以太坊地址
function validateAddress(addr: string): boolean {
  return isAddress(addr)
}
```

### 3. 样式规范

#### Tailwind CSS
- ✅ 使用 Tailwind 工具类优先
- ✅ 使用 `cn()` 工具函数合并类名
- ✅ 响应式设计: 优先移动端 (mobile-first)
- ✅ 使用 CSS 变量定义主题色

```typescript
import { cn } from '@/lib/utils'

// ✅ 正确使用
<button 
  className={cn(
    "px-4 py-2 rounded-lg",
    "hover:bg-accent transition-colors",
    "md:px-6 md:py-3", // 响应式
    isActive && "bg-primary text-primary-foreground"
  )}
>
  按钮
</button>
```

#### shadcn/ui 组件
- ✅ 使用项目中已有的 UI 组件
- ✅ 需要新组件时，从 shadcn/ui 添加: `npx shadcn@latest add [component]`
- ✅ 自定义组件放在 `components/` 目录，UI 组件放在 `components/ui/`

### 4. 数据获取规范

#### 使用 SWR
```typescript
import useSWR from 'swr'

// ✅ 创建可复用的 Hook
export function useEthPrice() {
  const { data, error, isLoading } = useSWR(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  )

  return {
    price: data?.ethereum?.usd,
    isLoading,
    isError: error,
  }
}
```

#### 条件数据获取
```typescript
// ✅ 正确的条件获取
const { data } = useSWR(
  address ? `/api/balance/${address}` : null, // address 为空时不请求
  fetcher
)
```

### 5. 路径别名

使用 `@` 别名引用 `src` 目录:

```typescript
// ✅ 使用路径别名
import { Button } from '@/components/ui/button'
import { useEthPrice } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { config } from '@/config/wagmi'

// ❌ 避免相对路径
import { Button } from '../../components/ui/button'
```

### 6. 环境变量

在项目根目录创建 `.env` 文件:

```env
# WalletConnect Project ID (必需)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# API 配置 (可选)
VITE_API_BASE_URL=https://api.example.com
```

在代码中使用:
```typescript
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
```

## 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run build

# 代码检查
npm run lint

# 预览生产构建
npm run preview
```

## 添加新组件

### 添加 shadcn/ui 组件
```bash
# 查看可用组件
npx shadcn@latest add

# 添加特定组件
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
```

### 创建自定义组件
```typescript
// src/components/TokenBalance.tsx
interface TokenBalanceProps {
  address: string
  tokenSymbol: string
}

export function TokenBalance({ address, tokenSymbol }: TokenBalanceProps) {
  const { data: balance, isLoading } = useBalance({ address })
  
  if (isLoading) return <Skeleton className="h-8 w-32" />
  
  return (
    <div className="text-2xl font-bold">
      {balance?.formatted} {tokenSymbol}
    </div>
  )
}
```

## 移动端优化建议

### 1. Deep Link 钱包唤起
RainbowKit 已配置 Deep Link，在移动设备上点击连接会自动唤起钱包 App。

### 2. 响应式设计
```typescript
// ✅ 使用响应式工具类
<div className="
  px-4 py-2           /* 移动端 */
  md:px-6 md:py-4     /* 平板 */
  lg:px-8 lg:py-6     /* 桌面 */
">
  内容
</div>
```

### 3. 触摸优化
```typescript
// ✅ 增大点击区域
<button className="min-h-[44px] min-w-[44px] p-3">
  点击
</button>
```

## 安全注意事项

1. **私钥管理**: 永远不要在前端存储或处理私钥
2. **地址验证**: 使用 `isAddress()` 验证所有地址输入
3. **交易确认**: 发送交易前显示明确的确认信息
4. **网络验证**: 检查用户连接的网络是否正确
5. **金额显示**: 使用适当的精度显示代币金额

```typescript
// ✅ 安全的金额格式化
import { formatUnits } from 'viem'

function formatTokenAmount(amount: bigint, decimals: number): string {
  return formatUnits(amount, decimals)
}
```

## 调试技巧

### 1. React Query DevTools
```typescript
// main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 2. 检查钱包连接状态
```typescript
const { address, isConnected, isConnecting, isDisconnected } = useAccount()

console.log({
  address,
  isConnected,
  isConnecting,
  isDisconnected,
})
```

### 3. 网络错误处理
```typescript
import { BaseError } from 'wagmi'

try {
  // Web3 操作
} catch (error) {
  if (error instanceof BaseError) {
    console.error('Web3 错误:', error.shortMessage)
  }
}
```

## 性能优化

### 1. 组件懒加载
```typescript
import { lazy, Suspense } from 'react'

const NFTGallery = lazy(() => import('@/components/NFTGallery'))

<Suspense fallback={<LoadingSpinner />}>
  <NFTGallery />
</Suspense>
```

### 2. SWR 缓存策略
```typescript
// 针对不同数据配置不同的缓存策略
useSWR(key, fetcher, {
  refreshInterval: 30000,      // 自动刷新
  revalidateOnFocus: false,    // 聚焦时不重新验证
  dedupingInterval: 2000,      // 去重间隔
})
```

### 3. 避免不必要的重渲染
```typescript
import { memo } from 'react'

// 使用 memo 包装纯展示组件
export const TokenCard = memo(({ token, balance }: TokenCardProps) => {
  return <Card>...</Card>
})
```

## 部署配置

### Vercel 部署
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_WALLETCONNECT_PROJECT_ID": "@walletconnect_project_id"
  }
}
```

### Netlify 部署
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## AI Agent 协作指南

当 AI Agent 协助开发时，请遵循以下原则:

### 1. 理解上下文
- 🔍 在修改代码前，先阅读相关文件了解现有实现
- 📚 参考项目中已有的模式和风格
- 🎯 确保新代码与现有代码风格一致

### 2. 最佳实践
- ✅ 优先使用项目中已有的组件和工具
- ✅ 添加新功能时，考虑是否需要创建可复用的 Hook
- ✅ 编写类型安全的代码，避免使用 `any`
- ✅ 为复杂逻辑添加注释说明

### 3. 代码修改
- 📝 使用 `replace_string_in_file` 工具精确修改代码
- 🧪 修改后使用 `get_errors` 检查错误
- 🎨 确保样式符合移动端优化要求
- 🔒 遵循 Web3 安全最佳实践

### 4. 测试验证
- ✅ 检查 TypeScript 编译错误
- ✅ 运行 ESLint 检查代码质量
- ✅ 在开发服务器中测试功能
- ✅ 验证移动端响应式表现

### 5. 文档更新
- 📄 添加新功能时更新相关文档
- 💬 为公共 API 添加 JSDoc 注释
- 📋 更新 README.md 说明新特性

## 常见问题解决

### Q: WalletConnect 无法连接?
A: 确保设置了正确的 `VITE_WALLETCONNECT_PROJECT_ID` 环境变量

### Q: 样式不生效?
A: 检查 Tailwind CSS 配置，确保文件路径包含在 `content` 数组中

### Q: TypeScript 报错?
A: 运行 `npm run build` 查看详细错误信息

### Q: 移动端钱包无法唤起?
A: 确保在 HTTPS 环境下测试，或使用 ngrok 等工具创建安全隧道

### Q: SWR 数据不更新?
A: 检查 `refreshInterval` 和 `revalidateOnFocus` 配置

## 参考资源

- [wagmi 文档](https://wagmi.sh)
- [RainbowKit 文档](https://www.rainbowkit.com)
- [viem 文档](https://viem.sh)
- [SWR 文档](https://swr.vercel.app)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [React 文档](https://react.dev)

## 许可证

本项目仅供学习和开发使用。

---

**最后更新**: 2025年11月4日
**版本**: 1.0.0
