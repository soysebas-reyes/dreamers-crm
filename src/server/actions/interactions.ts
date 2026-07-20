"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { quickLogSchema } from "@/lib/validations/interaction";
import { TaskStatus } from "@/generated/prisma/client";

// The quick-log transaction (PRD §7.5, §4.3). Order matters: the prior open
// next-step is closed BEFORE a new one is inserted, or the iron rule's
// partial unique index (task_one_open_next_action) rejects the insert.
export async function logTouchpoint(rawInput: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated.");

  const input = quickLogSchema.parse(rawInput);

  try {
    await prisma.$transaction(async (tx) => {
      const interaction = await tx.interaction.create({
        data: {
          dreamerId: input.dreamerId,
          projectId: input.projectId,
          helperId: session.user.id,
          channel: input.channel,
          direction: input.direction,
          occurredAt: input.occurredAt,
          summary: input.summary,
          outcome: input.outcome ?? null,
          countsAsContact: input.countsAsContact,
        },
      });

      const openTask = await tx.task.findFirst({
        where: {
          projectId: input.projectId,
          isNextAction: true,
          status: TaskStatus.OPEN,
        },
      });

      if (openTask) {
        await tx.task.update({
          where: { id: openTask.id },
          data: {
            status: TaskStatus.DONE,
            isNextAction: false,
            completedAt: new Date(),
          },
        });
      }

      if (input.mode === "next_step") {
        await tx.task.create({
          data: {
            dreamerId: input.dreamerId,
            projectId: input.projectId,
            assigneeId: session.user.id,
            title: input.nextStepTitle,
            dueAt: input.nextStepDueAt,
            isNextAction: true,
            status: TaskStatus.OPEN,
            sourceInteractionId: interaction.id,
            recreatedFromId: openTask?.id ?? null,
          },
        });
      } else if (input.mode === "decide_tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await tx.task.create({
          data: {
            dreamerId: input.dreamerId,
            projectId: input.projectId,
            assigneeId: session.user.id,
            title: "Decide next step",
            dueAt: tomorrow,
            isNextAction: true,
            status: TaskStatus.OPEN,
            sourceInteractionId: interaction.id,
            recreatedFromId: openTask?.id ?? null,
          },
        });
      } else if (input.mode === "status_change") {
        // The iron rule only binds status ACTIVE (PRD §4.3) — no new next
        // step is created here; the clock keeps showing, per §4.2.
        await tx.project.update({
          where: { id: input.projectId },
          data: {
            status: input.newStatus,
            waitingFor:
              input.newStatus === "WAITING_ON_DREAMER"
                ? input.statusNote
                : null,
            pauseReason: input.newStatus === "PAUSED" ? input.statusNote : null,
            resumeDate:
              input.newStatus === "PAUSED" ? (input.resumeDate ?? null) : null,
          },
        });
      }
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error(
        "This Dream already has an open next step — refresh and try again.",
      );
    }
    throw error;
  }

  revalidatePath("/today");
  revalidatePath("/dreamers");
  revalidatePath(`/dreamers/${input.dreamerId}`);
}
