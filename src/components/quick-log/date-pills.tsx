"use client";

import { addDays, format, isSameDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PILLS = [
  { label: "Tmrw", days: 1 },
  { label: "3d", days: 3 },
  { label: "1w", days: 7 },
  { label: "2w", days: 14 },
] as const;

export function DatePills({
  value,
  onChange,
}: {
  value: Date;
  onChange: (date: Date) => void;
}) {
  const now = new Date();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PILLS.map((pill) => {
        const target = addDays(now, pill.days);
        const active = isSameDay(value, target);
        return (
          <Button
            key={pill.label}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            className="h-8 px-3"
            onClick={() => onChange(target)}
          >
            {pill.label}
          </Button>
        );
      })}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              size="sm"
              variant={
                PILLS.some((p) => isSameDay(value, addDays(now, p.days)))
                  ? "outline"
                  : "default"
              }
              className={cn("h-8 px-3")}
            />
          }
        >
          <CalendarIcon className="size-3.5" />
          {format(value, "d MMM")}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => date && onChange(date)}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
