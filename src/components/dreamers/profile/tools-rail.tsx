"use client";

import { useState } from "react";
import { Plus, CheckCircle, CircleDashed, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { type AffiliateTool, type DreamerTool } from "@/generated/prisma/client";
import { suggestTool, markToolUsed, addCustomTool } from "@/server/actions/tools";

type ToolWithStatus = DreamerTool & { tool: AffiliateTool };

interface ToolsRailProps {
  dreamerId: string;
  dreamerTools: ToolWithStatus[];
  availableTools: AffiliateTool[];
}

export function ToolsRail({ dreamerId, dreamerTools, availableTools }: ToolsRailProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for custom tool
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const suggestedTools = dreamerTools.filter((t) => t.status === "SUGGESTED");
  const usedTools = dreamerTools.filter((t) => t.status === "USED");

  const unassignedTools = availableTools.filter(
    (at) => !dreamerTools.some((dt) => dt.toolId === at.id)
  );

  async function handleSuggestExisting(toolId: string) {
    await suggestTool(dreamerId, toolId);
    setOpen(false);
  }

  async function handleAddCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!customName.trim()) return;

    setIsSubmitting(true);
    try {
      const newTool = await addCustomTool(customName.trim(), customUrl.trim() || undefined);
      await suggestTool(dreamerId, newTool.id);
      setOpen(false);
      setCustomName("");
      setCustomUrl("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMarkUsed(toolId: string) {
    await markToolUsed(dreamerId, toolId);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold tracking-tight">Affiliate Tools</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Plus className="mr-2 h-4 w-4" />
              Suggest Tool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suggest Affiliate Tool</DialogTitle>
              <DialogDescription>
                Recommend a HelpBnk tool to this Dreamer.
              </DialogDescription>
            </DialogHeader>

            {unassignedTools.length > 0 && (
              <div className="flex flex-col gap-2 py-4">
                <Label>From Catalog</Label>
                <div className="grid max-h-[200px] gap-2 overflow-y-auto">
                  {unassignedTools.map((tool) => (
                    <Button
                      key={tool.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => handleSuggestExisting(tool.id)}
                    >
                      {tool.name}
                    </Button>
                  ))}
                </div>
                <div className="my-2 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-xs uppercase">or custom</span>
                  <Separator className="flex-1" />
                </div>
              </div>
            )}

            <form onSubmit={handleAddCustom} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="custom-name">Tool Name *</Label>
                <Input
                  id="custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Stripe Atlas"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="custom-url">URL (optional)</Label>
                <Input
                  id="custom-url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || !customName.trim()}>
                  {isSubmitting ? "Adding..." : "Add Custom Tool"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 text-sm">
        {dreamerTools.length === 0 ? (
          <p className="text-muted-foreground italic">No tools suggested yet.</p>
        ) : (
          <>
            {suggestedTools.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs font-medium uppercase">
                  Suggested
                </span>
                {suggestedTools.map((dt) => (
                  <div key={dt.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CircleDashed className="text-muted-foreground h-4 w-4" />
                      {dt.tool.url ? (
                        <a
                          href={dt.tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {dt.tool.name}
                        </a>
                      ) : (
                        <span>{dt.tool.name}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleMarkUsed(dt.toolId)}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" /> Mark Used
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {usedTools.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs font-medium uppercase">
                  Used
                </span>
                {usedTools.map((dt) => (
                  <div key={dt.id} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground line-through decoration-muted-foreground/50">
                      {dt.tool.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
