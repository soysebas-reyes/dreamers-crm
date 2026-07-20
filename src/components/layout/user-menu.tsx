import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/server/actions/auth";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-8">
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="hidden text-sm leading-tight sm:block">
        <div className="font-medium">{name}</div>
        <div className="text-muted-foreground text-xs capitalize">
          {role.toLowerCase()}
        </div>
      </div>
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}
