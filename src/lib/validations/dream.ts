import { z } from "zod";
import { Stage } from "@/generated/prisma/client";

export const createDreamSchema = z.object({
  dreamerId: z.uuid(),
  title: z.string().min(1, "What's the dream, in a few words?"),
  description: z.string().nullish(),
  northStar: z.string().nullish(),
  northStarTargetDate: z.coerce.date().nullish(),
});

export type CreateDreamInput = z.infer<typeof createDreamSchema>;

// A stage move backward through the pipeline requires a one-line reason
// (PRD §4.2) — forward moves and the initial creation don't.
export const changeStageSchema = z.object({
  projectId: z.uuid(),
  toStage: z.enum(Stage),
  reason: z.string().nullish(),
});

export type ChangeStageInput = z.infer<typeof changeStageSchema>;
