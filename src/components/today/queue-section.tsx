import type { TodayQueueItem } from "@/server/queries/today";
import { QueueCard } from "./queue-card";

export function QueueSection({
  title,
  items,
}: {
  title: string;
  items: TodayQueueItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        {title} &middot; {items.length}
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <QueueCard key={item.projectId} item={item} />
        ))}
      </div>
    </section>
  );
}
