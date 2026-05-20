export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-8 text-center shadow-sm">
      <p className="text-lg font-semibold text-ink">{title}</p>
      {detail ? <p className="mt-2 text-sm text-ink/65">{detail}</p> : null}
    </div>
  );
}
