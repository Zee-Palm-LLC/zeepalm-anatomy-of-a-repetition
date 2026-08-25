import type { Metadata } from "next";
import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import { EXERCISES } from "@/lib/exercises";
import { CARD } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1560px] px-5 pt-10 sm:px-8 xl:px-12">
      <header className="mb-12">
        <Eyebrow>404</Eyebrow>
        <h1 className="font-display max-w-[16ch] text-[42px] font-normal leading-[1.02] tracking-[-0.02em] text-slate-50 sm:text-[58px]">
          No such movement
        </h1>
        <p className="mt-6 max-w-[60ch] text-[16px] leading-[1.65] text-slate-400 sm:text-[17px]">
          There are six lifts here, and whatever you asked for is not one of them.
        </p>
      </header>

      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXERCISES.map((e) => (
          <Link
            key={e.id}
            href={`/lifts/${e.id}`}
            className={`${CARD} group flex items-center justify-between p-5 transition-all hover:border-accent/30`}
          >
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {e.family}
              </span>
              <span className="font-display mt-1 block text-[18px] text-slate-50 group-hover:text-accent-lit">
                {e.name}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-accent-lit"
            >
              →
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-[15px] font-medium text-accent-ink transition-opacity hover:opacity-90"
      >
        Back to the overview
      </Link>
    </main>
  );
}
