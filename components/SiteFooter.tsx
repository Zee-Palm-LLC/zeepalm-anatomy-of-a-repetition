import Link from "next/link";
import Wordmark from "./Wordmark";
import { EXERCISES } from "@/lib/exercises";
import { SITE } from "@/lib/site";

const PAGES = [
  { href: "/", label: "Overview" },
  { href: "/coverage", label: "Coverage" },
  { href: "/method", label: "Method" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/[0.07] bg-white/[0.02]">
      <div className="mx-auto w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1560px] px-5 py-20 sm:px-8 xl:px-12">
        <div className="grid gap-14 lg:grid-cols-[1.7fr_1fr_1fr_1.5fr] lg:gap-12">
          <div>
            <Wordmark />
            <p className="font-display mt-6 max-w-[24ch] text-[24px] leading-[1.25] text-slate-50">
              {SITE.tagline}
            </p>
            <p className="mt-4 max-w-[40ch] text-[15px] leading-[1.65] text-slate-500">
              Six lifts, thirteen muscle groups, drawn from a rig rather than a
              flipbook.
            </p>
          </div>

          <nav aria-label="Pages">
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Pages
            </h2>
            <ul className="space-y-2.5">
              {PAGES.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="text-[15px] text-slate-500 transition-colors hover:text-accent"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Lifts">
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
              The lifts
            </h2>
            <ul className="space-y-2.5">
              {EXERCISES.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/lifts/${e.id}`}
                    className="text-[15px] text-slate-500 transition-colors hover:text-accent"
                  >
                    {e.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Built by {SITE.publisher}
            </h2>
            <p className="text-[15px] leading-[1.65] text-slate-500">
              {SITE.studio}. We work with gyms and studios, coaches, supplement
              brands, wellness creators and health-tech teams. This is a study in
              making something invisible legible, which is most of that job.
            </p>
            <a
              href={SITE.company}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#0F1724] px-5 py-3 text-[15px] font-medium text-slate-100 transition-all hover:border-accent/40 hover:text-accent"
            >
              zeepalm.com
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </div>
        </div>

        {/* The disclaimer travels with every page, not just the one that admits it. */}
        <div className="mt-16 border-t border-white/[0.07] pt-8">
          <p className="max-w-[92ch] text-[14px] leading-[1.7] text-slate-500">
            <span className="text-slate-300">Illustrative, not measured.</span>{" "}
            Activation values are hand-authored to match the shape of a repetition — they
            are not EMG data. This is one idealised repetition seen from one side, drawn per
            muscle group rather than per side, and it is not medical, coaching or
            rehabilitation advice.
          </p>
          <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
              © {SITE.year} {SITE.publisher} · {SITE.lab}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Next.js · TypeScript · SVG · MIT
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
