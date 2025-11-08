import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

interface QualificationDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function QualificationDialog({ isOpen, onClose }: QualificationDialogProps) {
  const address = useAuthStore((state) => state.userInfo?.address)

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-md rounded-2xl p-6 relative"
          style={{
            background: 'linear-gradient(180deg, rgba(24, 26, 33, 0.98) 0%, rgba(24, 26, 33, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* 标题 */}
          <h2 
            className="text-2xl font-bold text-center mb-4"
            style={{ color: '#3CB11F' }}
          >
            绑定后，可获得邀请好友资格！
          </h2>

          {/* 提示文字 */}
          <p 
            className="text-[18px] text-center mb-6 leading-relaxed"
            style={{ color: '#FCD635' }}
          >
            注：绑定后不可更改，请检查是否您好友钱包地址！（绑定后会有空投奖励给好友）
          </p>

          {/* 绑定钱包信息 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 rounded-[2rem] bg-[rgba(34,37,45,0.92)] px-6 py-3 text-left text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <div className="flex-shrink-0 text-sm text-white/60">绑定钱包：</div>
              <div className="flex-1 overflow-hidden">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-base tracking-wide text-white">
                  {address ?? '--'}
                </div>
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <Button
            onClick={onClose}
            variant="yellow"
            className="w-full h-12 text-base"
          >
            我知道了
          </Button>
        </div>
      </div>
    </>
  )
}
