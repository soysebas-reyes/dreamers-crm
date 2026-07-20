import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDreamerProfile } from "@/server/queries/dreamers";
import { getDreamerTimeline } from "@/server/queries/timeline";
import { DEFAULT_STAGE_CONFIG } from "@/lib/stage-config";
import { IdentityRail } from "@/components/dreamers/profile/identity-rail";
import { DreamCard } from "@/components/dreamers/profile/dream-card";
import { TheAsk } from "@/components/dreamers/profile/the-ask";
import { Timeline } from "@/components/dreamers/profile/timeline";
import { DreamFormDialog } from "@/components/dreamers/profile/dream-form-dialog";
import { QuickLogComposer } from "@/components/quick-log/quick-log-composer";
import { ProjectStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function DreamerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dreamer = await getDreamerProfile(id);
  if (!dreamer) notFound();

  const [timeline, stageConfigs] = await Promise.all([
    getDreamerTimeline(id),
    prisma.stageConfig.findMany({ where: { teamId: dreamer.teamId } }),
  ]);
  const cadenceByStage = new Map(
    stageConfigs.map((sc) => [sc.stage, sc.cadenceDays]),
  );

  const activeProjects = dreamer.projects.filter(
    (p) =>
      p.status === ProjectStatus.ACTIVE ||
      p.status === ProjectStatus.RE_ENGAGED,
  );
  const dreamOptions = activeProjects.map((p) => ({
    id: p.id,
    title: p.title,
  }));
  const displayName = dreamer.preferredName ?? dreamer.firstName;
  const primaryCadence = activeProjects[0]
    ? (cadenceByStage.get(activeProjects[0].stage) ??
      DEFAULT_STAGE_CONFIG[activeProjects[0].stage].cadenceDays)
    : 7;

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside>
        <IdentityRail dreamer={dreamer} />
      </aside>

      <main className="flex flex-col gap-4">
        {dreamer.dreamStatement && (
          <blockquote className="text-muted-foreground border-l-2 pl-4 text-lg italic">
            &ldquo;{dreamer.dreamStatement}&rdquo;
          </blockquote>
        )}

        {dreamOptions.length > 0 ? (
          <QuickLogComposer
            dreamerId={dreamer.id}
            dreamerName={displayName}
            dreamOptions={dreamOptions}
            defaultChannel={dreamer.communicationPreference ?? undefined}
            cadenceDays={primaryCadence}
          />
        ) : (
          <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
            No active Dream to log against — start one on the right.
          </p>
        )}

        <Timeline items={timeline} />
      </main>

      <aside className="flex flex-col gap-4">
        {dreamer.projects.map((project) => (
          <DreamCard key={project.id} project={project} />
        ))}
        <DreamFormDialog dreamerId={dreamer.id} />
        <TheAsk originalAsk={dreamer.originalAsk} />
      </aside>
    </div>
  );
}
