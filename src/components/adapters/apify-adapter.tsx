"use client";

import { ApifyTool } from "@/types/tool";
import { RunButton } from "@/components/apify/run-button";
import { RunHistoryTable } from "@/components/apify/run-history-table";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";

export function ApifyAdapter({ tool }: { tool: ApifyTool }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <RunButton tool={tool} />
        {tool.outputConfig.externalOutputs?.map((output, i) => (
          <a
            key={i}
            href={output.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {output.label}
          </a>
        ))}
      </div>

      {tool.localPath && (
        <p className="text-xs text-muted-foreground">
          Local checkout:{" "}
          <code className="font-mono">{tool.localPath}</code>
        </p>
      )}

      {tool.actorId && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-4">Run History</h2>
            <RunHistoryTable tool={tool} />
          </div>
        </>
      )}
    </div>
  );
}
