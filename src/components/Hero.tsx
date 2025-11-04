import initBg from '@/assets/init.png'

export function Hero() {
  return (
    <div 
      className="fixed inset-0 z-0 pt-[9.6875rem] pb-[6.25rem] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${initBg})`,
      }}
    >
    </div>
  )
}
