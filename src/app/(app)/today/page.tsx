import { auth } from "@/auth";
import { getTodayQueue } from "@/server/queries/today";
import { QueueSection } from "@/components/today/queue-section";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user) return null; // (app) layout already redirects; satisfies TS

  const items = await getTodayQueue(session.user.id);
  const overdue = items.filter((i) => i.bucket === "overdue");
  const dueToday = items.filter((i) => i.bucket === "due_today");
  const goingQuiet = items.filter((i) => i.bucket === "going_quiet");

  const isEmpty = items.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold">Today</h1>
        <p className="text-muted-foreground text-sm">
          Who to contact today, in order.
        </p>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">Queue clear 🎉</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Nobody who asked for help gets forgotten here.
          </p>
        </div>
      ) : (
        <>
          <QueueSection title="Overdue" items={overdue} />
          <QueueSection title="Due today" items={dueToday} />
          <QueueSection title="Going quiet" items={goingQuiet} />
        </>
      )}
    </div>
  );
}
