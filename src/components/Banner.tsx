export function Banner() {
  return (
    <div className="fixed left-0 right-0 z-40 top-[4.9375rem] px-4 mt-[3.5rem]">
      <div className="container mx-auto">
        <div className="flex flex-col items-start">
          {/* 第一行：奖励空投10% */}
          <div className="mb-[1.125rem]">
            <span 
              className="text-[3.125rem] font-black tracking-wide leading-none inline-block text-[#E452DD]"
              style={{
                textShadow: `
                  0.03em 0 #FFFFFF,
                  -0.03em 0 #FFFFFF,
                  0 0.03em #FFFFFF,
                  0 -0.03em #FFFFFF,
                  0 0 0.12em rgba(0,0,0,0.2)
                `,
              }}
            >
              奖励空投10%
            </span>
          </div>
          
          {/* 第二行：邀请好友 */}
          <div>
            <span 
              className="text-[2.25rem] font-black tracking-wide leading-none inline-block text-[#99ED37]"
              style={{
                textShadow: `
                  0.03em 0 #5A2908,
                  -0.03em 0 #5A2908,
                  0 0.03em #5A2908,
                  0 -0.03em #5A2908,
                  0 0 0.1em rgba(0,0,0,0.25)
                `,
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
