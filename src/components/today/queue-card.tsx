"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChannelChips } from "@/components/dreamers/channel-chips";
import { FreshnessDot } from "@/components/dreamers/freshness-dot";
import { SnoozeMenu } from "./snooze-menu";
import {
  QuickLogDialog,
  useQuickLogDialog,
} from "@/components/quick-log/quick-log-dialog";
import type { TodayQueueItem } from "@/server/queries/today";
import { classifyFreshness } from "@/lib/cadence";

const BUCKET_LABEL: Record<TodayQueueItem["bucket"], string> = {
  overdue: "Overdue",
  due_today: "Due today",
  going_quiet: "Going quiet",
};

export function QueueCard({ item }: { item: TodayQueueItem }) {
  const { open, setOpen } = useQuickLogDialog();
  const freshness = classifyFreshness(item.daysSinceContact, item.cadenceDays);

  return (
    <div className="bg-card flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FreshnessDot freshness={freshness} />
          <Link
            href={`/dreamers/${item.dreamerId}`}
            className="font-medium hover:underline"
          >
            {item.dreamerName}
          </Link>
          <span className="text-muted-foreground">
            &mdash; &ldquo;{item.dreamTitle}&rdquo;
          </span>
        </div>
        <Badge variant="outline">{BUCKET_LABEL[item.bucket]}</Badge>
      </div>

      {item.nextStep ? (
        <p className="text-sm">
          Next step: {item.nextStep.title} &middot; due{" "}
          {format(item.nextStep.dueAt, "EEE d MMM")}
        </p>
      ) : (
        <p className="text-sm text-amber-700 dark:text-amber-500">
          No next step set yet — worth deciding one.
        </p>
      )}

      <p className="text-muted-foreground text-sm">
        {item.daysSinceContact === null
          ? "Never contacted yet"
          : `Last contact: ${item.daysSinceContact}d ago`}
        {item.lastSummary && <> &mdash; &ldquo;{item.lastSummary}&rdquo;</>}
      </p>

      {/* remember_item line — deferred past this build, see docs/PRD.md §9.2 */}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <ChannelChips whatsapp={item.whatsapp} email={item.email} size="sm" />
        <Button size="sm" onClick={() => setOpen(true)}>
          <CheckCircle2 className="size-4" />
          Done + Log
        </Button>
        {item.nextStep && <SnoozeMenu taskId={item.nextStep.id} />}
        <div className="flex-1" />
        <Button
          size="sm"
          variant="ghost"
          nativeButton={false}
          render={<Link href={`/dreamers/${item.dreamerId}`} />}
        >
          Open
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <QuickLogDialog
        open={open}
        onOpenChange={setOpen}
        dreamerId={item.dreamerId}
        dreamerName={item.dreamerName}
        dreamOptions={[{ id: item.projectId, title: item.dreamTitle }]}
        cadenceDays={item.cadenceDays}
        completingTaskId={item.nextStep?.id}
      />
    </div>
  );
}
