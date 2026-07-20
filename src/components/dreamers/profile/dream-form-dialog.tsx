"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAdditionalDream } from "@/server/actions/dreams";

export function DreamFormDialog({ dreamerId }: { dreamerId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [northStar, setNorthStar] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!title.trim()) {
      toast.error("What's the dream, in a few words?");
      return;
    }
    startTransition(async () => {
      try {
        await createAdditionalDream({
          dreamerId,
          title,
          description: description || null,
          northStar: northStar || null,
          northStarTargetDate: null,
        });
        toast.success("New Dream started");
        setOpen(false);
        setTitle("");
        setDescription("");
        setNorthStar("");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Couldn't create that Dream.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        + New Dream
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Dream</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dream-title">Title</Label>
            <Input
              id="dream-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Catering side business"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dream-description">Description (optional)</Label>
            <Textarea
              id="dream-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dream-north-star">North star (optional)</Label>
            <Input
              id="dream-north-star"
              value={northStar}
              onChange={(e) => setNorthStar(e.target.value)}
              placeholder="First paying customer by October"
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isPending} onClick={submit}>
            {isPending ? "Creating…" : "Start this Dream"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
