"use client";

import { useMemo, useState } from "react";
import { EXERCISES } from "@/lib/exercises";
import { activationColor, GROUP_LABEL, MUSCLES, type MuscleGroup } from "@/lib/muscles";
import { coverageFor } from "@/lib/analysis";
import { GROUP_COLOR_DARK as GROUP_COLOR } from "@/lib/palette";

const GROUPS: MuscleGroup[] = ["posterior", "anterior", "upper"];

/** Below this, a muscle is not meaningfully trained by the session. */
const THRESHOLD = 0.5;

export default function SessionBuilder() {
  const [picked, setPicked] = useState<string[]>(["squat", "pushup"]);

  const coverage = useMemo(() => coverageFor(picked), [picked]);
  const gaps = MUSCLES.filter((m) => coverage[m.id] < THRESHOLD);

  const toggle = (id: string) =>
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {EXERCISES.map((e) => {
          const on = picked.includes(e.id);
          return (
            <button
              key={e.id}
              onClick={() => toggle(e.id)}
              className={`rounded-lg border px-4 py-2.5 text-[14px] font-medium transition-all ${
                on
                  ? "border-accent/35 bg-accent/[0.07] text-accent"
                  : "border-white/[0.07] bg-[#0F1724] text-slate-500 hover:border-white/20 hover:text-slate-100"
              }`}
            >
              <span className="mr-2 font-mono text-[11px]">{on ? "✓" : "+"}</span>
              {e.name}
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:gap-12">
        <div className="space-y-5">
          {GROUPS.map((g) => (
            <div key={g}>
              <div className="mb-2 flex items-center gap-1.5">
                <span
                  className="h-[5px] w-[5px] rounded-full"
                  style={{ backgroundColor: GROUP_COLOR[g] }}
                />
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: GROUP_COLOR[g] }}
                >
                  {GROUP_LABEL[g]}
                </span>
              </div>
              <div className="space-y-1">
                {MUSCLES.filter((m) => m.group === g).map((m) => {
                  const v = coverage[m.id];
                  const weak = v < THRESHOLD;
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <span
                        className={`w-[132px] shrink-0 text-[14px] ${
                          weak ? "text-slate-500" : "text-slate-300"
                        }`}
                      >
                        {m.label}
                      </span>
                      <span className="relative h-[9px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(v * 100, 1.5)}%`,
                            backgroundColor: activationColor(v),
                          }}
                        />
                        <span
                          className="absolute inset-y-0 w-px bg-slate-300"
                          style={{ left: `${THRESHOLD * 100}%` }}
                        />
                      </span>
                      <span className="w-8 shrink-0 text-right font-mono text-[12px] tabular-nums text-slate-500">
                        {Math.round(v * 100)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Session
            </div>
            <div className="font-display mt-1 text-[30px] leading-none text-slate-50">
              {picked.length}
              <span className="text-[17px] text-slate-500"> / 6 lifts</span>
            </div>

            <div className="mt-5 border-t border-white/[0.07] pt-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Under {THRESHOLD * 100}%
              </div>
              {picked.length === 0 ? (
                <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
                  Nothing selected. Pick a lift to see what it covers.
                </p>
              ) : gaps.length === 0 ? (
                <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
                  Every muscle group here clears {THRESHOLD * 100}% in at least one of
                  your lifts.
                </p>
              ) : (
                <>
                  <ul className="mt-2 space-y-1">
                    {gaps.map((m) => (
                      <li key={m.id} className="text-[14px] text-slate-500">
                        {m.label}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
                    Left alone by this selection — within the thirteen groups drawn
                    here, and by these illustrative values.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
