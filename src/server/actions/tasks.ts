"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function snoozeTask(taskId: string, newDueAt: Date) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated.");

  await prisma.task.update({
    where: { id: taskId },
    data: {
      dueAt: newDueAt,
      snoozeCount: { increment: 1 },
    },
  });

  revalidatePath("/today");
  revalidatePath("/dreamers");
}
