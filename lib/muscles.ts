/**
 * Muscle geometry. Each muscle is attached to a bone segment of the rig and
 * derives its shape from the live joint positions, so it follows the movement
 * instead of being drawn frame by frame. Activation thickens the belly and
 * shortens the ends — a contracting muscle visibly bunches up.
 */

import { frame, lerpV, type Rig, type Vec } from "./anatomy";
import { THEME, type Theme } from "./palette";

export type MuscleId =
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "erectors"
  | "abs"
  | "lats"
  | "traps"
  | "delts"
  | "pecs"
  | "biceps"
  | "triceps"
  | "forearms";

export type MuscleGroup = "posterior" | "anterior" | "upper";

type Chain = "leg" | "arm" | "torso";

export type MuscleDef = {
  id: MuscleId;
  label: string;
  group: MuscleGroup;
  kind: "strip" | "blob";
  chain: Chain;
  a: string;
  b: string;
  /** Fraction along a→b that the belly spans (strip) or sits at (blob). */
  t0: number;
  t1: number;
  side: 1 | -1;
  /** Constant offset off the bone, so muscles can stack on one side. */
  pad: number;
  /** Peak half-thickness of the belly. */
  w: number;
  /** Blob only: radius along the bone. */
  rx?: number;
};

export const MUSCLES: MuscleDef[] = [
  // --- legs -------------------------------------------------------------
  { id: "quads", label: "Quadriceps", group: "anterior", kind: "strip", chain: "leg", a: "hip", b: "knee", t0: 0.12, t1: 0.96, side: 1, pad: 1, w: 11 },
  { id: "hamstrings", label: "Hamstrings", group: "posterior", kind: "strip", chain: "leg", a: "hip", b: "knee", t0: 0.16, t1: 0.94, side: -1, pad: 1, w: 10 },
  { id: "glutes", label: "Glutes", group: "posterior", kind: "blob", chain: "leg", a: "hip", b: "knee", t0: 0.15, t1: 0.15, side: -1, pad: 6, w: 12, rx: 21 },
  { id: "calves", label: "Calves", group: "posterior", kind: "strip", chain: "leg", a: "knee", b: "ankle", t0: 0.06, t1: 0.62, side: -1, pad: 1, w: 10 },
  // --- torso ------------------------------------------------------------
  { id: "erectors", label: "Spinal erectors", group: "posterior", kind: "strip", chain: "torso", a: "pelvis", b: "chest", t0: 0.05, t1: 0.86, side: 1, pad: 5, w: 7 },
  { id: "abs", label: "Abdominals", group: "anterior", kind: "strip", chain: "torso", a: "pelvis", b: "chest", t0: 0.06, t1: 0.7, side: -1, pad: 6, w: 8 },
  { id: "lats", label: "Latissimus dorsi", group: "posterior", kind: "strip", chain: "torso", a: "pelvis", b: "shoulder", t0: 0.34, t1: 0.99, side: 1, pad: 8, w: 10 },
  { id: "traps", label: "Trapezius", group: "posterior", kind: "blob", chain: "torso", a: "chest", b: "head", t0: 0.15, t1: 0.15, side: 1, pad: 5, w: 8, rx: 18 },
  { id: "pecs", label: "Pectorals", group: "anterior", kind: "blob", chain: "torso", a: "shoulder", b: "pelvis", t0: 0.16, t1: 0.16, side: -1, pad: 8, w: 9, rx: 19 },
  // --- arms -------------------------------------------------------------
  { id: "delts", label: "Deltoids", group: "upper", kind: "blob", chain: "arm", a: "shoulder", b: "elbow", t0: 0.1, t1: 0.1, side: 1, pad: 0, w: 11, rx: 17 },
  { id: "biceps", label: "Biceps", group: "upper", kind: "strip", chain: "arm", a: "shoulder", b: "elbow", t0: 0.3, t1: 0.94, side: 1, pad: 0.5, w: 8 },
  { id: "triceps", label: "Triceps", group: "upper", kind: "strip", chain: "arm", a: "shoulder", b: "elbow", t0: 0.28, t1: 0.92, side: -1, pad: 0.5, w: 8 },
  { id: "forearms", label: "Forearms", group: "upper", kind: "strip", chain: "arm", a: "elbow", b: "wrist", t0: 0.05, t1: 0.7, side: 1, pad: 0.5, w: 7 },
];

export const MUSCLE_BY_ID: Record<MuscleId, MuscleDef> = Object.fromEntries(
  MUSCLES.map((m) => [m.id, m]),
) as Record<MuscleId, MuscleDef>;

export const GROUP_LABEL: Record<MuscleGroup, string> = {
  posterior: "Posterior chain",
  anterior: "Anterior",
  upper: "Shoulders & arms",
};

/* ------------------------------------------------------------------ */
/* Resolving a muscle against the rig                                  */
/* ------------------------------------------------------------------ */

