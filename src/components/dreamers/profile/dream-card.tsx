import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StageSelect } from "./stage-select";
import type { Stage, ProjectStatus } from "@/generated/prisma/enums";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: "Active",
  WAITING_ON_DREAMER: "Waiting on them",
  PAUSED: "Paused",
  GHOSTED: "Ghosted",
  RE_ENGAGED: "Re-engaged",
  DORMANT: "Dormant",
};

export function DreamCard({
  project,
}: {
  project: {
    id: string;
    title: string;
    stage: Stage;
    status: ProjectStatus;
    northStar: string | null;
    northStarTargetDate: Date | null;
    waitingFor: string | null;
    pauseReason: string | null;
    tasks: { id: string; title: string; dueAt: Date }[];
  };
}) {
  const nextStep = project.tasks[0] ?? null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{project.title}</CardTitle>
        <StageSelect projectId={project.id} stage={project.stage} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {project.status !== "ACTIVE" && (
          <Badge variant="secondary" className="w-fit">
            {STATUS_LABELS[project.status]}
            {project.status === "WAITING_ON_DREAMER" && project.waitingFor
              ? ` — ${project.waitingFor}`
              : ""}
            {project.status === "PAUSED" && project.pauseReason
              ? ` — ${project.pauseReason}`
              : ""}
          </Badge>
        )}
        {project.northStar && (
          <p className="text-sm">
            <span className="text-muted-foreground">North star:</span>{" "}
            {project.northStar}
            {project.northStarTargetDate && (
              <>
                {" "}
                &middot; by {format(project.northStarTargetDate, "d MMM yyyy")}
              </>
            )}
          </p>
        )}
        {nextStep ? (
          <p className="text-sm font-medium">
            Next step: {nextStep.title} &middot; due{" "}
            {format(nextStep.dueAt, "d MMM")}
          </p>
        ) : (
          <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
            No next step set — worth deciding one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
