"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Channel } from "@/generated/prisma/enums";

const CHANNEL_LABELS: Record<Channel, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  VIDEO_CALL: "Video call",
  PHONE_CALL: "Call",
  IN_PERSON: "In person",
  HELPBNK_DM: "HelpBnk DM",
  VOICE_NOTE: "Voice note",
  SOCIAL_DM: "Social DM",
  OTHER: "Other",
};

// The most common channels get a pill; the rest live in the native select
// fallback so the row doesn't sprawl.
const PRIMARY_CHANNELS: Channel[] = [
  Channel.WHATSAPP,
  Channel.EMAIL,
  Channel.PHONE_CALL,
  Channel.IN_PERSON,
];

export function ChannelPills({
  value,
  onChange,
}: {
  value: Channel;
  onChange: (channel: Channel) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRIMARY_CHANNELS.map((channel) => (
        <Button
          key={channel}
          type="button"
          size="sm"
          variant={value === channel ? "default" : "outline"}
          className={cn("h-8 px-3")}
          onClick={() => onChange(channel)}
        >
          {CHANNEL_LABELS[channel]}
        </Button>
      ))}
      <select
        className="border-input bg-background h-8 rounded-full border px-3 text-sm"
        value={PRIMARY_CHANNELS.includes(value) ? "" : value}
        onChange={(e) => onChange(e.target.value as Channel)}
      >
        <option value="" disabled>
          More…
        </option>
        {Object.entries(CHANNEL_LABELS)
          .filter(([c]) => !PRIMARY_CHANNELS.includes(c as Channel))
          .map(([c, label]) => (
            <option key={c} value={c}>
              {label}
            </option>
          ))}
      </select>
    </div>
  );
}
