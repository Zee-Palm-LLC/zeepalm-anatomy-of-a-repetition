"use client";

import { memo, useMemo, type KeyboardEvent } from "react";
import { buildRig, type Rig, type Vec } from "@/lib/anatomy";
import {
  activationColor,
  glowFor,
  musclePath,
  MUSCLES,
  type MuscleId,
} from "@/lib/muscles";
import { samplePose, sampleCurve, type Exercise } from "@/lib/exercises";
import { THEME, type Theme } from "@/lib/palette";

import {
  BAR_Y,
  GROUND_Y,
  VB,
  anchorRig,
  framing,
  plantHands,
  rackPoint,
  torsoPath,
} from "@/lib/stage";

type Props = {
  exercise: Exercise;
  t: number;
  hovered: MuscleId | null;
  selected: MuscleId | null;
  showMuscles: boolean;
  onHover: (id: MuscleId | null) => void;
  onSelect: (id: MuscleId) => void;
  /**
   * Frame for a single instant instead of the whole repetition. A thumbnail only ever
   * shows one pose, so fitting the union of all sixteen sampled frames shrinks
   * it to make room for poses that are never drawn.
   */
  frameAt?: number;
  framePad?: number;
  theme?: Theme;
  /** Thumbnails are decorative: no focus stops, no duplicate labels. */
  interactive?: boolean;
};

