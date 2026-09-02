/**
 * Renders one frame of a movement as a standalone SVG string.
 *
 * This exists so social assets can be produced from the *same* rig, curves and
 * palette the site animates — not from a screen recording, and not from a
 * second copy of the anatomy. Geometry, colour and framing are all imported;
 * only the markup assembly lives here, because the on-site version of that is
 * React and cannot be called from a build script.
 */

import { buildRig, type Rig, type Vec } from "./anatomy";
import { samplePose, sampleCurve, type Exercise } from "./exercises";
import { activationColor, glowFor, musclePath, MUSCLES } from "./muscles";
import { THEME, type Theme } from "./palette";
import {
  BAR_Y,
  GROUND_Y,
  allJoints,
  anchorRig,
  plantHands,
  rackPoint,
  torsoPath,
} from "./stage";

export type FrameOptions = {
  width: number;
  height: number;
  theme?: Theme;
  /** Fraction of the shorter side left as margin around the figure. */
  pad?: number;
  background?: string | null;
  /** Namespaces defs so a frame can be nested inside another SVG. */
  idPrefix?: string;
};

const n2 = (v: number) => v.toFixed(2);
const line = (a: Vec, b: Vec) => `M ${n2(a.x)} ${n2(a.y)} L ${n2(b.x)} ${n2(b.y)}`;

/** Fit the whole repetition into the target box, so nothing drifts or rescales. */
function fitTransform(ex: Exercise, width: number, height: number, pad: number) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < 24; i++) {
    const rig = plantHands(
      anchorRig(buildRig(samplePose(ex, i / 24), ex.symmetric), ex.anchor),
      ex,
    );
    for (const j of allJoints(rig)) {
      minX = Math.min(minX, j.x);
      maxX = Math.max(maxX, j.x);
      minY = Math.min(minY, j.y);
      maxY = Math.max(maxY, j.y);
    }
  }
  if (ex.equipment === "pullup-bar") minY = Math.min(minY, BAR_Y);

  // Muscle bellies and the barbell sit outside the joint hull.
  const margin = 20;
  minX -= margin;
  maxX += margin;
  minY -= margin;
  maxY += margin;

  const boxW = width * (1 - pad);
  const boxH = height * (1 - pad);
  const k = Math.min(boxW / (maxX - minX), boxH / (maxY - minY));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return `translate(${n2(width / 2)} ${n2(height / 2)}) scale(${k.toFixed(
    5,
  )}) translate(${n2(-cx)} ${n2(-cy)})`;
}

function silhouette(rig: Rig, side: 0 | 1, skin: (typeof THEME)[Theme]) {
  const leg = rig.legs[side];
  const arm = rig.arms[side];
  const far = side === 0;
  const c = far ? skin.bodyFar : skin.bodyNear;
  const w = (near: number, farW: number) => (far ? farW : near);
  return `<g stroke="${c}" stroke-linecap="round" fill="none">
    <path d="${line(leg.hip, leg.knee)}" stroke-width="${w(40, 36)}"/>
    <path d="${line(leg.knee, leg.ankle)}" stroke-width="${w(30, 27)}"/>
    <path d="${line(leg.heel, leg.toe)}" stroke-width="${w(16, 14)}"/>
    <path d="${line(arm.shoulder, arm.elbow)}" stroke-width="${w(26, 23)}"/>
    <path d="${line(arm.elbow, arm.wrist)}" stroke-width="${w(21, 19)}"/>
    <path d="${line(arm.wrist, arm.hand)}" stroke-width="${w(15, 13)}"/>
  </g>`;
}

