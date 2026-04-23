"use client";

import { MouseEvent, useState } from "react";
import { Cloud, HardDrive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApifyTool, ToolDefinition } from "@/types/tool";
import { toast } from "sonner";

// Prevent clicks on action buttons from bubbling up to the stretched link
// that wraps the whole card.
function stop(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function ToolCardActions({ tool }: { tool: ToolDefinition }) {
  if (tool.type !== "apify") return null;
  const apify = tool as ApifyTool;
  const canOnline = Boolean(apify.actorId);
  const canOffline = Boolean(apify.localPath);
  if (!canOnline && !canOffline) return null;

  return (
    <div className="flex items-center gap-1">
      {canOnline && <QuickOnline tool={apify} />}
      {canOffline && <QuickOffline tool={apify} />}
    </div>
  );
}

function QuickOnline({ tool }: { tool: ApifyTool }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(() =>
    JSON.stringify(tool.defaultInput, null, 2)
  );
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(input);
      } catch {
        toast.error("Invalid JSON input");
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/tools/${tool.id}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: parsed }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start run");
      }
      const data = await res.json();
      toast.success(`Run started: ${data.run.id}`);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start run");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={(e) => {
                stop(e);
                setOpen(true);
              }}
              aria-label={`Run ${tool.name} on Apify`}
            />
          }
        >
          <Cloud className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent>Run on Apify</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg" onClick={stop}>
          <DialogHeader>
            <DialogTitle>Run {tool.name} on Apify</DialogTitle>
            <DialogDescription>
              Starts a run in Apify cloud. Review and edit the input JSON first.
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
                <Cloud className="h-4 w-4" />
              )}
              {loading ? "Starting..." : "Run on Apify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function QuickOffline({ tool }: { tool: ApifyTool }) {
  const [loading, setLoading] = useState(false);

  const handleRun = async (e: MouseEvent) => {
    stop(e);
    setLoading(true);
    try {
      const res = await fetch(`/api/tools/${tool.id}/run-local`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start local run");
      }
      const data = await res.json();
      toast.success(`Local run started: ${data.run.runId}`, {
        description: `Log: ${data.run.logFile}`,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start local run"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleRun}
            disabled={loading}
            aria-label={`Run ${tool.name} locally`}
          />
        }
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <HardDrive className="h-3.5 w-3.5" />
        )}
      </TooltipTrigger>
      <TooltipContent>Run Locally</TooltipContent>
    </Tooltip>
  );
}
