export default function Eyebrow({
  n,
  children,
}: {
  n?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {n && <span className="font-mono text-[11px] tabular-nums text-accent">{n}</span>}
      {n && <span className="h-px w-6 bg-slate-300" />}
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {children}
      </span>
    </div>
  );
}
