"use client";

import type { Exercise } from "@/lib/exercises";

/**
 * The repetition laid out as a track. Each phase gets a band, so you can see at a
 * glance how much of the repetition is spent lowering versus driving back up.
 */
export default function PhaseTrack({
  exercise,
  t,
  onScrub,
  dark = false,
}: {
  exercise: Exercise;
  t: number;
  onScrub: (t: number) => void;
  dark?: boolean;
}) {
  const bands = exercise.phases.map((p, i) => {
    const next = exercise.phases[i + 1];
    const to = next ? next.from : 1;
    return {
      ...p,
      to,
      // "Eccentric — lowering" is prose; a 10%-wide band needs one word.
      short: p.label.split("—")[0].trim().split(" ")[0],
      width: to - p.from,
    };
  });

  return (
    <div>
      <div
        className={`relative flex h-[34px] w-full cursor-pointer overflow-hidden rounded-md border ${
          dark ? "border-white/10 bg-white/[0.03]" : "border-white/[0.07] bg-white/[0.035]"
        }`}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onScrub(Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width)));
        }}
      >
        {bands.map((b, i) => {
          const active = t >= b.from && t < b.to;
          return (
            <div
              key={b.label}
              className={`relative flex items-center justify-center overflow-hidden border-r transition-colors duration-200 last:border-r-0 ${
                dark ? "border-white/10" : "border-white/[0.07]"
              }`}
              style={{
                width: `${(b.to - b.from) * 100}%`,
                backgroundColor: active
                  ? dark
                    ? "rgba(33,176,131,0.16)"
                    : "rgba(33,176,131,0.08)"
                  : undefined,
              }}
            >
              {/* A narrow band can only carry its label while it is active. */}
              {(b.width >= 0.16 || active) && (
                <span
                  className={`truncate px-2.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
                    active
                      ? dark
                        ? "text-accent-lit"
                        : "text-accent"
                      : dark
                        ? "text-slate-500"
                        : "text-slate-500"
                  }`}
                >
                  {b.short}
                </span>
              )}
              {i === 0 && <span className="sr-only">repetition timeline</span>}
            </div>
          );
        })}
        <div
          className={`pointer-events-none absolute inset-y-0 w-[2px] ${
            dark ? "bg-accent-lit" : "bg-accent"
          }`}
          style={{ left: `${t * 100}%` }}
        />
      </div>
    </div>
  );
}
