import type { TimelineItem as TimelineItemType } from "@/lib/timeline";
import { TimelineItem } from "./timeline-item";

export function Timeline({ items }: { items: TimelineItemType[] }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
        No history yet — log the first touchpoint above.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <TimelineItem key={`${item.kind}-${item.id}`} item={item} />
      ))}
    </div>
  );
}
