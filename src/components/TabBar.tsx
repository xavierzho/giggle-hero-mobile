import { useState } from 'react'
import { Users, FileText, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  {
    id: 'invite',
    label: '邀请',
    icon: <Users className="w-6 h-6" />
  },
  {
    id: 'rules',
    label: '规则',
    icon: <FileText className="w-6 h-6" />
  },
  {
    id: 'mine',
    label: '我的',
    icon: <User className="w-6 h-6" />
  }
]

export function TabBar() {
  const [activeTab, setActiveTab] = useState('invite')
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-brand-dark shadow-lg">
        <div className="container mx-auto">
          <div className="grid grid-cols-3 gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 transition-all duration-300 relative group",
                  activeTab === tab.id
                    ? "text-brand-yellow"
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <div className="mb-2 transition-all duration-300">
                  {tab.icon}
                </div>
                <span className={cn(
                  "text-sm font-medium transition-all duration-300",
                  activeTab === tab.id ? "font-semibold" : ""
                )}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}