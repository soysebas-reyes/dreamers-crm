"use client";

import { useTransition } from "react";
import { addDays, addWeeks } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { snoozeTask } from "@/server/actions/tasks";

const OPTIONS = [
  { label: "+1 day", getDate: () => addDays(new Date(), 1) },
  { label: "+3 days", getDate: () => addDays(new Date(), 3) },
  { label: "+1 week", getDate: () => addWeeks(new Date(), 1) },
  {
    label: "They asked for space (+1 month)",
    getDate: () => addDays(new Date(), 30),
  },
] as const;

export function SnoozeMenu({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSnooze(getDate: () => Date) {
    startTransition(async () => {
      try {
        await snoozeTask(taskId, getDate());
        toast.success("Snoozed");
      } catch {
        toast.error("Couldn't snooze — try again.");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" disabled={isPending} />}
      >
        Snooze
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.label}
            onClick={() => handleSnooze(opt.getDate)}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
