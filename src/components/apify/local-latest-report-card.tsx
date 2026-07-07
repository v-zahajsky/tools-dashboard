"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { FileCode, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LocalRunSummary {
  runId: string;
  mtime: string;
  hasReport: boolean;
}

export function LocalLatestReportCard({ toolId }: { toolId: string }) {
  const [latest, setLatest] = useState<LocalRunSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRuns() {
      try {
        const res = await fetch(`/api/tools/${toolId}/local-runs`);
        if (!res.ok) return;
        const data = await res.json();
        const runs: LocalRunSummary[] = data.runs || [];
        const first = runs.find((r) => r.hasReport) ?? null;
        if (!cancelled) setLatest(first);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRuns();
    const interval = setInterval(fetchRuns, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [toolId]);

  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (!latest) {
    return null;
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <FileCode className="h-5 w-5 text-blue-400 shrink-0" />
          <div>
            <p className="text-sm font-medium">Latest local report</p>
            <p
              className="text-xs text-muted-foreground"
              title={format(new Date(latest.mtime), "PPpp")}
            >
              Generated{" "}
              {formatDistanceToNow(new Date(latest.mtime), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={() =>
            window.open(`/api/local-runs/${latest.runId}/report`, "_blank")
          }
        >
          <Eye className="h-4 w-4" />
          View report
        </Button>
      </CardContent>
    </Card>
  );
}
