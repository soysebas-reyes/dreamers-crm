"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ToolStatus } from "@/generated/prisma/client";

export async function suggestTool(dreamerId: string, toolId: string, notes?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated.");

  await prisma.dreamerTool.upsert({
    where: {
      dreamerId_toolId: {
        dreamerId,
        toolId,
      },
    },
    update: {
      notes,
    },
    create: {
      dreamerId,
      toolId,
      status: ToolStatus.SUGGESTED,
      notes,
    },
  });

  revalidatePath(`/dreamers/${dreamerId}`);
}

export async function markToolUsed(dreamerId: string, toolId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated.");

  await prisma.dreamerTool.update({
    where: {
      dreamerId_toolId: {
        dreamerId,
        toolId,
      },
    },
    data: {
      status: ToolStatus.USED,
    },
  });

  revalidatePath(`/dreamers/${dreamerId}`);
}

export async function addCustomTool(name: string, url?: string, category?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated.");

  const tool = await prisma.affiliateTool.create({
    data: {
      name,
      url,
      category,
    },
  });
  
  // Revalidate anything depending on the tool list
  revalidatePath(`/dreamers`);
  
  return tool;
}
