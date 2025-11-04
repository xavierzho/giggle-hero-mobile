export function Banner() {
  return (
    <div className="fixed left-0 right-0 z-40 top-[4.9375rem] px-4 mt-[3.5rem]">
      <div className="container mx-auto">
        <div className="flex flex-col items-start">
          {/* 第一行：奖励空投10% */}
          <div className="mb-[1.125rem]">
            <span 
              className="text-[3.125rem] font-black tracking-wider leading-none inline-block"
              style={{
                background: 'linear-gradient(180deg, #E452DD 50%, #9D63FE 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                WebkitTextStroke: '0.125rem #FFFFFF',
                paintOrder: 'stroke fill',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            >
              奖励空投10%
            </span>
          </div>
          
          {/* 第二行：邀请好友 */}
          <div>
            <span 
              className="text-[2.25rem] font-black tracking-wider leading-none inline-block"
              style={{
                background: 'linear-gradient(180deg, #99ED37 50%, #3CB11F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                WebkitTextStroke: '0.125rem #5A2908',
                paintOrder: 'stroke fill',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            >
              邀请好友
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
