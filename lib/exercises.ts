/**
 * Movement definitions. A repetition is one loop of t from 0 to 1.
 *
 * Poses are keyframed and interpolated with a smoothstep, which is what keeps
 * the motion from looking like a flipbook. Activation curves are authored
 * against the same t, so the colour and the movement can never drift apart.
 */

import type { Pose } from "./anatomy";
import type { MuscleId } from "./muscles";

export type Keyframe = { t: number; pose: Pose };
export type Curve = [number, number][];
export type Anchor = "feet" | "hands" | "floor";
export type Equipment = "barbell-back" | "barbell-hands" | "pullup-bar" | "none";

export type Exercise = {
  id: string;
  name: string;
  family: string;
  cue: string;
  anchor: Anchor;
  equipment: Equipment;
  symmetric: boolean;
  /** Where the hands are pinned. Arms are then solved by IK, not keyframed. */
  handTarget?: "floor" | "bar";
  elbowBend?: 1 | -1;
  keys: Keyframe[];
  phases: { from: number; label: string }[];
  activation: Record<MuscleId, Curve>;
  primary: MuscleId[];
  /** The thing a coach would actually say about the repetition. */
  note: string;
};

const p = (
  torso: number,
  neck: number,
  leg: [number, number, number],
  arm: [number, number],
  farLeg?: [number, number, number],
  farArm?: [number, number],
): Pose => ({
  torso,
  neck,
  legs: [
    { hip: (farLeg ?? leg)[0], knee: (farLeg ?? leg)[1], ankle: (farLeg ?? leg)[2] },
    { hip: leg[0], knee: leg[1], ankle: leg[2] },
  ],
  arms: [
    { shoulder: (farArm ?? arm)[0], elbow: (farArm ?? arm)[1] },
    { shoulder: arm[0], elbow: arm[1] },
  ],
});

/** Fill in the muscles an exercise doesn't bother naming, at a resting hum. */
const rest = (v: number): Curve => [
  [0, v],
  [1, v],
];

function curves(given: Partial<Record<MuscleId, Curve>>): Record<MuscleId, Curve> {
  const base: Record<MuscleId, Curve> = {
    quads: rest(0.1),
    hamstrings: rest(0.1),
    glutes: rest(0.1),
    calves: rest(0.1),
    erectors: rest(0.12),
    abs: rest(0.12),
    lats: rest(0.1),
    traps: rest(0.1),
    delts: rest(0.1),
    pecs: rest(0.08),
    biceps: rest(0.08),
    triceps: rest(0.08),
    forearms: rest(0.1),
  };
  return { ...base, ...given };
}

