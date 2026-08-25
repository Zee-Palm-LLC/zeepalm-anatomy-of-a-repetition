const FALLBACK_URL = "https://anatomy-of-a-repetition.vercel.app";

/**
 * Resolve the public origin defensively.
 *
 * `metadataBase` is built from this, and an invalid value throws inside Next's
 * config collection rather than anywhere useful — the build dies on
 * `/_not-found` with "Invalid URL" and no mention of the variable at fault.
 *
 * `??` is not enough: it only catches null and undefined. Adding the variable
 * in a host's dashboard and leaving it blank yields an empty string, and a bare
 * "example.com" with no protocol is the likeliest thing anyone types.
 */
export function resolveSiteUrl(raw?: string): string {
  const value = raw?.trim();
  if (!value) return FALLBACK_URL;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname.includes(".") && parsed.hostname !== "localhost") {
      return FALLBACK_URL;
    }
    // Trailing slashes double up when Next joins canonical paths onto this.
    return parsed.origin;
  } catch {
    return FALLBACK_URL;
  }
}

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
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  company: "https://zeepalm.com",
  year: new Date().getFullYear(),
} as const;
