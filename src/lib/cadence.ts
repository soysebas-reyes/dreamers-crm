import { differenceInCalendarDays, startOfDay, isSameDay } from "date-fns";

// Pure, unit-testable cadence/queue math (PRD §6.10, §7.1). No Prisma, no
// I/O — every function takes `now` as a parameter so tests can inject a
// fixed clock.

export type Freshness = "fresh" | "cooling" | "stale";

/**
 * The rule-based traffic light (PRD §6.10). Deliberately amber-forward on
 * helper surfaces (PRD §10.3, anti-pattern #3): "stale" renders as a deeper
 * amber in the UI, never literal red — red is reserved for lead views and
 * Dreamer-safety situations, neither of which exist in this build.
 */
export function classifyFreshness(
  daysSinceContact: number | null,
  cadenceDays: number,
): Freshness {
  if (daysSinceContact === null) return "stale";
  const ratio = cadenceDays > 0 ? daysSinceContact / cadenceDays : Infinity;
  if (ratio <= 1.0) return "fresh";
  if (ratio <= 1.5) return "cooling";
  return "stale";
}

export function daysSince(from: Date | null, now: Date): number | null {
  if (!from) return null;
  return differenceInCalendarDays(now, from);
}

export type QueueBucket = "overdue" | "due_today" | "going_quiet";

export interface QueueableProject {
  projectId: string;
  dreamerId: string;
  cadenceDays: number;
  /** Most recent counted touch, on this Dream or person-level. Null = never contacted. */
  lastContactAt: Date | null;
  stageEnteredAt: Date;
  /** The Dream's single open next-step, if any (PRD §4.3 iron rule). */
  nextStep: { id: string; title: string; dueAt: Date } | null;
}

export interface BucketedProject extends QueueableProject {
  bucket: QueueBucket;
  daysSinceContact: number | null;
}

/**
 * Partitions active/re-engaged Dreams into the Today queue's three sections
 * (PRD §7.1). A Dream with a healthy future next-step and recent contact
 * doesn't appear at all — the queue stays finite by design (PRD §5.1).
 */
export function bucketTodayQueue(
  items: QueueableProject[],
  now: Date,
): BucketedProject[] {
  const startOfToday = startOfDay(now);
  const bucketed: BucketedProject[] = [];

  for (const item of items) {
    const referenceDate = item.lastContactAt ?? item.stageEnteredAt;
    const daysSinceContact = item.lastContactAt
      ? differenceInCalendarDays(now, referenceDate)
      : null;
    const daysSinceReference = differenceInCalendarDays(now, referenceDate);

    let bucket: QueueBucket | null = null;
    if (item.nextStep && item.nextStep.dueAt < startOfToday) {
      bucket = "overdue";
    } else if (item.nextStep && isSameDay(item.nextStep.dueAt, now)) {
      bucket = "due_today";
    } else if (
      !item.nextStep ||
      daysSinceReference > item.cadenceDays ||
      item.lastContactAt === null
    ) {
      bucket = "going_quiet";
    }

    if (bucket) {
      bucketed.push({ ...item, bucket, daysSinceContact });
    }
  }

  const rank: Record<QueueBucket, number> = {
    overdue: 0,
    due_today: 1,
    going_quiet: 2,
  };

  return bucketed.sort((a, b) => {
    if (rank[a.bucket] !== rank[b.bucket])
      return rank[a.bucket] - rank[b.bucket];
    if (a.bucket === "overdue" || a.bucket === "due_today") {
      return (
        (a.nextStep?.dueAt.getTime() ?? 0) - (b.nextStep?.dueAt.getTime() ?? 0)
      );
    }
    // going_quiet: longest silence first; never-contacted sorts first of all
    const aDays = a.daysSinceContact ?? Number.POSITIVE_INFINITY;
    const bDays = b.daysSinceContact ?? Number.POSITIVE_INFINITY;
    return bDays - aDays;
  });
}
