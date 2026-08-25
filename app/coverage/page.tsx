import type { Metadata } from "next";
import CoverageMatrix from "@/components/CoverageMatrix";
import SessionBuilder from "@/components/SessionBuilder";
import Eyebrow from "@/components/Eyebrow";
import { CARD } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Coverage",
  description:
    "A muscle-by-lift matrix of peak activation, and a tool for finding what your session leaves alone.",
  alternates: { canonical: "/coverage" },
};

export default function CoveragePage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1560px] px-5 pt-10 sm:px-8 xl:px-12 lg:pt-16">
      <header className="mb-14">
        <Eyebrow>Coverage</Eyebrow>
        <h1 className="font-display max-w-[16ch] text-[42px] font-normal leading-[1.02] tracking-[-0.02em] text-slate-50 sm:text-[58px]">
          What each lift actually trains
        </h1>
        <p className="mt-6 max-w-[68ch] text-[17px] leading-[1.65] text-slate-500 sm:text-[18px]">
          Every muscle&apos;s hardest moment in every lift, on one grid — the same
          curves that drive the animation, so the two can never disagree.
        </p>
      </header>

      <section className="mb-16 lg:mb-24">
        <Eyebrow n="01">Build a session</Eyebrow>
        <p className="mb-6 max-w-[68ch] text-[16px] leading-[1.65] text-slate-500">
          Coverage is the <span className="text-slate-50">hardest</span> any one
          lift works a muscle, not the sum — two lifts hitting the quads at 90 do
          not train them at 180.
        </p>
        <div className={`${CARD} p-6 sm:p-8`}>
          <SessionBuilder />
        </div>
      </section>

      <section className="mb-10">
        <Eyebrow n="02">The full matrix</Eyebrow>
        <p className="mb-6 max-w-[68ch] text-[16px] leading-[1.65] text-slate-500">
          Thirteen muscles down, six lifts across.
        </p>
        <div className={`${CARD} p-6 sm:p-8`}>
          <CoverageMatrix />
        </div>
      </section>
    </main>
  );
}
