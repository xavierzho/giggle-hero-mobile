import { Button } from '@/components/ui/button'

interface QualificationDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function QualificationDialog({ isOpen, onClose }: QualificationDialogProps) {
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
            className="text-[26px] font-bold text-center mb-4"
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
