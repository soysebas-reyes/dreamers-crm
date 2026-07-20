import { prisma } from "@/lib/prisma";
import { bucketTodayQueue, type QueueableProject } from "@/lib/cadence";
import { DEFAULT_STAGE_CONFIG } from "@/lib/stage-config";
import { ProjectStatus, TaskStatus, Channel } from "@/generated/prisma/client";

export type TodayQueueItem = ReturnType<typeof bucketTodayQueue>[number] & {
  dreamTitle: string;
  dreamerName: string;
  whatsapp: string | null;
  email: string | null;
  lastSummary: string | null;
};

export async function getTodayQueue(
  helperId: string,
): Promise<TodayQueueItem[]> {
  const helper = await prisma.user.findUniqueOrThrow({
    where: { id: helperId },
    select: { teamId: true },
  });

  const stageConfigs = helper.teamId
    ? await prisma.stageConfig.findMany({ where: { teamId: helper.teamId } })
    : [];
  const cadenceByStage = new Map(
    stageConfigs.map((sc) => [sc.stage, sc.cadenceDays]),
  );

  const projects = await prisma.project.findMany({
    where: {
      ownerId: helperId,
      status: { in: [ProjectStatus.ACTIVE, ProjectStatus.RE_ENGAGED] },
      archivedAt: null,
    },
    include: {
      dreamer: {
        include: {
          channelIdentities: true,
        },
      },
      tasks: {
        where: { isNextAction: true, status: TaskStatus.OPEN },
        take: 1,
      },
      interactions: {
        where: { countsAsContact: true },
        orderBy: { occurredAt: "desc" },
        take: 1,
      },
    },
  });

  const queueable: QueueableProject[] = projects.map((p) => ({
    projectId: p.id,
    dreamerId: p.dreamerId,
    cadenceDays:
      cadenceByStage.get(p.stage) ?? DEFAULT_STAGE_CONFIG[p.stage].cadenceDays,
    lastContactAt: p.interactions[0]?.occurredAt ?? null,
    stageEnteredAt: p.stageEnteredAt,
    nextStep: p.tasks[0]
      ? { id: p.tasks[0].id, title: p.tasks[0].title, dueAt: p.tasks[0].dueAt }
      : null,
  }));

  const bucketed = bucketTodayQueue(queueable, new Date());
  const byProjectId = new Map(projects.map((p) => [p.id, p]));

  return bucketed.map((item) => {
    const p = byProjectId.get(item.projectId)!;
    const whatsapp = p.dreamer.channelIdentities.find(
      (c) => c.channel === Channel.WHATSAPP,
    );
    const email = p.dreamer.channelIdentities.find(
      (c) => c.channel === Channel.EMAIL,
    );
    return {
      ...item,
      dreamTitle: p.title,
      dreamerName: p.dreamer.preferredName ?? p.dreamer.firstName,
      whatsapp: whatsapp?.handle ?? null,
      email: email?.handle ?? null,
      lastSummary: p.interactions[0]?.summary ?? null,
    };
  });
}
