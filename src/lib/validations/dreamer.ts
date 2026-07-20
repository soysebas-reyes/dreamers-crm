import { z } from "zod";
import { Channel, DreamerSource } from "@/generated/prisma/enums";

export const createDreamerSchema = z.object({
  firstName: z.string().min(1, "A name to start with."),
  lastName: z.string().nullish(),
  preferredName: z.string().nullish(),
  // No .default() here — react-hook-form's useForm<CreateDreamerInput>
  // needs input/output shapes to match; the form supplies its own
  // defaultValues instead (see dreamer-form.tsx).
  source: z.enum(DreamerSource),
  dreamStatement: z.string().nullish(),
  originalAsk: z.string().nullish(),
  bioContext: z.string().nullish(),
  communicationPreference: z.enum(Channel).nullish(),
  locationCity: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.email().nullish(),
  // A Dreamer is always created with their first Dream (PRD §6.3) — a
  // person-with-no-Dream isn't a state the foundation UI creates; helpers
  // add subsequent Dreams from the profile's "+ New Dream" action.
  dreamTitle: z.string().min(1, "What's the dream, in a few words?"),
});

export type CreateDreamerInput = z.infer<typeof createDreamerSchema>;
