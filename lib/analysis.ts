/**
 * Derived readings over the activation curves.
 *
 * Everything here is computed from the same curves the figure animates from,
 * so the matrix and the animation can never disagree about which lift trains
 * what.
 */

import { EXERCISES, sampleCurve, type Exercise } from "./exercises";
import { MUSCLES, type MuscleId } from "./muscles";

const RESOLUTION = 96;

/** The hardest this muscle works at any point in the rep. */
export function peakOf(ex: Exercise, id: MuscleId): number {
  const curve = ex.activation[id];
  let peak = 0;
  for (let i = 0; i <= RESOLUTION; i++) {
    const v = sampleCurve(curve, i / RESOLUTION);
    if (v > peak) peak = v;
  }
  return peak;
}

/** The instant in the rep where the prime movers are working hardest. */
export function peakMomentOf(ex: Exercise): number {
  let best = 0;
  let bestT = 0.5;
  for (let i = 0; i <= RESOLUTION; i++) {
    const t = i / RESOLUTION;
    let sum = 0;
    for (const id of ex.primary) sum += sampleCurve(ex.activation[id], t);
    if (sum > best) {
      best = sum;
      bestT = t;
    }
  }
  return bestT;
}

export type MatrixRow = { id: MuscleId; label: string; peaks: number[] };

/** Peak activation for every muscle across every exercise. */
export function buildMatrix(): MatrixRow[] {
  return MUSCLES.map((m) => ({
    id: m.id,
    label: m.label,
    peaks: EXERCISES.map((ex) => peakOf(ex, m.id)),
  }));
}

/** Which lift trains this muscle hardest, and how hard. */
export function bestLiftFor(row: MatrixRow): { name: string; value: number } {
  let idx = 0;
  for (let i = 1; i < row.peaks.length; i++) if (row.peaks[i] > row.peaks[idx]) idx = i;
  return { name: EXERCISES[idx].name, value: row.peaks[idx] };
}

/**
 * Combined coverage for a set of lifts: for each muscle, the hardest any one of
 * the chosen lifts works it. Max rather than sum — doing two lifts that both hit
 * the quads at 90 does not train them at 180.
 */
export function coverageFor(ids: string[]): Record<MuscleId, number> {
  const chosen = EXERCISES.filter((e) => ids.includes(e.id));
  const out = {} as Record<MuscleId, number>;
  for (const m of MUSCLES) {
    out[m.id] = chosen.reduce((best, ex) => Math.max(best, peakOf(ex, m.id)), 0);
  }
  return out;
}

/** Every muscle in one lift, hardest-worked first. */
export function sortedPeaks(ex: Exercise): { id: MuscleId; label: string; v: number }[] {
  return MUSCLES.map((m) => ({ id: m.id, label: m.label, v: peakOf(ex, m.id) })).sort(
    (a, b) => b.v - a.v,
  );
}
