import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RepStudio from "@/components/RepStudio";
import Eyebrow from "@/components/Eyebrow";
import { EXERCISES } from "@/lib/exercises";
import { MUSCLE_BY_ID } from "@/lib/muscles";
import { sortedPeaks, peakOf } from "@/lib/analysis";
import { activationColor } from "@/lib/muscles";
import { CARD } from "@/lib/ui";

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ex = EXERCISES.find((e) => e.id === id);
  if (!ex) return { title: "Not found" };
  const movers = ex.primary.map((m) => MUSCLE_BY_ID[m].label.toLowerCase()).join(", ");
  const description = `An animated anatomical breakdown of the ${ex.name.toLowerCase()}: ${movers}, and what the rest of the body is doing.`;
  return {
    title: ex.name,
    description,
    alternates: { canonical: `/lifts/${ex.id}` },
    openGraph: { title: `${ex.name} — Anatomy of a Repetition`, description },
  };
}

export default async function LiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ex = EXERCISES.find((e) => e.id === id);
  if (!ex) notFound();

  const idx = EXERCISES.findIndex((e) => e.id === id);
  const prev = EXERCISES[(idx - 1 + EXERCISES.length) % EXERCISES.length];
  const next = EXERCISES[(idx + 1) % EXERCISES.length];
  const ranked = sortedPeaks(ex);

  // Where this lift stands against the other five, for its own prime movers.
  const standings = ex.primary.map((mid) => {
    const scores = EXERCISES.map((e) => ({ name: e.name, v: peakOf(e, mid) })).sort(
      (a, b) => b.v - a.v,
    );
    const rank = scores.findIndex((s) => s.name === ex.name) + 1;
    return { label: MUSCLE_BY_ID[mid].label, rank, top: scores[0], mine: peakOf(ex, mid) };
  });

  return (
    <main className="mx-auto w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1560px] px-5 pt-10 sm:px-8 xl:px-12 lg:pt-16">
      <header className="mb-10">
        <Eyebrow>{ex.family}</Eyebrow>
        <h1 className="font-display text-[42px] font-normal leading-[1.02] tracking-[-0.02em] text-slate-50 sm:text-[58px]">
          {ex.name}
        </h1>
        <p className="font-display mt-4 max-w-[40ch] text-[20px] leading-snug text-data-lit sm:text-[24px]">
          {ex.cue}
        </p>
      </header>

      <section className="mb-14">
        <RepStudio key={ex.id} initialId={ex.id} lock />
      </section>

      <section className="mb-14 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className={`${CARD} p-6 sm:p-8`}>
          <Eyebrow n="01">What it trains</Eyebrow>
          <p className="mb-5 text-[15px] leading-relaxed text-slate-500">
            Peak activation for every muscle group during one repetition, hardest first.
          </p>
          <div className="space-y-1.5">
            {ranked.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <span
                  className={`w-[132px] shrink-0 text-[14px] ${
                    r.v >= 0.5 ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {r.label}
                </span>
                <span className="relative h-[9px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${Math.max(r.v * 100, 1.5)}%`,
                      backgroundColor: activationColor(r.v),
                    }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right font-mono text-[12px] tabular-nums text-slate-500">
                  {Math.round(r.v * 100)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`${CARD} p-6 sm:p-8`}>
            <Eyebrow n="02">How it ranks</Eyebrow>
            <div className="space-y-4">
              {standings.map((s) => (
                <div key={s.label} className="border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
                  <div className="font-display text-[17px] text-slate-50">
                    {s.label}
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-500">
                    {s.rank === 1 ? (
                      <>
                        The <span className="text-data-lit">hardest</span> of the six
                        lifts for this muscle, at{" "}
                        <span className="font-mono">{Math.round(s.mine * 100)}</span>.
                      </>
                    ) : (
                      <>
                        Ranks <span className="font-mono">#{s.rank}</span> of six at{" "}
                        <span className="font-mono">{Math.round(s.mine * 100)}</span> —
                        the {s.top.name.toLowerCase()} takes it at{" "}
                        <span className="font-mono">{Math.round(s.top.v * 100)}</span>.
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${CARD} p-6 sm:p-8`}>
            <Eyebrow n="03">The thing to notice</Eyebrow>
            <p className="text-[16px] leading-[1.65] text-slate-500">{ex.note}</p>
          </div>
        </div>
      </section>

      <nav className="mb-6 grid gap-3 sm:grid-cols-2">
        {[
          { e: prev, dir: "Previous", arrow: "←" },
          { e: next, dir: "Next", arrow: "→" },
        ].map(({ e, dir, arrow }) => (
          <Link
            key={dir}
            href={`/lifts/${e.id}`}
            className={`${CARD} group flex items-center justify-between p-5 transition-all hover:border-accent/30`}
          >
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {dir}
              </span>
              <span className="font-display mt-0.5 block text-[18px] text-slate-50 group-hover:text-accent">
                {e.name}
              </span>
            </span>
            <span className="text-slate-300 transition-all group-hover:text-accent">
              {arrow}
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
