import { format } from "date-fns";
import {
  MessageCircle,
  Mail,
  Phone,
  Video,
  Users,
  Smartphone,
  Mic,
} from "lucide-react";
import type { TimelineItem as TimelineItemType } from "@/lib/timeline";

const CHANNEL_ICONS: Record<string, typeof MessageCircle> = {
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
  PHONE_CALL: Phone,
  VIDEO_CALL: Video,
  IN_PERSON: Users,
  HELPBNK_DM: Smartphone,
  VOICE_NOTE: Mic,
  SOCIAL_DM: Smartphone,
  OTHER: MessageCircle,
};

const STAGE_LABELS: Record<string, string> = {
  INTAKE: "Intake",
  DISCOVERY: "Discovery",
  ACTIVE_HELP: "Active Help",
  LAUNCH_SUPPORT: "Launch Support",
  MOMENTUM: "Momentum",
  GRADUATED: "Graduated",
  CLOSED_REFERRED: "Closed — Referred",
  CLOSED_UNRESPONSIVE: "Closed — Unresponsive",
};

export function TimelineItem({ item }: { item: TimelineItemType }) {
  const timestamp = format(item.at, "d MMM, HH:mm");

  if (item.kind === "interaction") {
    const Icon = CHANNEL_ICONS[item.channel] ?? MessageCircle;
    return (
      <div className="flex gap-3 rounded-lg border p-3">
        <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span>{item.helperName}</span>
            <span>&middot;</span>
            <span>{timestamp}</span>
            {item.dreamTitle && (
              <>
                <span>&middot;</span>
                <span>{item.dreamTitle}</span>
              </>
            )}
          </div>
          <p className="text-sm">{item.summary}</p>
        </div>
      </div>
    );
  }

  if (item.kind === "stage_change") {
    return (
      <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs">
        <span>{timestamp}</span>
        <span>&middot;</span>
        <span>
          {item.dreamTitle} moved{" "}
          {item.fromStage ? `${STAGE_LABELS[item.fromStage]} → ` : ""}
          {STAGE_LABELS[item.toStage]}
        </span>
        <span>&middot;</span>
        <span>{item.changedByName}</span>
        {item.reason && <span className="italic">&mdash; {item.reason}</span>}
      </div>
    );
  }

  // note
  return (
    <div className="rounded-lg border-l-4 border-l-amber-400 bg-amber-50 p-3 dark:bg-amber-950/30">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <span>{item.authorName}</span>
        <span>&middot;</span>
        <span>{timestamp}</span>
        {item.isPinned && <span>&middot; 📌 pinned</span>}
      </div>
      <p className="mt-1 text-sm whitespace-pre-wrap">{item.body}</p>
    </div>
  );
}
