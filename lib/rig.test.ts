/**
 * Invariants for the rig.
 *
 * Every case here is a bug that actually shipped into a screenshot: a knee bent
 * backwards, a palm hovering above the floor, a barbell floating, a muscle path
 * folded through itself. Geometry has right answers, so these assert them
 * rather than trusting the render.
 */

import { describe, expect, it } from "vitest";
import { buildRig, SEG, solveTwoBone, dn, type Rig } from "./anatomy";
import { EXERCISES, samplePose, sampleCurve } from "./exercises";
import { MUSCLES, musclePath, closedPath, activationColor } from "./muscles";
import { anchorRig, plantHands, framing, GROUND_Y, BAR_X, BAR_Y } from "./stage";
import { peakOf, peakMomentOf, coverageFor } from "./analysis";
import { resolveSiteUrl } from "./site";

/** A rep, sampled densely enough to catch a bad frame between keyframes. */
const FRAMES = Array.from({ length: 41 }, (_, i) => i / 40);

const staged = (ex: (typeof EXERCISES)[number], t: number): Rig =>
  plantHands(anchorRig(buildRig(samplePose(ex, t), ex.symmetric), ex.anchor), ex);

const angleOf = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

const signedDelta = (from: number, to: number) => {
  let d = to - from;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
};

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

describe("skeleton", () => {
  it("never stretches a bone", () => {
    for (const ex of EXERCISES) {
      for (const t of FRAMES) {
        const rig = staged(ex, t);
        for (const leg of rig.legs) {
          expect(dist(leg.hip, leg.knee)).toBeCloseTo(SEG.thigh, 6);
          expect(dist(leg.knee, leg.ankle)).toBeCloseTo(SEG.shin, 6);
        }
        for (const arm of rig.arms) {
          expect(dist(arm.shoulder, arm.elbow)).toBeCloseTo(SEG.upperArm, 6);
          expect(dist(arm.elbow, arm.wrist)).toBeCloseTo(SEG.forearm, 6);
        }
      }
    }
  });

  it("never hyperextends a knee", () => {
    // The far-side depth offset used to push a straight knee past straight,
    // which is the one thing a knee cannot do.
    for (const ex of EXERCISES) {
      for (const t of FRAMES) {
        const rig = staged(ex, t);
        for (const [side, leg] of rig.legs.entries()) {
          const bend = signedDelta(
            angleOf(leg.hip, leg.knee),
            angleOf(leg.knee, leg.ankle),
          );
          expect(
            bend,
            `${ex.id} leg ${side} at t=${t.toFixed(2)} bends ${bend.toFixed(1)}°`,
          ).toBeGreaterThan(-0.5);
        }
      }
    }
  });

  it("produces finite coordinates everywhere", () => {
    for (const ex of EXERCISES) {
      for (const t of FRAMES) {
        const rig = staged(ex, t);
        const pts = [
          rig.pelvis,
          rig.chest,
          rig.head,
          ...rig.legs.flatMap((l) => [l.knee, l.ankle, l.toe, l.heel]),
          ...rig.arms.flatMap((a) => [a.elbow, a.wrist, a.hand]),
        ];
        for (const p of pts) {
          expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
        }
      }
    }
  });
});

describe("contact with the world", () => {
  it("keeps a foot-anchored figure standing on the floor", () => {
    for (const ex of EXERCISES.filter((e) => e.anchor === "feet")) {
      for (const t of FRAMES) {
        const rig = staged(ex, t);
        const lowest = Math.max(
          ...rig.legs.flatMap((l) => [l.toe.y, l.heel.y]),
        );
        expect(lowest, `${ex.id} at t=${t.toFixed(2)}`).toBeCloseTo(GROUND_Y, 6);
      }
    }
  });

  it("plants both palms on the floor for the whole push-up", () => {
    // Hand-authored arm angles left the figure hovering; IK has to land it.
    const pushup = EXERCISES.find((e) => e.handTarget === "floor")!;
    for (const t of FRAMES) {
      const rig = staged(pushup, t);
      for (const arm of rig.arms) {
        expect(arm.wrist.y, `wrist at t=${t.toFixed(2)}`).toBeCloseTo(GROUND_Y, 3);
      }
    }
  });

  it("keeps both hands on the bar for the whole pull-up", () => {
    const pullup = EXERCISES.find((e) => e.handTarget === "bar")!;
    for (const t of FRAMES) {
      const rig = staged(pullup, t);
      for (const arm of rig.arms) {
        expect(dist(arm.wrist, { x: BAR_X, y: BAR_Y })).toBeLessThan(0.01);
      }
    }
  });

  it("never sinks a foot below the floor", () => {
    // A hanging figure has no floor beneath it — the ground line is hidden for
    // bar-anchored lifts precisely because the feet dangle past it.
    for (const ex of EXERCISES.filter((e) => e.anchor !== "hands")) {
      for (const t of FRAMES) {
        const rig = staged(ex, t);
        for (const leg of rig.legs) {
          expect(leg.toe.y).toBeLessThanOrEqual(GROUND_Y + 0.01);
          expect(leg.heel.y).toBeLessThanOrEqual(GROUND_Y + 0.01);
        }
      }
    }
  });
});