type JointBag = Record<string, Vec>;

function chainJoints(rig: Rig, chain: Chain, sideIndex: 0 | 1): JointBag {
  if (chain === "leg") return rig.legs[sideIndex] as unknown as JointBag;
  if (chain === "arm") return rig.arms[sideIndex] as unknown as JointBag;
  return {
    pelvis: rig.pelvis,
    chest: rig.chest,
    shoulder: rig.shoulder,
    neck: rig.neck,
    head: rig.head,
  };
}

/**
 * Smooth closed path through a ring of points (Catmull-Rom → cubic bezier).
 *
 * Control-point length is clamped against the segment it belongs to. A muscle
 * tapers to nearly nothing at each end, so consecutive ring points there can sit
 * a fraction of a unit apart while their neighbours are tens of units away —
 * unclamped, the tangent overshoots the segment several times over and the curve
 * folds back through itself, which shows up as hatched spikes at the tendon.
 */
export function closedPath(pts: Vec[]): string {
  const n = pts.length;
  if (n < 3) return "";

  const MAX = 0.42;
  const scaled = (from: Vec, dx: number, dy: number, span: number): Vec => {
    const len = Math.hypot(dx, dy);
    const limit = span * MAX;
    const k = len > limit && len > 0 ? limit / len : 1;
    return { x: from.x + dx * k, y: from.y + dy * k };
  };

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const span = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const c1 = scaled(p1, (p2.x - p0.x) / 6, (p2.y - p0.y) / 6, span);
    const c2 = scaled(p2, -(p3.x - p1.x) / 6, -(p3.y - p1.y) / 6, span);
    d += ` C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d + " Z";
}

const SAMPLES = 10;

/**
 * The outline of one muscle at a given activation.
 * `act` in 0..1 swells the belly and pulls the ends in.
 */
export function musclePath(
  def: MuscleDef,
  rig: Rig,
  sideIndex: 0 | 1,
  act: number,
): string {
  const joints = chainJoints(rig, def.chain, sideIndex);
  const a = joints[def.a];
  const b = joints[def.b];
  if (!a || !b) return "";

  const { n } = frame(a, b);
  const off = (v: Vec, amount: number): Vec => ({
    x: v.x + n.x * amount * def.side,
    y: v.y + n.y * amount * def.side,
  });

  if (def.kind === "blob") {
    const c = off(lerpV(a, b, def.t0), def.pad);
    const swell = 1 + 0.22 * act;
    const rx = (def.rx ?? def.w) * swell;
    const ry = def.w * swell;
    // Ellipse aligned to the bone, written as a path so it shares the strip
    // rendering path (and can be filled with the same gradient).
    const { d } = frame(a, b);
    const ang = (Math.atan2(d.y, d.x) * 180) / Math.PI;
    const pts: Vec[] = [];
    for (let i = 0; i < 12; i++) {
      const th = (i / 12) * Math.PI * 2;
      const ex = Math.cos(th) * rx;
      const ey = Math.sin(th) * ry;
      const ca = Math.cos((ang * Math.PI) / 180);
      const sa = Math.sin((ang * Math.PI) / 180);
      pts.push({ x: c.x + ex * ca - ey * sa, y: c.y + ex * sa + ey * ca });
    }
    return closedPath(pts);
  }

  // Contraction: belly thickens, origin and insertion creep toward each other.
  const pull = 0.035 * act;
  const t0 = def.t0 + pull;
  const t1 = def.t1 - pull;
  const swell = 1 + 0.4 * act;

  const outer: Vec[] = [];
  const inner: Vec[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const u = i / SAMPLES;
    const s = t0 + (t1 - t0) * u;
    const spine = lerpV(a, b, s);
    const profile = Math.pow(Math.sin(Math.PI * u), 0.4);
    outer.push(off(spine, def.pad + def.w * swell * profile));
    inner.push(off(spine, def.pad * 0.2 + def.w * 0.3 * profile));
  }
  return closedPath([...outer, ...inner.reverse()]);
}

/* ------------------------------------------------------------------ */
/* Activation → colour                                                 */
/* ------------------------------------------------------------------ */

export function activationColor(v: number, theme: Theme = "dark"): string {
  const ramp = THEME[theme].ramp;
  const t = Math.min(1, Math.max(0, v));
  for (let i = 0; i < ramp.length - 1; i++) {
    const [p0, c0] = ramp[i];
    const [p1, c1] = ramp[i + 1];
    if (t <= p1) {
      const k = (t - p0) / (p1 - p0);
      const c = c0.map((ch, j) => Math.round(ch + (c1[j] - ch) * k));
      return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    }
  }
  const last = ramp[ramp.length - 1][1];
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

/** How much bloom to put behind a muscle. Only the hard-working ones glow. */
export const glowFor = (v: number) => Math.max(0, (v - 0.55) / 0.45);
