/**
 * Renders social assets straight from the rig.
 *
 *   node scripts/render-social.mjs
 *
 * Frames come from lib/svgFrame.ts — the same geometry, curves and palette the
 * site animates — so the video can never show anatomy the site disagrees with.
 * Rasterised with sharp, encoded with ffmpeg.
 *
 * Every clip is a whole number of repetitions, and a repetition ends where it
 * began, so the result loops seamlessly with no crossfade.
 */

import { mkdir, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createJiti from "jiti";
import sharp from "sharp";

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const jiti = createJiti(root, { interopDefault: true });

const { EXERCISES } = jiti("./lib/exercises.ts");
const { renderFrame } = jiti("./lib/svgFrame.ts");
const { renderMatrix } = jiti("./lib/svgMatrix.ts");
const { renderCarousel } = jiti("./lib/svgSlide.ts");

const FPS = 30;
const SECONDS_PER_LIFT = 2;
const OUT = path.join(root, "public", "social");

const FORMATS = [
  { name: "square", width: 1080, height: 1080, pad: 0.08 },
  { name: "landscape", width: 1920, height: 1080, pad: 0.10 },
  { name: "portrait", width: 1080, height: 1920, pad: 0.34 },
];

async function renderFormat(fmt) {
  const dir = path.join(OUT, `frames-${fmt.name}`);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const perLift = FPS * SECONDS_PER_LIFT;
  let index = 0;

  for (const ex of EXERCISES) {
    for (let f = 0; f < perLift; f++) {
      const svg = renderFrame(ex, f / perLift, {
        width: fmt.width,
        height: fmt.height,
        pad: fmt.pad,
      });
      const file = path.join(dir, `${String(index).padStart(5, "0")}.png`);
      await sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toFile(file);
      index++;
    }
    process.stdout.write(`  ${fmt.name}: ${ex.name} ✓\n`);
  }

  const mp4 = path.join(OUT, `anatomy-${fmt.name}.mp4`);
  await run("ffmpeg", [
    "-y", "-framerate", String(FPS),
    "-i", path.join(dir, "%05d.png"),
    // yuv420p + even dimensions: required for playback on X, LinkedIn and iOS.
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-crf", "18", "-preset", "slow",
    "-movflags", "+faststart",
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    mp4,
  ]);

  // Poster frame, for platforms that need a thumbnail.
  await sharp(path.join(dir, "00040.png")).toFile(
    path.join(OUT, `anatomy-${fmt.name}-poster.jpg`),
  );

  await rm(dir, { recursive: true, force: true });
  return { mp4, frames: index };
}

await mkdir(OUT, { recursive: true });

// Static card: the coverage matrix, for posts that argue rather than show off.
await sharp(Buffer.from(renderMatrix(1080, 1080)))
  .png()
  .toFile(path.join(OUT, "coverage-matrix.png"));
console.log("public/social/coverage-matrix.png");

// Carousel: the same study told in steps, for LinkedIn and X.
const carouselDir = path.join(OUT, "carousel");
await mkdir(carouselDir, { recursive: true });
const slides = renderCarousel();
for (const slide of slides) {
  await sharp(Buffer.from(slide.svg))
    .png()
    .toFile(path.join(carouselDir, `${slide.name}.png`));
}
console.log(`public/social/carousel/ (${slides.length} slides)`);

for (const fmt of FORMATS) {
  const { mp4, frames } = await renderFormat(fmt);
  console.log(`${path.relative(root, mp4)}  (${frames} frames)`);
}
