import { prisma } from "@/lib/prisma";
import { classifyFreshness, daysSince, type Freshness } from "@/lib/cadence";
import { DEFAULT_STAGE_CONFIG } from "@/lib/stage-config";
import { ProjectStatus, type Stage } from "@/generated/prisma/client";

export interface DreamerListRow {
  id: string;
  name: string;
  ownerName: string | null;
  dreamTitle: string | null;
  stage: Stage | null;
  freshness: Freshness | null;
  daysSinceContact: number | null;
  nextStepId: string | null;
  nextStepTitle: string | null;
  nextStepDueAt: Date | null;
}

export async function listDreamers(teamId: string): Promise<DreamerListRow[]> {
  const [dreamers, stageConfigs] = await Promise.all([
    prisma.dreamer.findMany({
      where: { teamId, archivedAt: null },
      include: {
        owner: { select: { name: true } },
        projects: {
          where: { archivedAt: null },
          orderBy: { createdAt: "desc" },
          include: {
            tasks: {
              where: { isNextAction: true, status: "OPEN" },
              take: 1,
            },
            interactions: {
              where: { countsAsContact: true },
              orderBy: { occurredAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stageConfig.findMany({ where: { teamId } }),
  ]);

  const cadenceByStage = new Map(
    stageConfigs.map((sc) => [sc.stage, sc.cadenceDays]),
  );
  const now = new Date();

  return dreamers.map((d) => {
    const activeProjects = d.projects.filter(
      (p) =>
        p.status === ProjectStatus.ACTIVE ||
        p.status === ProjectStatus.RE_ENGAGED,
    );
    const primary = activeProjects[0] ?? d.projects[0] ?? null;

    if (!primary) {
      return {
        id: d.id,
        name: d.preferredName ?? d.firstName,
        ownerName: d.owner.name,
        dreamTitle: null,
        stage: null,
        freshness: null,
        daysSinceContact: null,
        nextStepId: null,
        nextStepTitle: null,
        nextStepDueAt: null,
      };
    }

    const cadenceDays =
      cadenceByStage.get(primary.stage) ??
      DEFAULT_STAGE_CONFIG[primary.stage].cadenceDays;
    const lastContact = primary.interactions[0]?.occurredAt ?? null;
    const daysSinceContact = daysSince(lastContact, now);
    const nextStep = primary.tasks[0] ?? null;

    return {
      id: d.id,
      name: d.preferredName ?? d.firstName,
      ownerName: d.owner.name,
      dreamTitle: primary.title,
      stage: primary.stage,
      freshness: classifyFreshness(daysSinceContact, cadenceDays),
      daysSinceContact,
      nextStepId: nextStep?.id ?? null,
      nextStepTitle: nextStep?.title ?? null,
      nextStepDueAt: nextStep?.dueAt ?? null,
    };
  });
}

export async function getDreamerProfile(dreamerId: string) {
  return prisma.dreamer.findUnique({
    where: { id: dreamerId },
    include: {
      owner: { select: { id: true, name: true } },
      channelIdentities: true,
      dreamerTags: { include: { tag: true } },
      rememberItems: { orderBy: { createdAt: "desc" } },
      projects: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          tasks: {
            where: { isNextAction: true, status: "OPEN" },
            take: 1,
          },
        },
      },
    },
  });
}
