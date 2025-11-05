import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Banner } from '@/components/Banner'
import { WalletCard } from '@/components/WalletCard'
import { TabBar } from '@/components/TabBar'
import { MinePage } from '@/components/MinePage'
import { ActivityRules } from '@/components/ActivityRules'
import { Hero } from '@/components/Hero'

function App() {
  const [activeTab, setActiveTab] = useState<'invite' | 'rules' | 'mine'>('invite')

  return (
    <div className="h-screen overflow-hidden bg-brand-dark text-white">
      {activeTab === 'invite' && <Hero />}
      <Navbar />
      {activeTab === 'invite' && (
        <>
          <Banner />
          <WalletCard />
        </>
      )}
      {activeTab === 'rules' && <ActivityRules />}
      {activeTab === 'mine' && <MinePage />}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
