import { z } from "zod";
import { Channel, DreamerSource } from "@/generated/prisma/client";

export const createDreamerSchema = z.object({
  firstName: z.string().min(1, "A name to start with."),
  lastName: z.string().nullish(),
  preferredName: z.string().nullish(),
  source: z.enum(DreamerSource).default(DreamerSource.OTHER),
  dreamStatement: z.string().nullish(),
  originalAsk: z.string().nullish(),
  bioContext: z.string().nullish(),
  communicationPreference: z.enum(Channel).nullish(),
  locationCity: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.email().nullish(),
});

export type CreateDreamerInput = z.infer<typeof createDreamerSchema>;
