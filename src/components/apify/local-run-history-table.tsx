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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Eye } from "lucide-react";
import { ToolDefinition } from "@/types/tool";

interface LocalRunSummary {
  runId: string;
  logFile: string;
  size: number;
  mtime: string;
  hasReport: boolean;
}

export function LocalRunHistoryTable({ tool }: { tool: ToolDefinition }) {
  const [runs, setRuns] = useState<LocalRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRuns() {
      try {
        const res = await fetch(`/api/tools/${tool.id}/local-runs`);
        if (!res.ok) throw new Error("Failed to fetch local runs");
        const data = await res.json();
        if (!cancelled) {
          setRuns(data.runs || []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch local runs"
          );
        }
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
  }, [tool.id]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-muted-foreground py-4">{error}</div>;
  }

  if (!tool.localPath) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        This tool has no local checkout configured.
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No local runs yet. Click &quot;Run Locally&quot; to start one.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Started</TableHead>
            <TableHead>Log size</TableHead>
            <TableHead>Report</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => (
            <TableRow key={run.runId}>
              <TableCell className="text-sm">
                <span title={format(new Date(run.mtime), "PPpp")}>
                  {formatDistanceToNow(new Date(run.mtime), {
                    addSuffix: true,
                  })}
                </span>
              </TableCell>
              <TableCell className="text-sm font-mono">
                {formatBytes(run.size)}
              </TableCell>
              <TableCell>
                {run.hasReport ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() =>
                      window.open(`/api/local-runs/${run.runId}/report`, "_blank")
                    }
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/tools/${tool.id}/local-runs/${run.runId}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View log
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
