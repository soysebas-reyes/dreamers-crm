"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type NoActionStatus = "WAITING_ON_DREAMER" | "PAUSED";

export function NoActionPanel({
  status,
  onStatusChange,
  note,
  onNoteChange,
  resumeDate,
  onResumeDateChange,
}: {
  status: NoActionStatus;
  onStatusChange: (status: NoActionStatus) => void;
  note: string;
  onNoteChange: (note: string) => void;
  resumeDate: Date | undefined;
  onResumeDateChange: (date: Date | undefined) => void;
}) {
  return (
    <div className="bg-muted/40 flex flex-col gap-3 rounded-md border p-3">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={status === "WAITING_ON_DREAMER" ? "default" : "outline"}
          onClick={() => onStatusChange("WAITING_ON_DREAMER")}
        >
          Waiting on them
        </Button>
        <Button
          type="button"
          size="sm"
          variant={status === "PAUSED" ? "default" : "outline"}
          onClick={() => onStatusChange("PAUSED")}
        >
          Paused
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status-note">
          {status === "WAITING_ON_DREAMER"
            ? "What are you waiting on?"
            : "Why the pause?"}
        </Label>
        <Textarea
          id="status-note"
          rows={2}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={
            status === "WAITING_ON_DREAMER"
              ? "Sending her draft deck…"
              : "Health stuff this month — resume mid-August."
          }
        />
      </div>
      {status === "PAUSED" && (
        <div className="flex flex-col gap-1.5">
          <Label>Resume around (optional, max 90 days out)</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn("w-fit")}
                />
              }
            >
              <CalendarIcon className="size-3.5" />
              {resumeDate ? format(resumeDate, "d MMM yyyy") : "Pick a date"}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={resumeDate}
                onSelect={onResumeDateChange}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
