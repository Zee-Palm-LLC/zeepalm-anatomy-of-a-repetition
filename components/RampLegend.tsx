import { THEME } from "@/lib/palette";

// The legend has to be drawn from the same ramp the figure uses, or the key
// explains a colour scheme that is not on screen.
const stops = THEME.dark.ramp
  .map(([at, c]) => `rgb(${c[0]}, ${c[1]}, ${c[2]}) ${(at * 100).toFixed(0)}%`)
  .join(", ");

export default function RampLegend({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div
        className="h-[6px] w-full rounded-full"
        style={{ background: `linear-gradient(to right, ${stops})` }}
      />
      <div className="mt-1.5 flex justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">
        <span>resting</span>
        <span>maximal</span>
      </div>
    </div>
  );
}
