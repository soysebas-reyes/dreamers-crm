import Link from "next/link";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FreshnessDot } from "./freshness-dot";
import type { DreamerListRow } from "@/server/queries/dreamers";

export function DreamerTable({ rows }: { rows: DreamerListRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
        Nobody here yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dreamer</TableHead>
          <TableHead>Dream</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Last contact</TableHead>
          <TableHead>Next step</TableHead>
          <TableHead>Owner</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} className="cursor-pointer">
            <TableCell>
              <Link
                href={`/dreamers/${row.id}`}
                className="flex items-center gap-2 hover:underline"
              >
                <FreshnessDot freshness={row.freshness} />
                {row.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.dreamTitle ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.stage?.replaceAll("_", " ") ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.daysSinceContact === null
                ? "Never"
                : `${row.daysSinceContact}d ago`}
            </TableCell>
            <TableCell>
              {row.nextStepId ? (
                <span>
                  {row.nextStepTitle} &middot;{" "}
                  {row.nextStepDueAt && format(row.nextStepDueAt, "d MMM")}
                </span>
              ) : (
                <Link
                  href={`/dreamers/${row.id}`}
                  className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400"
                >
                  + set step
                </Link>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.ownerName ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
