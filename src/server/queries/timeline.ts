import { prisma } from "@/lib/prisma";
import { mergeTimeline, type TimelineItem } from "@/lib/timeline";

const LIMIT = 50;

export async function getDreamerTimeline(
  dreamerId: string,
  before?: Date,
): Promise<TimelineItem[]> {
  const [interactions, transitions, notes] = await Promise.all([
    prisma.interaction.findMany({
      where: {
        dreamerId,
        archivedAt: null,
        ...(before && { occurredAt: { lt: before } }),
      },
      orderBy: { occurredAt: "desc" },
      take: LIMIT,
      include: {
        helper: { select: { name: true } },
        project: { select: { title: true } },
      },
    }),
    prisma.stageTransition.findMany({
      where: {
        project: { dreamerId },
        ...(before && { occurredAt: { lt: before } }),
      },
      orderBy: { occurredAt: "desc" },
      take: LIMIT,
      include: {
        project: { select: { title: true } },
        changedBy: { select: { name: true } },
      },
    }),
    prisma.note.findMany({
      where: {
        dreamerId,
        archivedAt: null,
        ...(before && { createdAt: { lt: before } }),
      },
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      include: {
        author: { select: { name: true } },
      },
    }),
  ]);

  const items: TimelineItem[] = [
    ...interactions.map((i): TimelineItem => ({
      kind: "interaction",
      id: i.id,
      at: i.occurredAt,
      channel: i.channel,
      direction: i.direction,
      summary: i.summary,
      outcome: i.outcome,
      helperName: i.helper.name ?? "Someone",
      dreamTitle: i.project?.title ?? null,
    })),
    ...transitions.map((t): TimelineItem => ({
      kind: "stage_change",
      id: t.id,
      at: t.occurredAt,
      fromStage: t.fromStage,
      toStage: t.toStage,
      reason: t.reason,
      changedByName: t.changedBy.name ?? "Someone",
      dreamTitle: t.project.title,
    })),
    ...notes.map((n): TimelineItem => ({
      kind: "note",
      id: n.id,
      at: n.createdAt,
      body: n.body,
      isPinned: n.isPinned,
      authorName: n.author.name ?? "Someone",
    })),
  ];

  return mergeTimeline(items).slice(0, LIMIT);
}
