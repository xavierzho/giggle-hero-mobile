import { Navbar } from '@/components/Navbar'
import { Banner } from '@/components/Banner'
import { Hero } from '@/components/Hero'
import { WalletCard } from '@/components/WalletCard'
import { TabBar } from '@/components/TabBar'

function App() {
  return (
    <div className="h-screen overflow-hidden">
      <Hero />
      <Navbar />
      <Banner />
      <WalletCard />
      <TabBar />
    </div>
  )
}

export default App
