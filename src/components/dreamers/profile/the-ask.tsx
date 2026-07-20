export function TheAsk({ originalAsk }: { originalAsk: string | null }) {
  if (!originalAsk) return null;

  return (
    <div className="rounded-lg border border-dashed p-3">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        The Ask
      </p>
      <p className="mt-1 text-sm">{originalAsk}</p>
    </div>
  );
}
