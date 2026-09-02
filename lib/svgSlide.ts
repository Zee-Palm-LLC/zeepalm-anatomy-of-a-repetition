/**
 * Carousel slides, rendered from the study itself.
 *
 * Every number that appears on a slide is read from the activation curves at
 * render time — none of it is typed in. If the curves change, the claims on the
 * slides change with them, which is the only way a deck like this stays honest.
 */

import { EXERCISES } from "./exercises";
import { MUSCLES, MUSCLE_BY_ID, type MuscleId } from "./muscles";
import { THEME } from "./palette";
import { peakOf, peakMomentOf, coverageFor } from "./analysis";
import { renderFrame } from "./svgFrame";
import { renderMatrix } from "./svgMatrix";

const W = 1080;
const H = 1080;
const BG = "#070B12";
const INK = "#F8FAFC";
const MUTED = "#8FA0B8";
const FAINT = "#64748B";
const ACCENT = "#21B083";
const DATA = "#FF6C4A";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const lift = (id: string) => EXERCISES.find((e) => e.id === id)!;
const peak = (id: string, m: MuscleId) => Math.round(peakOf(lift(id), m) * 100);

const serif = (size: number, fill = INK) =>
  `font-family="Georgia, serif" font-size="${size}" fill="${fill}"`;
const sans = (size: number, fill = MUTED) =>
  `font-family="ui-sans-serif, system-ui, sans-serif" font-size="${size}" fill="${fill}"`;
const mono = (size: number, fill = FAINT, ls = 3) =>
  `font-family="ui-monospace, monospace" font-size="${size}" letter-spacing="${ls}" fill="${fill}"`;

/** Naive wrap — enough for headlines we control. */
function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > max) {
      out.push(line.trim());
      line = word;
    } else line += " " + word;
  }
  if (line.trim()) out.push(line.trim());
  return out;
}

function lines(text: string, x: number, y: number, size: number, max: number, fill = INK) {
  return wrap(text, max)
    .map((l, i) => `<text x="${x}" y="${y + i * size * 1.16}" ${serif(size, fill)}>${esc(l)}</text>`)
    .join("");
}

/** Same, in the sans face, for body copy. */
function body(text: string, x: number, y: number, size: number, max: number, fill = MUTED) {
  return wrap(text, max)
    .map((l, i) => `<text x="${x}" y="${y + i * size * 1.45}" ${sans(size, fill)}>${esc(l)}</text>`)
    .join("");
}

function chrome(index: number, total: number) {
  return `<text x="56" y="${H - 44}" ${mono(15, FAINT, 2)}>ANATOMY OF A REPETITION</text>
<text x="${W - 56}" y="${H - 44}" text-anchor="end" ${mono(15, FAINT, 2)}>${index} / ${total}</text>`;
}

function figure(ex: (typeof EXERCISES)[number], box: { x: number; y: number; w: number; h: number }, prefix: string) {
  const inner = renderFrame(ex, peakMomentOf(ex), {
    width: box.w,
    height: box.h,
    pad: 0.04,
    background: null,
    idPrefix: prefix,
  });
  return `<g transform="translate(${box.x} ${box.y})">${inner}</g>`;
}

/* ------------------------------------------------------------------ */

function cover(i: number, n: number) {
  const squat = lift("squat");
  return `<rect width="${W}" height="${H}" fill="${BG}"/>
${figure(squat, { x: 250, y: 240, w: 780, h: 780 }, "s1")}
<text x="56" y="96" ${mono(16, ACCENT)}>ZEE PALM LABS</text>
${lines("Anatomy of a Repetition", 56, 220, 76, 14)}
<text x="56" y="380" ${sans(28, MUTED)}>See the work, not just the shape.</text>
${chrome(i, n)}`;
}

function claim(i: number, n: number) {
  return `<rect width="${W}" height="${H}" fill="${BG}"/>
<text x="56" y="96" ${mono(16, ACCENT)}>THE IDEA</text>
${lines("A diagram shows you the shape of a lift.", 56, 260, 62, 26, MUTED)}
${lines("This shows you the work.", 56, 470, 76, 22)}
<text x="56" y="620" ${sans(26, MUTED)}>Which muscles fire, how hard,</text>
<text x="56" y="662" ${sans(26, MUTED)}>and at which inch of the range.</text>
<rect x="56" y="748" width="${W - 112}" height="14" rx="7" fill="url(#ramp)"/>
<text x="56" y="800" ${mono(15, FAINT, 2)}>RESTING</text>
<text x="${W - 56}" y="800" text-anchor="end" ${mono(15, FAINT, 2)}>MAXIMAL</text>
${chrome(i, n)}`;
}

function insight(
  i: number,
  n: number,
  o: { id: string; eyebrow: string; headline: string; body: string },
) {
  const ex = lift(o.id);
  return `<rect width="${W}" height="${H}" fill="${BG}"/>
${figure(ex, { x: 470, y: 190, w: 620, h: 700 }, `s${i}`)}
<text x="56" y="96" ${mono(16, ACCENT)}>${esc(o.eyebrow)}</text>
${lines(o.headline, 56, 300, 52, 17)}
${body(o.body, 56, 540, 24, 34)}
<text x="56" y="${H - 96}" ${sans(26, DATA)}>${esc(ex.name)}</text>
${chrome(i, n)}`;
}

