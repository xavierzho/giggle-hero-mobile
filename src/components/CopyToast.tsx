import { type CSSProperties } from 'react'
import { Check, XCircle, Info, AlertTriangle } from 'lucide-react'

const toastContainerStyle: CSSProperties = {
  width: 'min(420px, calc(100vw - 2.5rem))',
}

interface CopyToastSuccessProps {
  link: string
  duration?: number
}

export function CopyToastSuccess({ link, duration = 2800 }: CopyToastSuccessProps) {
  return (
    <div
      className="rounded-2xl bg-[#1f222c] p-4 text-left text-white shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
      style={toastContainerStyle}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#34D399] to-[#10B981] shadow-lg">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold">邀请链接已复制</div>
          <div className="mt-1 truncate text-xs text-white/65">{link}</div>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="toast-progress h-full w-full rounded-full bg-[#FCD635]"
          style={{ '--toast-progress-duration': `${duration}ms` } as CSSProperties}
        />
      </div>
    </div>
  )
}

interface CopyToastErrorProps {
  duration?: number
}

export function CopyToastError({ duration = 2500 }: CopyToastErrorProps) {
  return (
    <div
      className="rounded-2xl bg-[#2a1f21] p-4 text-left text-white shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
      style={toastContainerStyle}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FCA5A5] to-[#F87171] shadow-lg">
          <XCircle className="h-6 w-6" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-[#FCD635]">复制失败，请重试</div>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="toast-progress h-full w-full rounded-full bg-[#FCD635]"
          style={{ '--toast-progress-duration': `${duration}ms` } as CSSProperties}
        />
      </div>
    </div>
  )
}

interface ConnectSuccessToastProps {
  duration?: number
}

export function ConnectSuccessToast({ duration = 2000 }: ConnectSuccessToastProps) {
  return (
    <div
      className="rounded-2xl bg-[#1f222c] p-4 text-left text-white shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
      style={toastContainerStyle}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#34D399] to-[#10B981] shadow-lg">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold">钱包连接成功</div>
          <div className="mt-1 text-xs text-white/65">已完成签名授权</div>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="toast-progress h-full w-full rounded-full bg-[#FCD635]"
          style={{ '--toast-progress-duration': `${duration}ms` } as CSSProperties}
        />
      </div>
    </div>
  )
}

interface ConnectErrorToastProps {
  message: string
  duration?: number
}

export function ConnectErrorToast({ message, duration = 3000 }: ConnectErrorToastProps) {
  return (
    <div
      className="rounded-2xl bg-[#2a1f21] p-4 text-left text-white shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
      style={toastContainerStyle}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FED7AA] to-[#FB923C] shadow-lg">
          <AlertTriangle className="h-6 w-6" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-[#FCD635]">连接失败</div>
          <div className="mt-1 truncate text-xs text-white/65">{message}</div>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="toast-progress h-full w-full rounded-full bg-[#FCD635]"
          style={{ '--toast-progress-duration': `${duration}ms` } as CSSProperties}
        />
      </div>
    </div>
  )
}

interface DisconnectToastProps {
  duration?: number
}

export function DisconnectToast({ duration = 2000 }: DisconnectToastProps) {
  return (
    <div
      className="rounded-2xl bg-[#1f222c] p-4 text-left text-white shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
      style={toastContainerStyle}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#A5B4FC] to-[#818CF8] shadow-lg">
          <Info className="h-6 w-6" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold">钱包已断开</div>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="toast-progress h-full w-full rounded-full bg-[#FCD635]"
          style={{ '--toast-progress-duration': `${duration}ms` } as CSSProperties}
        />
      </div>
    </div>
  )
}
