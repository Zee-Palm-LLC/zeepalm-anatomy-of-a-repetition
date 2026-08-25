import type { MetadataRoute } from "next";
import { EXERCISES } from "@/lib/exercises";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, priority: 1 },
    { url: `${SITE.url}/coverage`, lastModified: now, priority: 0.8 },
    { url: `${SITE.url}/method`, lastModified: now, priority: 0.6 },
    ...EXERCISES.map((e) => ({
      url: `${SITE.url}/lifts/${e.id}`,
      lastModified: now,
      priority: 0.7,
    })),
  ];
}
