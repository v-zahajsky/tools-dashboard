"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ApifyTool } from "@/types/tool";
import { toast } from "sonner";

export function RunButton({ tool }: { tool: ApifyTool }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(
    JSON.stringify(tool.defaultInput, null, 2)
  );
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      let parsedInput: Record<string, unknown>;
      try {
        parsedInput = JSON.parse(input);
      } catch {
        toast.error("Invalid JSON input");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/tools/${tool.id}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: parsedInput }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start run");
      }

      const data = await res.json();
      toast.success(`Run started: ${data.run.id}`);
      setOpen(false);

      // Force a page-level refresh to update run history
      window.location.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start run"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Play className="h-4 w-4" />
        Run Actor
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Run {tool.name}</DialogTitle>
          <DialogDescription>
            Review and edit the input JSON before running.
          </DialogDescription>
        </DialogHeader>
        <div className="my-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-xs h-64 resize-none"
            spellCheck={false}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRun} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {loading ? "Starting..." : "Run Actor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
