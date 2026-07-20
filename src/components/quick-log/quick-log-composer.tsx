"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChannelPills } from "./channel-pills";
import { DatePills } from "./date-pills";
import { NoActionPanel, type NoActionStatus } from "./no-action-panel";
import { logTouchpoint } from "@/server/actions/interactions";
import { cadenceToPillDays } from "@/lib/stage-config";
import { Channel } from "@/generated/prisma/enums";

type Mode = "next_step" | "decide_tomorrow" | "status_change";

export interface DreamOption {
  id: string;
  title: string;
}

export function QuickLogComposer({
  dreamerId,
  dreamerName,
  dreamOptions,
  defaultChannel = Channel.WHATSAPP,
  cadenceDays = 7,
  completingTaskId,
  onSuccess,
}: {
  dreamerId: string;
  dreamerName: string;
  dreamOptions: DreamOption[];
  defaultChannel?: Channel;
  cadenceDays?: number;
  completingTaskId?: string;
  onSuccess?: () => void;
}) {
  const [projectId, setProjectId] = useState(dreamOptions[0]?.id ?? "");
  const [mode, setMode] = useState<Mode>("next_step");
  const [channel, setChannel] = useState<Channel>(defaultChannel);
  const [summary, setSummary] = useState("");
  const [nextStepTitle, setNextStepTitle] = useState("");
  const [nextStepDueAt, setNextStepDueAt] = useState<Date>(() =>
    addDays(new Date(), cadenceToPillDays(cadenceDays)),
  );
  const [statusValue, setStatusValue] =
    useState<NoActionStatus>("WAITING_ON_DREAMER");
  const [statusNote, setStatusNote] = useState("");
  const [resumeDate, setResumeDate] = useState<Date | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setSummary("");
    setNextStepTitle("");
    setMode("next_step");
    setStatusNote("");
    setResumeDate(undefined);
  }

  function submit(modeOverride?: Mode) {
    const effectiveMode = modeOverride ?? mode;

    if (!summary.trim()) {
      toast.error("Say what happened — even one line.");
      return;
    }
    if (!projectId) {
      toast.error("Pick which Dream this is about.");
      return;
    }

    let payload: Record<string, unknown>;
    if (effectiveMode === "status_change") {
      if (!statusNote.trim()) {
        toast.error("One line on why — the clock still shows, just paused.");
        return;
      }
      payload = {
        mode: effectiveMode,
        dreamerId,
        projectId,
        completingTaskId,
        summary,
        channel,
        newStatus: statusValue,
        statusNote,
        resumeDate,
      };
    } else if (effectiveMode === "decide_tomorrow") {
      payload = {
        mode: effectiveMode,
        dreamerId,
        projectId,
        completingTaskId,
        summary,
        channel,
      };
    } else {
      if (!nextStepTitle.trim()) {
        toast.error("What happens next?");
        return;
      }
      payload = {
        mode: effectiveMode,
        dreamerId,
        projectId,
        completingTaskId,
        summary,
        channel,
        nextStepTitle,
        nextStepDueAt,
      };
    }

    startTransition(async () => {
      try {
        await logTouchpoint(payload);
        toast.success(
          effectiveMode === "next_step"
            ? `Logged · next step ${format(nextStepDueAt, "EEE d MMM")}`
            : "Logged",
        );
        reset();
        onSuccess?.();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Couldn't log that — try again.",
        );
      }
    });
  }

  function onSummaryKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  }

  function onNextStepKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">
          Log a touchpoint with {dreamerName}
        </span>
        {dreamOptions.length > 1 && (
          <Select
            value={projectId}
            onValueChange={(value) => setProjectId(value ?? "")}
          >
            <SelectTrigger size="sm" className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dreamOptions.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <ChannelPills value={channel} onChange={setChannel} />

      <Textarea
        placeholder="What happened? Even one line…"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        onKeyDown={onSummaryKeyDown}
        rows={2}
        autoFocus
      />

      {mode !== "status_change" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="next-step-title">Next step</Label>
          <Input
            id="next-step-title"
            placeholder="What happens next?"
            value={nextStepTitle}
            onChange={(e) => setNextStepTitle(e.target.value)}
            onKeyDown={onNextStepKeyDown}
          />
          <DatePills value={nextStepDueAt} onChange={setNextStepDueAt} />
        </div>
      ) : (
        <NoActionPanel
          status={statusValue}
          onStatusChange={setStatusValue}
          note={statusNote}
          onNoteChange={setStatusNote}
          resumeDate={resumeDate}
          onResumeDateChange={setResumeDate}
        />
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {mode === "next_step" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => submit("decide_tomorrow")}
            disabled={isPending}
          >
            Decide tomorrow
          </Button>
        )}
        {mode !== "status_change" ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setMode("status_change")}
          >
            No further action…
          </Button>
        ) : (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setMode("next_step")}
          >
            ← Back to logging a next step
          </Button>
        )}
        <div className="flex-1" />
        <Button type="button" onClick={() => submit()} disabled={isPending}>
          {isPending ? "Logging…" : "Log"}
        </Button>
      </div>
    </div>
  );
}
