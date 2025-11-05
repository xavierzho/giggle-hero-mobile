import { useMemo } from "react";
import heroAvatar from "@/assets/logo.png";
import { useAuthStore } from "@/store/useAuthStore";

export function MinePage() {
  const userInfo = useAuthStore(state => state.userInfo);

  const heroName = useMemo(() => {
    if (!userInfo?.inviteCode) {
      return "GiggleHero 01";
    }

    const suffix = userInfo.inviteCode.slice(-2).padStart(2, "0");
    return `GiggleHero ${suffix}`;
  }, [userInfo?.inviteCode]);

  const inviteCount = userInfo?.count ?? 0;

  return (
    <div className="fixed inset-x-0 top-[7.5rem] bottom-[6.5rem] z-30 overflow-y-auto text-lg">
      <div className="container mx-auto h-full px-6 py-6">
        <div className="flex flex-col gap-6">
          <section className="rounded-[2rem] border border-white/10 bg-[rgba(24,26,33,0.88)] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-[#FFD85E]/60 bg-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
                <img src={heroAvatar} alt="Giggle Hero" className="h-full w-full object-cover" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{heroName}</h2>
              <button
                type="button"
                className="mt-3 rounded-full bg-[#FFD85E] px-6 py-1.5 text-sm font-semibold text-[#1F2128] shadow-[0_15px_30px_rgba(255,216,94,0.4)]"
              >
                数据
              </button>

              <div className="mt-6 w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-left">
                <div className="flex items-center justify-between text-base text-white/80">
                  <span>邀请人数：</span>
                  <span className="text-2xl font-bold text-white">{inviteCount}</span>
                </div>
                {userInfo?.inviteCode && (
                  <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                    <span>我的邀请码</span>
                    <span className="font-mono text-sm text-[#FFD85E]">{userInfo.inviteCode}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[rgba(24,26,33,0.88)] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <span className="flex-1 h-px bg-white/15" />
              <h2 className="flex-shrink-0 px-4 text-center  font-semibold tracking-[0.45em] text-[#8b8c90]">
                关于邀请
              </h2>
              <span className="flex-1 h-px bg-white/15" />
            </div>
            <div className="mt-5 space-y-5 text-sm leading-relaxed text-white/70">
              <div>
                <p className="font-medium text-white">1. 空投发放时间</p>
                <p className="mt-1 text-brand-yellow">每月 - 10日/20日/月末 是发放空投定期。</p>
                <p className="mt-1 text-white/50">注：每月会有定期3次发放空投时间。</p>
              </div>
              <div className="mt-4">
                <p className="font-medium text-white">2. 空投奖励说明</p>
                <p className="mt-1 text-brand-yellow">
                  到定期发放空投的日期，被邀请人持有
                  <span className="px-1">GiggleHero</span>
                  需要达到持仓时间大于或等于5天。
                </p>
                <p className="mt-1 text-white/50">注：未达到标准的被邀请人会在下一次定期空投日期发放。</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