export const EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Back Squat",
    family: "Knee-dominant",
    cue: "Sit between the hips, drive the floor away",
    anchor: "feet",
    equipment: "barbell-back",
    symmetric: true,
    keys: [
      { t: 0, pose: p(6, -2, [2, 3, 0], [-15, -150]) },
      { t: 0.25, pose: p(20, -4, [40, 55, 8], [-15, -150]) },
      { t: 0.5, pose: p(32, -6, [78, 105, 16], [-15, -150]) },
      { t: 0.75, pose: p(22, -4, [44, 60, 9], [-15, -150]) },
      { t: 1, pose: p(6, -2, [2, 3, 0], [-15, -150]) },
    ],
    phases: [
      { from: 0, label: "Eccentric — lowering" },
      { from: 0.46, label: "Bottom position" },
      { from: 0.56, label: "Concentric — driving up" },
      { from: 0.9, label: "Lockout" },
    ],
    primary: ["quads", "glutes", "erectors"],
    note: "The erectors never get a rest. They are working before the knees bend and they are still working at lockout — which is why the squat loads the back as much as the legs.",
    activation: curves({
      quads: [[0, 0.2], [0.25, 0.55], [0.5, 0.8], [0.62, 0.98], [0.82, 0.55], [1, 0.2]],
      glutes: [[0, 0.15], [0.3, 0.45], [0.5, 0.72], [0.62, 0.95], [0.84, 0.45], [1, 0.15]],
      hamstrings: [[0, 0.12], [0.5, 0.45], [0.66, 0.55], [1, 0.12]],
      erectors: [[0, 0.35], [0.25, 0.7], [0.5, 0.85], [0.7, 0.82], [1, 0.35]],
      abs: [[0, 0.25], [0.5, 0.58], [0.66, 0.64], [1, 0.25]],
      calves: [[0, 0.2], [0.5, 0.45], [0.66, 0.55], [1, 0.2]],
      traps: [[0, 0.45], [0.5, 0.58], [1, 0.45]],
      lats: [[0, 0.3], [0.5, 0.46], [1, 0.3]],
      delts: [[0, 0.25], [0.5, 0.32], [1, 0.25]],
      forearms: [[0, 0.35], [0.5, 0.42], [1, 0.35]],
    }),
  },
  {
    id: "deadlift",
    name: "Deadlift",
    family: "Hip-dominant",
    cue: "Push the floor, then finish with the hips",
    anchor: "feet",
    equipment: "barbell-hands",
    symmetric: true,
    keys: [
      { t: 0, pose: p(57, -16, [70, 82, 12], [4, 2]) },
      { t: 0.25, pose: p(48, -11, [40, 44, 7], [4, 2]) },
      { t: 0.5, pose: p(3, 0, [2, 3, 0], [6, 2]) },
      { t: 0.75, pose: p(48, -11, [42, 46, 7], [4, 2]) },
      { t: 1, pose: p(57, -16, [70, 82, 12], [4, 2]) },
    ],
    phases: [
      { from: 0, label: "Set-up — bar on the floor" },
      { from: 0.08, label: "Concentric — breaking the floor" },
      { from: 0.34, label: "Hip extension" },
      { from: 0.46, label: "Lockout" },
      { from: 0.58, label: "Eccentric — returning" },
    ],
    primary: ["erectors", "glutes", "hamstrings"],
    note: "Watch the handoff. The quads break the bar off the floor, then the glutes and hamstrings take over above the knee. Two different muscles, one continuous pull.",
    activation: curves({
      erectors: [[0, 0.6], [0.2, 0.95], [0.45, 0.72], [0.55, 0.62], [0.78, 0.9], [1, 0.6]],
      glutes: [[0, 0.3], [0.26, 0.9], [0.5, 0.55], [0.8, 0.62], [1, 0.3]],
      hamstrings: [[0, 0.45], [0.22, 0.9], [0.5, 0.4], [0.8, 0.75], [1, 0.45]],
      quads: [[0, 0.6], [0.14, 0.72], [0.5, 0.2], [0.86, 0.5], [1, 0.6]],
      traps: [[0, 0.5], [0.3, 0.85], [0.5, 0.8], [1, 0.5]],
      lats: [[0, 0.55], [0.25, 0.82], [0.5, 0.6], [1, 0.55]],
      forearms: [[0, 0.7], [0.3, 0.95], [0.5, 0.9], [1, 0.7]],
      abs: [[0, 0.4], [0.25, 0.62], [1, 0.4]],
      calves: [[0, 0.3], [0.3, 0.5], [1, 0.3]],
      delts: [[0, 0.25], [1, 0.25]],
      biceps: [[0, 0.15], [1, 0.15]],
    }),
  },
  {
    id: "pushup",
    name: "Push-Up",
    family: "Horizontal press",
    cue: "One rigid line from heel to head",
    anchor: "feet",
    equipment: "none",
    symmetric: true,
    handTarget: "floor",
    elbowBend: -1,
    keys: [
      { t: 0, pose: p(72, -18, [-72, 2, -30], [0, 0]) },
      { t: 0.25, pose: p(78, -16, [-78, 2, -29], [0, 0]) },
      { t: 0.5, pose: p(84, -14, [-84, 2, -28], [0, 0]) },
      { t: 0.75, pose: p(78, -16, [-78, 2, -29], [0, 0]) },
      { t: 1, pose: p(72, -18, [-72, 2, -30], [0, 0]) },
    ],
    phases: [
      { from: 0, label: "Eccentric — lowering" },
      { from: 0.46, label: "Bottom position" },
      { from: 0.56, label: "Concentric — pressing" },
      { from: 0.9, label: "Lockout" },
    ],
    primary: ["pecs", "triceps", "delts"],
    note: "The abs and erectors hold a near-constant value the whole repetition. Nothing about the push-up looks like a core exercise, and the plank underneath it never switches off.",
    activation: curves({
      pecs: [[0, 0.3], [0.5, 0.75], [0.64, 0.95], [1, 0.3]],
      triceps: [[0, 0.35], [0.5, 0.7], [0.64, 0.92], [1, 0.35]],
      delts: [[0, 0.3], [0.5, 0.65], [0.64, 0.8], [1, 0.3]],
      abs: [[0, 0.55], [0.5, 0.66], [1, 0.55]],
      erectors: [[0, 0.45], [0.5, 0.52], [1, 0.45]],
      glutes: [[0, 0.4], [0.5, 0.45], [1, 0.4]],
      quads: [[0, 0.35], [1, 0.35]],
      traps: [[0, 0.35], [0.5, 0.5], [1, 0.35]],
      lats: [[0, 0.2], [0.5, 0.3], [1, 0.2]],
      forearms: [[0, 0.3], [0.5, 0.45], [1, 0.3]],
      hamstrings: [[0, 0.25], [1, 0.25]],
    }),
  },
  {
    id: "pullup",
    name: "Pull-Up",
    family: "Vertical pull",
    cue: "Pull the elbows down and back",
    anchor: "hands",
    equipment: "pullup-bar",
    symmetric: true,
    handTarget: "bar",
    elbowBend: 1,
    keys: [
      { t: 0, pose: p(-2, 2, [-8, 20, 0], [178, 4]) },
      { t: 0.25, pose: p(-4, 4, [-11, 27, 0], [150, 70]) },
      { t: 0.5, pose: p(-7, 6, [-14, 34, 0], [110, 140]) },
      { t: 0.75, pose: p(-4, 4, [-11, 27, 0], [150, 70]) },
      { t: 1, pose: p(-2, 2, [-8, 20, 0], [178, 4]) },
    ],
    phases: [
      { from: 0, label: "Dead hang" },
      { from: 0.08, label: "Concentric — pulling" },
      { from: 0.46, label: "Chin over the bar" },
      { from: 0.58, label: "Eccentric — lowering" },
    ],
    primary: ["lats", "biceps", "traps"],
    note: "Forearms start near their peak and stay there. On a long set the grip is usually what fails first — not the back.",
    activation: curves({
      lats: [[0, 0.35], [0.2, 0.85], [0.45, 0.95], [0.55, 0.88], [0.78, 0.6], [1, 0.35]],
      biceps: [[0, 0.25], [0.25, 0.75], [0.5, 0.85], [0.8, 0.55], [1, 0.25]],
      traps: [[0, 0.4], [0.3, 0.8], [0.5, 0.75], [1, 0.4]],
      forearms: [[0, 0.7], [0.5, 0.88], [1, 0.7]],
      delts: [[0, 0.3], [0.3, 0.6], [0.5, 0.62], [1, 0.3]],
      abs: [[0, 0.35], [0.5, 0.55], [1, 0.35]],
      erectors: [[0, 0.3], [0.5, 0.42], [1, 0.3]],
      pecs: [[0, 0.2], [0.4, 0.42], [1, 0.2]],
      hamstrings: [[0, 0.15], [1, 0.15]],
    }),
  },
  {
    id: "press",
    name: "Overhead Press",
    family: "Vertical press",
    cue: "Bar through the ears, ribs down",
    anchor: "feet",
    equipment: "barbell-hands",
    symmetric: true,
    keys: [
      { t: 0, pose: p(2, 0, [2, 3, 0], [32, 128]) },
      { t: 0.25, pose: p(-1, -4, [2, 3, 0], [96, 78]) },
      { t: 0.5, pose: p(-4, 2, [2, 3, 0], [176, 4]) },
      { t: 0.75, pose: p(-1, -4, [2, 3, 0], [96, 78]) },
      { t: 1, pose: p(2, 0, [2, 3, 0], [32, 128]) },
    ],
    phases: [
      { from: 0, label: "Front rack" },
      { from: 0.08, label: "Concentric — pressing" },
      { from: 0.46, label: "Overhead lockout" },
      { from: 0.58, label: "Eccentric — returning" },
    ],
    primary: ["delts", "triceps", "traps"],
    note: "The legs are not idle. Quads, glutes and erectors hold a braced column the whole time — a standing press is a core exercise that happens to move a bar.",
    activation: curves({
      delts: [[0, 0.35], [0.2, 0.9], [0.45, 0.95], [0.55, 0.72], [0.82, 0.6], [1, 0.35]],
      triceps: [[0, 0.2], [0.35, 0.7], [0.5, 0.85], [1, 0.2]],
      traps: [[0, 0.3], [0.4, 0.75], [0.5, 0.8], [1, 0.3]],
      abs: [[0, 0.45], [0.3, 0.68], [0.5, 0.6], [1, 0.45]],
      erectors: [[0, 0.5], [0.3, 0.72], [1, 0.5]],
      pecs: [[0, 0.35], [0.2, 0.52], [0.5, 0.25], [1, 0.35]],
      forearms: [[0, 0.5], [0.5, 0.62], [1, 0.5]],
      glutes: [[0, 0.3], [1, 0.3]],
      quads: [[0, 0.3], [1, 0.3]],
      lats: [[0, 0.25], [0.5, 0.36], [1, 0.25]],
      calves: [[0, 0.25], [1, 0.25]],
    }),
  },
  {
    id: "lunge",
    name: "Split Lunge",
    family: "Single-leg",
    cue: "Back knee down, front shin quiet",
    anchor: "feet",
    equipment: "none",
    symmetric: false,
    keys: [
      { t: 0, pose: p(6, 0, [20, 14, -6], [8, 6], [-14, 38, -28], [10, 6]) },
      { t: 0.25, pose: p(9, 0, [29, 51, 22], [8, 6], [-11, 58, -28], [10, 6]) },
      { t: 0.5, pose: p(11, 0, [38, 88, 50], [8, 6], [-8, 79, -28], [10, 6]) },
      { t: 0.75, pose: p(9, 0, [29, 51, 22], [8, 6], [-11, 58, -28], [10, 6]) },
      { t: 1, pose: p(6, 0, [20, 14, -6], [8, 6], [-14, 38, -28], [10, 6]) },
    ],
    phases: [
      { from: 0, label: "Split stance" },
      { from: 0.1, label: "Eccentric — lowering" },
      { from: 0.46, label: "Bottom position" },
      { from: 0.56, label: "Concentric — driving up" },
    ],
    primary: ["quads", "glutes", "abs"],
    note: "Activation here is drawn per muscle group, not per leg. In a real split stance the front and back leg are doing quite different jobs.",
    activation: curves({
      quads: [[0, 0.25], [0.3, 0.6], [0.5, 0.8], [0.66, 0.95], [1, 0.25]],
      glutes: [[0, 0.2], [0.5, 0.75], [0.66, 0.9], [1, 0.2]],
      hamstrings: [[0, 0.18], [0.5, 0.5], [0.68, 0.6], [1, 0.18]],
      abs: [[0, 0.35], [0.5, 0.62], [1, 0.35]],
      erectors: [[0, 0.38], [0.5, 0.62], [1, 0.38]],
      calves: [[0, 0.28], [0.5, 0.58], [0.66, 0.62], [1, 0.28]],
      traps: [[0, 0.15], [1, 0.15]],
    }),
  },
];

