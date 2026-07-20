"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuickLogComposer, type DreamOption } from "./quick-log-composer";
import type { Channel } from "@/generated/prisma/enums";

export function QuickLogDialog({
  open,
  onOpenChange,
  dreamerId,
  dreamerName,
  dreamOptions,
  defaultChannel,
  cadenceDays,
  completingTaskId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dreamerId: string;
  dreamerName: string;
  dreamOptions: DreamOption[];
  defaultChannel?: Channel;
  cadenceDays?: number;
  completingTaskId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log touchpoint</DialogTitle>
        </DialogHeader>
        <QuickLogComposer
          dreamerId={dreamerId}
          dreamerName={dreamerName}
          dreamOptions={dreamOptions}
          defaultChannel={defaultChannel}
          cadenceDays={cadenceDays}
          completingTaskId={completingTaskId}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function useQuickLogDialog() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
