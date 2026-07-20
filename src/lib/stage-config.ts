import { Stage } from "@/generated/prisma/client";

export type StageConfigDefaults = {
  cadenceDays: number;
  targetStageDays: number | null;
  firstTouchHours: number | null;
};

// Fallback values if a team's stage_config row is somehow missing — the
// seed script writes real rows per PRD §4.1; this is a safety net, not the
// primary source of truth.
export const DEFAULT_STAGE_CONFIG: Record<Stage, StageConfigDefaults> = {
  [Stage.INTAKE]: { cadenceDays: 2, targetStageDays: 5, firstTouchHours: 48 },
  [Stage.DISCOVERY]: {
    cadenceDays: 5,
    targetStageDays: 14,
    firstTouchHours: null,
  },
  [Stage.ACTIVE_HELP]: {
    cadenceDays: 7,
    targetStageDays: 112,
    firstTouchHours: null,
  },
  [Stage.LAUNCH_SUPPORT]: {
    cadenceDays: 5,
    targetStageDays: 42,
    firstTouchHours: null,
  },
  [Stage.MOMENTUM]: {
    cadenceDays: 14,
    targetStageDays: 56,
    firstTouchHours: null,
  },
  [Stage.GRADUATED]: {
    cadenceDays: 90,
    targetStageDays: null,
    firstTouchHours: null,
  },
  [Stage.CLOSED_REFERRED]: {
    cadenceDays: 0,
    targetStageDays: null,
    firstTouchHours: null,
  },
  [Stage.CLOSED_UNRESPONSIVE]: {
    cadenceDays: 0,
    targetStageDays: null,
    firstTouchHours: null,
  },
};

// Maps a stage's cadence to the nearest quick-log "when" pill (PRD §7.5) —
// the pre-selected next-step due date defaults to the stage's cadence.
export function cadenceToPillDays(cadenceDays: number): 1 | 3 | 7 | 14 {
  if (cadenceDays <= 2) return 1;
  if (cadenceDays <= 5) return 3;
  if (cadenceDays <= 7) return 7;
  return 14;
}
