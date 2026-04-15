"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RunLogViewerProps {
  runId: string;
}

export function RunLogViewer({ runId }: RunLogViewerProps) {
  const [log, setLog] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLog() {
      try {
        const res = await fetch(`/api/runs/${runId}/log`);
        if (!res.ok) throw new Error("Failed to fetch log");
        const text = await res.text();
        if (!cancelled) {
          setLog(text);
        }
      } catch {
        if (!cancelled) setLog("Failed to load log.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLog();
    return () => {
      cancelled = true;
    };
  }, [runId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] rounded-lg border border-border bg-black/50">
      <div ref={scrollRef} className="p-4">
        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
          {log || "No log output available."}
        </pre>
      </div>
    </ScrollArea>
  );
}
