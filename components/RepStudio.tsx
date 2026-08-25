"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Figure from "./Figure";
import ActivationPanel from "./ActivationPanel";
import PhaseTrack from "./PhaseTrack";
import { MUSCLES, type MuscleId } from "@/lib/muscles";
import { EXERCISES, phaseAt, sampleCurve } from "@/lib/exercises";
import { CARD } from "@/lib/ui";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

export default function RepStudio({
  initialId = EXERCISES[0].id,
  lock = false,
}: {
  initialId?: string;
  /** Pin the studio to one lift and hide the picker (used on lift pages). */
  lock?: boolean;
}) {
  const [exerciseId, setExerciseId] = useState(initialId);
  const [t, setT] = useState(0);
  // null = follow the motion preference; a boolean = the visitor chose.
  const [playOverride, setPlayOverride] = useState<boolean | null>(null);
  const [repSeconds, setRepSeconds] = useState(4);
  const [showMuscles, setShowMuscles] = useState(true);
  const [hovered, setHovered] = useState<MuscleId | null>(null);
  const [selected, setSelected] = useState<MuscleId | null>(null);
  const [reps, setReps] = useState(0);

  const exercise = useMemo(
    () => EXERCISES.find((e) => e.id === exerciseId) ?? EXERCISES[0],
    [exerciseId],
  );

  const reduced = usePrefersReducedMotion();
  const playing = playOverride ?? !reduced;

  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const step = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      setT((prev) => {
        const next = prev + dt / repSeconds;
        if (next >= 1) setReps((r) => r + 1);
        return next % 1;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, repSeconds]);

  const acts = useMemo(() => {
    const map = {} as Record<MuscleId, number>;
    for (const m of MUSCLES) map[m.id] = sampleCurve(exercise.activation[m.id], t);
    return map;
  }, [exercise, t]);

  const pick = useCallback((id: string) => {
    setExerciseId(id);
    setT(0);
    setReps(0);
  }, []);

  const toggleSelect = useCallback((id: MuscleId) => {
    setSelected((cur) => (cur === id ? null : id));
  }, []);

  const scrubTo = useCallback((v: number) => {
    setPlayOverride(false);
    setT(v);
  }, []);

  return (
    <div>
      {!lock && (
        <nav className="mb-4 flex flex-wrap gap-1.5">
          {EXERCISES.map((e) => {
            const on = e.id === exercise.id;
            return (
              <button
                key={e.id}
                onClick={() => pick(e.id)}
                className={`rounded-lg border px-4 py-2.5 text-[14px] font-medium transition-all ${
                  on
                    ? "border-accent/35 bg-accent/[0.07] text-accent"
                    : "border-white/[0.07] bg-[#0F1724] text-slate-500 hover:border-white/20 hover:text-slate-50"
                }`}
              >
                {e.name}
              </button>
            );
          })}
        </nav>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_348px] xl:grid-cols-[1fr_392px]">
        <div className="relative overflow-hidden rounded-2xl border border-[#0B1220] bg-[#0B1220] shadow-[0_20px_60px_-24px_rgba(11,18,32,0.65)]">
          {/* plate ruling + a warm pool of light under the figure */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
              maskImage:
                "radial-gradient(ellipse 76% 66% at 50% 46%, black 30%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 76% 66% at 50% 46%, black 30%, transparent 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 58%, rgba(255,94,63,0.10), transparent 70%), radial-gradient(ellipse 90% 70% at 50% 0%, rgba(148,163,184,0.10), transparent 60%)",
            }}
          />

          <div className="relative flex items-start justify-between px-6 pt-5">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Phase
              </div>
              <div
                className="font-display text-[18px] text-data-lit"
                aria-live="polite"
                aria-atomic="true"
              >
                {phaseAt(exercise, t)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Repetitions
              </div>
              <div className="font-mono text-[18px] tabular-nums text-slate-200">
                {String(reps).padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="relative h-[430px] sm:h-[520px] lg:h-[580px] xl:h-[680px] 2xl:h-[740px]">
            <Figure
              exercise={exercise}
              t={t}
              theme="dark"
              framePad={20}
              hovered={hovered}
              selected={selected}
              showMuscles={showMuscles}
              onHover={setHovered}
              onSelect={toggleSelect}
            />
          </div>

          <div className="relative border-t border-white/[0.07] bg-white/[0.02] px-6 py-4">
            <PhaseTrack exercise={exercise} t={t} onScrub={scrubTo} dark />

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                onClick={() => setPlayOverride(!playing)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/[0.12] text-accent-lit transition-all hover:bg-accent/25 active:scale-95"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <svg width="12" height="13" viewBox="0 0 10 11" fill="currentColor">
                    <rect width="3" height="11" rx="1" />
                    <rect x="7" width="3" height="11" rx="1" />
                  </svg>
                ) : (
                  <svg width="12" height="13" viewBox="0 0 10 11" fill="currentColor">
                    <path d="M0 1.2v8.6a1 1 0 0 0 1.5.86l7-4.3a1 1 0 0 0 0-1.72l-7-4.3A1 1 0 0 0 0 1.2Z" />
                  </svg>
                )}
              </button>

              <label className="flex min-w-[170px] flex-1 items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Scrub
                </span>
                <input
                  type="range"
                  min={0}
                  max={0.999}
                  step={0.001}
                  value={t}
                  onChange={(e) => scrubTo(Number(e.target.value))}
                  className="range range-dark flex-1"
                  aria-label="Scrub through the repetition"
                />
              </label>

              <label className="flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Tempo
                </span>
                <input
                  type="range"
                  min={1.2}
                  max={9}
                  step={0.1}
                  value={repSeconds}
                  onChange={(e) => setRepSeconds(Number(e.target.value))}
                  className="range range-dark w-[86px]"
                  aria-label="Seconds per repetition"
                />
                <span className="w-10 font-mono text-[12px] tabular-nums text-slate-500">
                  {repSeconds.toFixed(1)}s
                </span>
              </label>

              <button
                onClick={() => setShowMuscles((v) => !v)}
                className={`rounded-lg border px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  showMuscles
                    ? "border-accent/25 bg-accent/[0.07] text-accent"
                    : "border-white/[0.07] bg-[#0F1724] text-slate-500 hover:text-slate-500"
                }`}
              >
                {showMuscles ? "Activation on" : "Activation off"}
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/[0.06] bg-[#0E1626] p-5 shadow-[0_20px_60px_-30px_rgba(11,18,32,0.7)]">
          <ActivationPanel
            theme="dark"
            exercise={exercise}
            t={t}
            acts={acts}
            hovered={hovered}
            selected={selected}
            onHover={setHovered}
            onSelect={toggleSelect}
          />
        </aside>
      </div>

      <div className={`mt-4 ${CARD} p-6`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="sm:w-[168px] sm:shrink-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
              What to look for
            </div>
            <div className="font-display mt-1.5 text-[16px] leading-snug text-slate-100">
              {exercise.cue}
            </div>
          </div>
          <p className="max-w-[74ch] text-[16px] leading-[1.65] text-slate-500">
            {exercise.note}
          </p>
        </div>
      </div>
    </div>
  );
}
