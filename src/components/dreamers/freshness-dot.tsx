import { cn } from "@/lib/utils";
import type { Freshness } from "@/lib/cadence";

// Amber-forward per PRD §10.3 (anti-pattern #3: no guilt-red on helper
// surfaces) — "stale" is a deeper amber, never literal red.
const COLORS: Record<Freshness, string> = {
  fresh: "bg-emerald-500",
  cooling: "bg-amber-400",
  stale: "bg-amber-600",
};

const LABELS: Record<Freshness, string> = {
  fresh: "In touch, within cadence",
  cooling: "Getting quiet",
  stale: "Past cadence — worth a check-in",
};

export function FreshnessDot({
  freshness,
  className,
}: {
  freshness: Freshness | null;
  className?: string;
}) {
  if (!freshness) {
    return (
      <span
        className={cn(
          "bg-muted-foreground/30 inline-block size-2.5 rounded-full",
          className,
        )}
        title="No active Dream"
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-block size-2.5 rounded-full",
        COLORS[freshness],
        className,
      )}
      title={LABELS[freshness]}
    />
  );
}