export function renderFrame(ex: Exercise, t: number, opts: FrameOptions): string {
  const { width, height, theme = "dark", pad = 0.08, idPrefix = "f" } = opts;
  const background = opts.background === undefined ? "#070B12" : opts.background;
  const skin = THEME[theme];

  const rig = plantHands(
    anchorRig(buildRig(samplePose(ex, t), ex.symmetric), ex.anchor),
    ex,
  );
  const acts = Object.fromEntries(
    MUSCLES.map((m) => [m.id, sampleCurve(ex.activation[m.id], t)]),
  ) as Record<string, number>;

  const muscles = (chain: "leg" | "arm" | "torso", side: 0 | 1) =>
    MUSCLES.filter((m) => m.chain === chain)
      .map((m) => {
        const act = acts[m.id];
        const d = musclePath(m, rig, side, act);
        if (!d) return "";
        const colour = activationColor(act, theme);
        const bloom = glowFor(act);
        const halo =
          bloom > 0.01
            ? `<path d="${d}" fill="${colour}" opacity="${(
                bloom * skin.glowStrength
              ).toFixed(3)}" filter="url(#${idPrefix}-bloom)"/>`
            : "";
        return `<g opacity="${side === 0 ? 0.45 : 1}">${halo}<path d="${d}" fill="${colour}" stroke="${
          skin.muscleEdge
        }" stroke-width="0.9"/></g>`;
      })
      .join("");

  const onFloor = ex.anchor !== "hands";
  const contacts = [
    ...rig.legs.flatMap((l) => [l.toe, l.heel]),
    ...(ex.handTarget === "floor" ? rig.arms.map((a) => a.wrist) : []),
  ];
  const lowest = Math.max(...contacts.map((c) => c.y));
  const footCx =
    (Math.min(...contacts.map((c) => c.x)) + Math.max(...contacts.map((c) => c.x))) / 2;
  const footRx = Math.max(80, (Math.max(...contacts.map((c) => c.x)) - Math.min(...contacts.map((c) => c.x))) / 2 + 42);

  const barPos = ex.equipment === "barbell-back" ? rackPoint(rig) : rig.arms[1].wrist;
  const facing = { x: rig.head.x + 9, y: rig.head.y + 2 };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <filter id="${idPrefix}-bloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="${idPrefix}-floorGlow" cx="50%" cy="50%">
    <stop offset="0%" stop-color="${skin.glow}" stop-opacity="0.14"/>
    <stop offset="100%" stop-color="${skin.glow}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="${idPrefix}-groundLine" x1="0" x2="1">
    <stop offset="0%" stop-color="${skin.ground}" stop-opacity="0"/>
    <stop offset="50%" stop-color="${skin.ground}" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="${skin.ground}" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="${idPrefix}-vignette" cx="50%" cy="52%">
    <stop offset="55%" stop-color="${skin.glow}" stop-opacity="0.07"/>
    <stop offset="100%" stop-color="${skin.glow}" stop-opacity="0"/>
  </radialGradient>
</defs>
${background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : ""}
<rect width="${width}" height="${height}" fill="url(#${idPrefix}-vignette)"/>
<g transform="${fitTransform(ex, width, height, pad)}">
  ${
    onFloor
      ? `<ellipse cx="${n2(footCx)}" cy="${GROUND_Y}" rx="${n2(footRx + 90)}" ry="42" fill="url(#${idPrefix}-floorGlow)"/>
         <line x1="-3000" x2="3000" y1="${GROUND_Y}" y2="${GROUND_Y}" stroke="url(#${idPrefix}-groundLine)" stroke-width="1.5"/>
         <ellipse cx="${n2(footCx)}" cy="${n2(Math.min(GROUND_Y, lowest) + 4)}" rx="${n2(footRx)}" ry="9" fill="${skin.shadow}" opacity="${skin.shadowOpacity}"/>`
      : ""
  }
  ${
    ex.equipment === "pullup-bar"
      ? `<line x1="90" x2="490" y1="${BAR_Y}" y2="${BAR_Y}" stroke="${skin.rigBar}" stroke-width="9" stroke-linecap="round"/>
         <line x1="112" x2="112" y1="-40" y2="${BAR_Y}" stroke="${skin.rigPost}" stroke-width="7"/>
         <line x1="468" x2="468" y1="-40" y2="${BAR_Y}" stroke="${skin.rigPost}" stroke-width="7"/>`
      : ""
  }
  ${silhouette(rig, 0, skin)}${muscles("leg", 0)}${muscles("arm", 0)}
  <path d="${torsoPath(rig)}" fill="${skin.bodyNear}"/>
  <path d="${line(rig.chest, rig.head)}" stroke="${skin.bodyNear}" stroke-width="23" stroke-linecap="round" fill="none"/>
  <circle cx="${n2(rig.head.x)}" cy="${n2(rig.head.y)}" r="23" fill="${skin.head}"/>
  <circle cx="${n2(facing.x)}" cy="${n2(facing.y)}" r="14" fill="${skin.face}"/>
  ${muscles("torso", 1)}
  ${silhouette(rig, 1, skin)}${muscles("leg", 1)}${muscles("arm", 1)}
  ${
    ex.equipment !== "none" && ex.equipment !== "pullup-bar"
      ? `<circle cx="${n2(barPos.x)}" cy="${n2(barPos.y)}" r="27" fill="${skin.barPlate}" stroke="${skin.barPlateEdge}" stroke-width="2.5"/>
         <circle cx="${n2(barPos.x)}" cy="${n2(barPos.y)}" r="18" fill="${skin.barInner}"/>
         <circle cx="${n2(barPos.x)}" cy="${n2(barPos.y)}" r="9" fill="${skin.barSleeve}"/>
         <circle cx="${n2(barPos.x)}" cy="${n2(barPos.y)}" r="4" fill="${skin.barCollar}"/>`
      : ""
  }
</g>
</svg>`;
}
