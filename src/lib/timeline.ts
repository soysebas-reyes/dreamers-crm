import type {
  Channel,
  Direction,
  InteractionOutcome,
  Stage,
} from "@/generated/prisma/client";

// Merged timeline (PRD §7.2): interactions, stage changes, and notes are
// visually distinct (a note never masquerades as a logged contact) but
// share one reverse-chronological feed per Dreamer.

export type TimelineItem =
  | {
      kind: "interaction";
      id: string;
      at: Date;
      channel: Channel;
      direction: Direction;
      summary: string;
      outcome: InteractionOutcome | null;
      helperName: string;
      dreamTitle: string | null;
    }
  | {
      kind: "stage_change";
      id: string;
      at: Date;
      fromStage: Stage | null;
      toStage: Stage;
      reason: string | null;
      changedByName: string;
      dreamTitle: string;
    }
  | {
      kind: "note";
      id: string;
      at: Date;
      body: string;
      isPinned: boolean;
      authorName: string;
    };

export function mergeTimeline(items: TimelineItem[]): TimelineItem[] {
  return [...items].sort((a, b) => b.at.getTime() - a.at.getTime());
}
