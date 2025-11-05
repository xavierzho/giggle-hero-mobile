import { useAuthStore } from '@/store/useAuthStore'

export function Hero() {
  const backgroundImage = useAuthStore((state) => state.backgroundImage)
  
  return (
    <div 
      className="fixed inset-x-0 top-[4.9375rem] bottom-[6.5rem] z-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
    </div>
  )
}
