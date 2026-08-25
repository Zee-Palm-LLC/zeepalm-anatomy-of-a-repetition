/**
 * Forward-kinematic rig for a side-on human figure, plus the muscle geometry
 * that hangs off it.
 *
 * Angles are authored in WORLD space, in degrees. Two conventions:
 *   dn(θ): θ=0 points straight down (0,+1); positive rotates toward +x
 *   up(θ): θ=0 points straight up   (0,-1); positive tilts toward +x
 * The figure faces +x, so +x is anterior.
 */

export type Vec = { x: number; y: number };

const RAD = Math.PI / 180;

export const dn = (from: Vec, deg: number, len: number): Vec => ({
  x: from.x + Math.sin(deg * RAD) * len,
  y: from.y + Math.cos(deg * RAD) * len,
});

export const up = (from: Vec, deg: number, len: number): Vec => ({
  x: from.x + Math.sin(deg * RAD) * len,
  y: from.y - Math.cos(deg * RAD) * len,
});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpV = (a: Vec, b: Vec, t: number): Vec => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

/** Unit vector a→b, and the left-hand normal. */
export function frame(a: Vec, b: Vec) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const d = { x: dx / len, y: dy / len };
  return { d, n: { x: d.y, y: -d.x }, len };
}

/* ------------------------------------------------------------------ */
/* Segment lengths (px). Roughly 7.5 head-units.                       */
/* ------------------------------------------------------------------ */

export const SEG = {
  thigh: 96,
  shin: 94,
  foot: 34,
  heel: 14,
  torso: 120,
  neck: 30,
  headR: 25,
  upperArm: 82,
  forearm: 76,
  hand: 16,
};

/* ------------------------------------------------------------------ */
/* Pose                                                                */
/* ------------------------------------------------------------------ */

export type LegPose = { hip: number; knee: number; ankle: number };
export type ArmPose = { shoulder: number; elbow: number };

export type Pose = {
  torso: number;
  neck: number;
  /** [far, near] */
  legs: [LegPose, LegPose];
  arms: [ArmPose, ArmPose];
};

export type Limb = {
  hip: Vec;
  knee: Vec;
  ankle: Vec;
  toe: Vec;
  heel: Vec;
};

export type Arm = {
  shoulder: Vec;
  elbow: Vec;
  wrist: Vec;
  hand: Vec;
};

export type Rig = {
  pelvis: Vec;
  chest: Vec;
  shoulder: Vec;
  neck: Vec;
  head: Vec;
  legs: [Limb, Limb];
  arms: [Arm, Arm];
};

/** Depth offset so the far-side limb doesn't hide exactly behind the near one. */
const FAR_DELTA: LegPose = { hip: 7, knee: -6, ankle: 0 };
const FAR_ARM_DELTA: ArmPose = { shoulder: -9, elbow: 4 };

export function buildRig(pose: Pose, symmetric: boolean): Rig {
  const pelvis = { x: 0, y: 0 };
  const chest = up(pelvis, pose.torso, SEG.torso);
  const shoulder = up(pelvis, pose.torso, SEG.torso * 0.9);
  const neck = up(chest, pose.torso + pose.neck, SEG.neck * 0.45);
  const head = up(chest, pose.torso + pose.neck, SEG.neck * 0.72 + SEG.headR * 0.7);

  const leg = (p: LegPose, far: boolean): Limb => {
    const offset = far && symmetric;
    const hipA = p.hip + (offset ? FAR_DELTA.hip : 0);
    // The depth offset is scaled by how flexed the knee already is, and never
    // allowed past straight. A knee that is bent 100 degrees can absorb a few
    // degrees of separation; a straight one would be pushed backwards into
    // hyperextension, which is exactly what a knee cannot do.
    const kneeA = Math.max(
      0,
      p.knee + (offset ? FAR_DELTA.knee * Math.min(1, p.knee / 30) : 0),
    );
    const hip = { x: pelvis.x + (far ? -5 : 5), y: pelvis.y + (far ? -2 : 2) };
    const knee = dn(hip, hipA, SEG.thigh);
    const shinA = hipA - kneeA;
    const ankle = dn(knee, shinA, SEG.shin);
    const footA = shinA + 90 + p.ankle;
    return {
      hip,
      knee,
      ankle,
      toe: dn(ankle, footA, SEG.foot),
      heel: dn(ankle, footA, -SEG.heel),
    };
  };

  const arm = (p: ArmPose, far: boolean): Arm => {
    const shA = p.shoulder + (far && symmetric ? FAR_ARM_DELTA.shoulder : 0);
    const elA = p.elbow + (far && symmetric ? FAR_ARM_DELTA.elbow : 0);
    const sh = { x: shoulder.x + (far ? -6 : 6), y: shoulder.y + (far ? -2 : 2) };
    const elbow = dn(sh, shA, SEG.upperArm);
    const wrist = dn(elbow, shA + elA, SEG.forearm);
    return { shoulder: sh, elbow, wrist, hand: dn(wrist, shA + elA, SEG.hand) };
  };

  return {
    pelvis,
    chest,
    shoulder,
    neck,
    head,
    legs: [leg(pose.legs[0], true), leg(pose.legs[1], false)],
    arms: [arm(pose.arms[0], true), arm(pose.arms[1], false)],
  };
}

/** Shift every joint in the rig by (dx, dy). */
export function translateRig(rig: Rig, dx: number, dy: number): Rig {
  const t = (v: Vec): Vec => ({ x: v.x + dx, y: v.y + dy });
  return {
    pelvis: t(rig.pelvis),
    chest: t(rig.chest),
    shoulder: t(rig.shoulder),
    neck: t(rig.neck),
    head: t(rig.head),
    legs: rig.legs.map((l) => ({
      hip: t(l.hip),
      knee: t(l.knee),
      ankle: t(l.ankle),
      toe: t(l.toe),
      heel: t(l.heel),
    })) as [Limb, Limb],
    arms: rig.arms.map((a) => ({
      shoulder: t(a.shoulder),
      elbow: t(a.elbow),
      wrist: t(a.wrist),
      hand: t(a.hand),
    })) as [Arm, Arm],
  };
}

/**
 * Two-bone IK, solved in the plane, returning angles in the dn() convention.
 *
 * Hand-authoring arm angles for a push-up means guessing the exact bend that
 * lands the palm on the floor, and getting it wrong by a few degrees leaves the
 * figure hovering. Solving for the contact point instead makes planted hands a
 * property of the rig rather than something to keep re-tuning.
 */
export function solveTwoBone(
  root: Vec,
  target: Vec,
  l1: number,
  l2: number,
  bend: 1 | -1,
): { a: number; b: number } {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const reach = Math.hypot(dx, dy);
  // Clamped to the annulus the two bones can actually reach. No margin on the
  // outer edge: acos is clamped below, so full extension resolves exactly.
  const d = Math.min(Math.max(reach, Math.abs(l1 - l2) + 1e-9), l1 + l2);

  const base = (Math.atan2(dx, dy) * 180) / Math.PI;
  const clamp = (v: number) => Math.min(1, Math.max(-1, v));

  const upper =
    (Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))) * 180) / Math.PI;
  const interior =
    (Math.acos(clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2))) * 180) / Math.PI;

  return { a: base + bend * upper, b: -bend * (180 - interior) };
}
