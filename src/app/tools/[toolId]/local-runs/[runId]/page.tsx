"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RunLogViewer } from "@/components/apify/run-log-viewer";
import { getToolById } from "@/lib/registry";

export default function LocalRunDetailPage() {
  const params = useParams<{ toolId: string; runId: string }>();
  const { toolId, runId } = params;
  const tool = getToolById(toolId);

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
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold font-mono break-all">{runId}</h1>
          <Badge variant="secondary" className="gap-1">
            <HardDrive className="h-3 w-3" />
            Local
          </Badge>
        </div>
      </div>

      <RunLogViewer runId={runId} source="local" />
    </div>
  );
}
