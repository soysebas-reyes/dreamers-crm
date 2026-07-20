"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createDreamSchema, changeStageSchema } from "@/lib/validations/dream";
import { Stage, ProjectStatus } from "@/generated/prisma/client";

// Canonical pipeline order (PRD §4.1) — used to detect a backward move.
const STAGE_ORDER: Stage[] = [
  Stage.INTAKE,
  Stage.DISCOVERY,
  Stage.ACTIVE_HELP,
  Stage.LAUNCH_SUPPORT,
  Stage.MOMENTUM,
  Stage.GRADUATED,
];

export async function createAdditionalDream(rawInput: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated.");

  const input = createDreamSchema.parse(rawInput);

  const dreamer = await prisma.dreamer.findUniqueOrThrow({
    where: { id: input.dreamerId },
    select: { ownerId: true },
  });

  await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        dreamerId: input.dreamerId,
        ownerId: dreamer.ownerId,
        title: input.title,
        description: input.description,
        northStar: input.northStar,
        northStarTargetDate: input.northStarTargetDate,
        stage: Stage.INTAKE,
        status: ProjectStatus.ACTIVE,
      },
    });

    await tx.stageTransition.create({
      data: {
        projectId: project.id,
        fromStage: null,
        toStage: Stage.INTAKE,
        changedById: session.user.id,
      },
    });

    const dueAt = new Date();
    dueAt.setHours(dueAt.getHours() + 48);
    await tx.task.create({
      data: {
        dreamerId: input.dreamerId,
        projectId: project.id,
        assigneeId: dreamer.ownerId,
        title: "Make first contact",
        dueAt,
        isNextAction: true,
      },
    });
  });

  revalidatePath(`/dreamers/${input.dreamerId}`);
  revalidatePath("/today");
}

export async function changeStage(rawInput: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated.");

  const input = changeStageSchema.parse(rawInput);

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: input.projectId },
    select: { stage: true, dreamerId: true },
  });

  const fromIdx = STAGE_ORDER.indexOf(project.stage);
  const toIdx = STAGE_ORDER.indexOf(input.toStage);
  const isRegression = fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx;
  if (isRegression && !input.reason?.trim()) {
    throw new Error("Moving backward needs a one-line reason — what changed?");
  }

  await prisma.$transaction([
    prisma.project.update({
      where: { id: input.projectId },
      data: { stage: input.toStage, stageEnteredAt: new Date() },
    }),
    prisma.stageTransition.create({
      data: {
        projectId: input.projectId,
        fromStage: project.stage,
        toStage: input.toStage,
        changedById: session.user.id,
        reason: input.reason,
      },
    }),
  ]);

  revalidatePath(`/dreamers/${project.dreamerId}`);
  revalidatePath("/today");
}
