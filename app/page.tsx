import Link from "next/link";
import RepStudio from "@/components/RepStudio";
import SmallMultiples from "@/components/SmallMultiples";
import RampLegend from "@/components/RampLegend";
import Eyebrow from "@/components/Eyebrow";
import { CARD } from "@/lib/ui";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1560px] px-5 pt-10 sm:px-8 xl:px-12 lg:pt-16">
      <header className="mb-14 lg:mb-20">
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex h-[24px] shrink-0 items-center whitespace-nowrap rounded-full border border-accent/25 bg-accent/[0.07] px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Zee Palm Labs
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Movement visualisation study
          </span>
        </div>

        <h1 className="font-display max-w-[13ch] text-[48px] font-normal leading-[0.95] tracking-[-0.02em] text-slate-50 sm:text-[68px] lg:text-[82px] xl:text-[96px]">
          Anatomy of a Repetition
        </h1>

        <div className="mt-8 grid gap-8 border-t border-white/[0.07] pt-8 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <p className="text-[18px] leading-[1.62] text-slate-500 sm:text-[20px]">
            A diagram shows you the shape of a lift. This shows you the{" "}
            <span className="text-slate-50">work</span> — which muscles are firing,
            how hard, and at which inch of the range. Every muscle is drawn from the
            joint positions, so the anatomy and the movement can never fall out of
            step.
          </p>
          <div className="flex flex-col justify-end gap-4">
            <RampLegend />
            <p className="text-[14px] leading-relaxed text-slate-500">
              Colour is effort. A resting muscle sinks into the body; a working one
              is the reddest thing on the page.
            </p>
          </div>
        </div>
      </header>

      <section className="mb-16 lg:mb-24">
        <Eyebrow n="01">Overview — one repetition, looped</Eyebrow>
        <RepStudio />
      </section>


      {/* Light: nothing is rendered here, it is only read. */}
      <section className="mb-16 lg:mb-24">
        <div className={`overflow-hidden ${CARD}`}>
          <div className="grid divide-y divide-white/[0.07] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
            {[
              { n: "6", l: "Lifts, fully rigged" },
              { n: "13", l: "Muscle groups, live" },
              { n: "0", l: "Sprite sheets or video" },
              { n: "100%", l: "Vector, at any size" },
            ].map((stat, i) => (
              <div
                key={stat.l}
                className={`px-7 py-9 ${
                  i > 0 ? "sm:border-l sm:border-white/[0.07] lg:border-l" : ""
                } ${i === 2 ? "lg:border-l" : ""}`}
              >
                <div className="font-display text-[46px] leading-none text-slate-50">
                  {stat.n}
                </div>
                <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {stat.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-16 lg:mb-24">
        <Eyebrow n="02">Six lifts, each at its hardest moment</Eyebrow>
        <p className="mb-6 max-w-[68ch] text-[16px] leading-[1.65] text-slate-500">
          Each figure is frozen at the instant its prime movers are working
          hardest — found by searching its own curves, not chosen by eye.
        </p>
        <SmallMultiples mode="link" />
      </section>

      <section className="mb-16 lg:mb-24">
        <Eyebrow n="03">Coverage</Eyebrow>
        <div className={`${CARD} overflow-hidden`}>
          <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16 lg:p-12">
            <div>
              <h2 className="font-display max-w-[18ch] text-[30px] leading-[1.08] tracking-[-0.01em] text-slate-50 sm:text-[38px]">
                Does your session actually cover you?
              </h2>
              <p className="mt-4 max-w-[54ch] text-[16px] leading-[1.65] text-slate-500">
                Pick your lifts. See what gets trained, and what gets left alone.
              </p>
              <Link
                href="/coverage"
                className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-[15px] font-medium text-accent-ink transition-all hover:bg-accent"
              >
                Open the coverage tool
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                For example
              </div>
              <p className="font-display mt-2 text-[20px] leading-snug text-slate-100">
                Squat and push-up together leave the lats, forearms and biceps
                under half.
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-500">
                Everything you pull with. Which is the argument for adding a row,
                made in numbers rather than in a forum thread.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
