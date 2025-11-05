export function ActivityRules() {
  return (
    <div className="fixed inset-x-0 top-[7.5rem] bottom-[6.5rem] z-20 overflow-y-auto bg-brand-dark text-lg">
      <div className="mx-auto max-w-2xl px-6 pb-16">
        <header className="mb-12 pt-6 text-center">
          <h1 className="text-[2.375rem] font-black tracking-[0.3em] text-white">活动规则</h1>
        </header>

        <div className="space-y-14 text-base leading-7 text-[#D8DBE3]">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="flex-1 h-px bg-white/15" />
                <h2 className="flex-shrink-0 px-4 text-center  font-semibold tracking-[0.45em] text-[#8b8c90]">
                  关于邀请
                </h2>
                <span className="flex-1 h-px bg-white/15" />
              </div>

              <div className="space-y-6">
                <article>
                  <p className=" font-semibold text-white">1. 如何获得专属邀请链接？</p>
                  <div className="mt-3 space-y-2 pl-4 text-brand-yellow">
                    <p>
                      方法一：使用持有 <span>GiggleHero</span> 的钱包连接即可。
                    </p>
                    <p>方法二：通过他人专属邀请链接，绑定钱包即可。</p>
                  </div>
                </article>

                <article>
                  <p className=" font-semibold text-white">2. 如何邀请好友？</p>
                  <div className="mt-3 space-y-2 pl-4 text-brand-yellow">
                    <p>第一步：分享您的专属邀请链接给好友。</p>
                    <p>第二步：好友使用您的专属链接，打开连接绑定。</p>
                  </div>
                </article>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="flex-1 h-px bg-white/15" />
                <h2 className="flex-shrink-0 px-4 text-center  font-semibold tracking-[0.45em] text-[#8b8c90]">
                  {" "}
                  关于空投
                </h2>
                <span className="flex-1 h-px bg-white/15" />
              </div>

              <div className="space-y-6">
                <article>
                  <p className=" font-semibold text-white">1. 空投发放时间</p>
                  <div className="mt-3 space-y-2 pl-4">
                    <p className="text-brand-yellow">每月 - 10日 / 20日 / 月末 是发放空投定期。</p>
                    <p className="text-[#8C90A0]">备注：每月会有某3次发放空投时间。</p>
                  </div>
                </article>

                <article>
                  <p className=" font-semibold text-white">2. 空投奖励说明</p>
                  <div className="mt-3 space-y-3 pl-4">
                    <p className="text-brand-yellow">
                      当达到指定发放空投的日期，被邀请人持有 <span>GiggleHero</span>{" "}
                      的数量需要达到持仓时间大于7天或等于7天。
                    </p>
                    <p className="text-[#8C90A0]">备注：未达到标准的被邀请人会在下一次定期空投日期发放。</p>
                  </div>
                </article>
              </div>
            </section>

            <section className="space-y-6 ">
              <div className="flex items-center gap-4">
                <span className="flex-1 h-px bg-white/15" />
                <h2 className="flex-shrink-0 px-4 text-center  font-semibold tracking-[0.45em] text-[#8b8c90]">
                  {" "}
                  关于详情
                </h2>
                <span className="flex-1 h-px bg-white/15" />
              </div>

              <article className="space-y-4 rounded-2xl bg-[#1E2028] px-6 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <p className=" text-white">邀请好友奖励空投 10%</p>
                <p className="text-brand-yellow">
                  <span className="text-white"> 奖励10%：</span> 是 $GiggleHero 代币，您邀请的好友购买 $GiggleHero
                  越多，您获得的奖励就越多。
                </p>
                <p>
                  <span className="text-white">假设：</span>
                  您邀请的好友购买了1000 $GiggleHero，那么您就可以获得10%，也就是100 $GiggleHero 的空投奖励。
                </p>
                <p className="text-[#8b8c90]">注：这10%的空投奖励是由社区发放，并非从邀请好友中获取。</p>
              </article>
            </section>
        </div>
      </div>
    </div>
  )
}
