import { prisma } from "@/lib/prisma";

export async function getActiveTools() {
  try {
    return await prisma.affiliateTool.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch active tools:", error);
    return [];
  }
}
