const INK = "#8FA0B8";
const LINE = "#39465C";
const HOT = "#FF5E3F";

const label = {
  fontSize: 9,
  fontFamily: "var(--font-mono), monospace",
  letterSpacing: "0.08em",
  fill: "#64748B",
} as const;

/** 1 — a handful of angles resolve into a whole pose. */
export function RigDiagram() {
  const poses = [
    { torso: 6, hip: 2, knee: 3 },
    { torso: 20, hip: 40, knee: 55 },
    { torso: 32, hip: 78, knee: 105 },
    { torso: 22, hip: 44, knee: 60 },
    { torso: 6, hip: 2, knee: 3 },
  ];
  const R = Math.PI / 180;

  return (
    <svg viewBox="0 0 340 150" className="h-auto w-full" role="img" aria-label="Five keyframed poses interpolated into a continuous repetition">
      {poses.map((p, i) => {
        const x = 34 + i * 68;
        const groundY = 122;
        const hipY = groundY - 34 - 26 * Math.cos(p.knee * R * 0.6);
        const kx = x + Math.sin(p.hip * R) * 24;
        const ky = hipY + Math.cos(p.hip * R) * 24;
        const ax = kx + Math.sin((p.hip - p.knee) * R) * 24;
        const ay = ky + Math.cos((p.hip - p.knee) * R) * 24;
        const cx = x + Math.sin(p.torso * R) * 30;
        const cy = hipY - Math.cos(p.torso * R) * 30;
        const key = i === 0 || i === 2 || i === 4;
        const c = key ? INK : LINE;
        return (
          <g key={i}>
            <line x1={x - 22} x2={x + 22} y1={groundY} y2={groundY} stroke="#273244" strokeWidth={1} />
            <g stroke={c} strokeWidth={4.5} strokeLinecap="round" fill="none">
              <path d={`M ${x} ${hipY} L ${cx} ${cy}`} />
              <path d={`M ${x} ${hipY} L ${kx} ${ky} L ${ax} ${ay}`} />
            </g>
            <circle cx={cx} cy={cy - 6} r={5} fill={c} />
            {[[x, hipY], [kx, ky]].map(([jx, jy], j) => (
              <circle key={j} cx={jx} cy={jy} r={2.6} fill={key ? HOT : LINE} />
            ))}
            <text x={x} y={140} textAnchor="middle" style={label}>
              {key ? "KEY" : "···"}
            </text>
          </g>
        );
      })}
      <text x={4} y={16} style={label}>5 AUTHORED POSES → EVERY FRAME BETWEEN THEM</text>
    </svg>
  );
}

