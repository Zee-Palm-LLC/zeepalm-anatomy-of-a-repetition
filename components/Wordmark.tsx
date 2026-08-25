/**
 * The mark is a muscle belly between its origin and insertion — the one idea
 * the whole site is built on, at 16px.
 */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M8.6 3.6 C 15.4 7.4, 17.2 14, 14.6 20.4 C 8.2 16.4, 6.4 9.8, 8.6 3.6 Z"
        fill="#B0142A"
      />
      <path
        d="M8.6 3.6 C 12 8.4, 12.8 14.6, 14.6 20.4"
        stroke="#fff"
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="8.6" cy="3.6" r="2.1" fill="#3D4757" />
      <circle cx="14.6" cy="20.4" r="2.1" fill="#3D4757" />
    </svg>
  );
}

export default function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <Mark />
      {/* Below sm the mark carries the brand alone: a 23-character name
          beside three nav items wraps to three lines and bloats a sticky bar.
          The name is still the first thing in the page itself. */}
      <span className="hidden flex-col leading-none sm:flex">
        <span className="font-display text-[19px] leading-none tracking-[-0.01em] text-slate-50">
          Anatomy of a Repetition
        </span>
        {!compact && (
          <span className="mt-[5px] hidden font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500 sm:block">
            A Zee Palm Labs study
          </span>
        )}
      </span>
    </span>
  );
}
