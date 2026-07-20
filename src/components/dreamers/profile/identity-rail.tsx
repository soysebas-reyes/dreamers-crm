import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChannelChips } from "@/components/dreamers/channel-chips";
import { Channel } from "@/generated/prisma/enums";

const SOURCE_LABELS: Record<string, string> = {
  HELPBNK_DM: "HelpBnk DM",
  DOORBELL: "Doorbell",
  EVENT: "Event",
  SOCIAL_DM: "Social DM",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
  OTHER: "Other",
};

export function IdentityRail({
  dreamer,
}: {
  dreamer: {
    firstName: string;
    lastName: string | null;
    preferredName: string | null;
    locationCity: string | null;
    source: string;
    owner: { name: string | null };
    channelIdentities: { channel: string; handle: string }[];
    dreamerTags: { tag: { name: string } }[];
  };
}) {
  const displayName = dreamer.preferredName ?? dreamer.firstName;
  const fullName = [dreamer.firstName, dreamer.lastName]
    .filter(Boolean)
    .join(" ");
  const whatsapp = dreamer.channelIdentities.find(
    (c) => c.channel === Channel.WHATSAPP,
  )?.handle;
  const email = dreamer.channelIdentities.find(
    (c) => c.channel === Channel.EMAIL,
  )?.handle;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback>
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{displayName}</div>
          {fullName !== displayName && (
            <div className="text-muted-foreground text-sm">{fullName}</div>
          )}
        </div>
      </div>

      <div className="text-muted-foreground flex flex-col gap-1 text-sm">
        {dreamer.locationCity && <span>{dreamer.locationCity}</span>}
        <span>
          How we met: {SOURCE_LABELS[dreamer.source] ?? dreamer.source}
        </span>
        <span>Owner: {dreamer.owner.name ?? "Unassigned"}</span>
      </div>

      {dreamer.dreamerTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {dreamer.dreamerTags.map(({ tag }) => (
            <Badge key={tag.name} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <ChannelChips whatsapp={whatsapp} email={email} size="sm" />
    </div>
  );
}
