"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  createDreamerSchema,
  type CreateDreamerInput,
} from "@/lib/validations/dreamer";
import { createDreamer } from "@/server/actions/dreamers";
import { DreamerSource } from "@/generated/prisma/enums";

const SOURCE_LABELS: Record<DreamerSource, string> = {
  HELPBNK_DM: "HelpBnk DM",
  DOORBELL: "Doorbell",
  EVENT: "Event",
  SOCIAL_DM: "Social DM",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
  OTHER: "Other",
};

export function DreamerForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateDreamerInput>({
    resolver: zodResolver(createDreamerSchema),
    defaultValues: { source: DreamerSource.OTHER },
  });

  function onSubmit(values: CreateDreamerInput) {
    startTransition(async () => {
      try {
        await createDreamer(values);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Couldn't create that Dreamer.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-lg flex-col gap-4"
    >
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" {...register("firstName")} autoFocus />
          {errors.firstName && (
            <p className="text-destructive text-sm">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="lastName">Last name (optional)</Label>
          <Input id="lastName" {...register("lastName")} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="preferredName">Preferred name (optional)</Label>
        <Input id="preferredName" {...register("preferredName")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="source">How did you meet?</Label>
        <Controller
          name="source"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => field.onChange(v)}
            >
              <SelectTrigger id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dreamTitle">Their dream, in a few words</Label>
        <Input
          id="dreamTitle"
          placeholder="Sourdough micro-bakery"
          {...register("dreamTitle")}
        />
        {errors.dreamTitle && (
          <p className="text-destructive text-sm">
            {errors.dreamTitle.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dreamStatement">In their own words (optional)</Label>
        <Textarea
          id="dreamStatement"
          rows={2}
          placeholder="I want to open a sourdough micro-bakery so I can work for myself."
          {...register("dreamStatement")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="originalAsk">
          The Ask &mdash; what did they ask HelpBnk for? (optional)
        </Label>
        <Textarea id="originalAsk" rows={2} {...register("originalAsk")} />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="phone">WhatsApp / phone (optional)</Label>
          <Input
            id="phone"
            placeholder="+447700900000"
            {...register("phone")}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="locationCity">City (optional)</Label>
        <Input id="locationCity" {...register("locationCity")} />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-fit">
        {isPending ? "Creating…" : "Create Dreamer"}
      </Button>
    </form>
  );
}
