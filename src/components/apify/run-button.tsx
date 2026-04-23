"use client";

import { useState } from "react";
import { Play, Loader2, HardDrive, Cloud } from "lucide-react";
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
import { usePreferences } from "@/components/preferences-provider";
import { toast } from "sonner";

type Mode = "online" | "offline";

export function RunButton({ tool }: { tool: ApifyTool }) {
  const { preferences } = usePreferences();

  const canOnline = Boolean(tool.actorId);
  const canOffline = Boolean(tool.localPath);

  if (!canOnline && !canOffline) {
    return (
      <Button disabled className="gap-2">
        <Play className="h-4 w-4" />
        Not runnable
      </Button>
    );
  }

  // Default mode — follow preferences, fall back to whichever is available.
  const preferred: Mode = preferences.executionMode;
  const defaultMode: Mode =
    preferred === "online" && canOnline
      ? "online"
      : preferred === "offline" && canOffline
        ? "offline"
        : canOnline
          ? "online"
          : "offline";

  return (
    <div className="flex items-center gap-2">
      {canOnline && (
        <RunOnlineButton
          tool={tool}
          isPrimary={defaultMode === "online"}
        />
      )}
      {canOffline && (
        <RunOfflineButton
          tool={tool}
          isPrimary={defaultMode === "offline"}
        />
      )}
    </div>
  );
}

function RunOnlineButton({
  tool,
  isPrimary,
}: {
  tool: ApifyTool;
  isPrimary: boolean;
}) {
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
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start run");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={isPrimary ? "default" : "outline"}
            className="gap-2"
          />
        }
      >
        <Cloud className="h-4 w-4" />
        Run on Apify
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
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
  );
}

function RunOfflineButton({
  tool,
  isPrimary,
}: {
  tool: ApifyTool;
  isPrimary: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
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
    <Button
      variant={isPrimary ? "default" : "outline"}
      onClick={handleRun}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <HardDrive className="h-4 w-4" />
      )}
      {loading ? "Starting..." : "Run Locally"}
    </Button>
  );
}
