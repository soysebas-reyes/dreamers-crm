import { MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { waLink, mailtoLink } from "@/lib/deep-links";

export function ChannelChips({
  whatsapp,
  email,
  size = "default",
}: {
  whatsapp?: string | null;
  email?: string | null;
  size?: "default" | "sm";
}) {
  if (!whatsapp && !email) return null;

  return (
    <div className="flex gap-2">
      {whatsapp && (
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : "default"}
          nativeButton={false}
          render={
            <a
              href={waLink(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </Button>
      )}
      {email && (
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : "default"}
          nativeButton={false}
          render={
            <a
              href={mailtoLink(email)}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <Mail className="size-4" />
          Email
        </Button>
      )}
    </div>
  );
}