const bone = (a: Vec, b: Vec) => `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;

function Silhouette({
  rig,
  side,
  skin,
}: {
  rig: Rig;
  side: 0 | 1;
  skin: (typeof THEME)[Theme];
}) {
  const leg = rig.legs[side];
  const arm = rig.arms[side];
  const far = side === 0;
  const fill = far ? skin.bodyFar : skin.bodyNear;
  return (
    <g stroke={fill} strokeLinecap="round" fill="none">
      <path d={bone(leg.hip, leg.knee)} strokeWidth={far ? 36 : 40} />
      <path d={bone(leg.knee, leg.ankle)} strokeWidth={far ? 27 : 30} />
      <path d={bone(leg.heel, leg.toe)} strokeWidth={far ? 14 : 16} />
      <path d={bone(arm.shoulder, arm.elbow)} strokeWidth={far ? 23 : 26} />
      <path d={bone(arm.elbow, arm.wrist)} strokeWidth={far ? 19 : 21} />
      <path d={bone(arm.wrist, arm.hand)} strokeWidth={far ? 13 : 15} />
    </g>
  );
}

function Figure({
  exercise,
  t,
  hovered,
  selected,
  showMuscles,
  onHover,
  onSelect,
  frameAt,
  framePad,
  theme = "light",
  interactive = true,
}: Props) {
  const skin = THEME[theme];
  const transform = useMemo(
    () => framing(exercise, frameAt, framePad),
    [exercise, frameAt, framePad],
  );

  const { rig, acts } = useMemo(() => {
    const raw = buildRig(samplePose(exercise, t), exercise.symmetric);
    const map = {} as Record<MuscleId, number>;
    for (const m of MUSCLES) map[m.id] = sampleCurve(exercise.activation[m.id], t);
    return { rig: plantHands(anchorRig(raw, exercise.anchor), exercise), acts: map };
  }, [exercise, t]);

  const focus = selected ?? hovered;

  const renderMuscles = (chain: "leg" | "arm" | "torso", side: 0 | 1) =>
    MUSCLES.filter((m) => m.chain === chain).map((m) => {
      const act = acts[m.id];
      const d = musclePath(m, rig, side, act);
      if (!d) return null;
      const dim = focus && focus !== m.id;
      const color = showMuscles ? activationColor(act, theme) : skin.muscleInert;
      const glow = showMuscles ? glowFor(act) : 0;
      return (
        <g key={`${m.id}-${side}`} opacity={side === 0 ? 0.45 : 1}>
          {glow > 0.01 && (
            <path d={d} fill={color} opacity={glow * skin.glowStrength} filter={`url(#bloom-${theme})`} />
          )}
          <path
            d={d}
            fill={color}
            stroke={focus === m.id ? skin.muscleEdgeFocus : skin.muscleEdge}
            strokeWidth={focus === m.id ? 1.6 : 0.9}
            opacity={dim ? 0.28 : 1}
            style={{ cursor: "pointer", transition: "opacity 180ms ease" }}
            onMouseEnter={() => onHover(m.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(m.id)}
            {...(side === 1 && interactive
              ? {
                  role: "button" as const,
                  tabIndex: 0,
                  "aria-label": `${m.label}, ${Math.round(act * 100)} percent`,
                  "aria-pressed": selected === m.id,
                  onFocus: () => onHover(m.id),
                  onBlur: () => onHover(null),
                  onKeyDown: (e: KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(m.id);
                    }
                  },
                }
              : { "aria-hidden": true as const })}
          />
        </g>
      );
    });

  const barPos =
    exercise.equipment === "barbell-back" ? rackPoint(rig) : rig.arms[1].wrist;
  const facing = { x: rig.head.x + 9, y: rig.head.y + 2 };

  const onFloor = exercise.anchor !== "hands";
  // Contact points, so the shadow tracks the figure instead of a fixed centre.
  const contacts = [
    ...rig.legs.flatMap((l) => [l.toe, l.heel]),
    ...(exercise.handTarget === "floor" ? rig.arms.map((a) => a.wrist) : []),
  ];
  const lowest = Math.max(...contacts.map((c) => c.y));
  const footMin = Math.min(...contacts.map((c) => c.x));
  const footMax = Math.max(...contacts.map((c) => c.x));
  const footCx = (footMin + footMax) / 2;
  const footRx = Math.max(80, (footMax - footMin) / 2 + 42);

  return (
    <svg
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Animated anatomical figure performing a ${exercise.name}`}
    >
      <defs>
        <filter id={`bloom-${theme}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={theme === "dark" ? 10 : 7} />
        </filter>
        <radialGradient id={`floorGlow-${theme}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={skin.glow} stopOpacity="0.09" />
          <stop offset="100%" stopColor={skin.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`groundLine-${theme}`} x1="0" x2="1">
          <stop offset="0%" stopColor={skin.ground} stopOpacity="0" />
          <stop offset="50%" stopColor={skin.ground} stopOpacity="0.85" />
          <stop offset="100%" stopColor={skin.ground} stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={transform}>
      {/* floor */}
      {onFloor && (
        <>
          <ellipse cx={footCx} cy={GROUND_Y} rx={footRx + 90} ry={42} fill={`url(#floorGlow-${theme})`} />
      {onFloor && (
        <ellipse
          cx={footCx}
          cy={Math.min(GROUND_Y, lowest) + 4}
          rx={footRx}
          ry={9}
          fill={skin.shadow}
          opacity={skin.shadowOpacity}
        />
      )}
          <line
            x1={-3000}
            x2={3000}
            y1={GROUND_Y}
            y2={GROUND_Y}
            stroke={`url(#groundLine-${theme})`}
            strokeWidth={1.5}
          />
        </>
      )}

      {/* pull-up bar sits behind the figure */}
      {exercise.equipment === "pullup-bar" && (
        <g>
          <line x1={90} x2={490} y1={BAR_Y} y2={BAR_Y} stroke={skin.rigBar} strokeWidth={9} strokeLinecap="round" />
          <line x1={112} x2={112} y1={VB.y} y2={BAR_Y} stroke={skin.rigPost} strokeWidth={7} />
          <line x1={468} x2={468} y1={VB.y} y2={BAR_Y} stroke={skin.rigPost} strokeWidth={7} />
        </g>
      )}

      {/* far side */}
      <g>
        <Silhouette rig={rig} side={0} skin={skin} />
        {renderMuscles("leg", 0)}
        {renderMuscles("arm", 0)}
      </g>

      {/* torso */}
      <path d={torsoPath(rig)} fill={skin.bodyNear} />
      <path d={bone(rig.chest, rig.head)} stroke={skin.bodyNear} strokeWidth={23} strokeLinecap="round" fill="none" />
      <circle cx={rig.head.x} cy={rig.head.y} r={23} fill={skin.head} />
      <circle cx={facing.x} cy={facing.y} r={14} fill={skin.face} />
      {renderMuscles("torso", 1)}

      {/* near side */}
      <g>
        <Silhouette rig={rig} side={1} skin={skin} />
        {renderMuscles("leg", 1)}
        {renderMuscles("arm", 1)}
      </g>

      {/* barbell, seen end-on */}
      {exercise.equipment !== "none" && exercise.equipment !== "pullup-bar" && (
        <g>
          {(() => {
            const c = barPos;
            return (
              <>
                <circle cx={c.x} cy={c.y} r={27} fill={skin.barPlate} stroke={skin.barPlateEdge} strokeWidth={2.5} />
                <circle cx={c.x} cy={c.y} r={18} fill={skin.barInner} />
                <circle cx={c.x} cy={c.y} r={9} fill={skin.barSleeve} />
                <circle cx={c.x} cy={c.y} r={4} fill={skin.barCollar} />
              </>
            );
          })()}
        </g>
      )}
      </g>
    </svg>
  );
}

/**
 * Memoised: the six static figures in the strip below the stage would otherwise
 * re-render on every animation frame of the one above them.
 */
export default memo(Figure);
