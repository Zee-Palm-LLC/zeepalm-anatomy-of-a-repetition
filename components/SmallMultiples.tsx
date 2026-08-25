"use client";

import { memo } from "react";
import Link from "next/link";
import Figure from "./Figure";
import { EXERCISES } from "@/lib/exercises";
import { peakMomentOf } from "@/lib/analysis";
import { MUSCLE_BY_ID } from "@/lib/muscles";

const noop = () => {};

type Props =
  | { mode: "link"; onPick?: never; current?: string }
  | { mode: "pick"; onPick: (id: string) => void; current: string };

/** Every lift frozen at the instant its prime movers are working hardest. */
function SmallMultiples(props: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {EXERCISES.map((ex) => {
        const t = peakMomentOf(ex);
        const on = ex.id === props.current;

        const inner = (
          <>
            <div className="pointer-events-none relative h-[196px] w-full overflow-hidden bg-[#0B1220] xl:h-[232px]">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 55% at 50% 60%, rgba(255,94,63,0.11), transparent 72%)",
                }}
              />
              <Figure
                exercise={ex}
                t={t}
                theme="dark"
                interactive={false}
                frameAt={t}
                framePad={14}
                hovered={null}
                selected={null}
                showMuscles
                onHover={noop}
                onSelect={noop}
              />
            </div>
            <div className="border-t border-white/[0.06] bg-[#0F1724] px-3 py-2.5">
              <div
                className={`font-display text-[16px] leading-tight ${
                  on ? "text-accent" : "text-slate-100"
                }`}
              >
                {ex.name}
              </div>
              <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-500">
                {MUSCLE_BY_ID[ex.primary[0]].label}
              </div>
            </div>
          </>
        );

        const cls = `group relative block overflow-hidden rounded-xl border bg-[#0F1724] text-left transition-all duration-300 ${
          on
            ? "border-accent/40 shadow-[0_6px_24px_-10px_rgba(33,176,131,0.45)]"
            : "border-white/[0.07] hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_40px_-20px_rgba(11,18,32,0.55)]"
        }`;

        return props.mode === "link" ? (
          <Link key={ex.id} href={`/lifts/${ex.id}`} className={cls}>
            {inner}
          </Link>
        ) : (
          <button key={ex.id} onClick={() => props.onPick(ex.id)} className={cls}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

export default memo(SmallMultiples);