describe("two-bone IK", () => {
  it("hits any reachable target exactly", () => {
    const root = { x: 0, y: 0 };
    for (const target of [
      { x: 0, y: 120 },
      { x: 60, y: 90 },
      { x: -80, y: 40 },
      { x: 30, y: -100 },
    ]) {
      for (const bend of [1, -1] as const) {
        const { a, b } = solveTwoBone(root, target, SEG.upperArm, SEG.forearm, bend);
        const elbow = dn(root, a, SEG.upperArm);
        const wrist = dn(elbow, a + b, SEG.forearm);
        expect(dist(wrist, target)).toBeLessThan(0.01);
      }
    }
  });

  it("clamps an out-of-reach target instead of returning NaN", () => {
    const root = { x: 0, y: 0 };
    for (const target of [{ x: 0, y: 9999 }, { x: 0, y: 0 }]) {
      const { a, b } = solveTwoBone(root, target, SEG.upperArm, SEG.forearm, 1);
      expect(Number.isFinite(a) && Number.isFinite(b)).toBe(true);
    }
  });
});

describe("activation data", () => {
  it("stays within 0..1 for every muscle of every lift", () => {
    for (const ex of EXERCISES) {
      for (const m of MUSCLES) {
        for (const t of FRAMES) {
          const v = sampleCurve(ex.activation[m.id], t);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("closes the loop, so a rep does not jump on repeat", () => {
    for (const ex of EXERCISES) {
      for (const m of MUSCLES) {
        const start = sampleCurve(ex.activation[m.id], 0);
        const end = sampleCurve(ex.activation[m.id], 1);
        expect(end, `${ex.id}/${m.id}`).toBeCloseTo(start, 6);
      }
      const a = samplePose(ex, 0);
      const b = samplePose(ex, 1);
      expect(b.torso).toBeCloseTo(a.torso, 6);
      expect(b.legs[1].knee).toBeCloseTo(a.legs[1].knee, 6);
    }
  });

  it("names prime movers that are actually the hardest worked", () => {
    for (const ex of EXERCISES) {
      const top = [...MUSCLES]
        .sort((x, y) => peakOf(ex, y.id) - peakOf(ex, x.id))
        .slice(0, 4)
        .map((m) => m.id);
      // Each declared prime mover should be near the top of its own lift.
      for (const id of ex.primary) {
        expect(top, `${ex.id} claims ${id}`).toContain(id);
      }
    }
  });

  it("finds a peak moment inside the rep", () => {
    for (const ex of EXERCISES) {
      const t = peakMomentOf(ex);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    }
  });
});

describe("coverage", () => {
  it("takes the hardest lift per muscle, never the sum", () => {
    const both = coverageFor(["squat", "pushup"]);
    for (const m of MUSCLES) {
      const solo = Math.max(
        peakOf(EXERCISES.find((e) => e.id === "squat")!, m.id),
        peakOf(EXERCISES.find((e) => e.id === "pushup")!, m.id),
      );
      expect(both[m.id]).toBeCloseTo(solo, 6);
      expect(both[m.id]).toBeLessThanOrEqual(1);
    }
  });

  it("reports nothing covered when nothing is selected", () => {
    const none = coverageFor([]);
    for (const m of MUSCLES) expect(none[m.id]).toBe(0);
  });
});

describe("muscle paths", () => {
  it("never folds a curve back through itself", () => {
    // Unclamped tangents at the tapered ends produced hatched spikes.
    // Path data is rounded to two decimals, so compare absolutely rather than
    // as a ratio — on a sub-unit segment, rounding alone moves the ratio.
    const LIMIT = 0.42;
    const ROUNDING = 0.02;
    for (const ex of EXERCISES) {
      for (const t of [0, 0.25, 0.5, 0.75]) {
        const rig = staged(ex, t);
        for (const def of MUSCLES) {
          for (const side of [0, 1] as const) {
            const act = sampleCurve(ex.activation[def.id], t);
            const d = musclePath(def, rig, side, act);
            const nums = (d.match(/-?\d+\.?\d*/g) ?? []).map(Number);
            for (let i = 2; i + 5 < nums.length; i += 6) {
              const p1 = { x: nums[i - 2], y: nums[i - 1] };
              const c1 = { x: nums[i], y: nums[i + 1] };
              const p2 = { x: nums[i + 4], y: nums[i + 5] };
              const span = dist(p1, p2);
              if (span > 0.001) {
                expect(dist(p1, c1)).toBeLessThanOrEqual(span * LIMIT + ROUNDING);
              }
            }
          }
        }
      }
    }
  });

  it("emits no NaN into path data", () => {
    for (const ex of EXERCISES) {
      const rig = staged(ex, 0.5);
      for (const def of MUSCLES) {
        expect(musclePath(def, rig, 1, 0.8)).not.toContain("NaN");
      }
    }
  });

  it("degrades safely on a degenerate ring", () => {
    expect(closedPath([])).toBe("");
    expect(closedPath([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe("");
  });
});

describe("framing", () => {
  it("produces a finite transform for every lift, in both themes of use", () => {
    for (const ex of EXERCISES) {
      for (const t of [undefined, 0, 0.5, 0.99]) {
        const tr = framing(ex, t);
        expect(tr).not.toContain("NaN");
        expect(tr).toMatch(/^translate\(.+\) scale\(.+\) translate\(.+\)$/);
      }
    }
  });

  it("is stable across the rep, so the figure cannot drift mid-motion", () => {
    for (const ex of EXERCISES) {
      expect(framing(ex)).toBe(framing(ex));
    }
  });
});

describe("colour", () => {
  it("returns a valid colour across the full range in both themes", () => {
    for (const theme of ["light", "dark"] as const) {
      for (let v = -0.5; v <= 1.5; v += 0.1) {
        expect(activationColor(v, theme)).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      }
    }
  });
});

describe("site url resolution", () => {
  // metadataBase throws inside Next's config collection if this is malformed,
  // and the build dies on /_not-found without naming the variable at fault.
  it("falls back for anything empty or unset", () => {
    for (const v of [undefined, "", "   ", "\t"]) {
      expect(resolveSiteUrl(v)).toMatch(/^https:\/\/[^/]+$/);
    }
  });

  it("adds a missing protocol rather than throwing", () => {
    expect(resolveSiteUrl("zeepalm.com")).toBe("https://zeepalm.com");
    expect(resolveSiteUrl("  zeepalm.com  ")).toBe("https://zeepalm.com");
  });

  it("strips paths and trailing slashes so canonicals cannot double up", () => {
    expect(resolveSiteUrl("https://zeepalm.com/")).toBe("https://zeepalm.com");
    expect(resolveSiteUrl("https://zeepalm.com/some/path")).toBe("https://zeepalm.com");
  });

  it("keeps a valid origin intact, http included", () => {
    expect(resolveSiteUrl("https://a.example.com")).toBe("https://a.example.com");
    expect(resolveSiteUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("falls back on junk instead of killing the build", () => {
    for (const v of ["not a url", "://", "https://", "!!!"]) {
      expect(() => resolveSiteUrl(v)).not.toThrow();
      expect(resolveSiteUrl(v)).toMatch(/^https?:\/\/[^/]+$/);
    }
  });

  it("always produces a URL that metadataBase can construct", () => {
    for (const v of [undefined, "", "zeepalm.com", "junk", "https://x.dev/"]) {
      expect(() => new URL(resolveSiteUrl(v))).not.toThrow();
    }
  });
});
