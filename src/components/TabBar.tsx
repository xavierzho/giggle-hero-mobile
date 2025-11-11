import { Users, FileText, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabId = 'invite' | 'rules' | 'mine'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

interface TabBarProps {
  activeTab: TabId
  onTabChange: (tabId: TabId) => void
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

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-brand-dark shadow-lg"
      style={{ paddingBottom: 'var(--safe-area-bottom)' }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
  )
}
