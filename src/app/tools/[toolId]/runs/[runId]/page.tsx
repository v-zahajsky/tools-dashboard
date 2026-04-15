"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, Clock, DollarSign, HardDrive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RunStatusBadge } from "@/components/apify/run-status-badge";
import { DatasetBrowser } from "@/components/apify/dataset-browser";
import { KVStoreBrowser } from "@/components/apify/kv-store-browser";
import { RunLogViewer } from "@/components/apify/run-log-viewer";
import { ApifyRun, ApifyRunStatus } from "@/types/tool";
import { getToolById } from "@/lib/registry";

export default function RunDetailPage() {
  const params = useParams<{ toolId: string; runId: string }>();
  const { toolId, runId } = params;
  const tool = getToolById(toolId);

  const [run, setRun] = useState<ApifyRun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let interval: NodeJS.Timeout;

    async function fetchRun() {
      try {
        const res = await fetch(`/api/runs/${runId}`);
        if (!res.ok) throw new Error("Failed to fetch run");
        const data = await res.json();
        if (!cancelled) {
          setRun(data.run);
          setLoading(false);

          // Stop polling when run is done
          const terminal: ApifyRunStatus[] = [
            "SUCCEEDED",
            "FAILED",
            "TIMED-OUT",
            "ABORTED",
          ];
          if (terminal.includes(data.run.status)) {
            clearInterval(interval);
          }
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRun();
    interval = setInterval(fetchRun, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [runId]);

  // Get KV config from the tool
  const kvHtmlReportKey =
    tool?.type === "apify" ? tool.outputConfig.kvHtmlReportKey : undefined;
  const kvCsvReportKey =
    tool?.type === "apify" ? tool.outputConfig.kvCsvReportKey : undefined;

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="text-muted-foreground">
        Run not found or failed to load.
      </div>
    );
  }

  const duration =
    run.stats?.durationMillis != null
      ? `${Math.round(run.stats.durationMillis / 1000)}s`
      : run.startedAt && run.finishedAt
        ? `${Math.round(
            (new Date(run.finishedAt).getTime() -
              new Date(run.startedAt).getTime()) /
              1000
          )}s`
        : "—";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link
          href={`/tools/${toolId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {tool?.name || "tool"}
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Run {run.id.slice(0, 8)}...</h1>
          <RunStatusBadge status={run.status} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Started</span>
            </div>
            <p className="text-sm font-medium">
              {run.startedAt
                ? formatDistanceToNow(new Date(run.startedAt), {
                    addSuffix: true,
                  })
                : "—"}
            </p>
            {run.startedAt && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(run.startedAt), "PPpp")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="text-sm font-medium font-mono">{duration}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Cost</span>
            </div>
            <p className="text-sm font-medium font-mono">
              {run.usageTotalUsd != null
                ? `$${run.usageTotalUsd.toFixed(4)}`
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <HardDrive className="h-4 w-4" />
              <span className="text-xs">Memory</span>
            </div>
            <p className="text-sm font-medium font-mono">
              {run.options?.memoryMbytes
                ? `${run.options.memoryMbytes} MB`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dataset" className="w-full">
        <TabsList>
          <TabsTrigger value="dataset">Dataset</TabsTrigger>
          <TabsTrigger value="kv">Key-Value Store</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
        </TabsList>

        <TabsContent value="dataset" className="mt-4">
          <DatasetBrowser runId={runId} />
        </TabsContent>

        <TabsContent value="kv" className="mt-4">
          <KVStoreBrowser
            runId={runId}
            kvHtmlReportKey={kvHtmlReportKey}
            kvCsvReportKey={kvCsvReportKey}
          />
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <RunLogViewer runId={runId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
