import { prisma } from "@/lib/prisma";

export async function getActiveTools() {
  return await prisma.affiliateTool.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}
