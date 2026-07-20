import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listDreamers } from "@/server/queries/dreamers";
import { DreamerTable } from "@/components/dreamers/dreamer-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Tab = "all" | "going_quiet" | "no_next_step";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "going_quiet", label: "Going quiet" },
  { key: "no_next_step", label: "No next step" },
];

export default async function DreamersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { tab: tabParam } = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === tabParam)
    ? (tabParam as Tab)
    : "all";

  const helper = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { teamId: true },
  });
  const rows = helper.teamId ? await listDreamers(helper.teamId) : [];

  const filtered = rows.filter((row) => {
    if (tab === "going_quiet") return row.freshness === "stale";
    if (tab === "no_next_step") return !row.nextStepId;
    return true;
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dreamers</h1>
          <p className="text-muted-foreground text-sm">
            Everyone the team is helping.
          </p>
        </div>
        <Button render={<Link href="/dreamers/new" />}>+ New Dreamer</Button>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/dreamers" : `/dreamers?tab=${t.key}`}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium",
              tab === t.key
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <DreamerTable rows={filtered} />
    </div>
  );
}
