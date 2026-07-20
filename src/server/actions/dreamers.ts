"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createDreamerSchema,
  type CreateDreamerInput,
} from "@/lib/validations/dreamer";
import { Channel, Stage, ProjectStatus } from "@/generated/prisma/client";

export async function createDreamer(rawInput: CreateDreamerInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated.");

  const input = createDreamerSchema.parse(rawInput);

  const helper = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { teamId: true },
  });
  if (!helper.teamId) {
    throw new Error("Your account isn't attached to a team yet.");
  }

  const dreamerId = await prisma.$transaction(async (tx) => {
    const dreamer = await tx.dreamer.create({
      data: {
        teamId: helper.teamId!,
        ownerId: session.user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        preferredName: input.preferredName,
        source: input.source,
        dreamStatement: input.dreamStatement,
        originalAsk: input.originalAsk,
        bioContext: input.bioContext,
        communicationPreference: input.communicationPreference,
        locationCity: input.locationCity,
      },
    });

    if (input.phone) {
      await tx.channelIdentity.create({
        data: {
          dreamerId: dreamer.id,
          channel: Channel.WHATSAPP,
          handle: input.phone,
          isPrimary: true,
        },
      });
    }
    if (input.email) {
      await tx.channelIdentity.create({
        data: {
          dreamerId: dreamer.id,
          channel: Channel.EMAIL,
          handle: input.email,
          isPrimary: !input.phone,
        },
      });
    }

    const project = await tx.project.create({
      data: {
        dreamerId: dreamer.id,
        ownerId: session.user.id,
        title: input.dreamTitle,
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

    // Next Step #1, auto-created (PRD §4.3): due +48h, satisfying the iron
    // rule from the moment the Dream exists.
    const dueAt = new Date();
    dueAt.setHours(dueAt.getHours() + 48);
    await tx.task.create({
      data: {
        dreamerId: dreamer.id,
        projectId: project.id,
        assigneeId: session.user.id,
        title: "Make first contact",
        dueAt,
        isNextAction: true,
      },
    });

    return dreamer.id;
  });

  revalidatePath("/dreamers");
  revalidatePath("/today");
  redirect(`/dreamers/${dreamerId}`);
}
