import { useAuthStore } from '@/store/useAuthStore'

export function Hero() {
  const backgroundImage = useAuthStore((state) => state.backgroundImage)

  const backgroundStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : undefined

  return (
    <div 
      className="pointer-events-none absolute inset-x-0 top-[4.9375rem] bottom-[6.5rem] z-0 bg-transparent bg-cover bg-center bg-no-repeat"
      style={backgroundStyle}
    />
  )
}
