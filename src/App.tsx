import { Navbar } from '@/components/Navbar'
import { Banner } from '@/components/Banner'
import { Hero } from '@/components/Hero'
import { WalletCard } from '@/components/WalletCard'
import { TabBar } from '@/components/TabBar'

function App() {
  return (
    <div className="h-screen overflow-hidden">
      {/* 主要内容区域 - 背景图 */}
      <Hero />
      
      {/* 顶部导航栏 */}
      <Navbar />
      
      {/* 横幅 */}
      <Banner />
      
      {/* 钱包连接卡片 */}
      <WalletCard />
      
      {/* 底部标签栏 */}
      <TabBar />
    </div>
  )
}

export default App