function gap(i: number, n: number) {
  const cov = coverageFor(["squat", "pushup"]);
  const missing = MUSCLES.filter((m) => cov[m.id] < 0.5).sort(
    (a, b) => cov[a.id] - cov[b.id],
  );
  const TRACK = W - 260;
  const rows = missing
    .map((m, k) => {
      const y = 560 + k * 78;
      const v = Math.round(cov[m.id] * 100);
      return `<text x="56" y="${y}" ${sans(30, INK)}>${esc(m.label)}</text>
<rect x="56" y="${y + 18}" width="${TRACK}" height="10" rx="5" fill="#1B2534"/>
<rect x="56" y="${y + 18}" width="${Math.max(TRACK * (v / 100), 4)}" height="10" rx="5" fill="${DATA}"/>
<rect x="${56 + TRACK * 0.5}" y="${y + 13}" width="2" height="20" fill="#3A4A63"/>
<text x="${W - 56}" y="${y}" text-anchor="end" font-family="ui-monospace, monospace" font-size="30" fill="${DATA}">${v}</text>`;
    })
    .join("");
  return `<rect width="${W}" height="${H}" fill="${BG}"/>
<text x="56" y="96" ${mono(16, ACCENT)}>THE GAP</text>
${lines("Squat and push-up is not a full-body programme.", 56, 220, 56, 24)}
<text x="56" y="470" ${sans(26, MUTED)}>Everything you pull with, left under half:</text>
<text x="${56 + TRACK * 0.5}" y="522" text-anchor="middle" ${mono(14, FAINT, 2)}>50</text>
${rows}
${chrome(i, n)}`;
}

function matrixSlide(i: number, n: number) {
  // renderMatrix draws its own footer, so add the counter alone rather than the
  // full chrome — otherwise the two overlap.
  const counter = `<text x="${W - 56}" y="${H - 12}" text-anchor="end" ${mono(15, FAINT, 2)}>${i} / ${n}</text>`;
  return renderMatrix(W, H).replace(/<\/svg>$/, `${counter}</svg>`);
}

function outro(i: number, n: number) {
  return `<rect width="${W}" height="${H}" fill="${BG}"/>
<text x="56" y="96" ${mono(16, ACCENT)}>TRY IT</text>
${lines("Six lifts. Thirteen muscles. One page.", 56, 250, 62, 20)}
<text x="56" y="470" ${sans(26, MUTED)}>Pick your lifts and it names what</text>
<text x="56" y="510" ${sans(26, MUTED)}>your session leaves untrained.</text>
<rect x="56" y="600" width="600" height="86" rx="14" fill="${ACCENT}"/>
<text x="356" y="654" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="30" fill="#04120C">Link in the post</text>
<text x="56" y="800" ${sans(24, FAINT)}>Built by Zee Palm — the digital studio</text>
<text x="56" y="838" ${sans(24, FAINT)}>for health, wellness &amp; fitness.</text>
<text x="56" y="900" ${mono(18, ACCENT, 2)}>ZEEPALM.COM</text>
${chrome(i, n)}`;
}

/* ------------------------------------------------------------------ */

export function renderCarousel(): { name: string; svg: string }[] {
  const ramp = THEME.dark.ramp
    .map(([at, c]) => `<stop offset="${at * 100}%" stop-color="rgb(${c[0]},${c[1]},${c[2]})"/>`)
    .join("");
  const defs = `<defs><linearGradient id="ramp" x1="0" x2="1">${ramp}</linearGradient></defs>`;

  const total = 8;
  const bodies = [
    cover(1, total),
    claim(2, total),
    insight(3, total, {
      id: "deadlift",
      eyebrow: "READ THE HANDOFF",
      headline: `Forearms ${peak("deadlift", "forearms")}. Same as the erectors.`,
      body: "Your grip fails before your back does — which is why the deadlift is a grip exercise nobody calls one.",
    }),
    insight(4, total, {
      id: "pushup",
      eyebrow: "MISLABELLED",
      headline: `Abs ${peak("pushup", "abs")} in a push-up.`,
      body: "Higher than its own biceps, lats and every posterior muscle. A core exercise wearing a chest exercise's clothes.",
    }),
    insight(5, total, {
      id: "pullup",
      eyebrow: "IRREPLACEABLE",
      headline: `Biceps ${peak("pullup", "biceps")}. Nothing else here clears 15.`,
      body: "Skip the pull and five of these six lifts leave your arms almost entirely alone.",
    }),
    matrixSlide(6, total),
    gap(7, total),
    outro(8, total),
  ];

  return bodies.map((body, i) => ({
    name: `slide-${String(i + 1).padStart(2, "0")}`,
    svg: body.startsWith("<svg")
      ? body
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${body}</svg>`,
  }));
}

export { MUSCLE_BY_ID };
