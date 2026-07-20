import { z } from "zod";
import {
  Channel,
  Direction,
  InteractionOutcome,
} from "@/generated/prisma/client";

// The quick-log (PRD §7.5): exactly two required fields (summary + next
// step), everything else defaulted or optional. Three modes cover the
// iron rule's escape hatches (PRD §4.3): a real next step, "decide
// tomorrow", or an explicit status change off `active`.

const commonFields = {
  dreamerId: z.uuid(),
  projectId: z.uuid().nullish(),
  completingTaskId: z.uuid().nullish(),
  summary: z.string().min(1, "Say what happened — even one line."),
  channel: z.enum(Channel).default(Channel.WHATSAPP),
  direction: z.enum(Direction).default(Direction.OUTBOUND),
  outcome: z.enum(InteractionOutcome).nullish(),
  occurredAt: z.coerce.date().default(() => new Date()),
  countsAsContact: z.boolean().default(true),
};

export const quickLogSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("next_step"),
    ...commonFields,
    nextStepTitle: z.string().min(1, "What happens next?"),
    nextStepDueAt: z.coerce.date(),
  }),
  z.object({
    mode: z.literal("decide_tomorrow"),
    ...commonFields,
  }),
  z.object({
    mode: z.literal("status_change"),
    ...commonFields,
    newStatus: z.enum(["WAITING_ON_DREAMER", "PAUSED"]),
    statusNote: z
      .string()
      .min(1, "One line on why — the clock still shows, just paused."),
    resumeDate: z.coerce.date().nullish(),
  }),
]);

export type QuickLogInput = z.infer<typeof quickLogSchema>;
