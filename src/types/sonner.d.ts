declare module 'sonner' {
  import type { ReactNode } from 'react'

  interface ToastOptions {
    description?: ReactNode
    duration?: number
    className?: string
  }

  interface ToasterProps {
    theme?: 'light' | 'dark' | 'system'
    position?:
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right'
    richColors?: boolean
    toastOptions?: ToastOptions
  }

  export function Toaster(props: ToasterProps): ReactNode

  interface ToastInstance {
    id: string
    dismiss: () => void
  }

  interface ToastAPI {
    success: (message: ReactNode, options?: ToastOptions) => void
    error: (message: ReactNode, options?: ToastOptions) => void
    info: (message: ReactNode, options?: ToastOptions) => void
    custom: (
      renderer: (toast: ToastInstance) => ReactNode,
      options?: ToastOptions
    ) => void
  }

  export const toast: ToastAPI
}