/* ------------------------------------------------------------------ */
/* Sampling                                                            */
/* ------------------------------------------------------------------ */

const smooth = (t: number) => t * t * (3 - 2 * t);

function segment<T extends { t: number }>(keys: T[], t: number) {
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const span = b.t - a.t || 1;
  return { a, b, k: smooth(Math.min(1, Math.max(0, (t - a.t) / span))) };
}

const mix = (x: number, y: number, k: number) => x + (y - x) * k;

export function samplePose(ex: Exercise, t: number): Pose {
  const { a, b, k } = segment(ex.keys, t);
  const A = a.pose;
  const B = b.pose;
  return {
    torso: mix(A.torso, B.torso, k),
    neck: mix(A.neck, B.neck, k),
    legs: [0, 1].map((i) => ({
      hip: mix(A.legs[i].hip, B.legs[i].hip, k),
      knee: mix(A.legs[i].knee, B.legs[i].knee, k),
      ankle: mix(A.legs[i].ankle, B.legs[i].ankle, k),
    })) as Pose["legs"],
    arms: [0, 1].map((i) => ({
      shoulder: mix(A.arms[i].shoulder, B.arms[i].shoulder, k),
      elbow: mix(A.arms[i].elbow, B.arms[i].elbow, k),
    })) as Pose["arms"],
  };
}

export function sampleCurve(curve: Curve, t: number): number {
  if (curve.length === 1) return curve[0][1];
  let i = 0;
  while (i < curve.length - 2 && t >= curve[i + 1][0]) i++;
  const [t0, v0] = curve[i];
  const [t1, v1] = curve[i + 1];
  const span = t1 - t0 || 1;
  return mix(v0, v1, smooth(Math.min(1, Math.max(0, (t - t0) / span))));
}

export function phaseAt(ex: Exercise, t: number): string {
  let label = ex.phases[0].label;
  for (const ph of ex.phases) if (t >= ph.from) label = ph.label;
  return label;
}
