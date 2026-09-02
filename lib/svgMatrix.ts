/**
 * The coverage matrix as a standalone graphic.
 *
 * Same source as the site: peaks are computed from the activation curves, so a
 * number printed here is the number the animation would show. Nothing is
 * transcribed by hand.
 */

import { EXERCISES } from "./exercises";
import { activationColor, GROUP_LABEL, MUSCLES, type MuscleGroup } from "./muscles";
import { GROUP_COLOR_DARK } from "./palette";
import { peakOf } from "./analysis";

const GROUPS: MuscleGroup[] = ["posterior", "anterior", "upper"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function renderMatrix(width = 1080, height = 1080): string {
  const padX = 56;
  const labelW = 206;
  const cols = EXERCISES.length;
  const gap = 6;
  const gridW = width - padX * 2 - labelW;
  const cellW = (gridW - gap * (cols - 1)) / cols;
  const cellH = 38;
  const rowGap = 4;
  const groupGap = 28;

  // Clear of the subtitle: the two-line column heads sit above this.
  const top = 274;
  let y = top;
  const rows: string[] = [];

  for (const g of GROUPS) {
    rows.push(
      `<circle cx="${padX + 5}" cy="${y - 12}" r="4" fill="${GROUP_COLOR_DARK[g]}"/>` +
        `<text x="${padX + 18}" y="${y - 7}" font-family="ui-monospace, monospace" font-size="16" letter-spacing="2.6" fill="${GROUP_COLOR_DARK[g]}">${esc(GROUP_LABEL[g].toUpperCase())}</text>`,
    );
    y += 14;

    for (const m of MUSCLES.filter((mm) => mm.group === g)) {
      rows.push(
        `<text x="${padX + labelW - 18}" y="${y + cellH / 2 + 7}" text-anchor="end" font-family="ui-sans-serif, system-ui" font-size="20" fill="#94A3B8">${esc(m.label)}</text>`,
      );
      EXERCISES.forEach((ex, i) => {
        const v = peakOf(ex, m.id);
        const x = padX + labelW + i * (cellW + gap);
        rows.push(
          `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="6" fill="${activationColor(v, "dark")}"/>` +
            `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 7}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="19" fill="${v > 0.5 ? "#FFF1EC" : "#9BA9BD"}">${Math.round(v * 100)}</text>`,
        );
      });
      y += cellH + rowGap;
    }
    y += groupGap;
  }

  const heads = EXERCISES.map((ex, i) => {
    const x = padX + labelW + i * (cellW + gap) + cellW / 2;
    const [a, b] = ex.name.split(" ");
    return (
      `<text x="${x}" y="${top - 46}" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="21" fill="#E2E8F0">${esc(a)}</text>` +
      (b
        ? `<text x="${x}" y="${top - 22}" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="21" fill="#E2E8F0">${esc(b)}</text>`
        : "")
    );
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FF5E3F" stop-opacity="0.07"/>
    <stop offset="60%" stop-color="#FF5E3F" stop-opacity="0"/>
  </linearGradient>
</defs>
<rect width="${width}" height="${height}" fill="#070B12"/>
<rect width="${width}" height="${height}" fill="url(#wash)"/>

<text x="${padX}" y="86" font-family="ui-monospace, monospace" font-size="15" letter-spacing="3" fill="#21B083">ZEE PALM LABS</text>
<text x="${padX}" y="146" font-family="Georgia, serif" font-size="52" fill="#F8FAFC">What each lift actually trains</text>
<text x="${padX}" y="184" font-family="ui-sans-serif, system-ui" font-size="21" fill="#8FA0B8">Peak activation for every muscle, in every lift. 100 = that muscle&#8217;s hardest moment.</text>

${heads}
${rows.join("\n")}

<text x="${padX}" y="${height - 42}" font-family="ui-monospace, monospace" font-size="15" letter-spacing="2" fill="#64748B">ILLUSTRATIVE, NOT EMG · ANATOMY OF A REPETITION</text>
<text x="${width - padX}" y="${height - 42}" text-anchor="end" font-family="ui-monospace, monospace" font-size="15" letter-spacing="2" fill="#64748B">ZEEPALM.COM</text>
</svg>`;
}
