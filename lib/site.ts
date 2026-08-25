/**
 * One source of truth for anything that names the site. Change the URL here
 * after the first deploy and every canonical link, sitemap entry and social
 * card follows.
 */
export const SITE = {
  name: "Anatomy of a Repetition",
  /** Used where the name needs its publisher attached. */
  full: "Anatomy of a Repetition — Zee Palm Labs",
  publisher: "Zee Palm",
  /** Zee Palm's own line, from zeepalm.com. */
  studio: "The digital studio for health, wellness & fitness",
  lab: "Zee Palm Labs",
  tagline: "See the work, not just the shape.",
  description:
    "An animated anatomical study of six lifts — which muscles fire, how hard, and at which inch of the range. Built by Zee Palm.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://anatomy-of-a-repetition.vercel.app",
  company: "https://zeepalm.com",
  year: new Date().getFullYear(),
} as const;