/** 2 — a muscle is built from the bone it sits on. */
export function MuscleDiagram() {
  const panels = [
    { title: "BONE", showNormals: false, fill: false, act: 0 },
    { title: "OFFSET + PROFILE", showNormals: true, fill: false, act: 0 },
    { title: "AT REST", showNormals: false, fill: true, act: 0.12 },
    { title: "CONTRACTED", showNormals: false, fill: true, act: 1 },
  ];

  const shape = (act: number) => {
    const w = 13 * (1 + 0.4 * act);
    const pull = 5 * act;
    const y0 = 26 + pull;
    const y1 = 104 - pull;
    const pts: string[] = [];
    const N = 12;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const y = y0 + (y1 - y0) * u;
      pts.push(`${(34 + Math.pow(Math.sin(Math.PI * u), 0.4) * w).toFixed(1)} ${y.toFixed(1)}`);
    }
    for (let i = N; i >= 0; i--) {
      const u = i / N;
      const y = y0 + (y1 - y0) * u;
      pts.push(`${(34 - Math.pow(Math.sin(Math.PI * u), 0.4) * w * 0.25).toFixed(1)} ${y.toFixed(1)}`);
    }
    return `M ${pts.join(" L ")} Z`;
  };

  return (
    <svg viewBox="0 0 340 150" className="h-auto w-full" role="img" aria-label="A muscle derived from a bone segment, at rest and contracted">
      <text x={4} y={16} style={label}>THE SAME BONE, FOUR STEPS</text>
      {panels.map((p, i) => (
        <g key={p.title} transform={`translate(${i * 85} 8)`}>
          <line x1={34} x2={34} y1={26} y2={104} stroke={LINE} strokeWidth={3} strokeLinecap="round" />
          <circle cx={34} cy={26} r={3} fill={INK} />
          <circle cx={34} cy={104} r={3} fill={INK} />
          {p.showNormals &&
            [0.2, 0.35, 0.5, 0.65, 0.8].map((u) => {
              const y = 26 + 78 * u;
              const w = Math.pow(Math.sin(Math.PI * u), 0.4) * 13;
              return (
                <line key={u} x1={34} x2={34 + w} y1={y} y2={y} stroke={HOT} strokeWidth={1} strokeDasharray="2 1.5" />
              );
            })}
          {p.fill && (
            <path
              d={shape(p.act)}
              fill={p.act > 0.5 ? HOT : "#4A5872"}
              opacity={p.act > 0.5 ? 0.92 : 0.55}
            />
          )}
          <text x={34} y={128} textAnchor="middle" style={label}>
            {p.title}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** 3 — the hand is solved onto its contact point, not guessed. */
export function IkDiagram() {
  const sh = { x: 120, y: 34 };
  const target = { x: 150, y: 112 };
  const good = { x: 84, y: 82 };
  const bad = { x: 176, y: 74 };

  return (
    <svg viewBox="0 0 340 150" className="h-auto w-full" role="img" aria-label="Two-bone inverse kinematics placing the hand on the floor">
      <text x={4} y={16} style={label}>ONE TARGET, TWO SOLUTIONS — PICK THE ELBOW</text>
      <line x1={40} x2={300} y1={112} y2={112} stroke="#273244" strokeWidth={2} />
      <text x={44} y={126} style={label}>FLOOR</text>

      <g stroke={LINE} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.55}>
        <path d={`M ${sh.x} ${sh.y} L ${bad.x} ${bad.y} L ${target.x} ${target.y}`} />
      </g>
      <circle cx={bad.x} cy={bad.y} r={4} fill={LINE} opacity={0.7} />

      <g stroke={INK} strokeWidth={5.5} strokeLinecap="round" fill="none">
        <path d={`M ${sh.x} ${sh.y} L ${good.x} ${good.y} L ${target.x} ${target.y}`} />
      </g>
      <circle cx={good.x} cy={good.y} r={4.5} fill={HOT} />
      <circle cx={sh.x} cy={sh.y} r={5} fill={INK} />
      <circle cx={target.x} cy={target.y} r={6} fill="none" stroke={HOT} strokeWidth={2} />
      <circle cx={target.x} cy={target.y} r={2.5} fill={HOT} />

      <text x={sh.x + 12} y={sh.y - 4} style={label}>SHOULDER</text>
      <text x={good.x - 46} y={good.y + 4} style={label}>ELBOW</text>
      <text x={target.x + 12} y={target.y + 4} style={label}>PALM, PLANTED</text>
    </svg>
  );
}

/** 4 — each movement is fitted to the stage on its own terms. */
export function FramingDiagram() {
  const boxes = [
    { w: 44, h: 96, t: "SQUAT" },
    { w: 112, h: 40, t: "PUSH-UP" },
    { w: 40, h: 104, t: "PULL-UP" },
  ];
  return (
    <svg viewBox="0 0 340 150" className="h-auto w-full" role="img" aria-label="Different movements fitted to the same stage">
      <text x={4} y={16} style={label}>SAME STAGE, THREE SHAPES</text>
      {boxes.map((b, i) => {
        const cx = 62 + i * 108;
        const cy = 78;
        return (
          <g key={b.t}>
            <rect x={cx - 48} y={cy - 52} width={96} height={104} rx={6} fill="none" stroke="#273244" strokeWidth={1.5} />
            <rect
              x={cx - b.w / 2}
              y={cy - b.h / 2}
              width={b.w}
              height={b.h}
              rx={3}
              fill="#8FA0B8"
              opacity={0.14}
              stroke={HOT}
              strokeWidth={1.4}
              strokeDasharray="3 2"
            />
            <text x={cx} y={cy + 68} textAnchor="middle" style={label}>
              {b.t}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
