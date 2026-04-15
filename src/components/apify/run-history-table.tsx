"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RunStatusBadge } from "./run-status-badge";
import { ApifyRun, ApifyTool } from "@/types/tool";
import { ExternalLink } from "lucide-react";

export function RunHistoryTable({ tool }: { tool: ApifyTool }) {
  const [runs, setRuns] = useState<ApifyRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRuns() {
      try {
        const res = await fetch(`/api/tools/${tool.id}/runs`);
        if (!res.ok) throw new Error("Failed to fetch runs");
        const data = await res.json();
        if (!cancelled) {
          setRuns(data.runs || []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch runs"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRuns();

    // Poll for active runs
    const interval = setInterval(fetchRuns, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tool.id]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        {error}. Make sure APIFY_TOKEN is set in .env.local and the actor ID is
        correct.
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No runs found. Click &quot;Run Actor&quot; to start one.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
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
              <TableRow key={run.id}>
                <TableCell>
                  <RunStatusBadge status={run.status} />
                </TableCell>
                <TableCell className="text-sm">
                  {run.startedAt ? (
                    <span title={format(new Date(run.startedAt), "PPpp")}>
                      {formatDistanceToNow(new Date(run.startedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {duration}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {run.usageTotalUsd != null
                    ? `$${run.usageTotalUsd.toFixed(4)}`
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/tools/${tool.id}/runs/${run.id}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
