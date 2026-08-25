"use client";

import {
  activationColor,
  GROUP_LABEL,
  MUSCLES,
  MUSCLE_BY_ID,
  type MuscleGroup,
  type MuscleId,
} from "@/lib/muscles";
import { sampleCurve, type Exercise } from "@/lib/exercises";
import { GROUP_COLOR, GROUP_COLOR_DARK, type Theme } from "@/lib/palette";

const GROUPS: MuscleGroup[] = ["posterior", "anterior", "upper"];

function RepCurve({
  exercise,
  id,
  t,
  theme,
}: {
  exercise: Exercise;
  id: MuscleId;
  t: number;
  theme: Theme;
}) {
  const dark = theme === "dark";
  const curve = exercise.activation[id];
  const N = 72;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const u = i / N;
    return `${(u * 100).toFixed(2)},${(38 - sampleCurve(curve, u) * 34).toFixed(2)}`;
  });
  const peak = Math.max(...Array.from({ length: N + 1 }, (_, i) => sampleCurve(curve, i / N)));
  const line = dark ? "#FF7A5C" : "#B0142A";

  return (
    <div
      className={`mt-3 rounded-lg border p-3 ${
        dark ? "border-white/10 bg-white/[0.03]" : "border-white/[0.07] bg-white/[0.035]"
      }`}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span
          className={`text-[12px] font-medium tracking-wide ${
            dark ? "text-slate-200" : "text-slate-300"
          }`}
        >
          {MUSCLE_BY_ID[id].label} across one repetition
        </span>
        <span className={`font-mono text-[12px] ${dark ? "text-slate-500" : "text-slate-500"}`}>
          peak {(peak * 100).toFixed(0)}%
        </span>
      </div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-14 w-full">
        <defs>
          <linearGradient id={`curveFill-${theme}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={line} stopOpacity={dark ? "0.4" : "0.28"} />
            <stop offset="100%" stopColor={line} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,40 ${pts.join(" ")} 100,40`} fill={`url(#curveFill-${theme})`} />
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={line}
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={t * 100}
          x2={t * 100}
          y1={0}
          y2={40}
          stroke={dark ? "#F8FAFC" : "#0F172A"}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          opacity={0.8}
        />
      </svg>
    </div>
  );
}

type Props = {
  exercise: Exercise;
  t: number;
  acts: Record<MuscleId, number>;
  hovered: MuscleId | null;
  selected: MuscleId | null;
  onHover: (id: MuscleId | null) => void;
  onSelect: (id: MuscleId) => void;
  theme?: Theme;
};

export default function ActivationPanel({
  exercise,
  t,
  acts,
  hovered,
  selected,
  onHover,
  onSelect,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const focus = selected ?? hovered;
  const prime = MUSCLES.reduce((best, m) => (acts[m.id] > acts[best.id] ? m : best), MUSCLES[0]);
  const groupColor = dark ? GROUP_COLOR_DARK : GROUP_COLOR;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-baseline justify-between">
        <h2
          className={`font-mono text-[12px] font-semibold uppercase tracking-[0.18em] ${
            dark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          Activation
        </h2>
        <span className={`text-[12px] ${dark ? "text-slate-500" : "text-slate-500"}`}>
          prime mover{" "}
          <span style={{ color: dark ? "#FF8A6B" : "#B0142A" }}>{prime.label}</span>
        </span>
      </div>

      <div className="space-y-4">
        {GROUPS.map((g) => (
          <div key={g}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span
                className="h-[5px] w-[5px] rounded-full"
                style={{ backgroundColor: groupColor[g] }}
              />
              <span
                className="font-mono text-[11px] uppercase tracking-[0.16em]"
                style={{ color: groupColor[g] }}
              >
                {GROUP_LABEL[g]}
              </span>
            </div>
            <div className="space-y-[3px]">
              {MUSCLES.filter((m) => m.group === g).map((m) => {
                const v = acts[m.id];
                const isFocus = focus === m.id;
                const isPrimary = exercise.primary.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onMouseEnter={() => onHover(m.id)}
                    onMouseLeave={() => onHover(null)}
                    onClick={() => onSelect(m.id)}
                    className={`group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors ${
                      isFocus
                        ? dark
                          ? "bg-white/[0.08]"
                          : "bg-white/[0.06]"
                        : dark
                          ? "hover:bg-white/[0.05]"
                          : "hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`w-[122px] shrink-0 truncate text-[13px] ${
                        isPrimary
                          ? dark
                            ? "text-slate-100"
                            : "text-slate-50"
                          : dark
                            ? "text-slate-500"
                            : "text-slate-500"
                      }`}
                    >
                      {m.label}
                    </span>
                    <span
                      className={`relative h-[8px] flex-1 overflow-hidden rounded-full ${
                        dark ? "bg-white/[0.07]" : "bg-white/[0.09]"
                      }`}
                    >
                      <span
                        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
                        style={{
                          width: `${v * 100}%`,
                          backgroundColor: activationColor(v, theme),
                          boxShadow:
                            v > 0.6 ? `0 0 12px ${activationColor(v, theme)}` : undefined,
                        }}
                      />
                    </span>
                    <span
                      className={`w-10 shrink-0 text-right font-mono text-[12px] tabular-nums ${
                        dark ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      {(v * 100).toFixed(0)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {focus ? (
        <RepCurve exercise={exercise} id={focus} t={t} theme={theme} />
      ) : (
        <p
          className={`mt-3 rounded-lg border border-dashed p-3 text-[13px] leading-relaxed ${
            dark ? "border-white/10 text-slate-500" : "border-white/15 text-slate-500"
          }`}
        >
          Hover a muscle — on the figure or in this list — to see how hard it works
          across the whole repetition, not just right now.
        </p>
      )}
    </div>
  );
}
