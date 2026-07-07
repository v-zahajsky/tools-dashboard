"use client";

import { ApifyTool } from "@/types/tool";
import { hasCloudVariant } from "@/lib/apify-actor";
import { RunButton } from "@/components/apify/run-button";
import { RunHistoryTable } from "@/components/apify/run-history-table";
import { LocalRunHistoryTable } from "@/components/apify/local-run-history-table";
import { LocalLatestReportCard } from "@/components/apify/local-latest-report-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, ExternalLink, HardDrive } from "lucide-react";

export function ApifyAdapter({ tool }: { tool: ApifyTool }) {
  const hasCloud = hasCloudVariant(tool);
  const hasLocal = Boolean(tool.localPath);
  const hasLocalHtmlReport =
    hasLocal && Boolean(tool.outputConfig.kvHtmlReportKey);

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

      {hasLocalHtmlReport && <LocalLatestReportCard toolId={tool.id} />}

      {(hasCloud || hasLocal) && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-4">Run History</h2>
            <Tabs defaultValue={hasCloud ? "cloud" : "local"} className="w-full">
              <TabsList>
                {hasCloud && (
                  <TabsTrigger value="cloud" className="gap-2">
                    <Cloud className="h-3.5 w-3.5" />
                    Cloud
                  </TabsTrigger>
                )}
                {hasLocal && (
                  <TabsTrigger value="local" className="gap-2">
                    <HardDrive className="h-3.5 w-3.5" />
                    Local
                  </TabsTrigger>
                )}
              </TabsList>
              {hasCloud && (
                <TabsContent value="cloud" className="mt-4">
                  <RunHistoryTable tool={tool} />
                </TabsContent>
              )}
              {hasLocal && (
                <TabsContent value="local" className="mt-4">
                  <LocalRunHistoryTable tool={tool} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
