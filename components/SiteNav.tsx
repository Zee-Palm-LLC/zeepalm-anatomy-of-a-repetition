"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/coverage", label: "Coverage" },
  { href: "/method", label: "Method" },
];

export default function SiteNav() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#070B12]/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1560px] items-center justify-between gap-4 px-5 py-4 sm:gap-6 sm:px-8 lg:py-5 xl:px-12">
        <Link href="/" aria-label={`${SITE.name} — home`} className="group min-w-0 shrink">
          <Wordmark />
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <nav aria-label="Primary" className="flex items-center gap-1">
            {LINKS.map((l) => {
              const on =
                l.href === "/"
                  ? path === "/" || path.startsWith("/lifts")
                  : path === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={on ? "page" : undefined}
                  className={`rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors sm:px-3.5 sm:text-[14px] `}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <a
            href={SITE.company}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 hidden items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[14px] font-medium text-accent-ink transition-colors hover:bg-accent sm:inline-flex"
          >
            Zee Palm
            <span aria-hidden="true" className="text-[13px] opacity-70">
              ↗
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
