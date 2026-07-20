"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { changeStage } from "@/server/actions/dreams";
import { Stage } from "@/generated/prisma/enums";

const STAGE_ORDER: Stage[] = [
  Stage.INTAKE,
  Stage.DISCOVERY,
  Stage.ACTIVE_HELP,
  Stage.LAUNCH_SUPPORT,
  Stage.MOMENTUM,
  Stage.GRADUATED,
];

const STAGE_LABELS: Record<Stage, string> = {
  INTAKE: "Intake",
  DISCOVERY: "Discovery",
  ACTIVE_HELP: "Active Help",
  LAUNCH_SUPPORT: "Launch Support",
  MOMENTUM: "Momentum",
  GRADUATED: "Graduated",
  CLOSED_REFERRED: "Closed — Referred",
  CLOSED_UNRESPONSIVE: "Closed — Unresponsive",
};

export function StageSelect({
  projectId,
  stage,
}: {
  projectId: string;
  stage: Stage;
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingStage, setPendingStage] = useState<Stage | null>(null);
  const [reason, setReason] = useState("");

  function apply(toStage: Stage, withReason?: string) {
    startTransition(async () => {
      try {
        await changeStage({ projectId, toStage, reason: withReason ?? null });
        toast.success(`Moved to ${STAGE_LABELS[toStage]}`);
        setPendingStage(null);
        setReason("");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't change stage.",
        );
      }
    });
  }

  function handleChange(value: string) {
    const toStage = value as Stage;
    const fromIdx = STAGE_ORDER.indexOf(stage);
    const toIdx = STAGE_ORDER.indexOf(toStage);
    const isRegression = fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx;

    if (isRegression) {
      setPendingStage(toStage);
    } else {
      apply(toStage);
    }
  }

  return (
    <>
      <Select
        value={stage}
        onValueChange={(v) => v && handleChange(v)}
        disabled={isPending}
      >
        <SelectTrigger size="sm" className="w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STAGE_ORDER.map((s) => (
            <SelectItem key={s} value={s}>
              {STAGE_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog
        open={pendingStage !== null}
        onOpenChange={(open) => !open && setPendingStage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What changed?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="regression-reason">
              Moving backward to {pendingStage && STAGE_LABELS[pendingStage]} —
              a one-line reason (this is signal, not a failure).
            </Label>
            <Textarea
              id="regression-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="New blocker came up — needs another round of funding guidance."
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={!reason.trim() || isPending}
              onClick={() => pendingStage && apply(pendingStage, reason)}
            >
              Confirm move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
