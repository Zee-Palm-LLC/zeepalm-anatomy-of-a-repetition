/**
 * Stage maths: where the rig stands in the world, and how each movement is
 * fitted to the viewport.
 *
 * Kept out of the component deliberately. This is the part that has to be
 * *correct* — feet on the floor, palms planted, no impossible joints — and none
 * of it can be tested while it is trapped inside a React render.
 */

import {
  buildRig,
  dn,
  frame,
  lerpV,
  SEG,
  solveTwoBone,
  translateRig,
  type Arm,
  type Rig,
  type Vec,
} from "./anatomy";
import { samplePose, type Exercise } from "./exercises";

// Framed tight on the figure so it fills the stage rather than floating in it.
export const VB = { x: -20, y: 64, w: 620, h: 420 };
export const GROUND_Y = 468;
export const CENTER_X = 290;
export const BAR_X = 312;
export const BAR_Y = 96;

/** Place the rig in the world according to what the exercise is standing on. */
export function anchorRig(rig: Rig, anchor: Exercise["anchor"]): Rig {
  const contactY = (vs: Vec[]) => Math.max(...vs.map((v) => v.y));
  if (anchor === "hands") {
    const w = rig.arms[1].wrist;
    return translateRig(rig, BAR_X - w.x, BAR_Y - w.y);
  }
  if (anchor === "floor") {
    const pts = [
      ...rig.legs.flatMap((l) => [l.toe, l.heel]),
      ...rig.arms.flatMap((a) => [a.wrist, a.hand]),
    ];
    const mid = (Math.min(...pts.map((v) => v.x)) + Math.max(...pts.map((v) => v.x))) / 2;
    return translateRig(rig, CENTER_X - mid, GROUND_Y - contactY(pts));
  }
  const feet = rig.legs.flatMap((l) => [l.toe, l.heel]);
  return translateRig(rig, 0, GROUND_Y - contactY(feet));
}

/** Every joint the figure occupies, for framing purposes. */
export function allJoints(rig: Rig): Vec[] {
  return [
    rig.pelvis,
    rig.chest,
    rig.shoulder,
    rig.head,
    ...rig.legs.flatMap((l): Vec[] => [l.hip, l.knee, l.ankle, l.toe, l.heel]),
    ...rig.arms.flatMap((a): Vec[] => [a.shoulder, a.elbow, a.wrist, a.hand]),
  ];
}

/**
 * Framing, solved once per exercise across the whole rep rather than per frame
 * — otherwise the figure would drift and rescale as its silhouette changes.
 * A squat is tall and narrow, a push-up short and wide; each gets fitted to the
 * stage instead of floating in a fixed box sized for neither.
 */
export function framing(ex: Exercise, frameAt?: number, pad = 36): string {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const samples =
    frameAt === undefined
      ? Array.from({ length: 16 }, (_, i) => i / 16)
      : [frameAt];

  for (const t of samples) {
    const rig = plantHands(
      anchorRig(buildRig(samplePose(ex, t), ex.symmetric), ex.anchor),
      ex,
    );
    for (const j of allJoints(rig)) {
      if (j.x < minX) minX = j.x;
      if (j.x > maxX) maxX = j.x;
      if (j.y < minY) minY = j.y;
      if (j.y > maxY) maxY = j.y;
    }
  }
  if (ex.equipment === "pullup-bar") minY = Math.min(minY, BAR_Y);

  // Muscle bellies and the barbell sit outside the joint hull.
  minX -= pad;
  maxX += pad;
  minY -= pad;
  maxY += pad;

  const k = Math.min(
    frameAt === undefined ? 2.05 : 2.6,
    Math.max(0.75, Math.min(VB.w / (maxX - minX), VB.h / (maxY - minY))),
  );
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return `translate(${(VB.x + VB.w / 2).toFixed(2)} ${(VB.y + VB.h / 2).toFixed(
    2,
  )}) scale(${k.toFixed(4)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`;
}

/** Where a racked barbell sits: across the traps, behind the neck. */
export function rackPoint(rig: Rig): Vec {
  const { n } = frame(rig.pelvis, rig.chest);
  const c = lerpV(rig.shoulder, rig.head, 0.16);
  return { x: c.x + n.x * 15, y: c.y + n.y * 15 };
}

/** Re-solve both arms so the hands sit exactly on their contact point. */
export function plantHands(rig: Rig, ex: Exercise): Rig {
  if (!ex.handTarget) return rig;
  const bend = ex.elbowBend ?? 1;
  const arms = rig.arms.map((a): Arm => {
    const target =
      ex.handTarget === "bar"
        ? { x: BAR_X, y: BAR_Y }
        : { x: a.shoulder.x + 6, y: GROUND_Y };
    const { a: shA, b: elA } = solveTwoBone(
      a.shoulder,
      target,
      SEG.upperArm,
      SEG.forearm,
      bend,
    );
    const elbow = dn(a.shoulder, shA, SEG.upperArm);
    const wrist = dn(elbow, shA + elA, SEG.forearm);
    // On the floor the palm lies flat and points forward; letting the hand carry
    // on along the forearm would drive it through the ground.
    const hand =
      ex.handTarget === "floor"
        ? { x: wrist.x + SEG.hand * 0.85, y: wrist.y }
        : dn(wrist, shA + elA, SEG.hand);
    return { shoulder: a.shoulder, elbow, wrist, hand };
  }) as [Arm, Arm];
  return { ...rig, arms };
}

