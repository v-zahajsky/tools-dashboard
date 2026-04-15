"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Eye, FileText, FileCode, FileSpreadsheet } from "lucide-react";

interface KVStoreItem {
  key: string;
  size: number;
}

interface KVStoreBrowserProps {
  runId: string;
  kvHtmlReportKey?: string;
  kvCsvReportKey?: string;
}

export function KVStoreBrowser({
  runId,
  kvHtmlReportKey,
  kvCsvReportKey,
}: KVStoreBrowserProps) {
  const [keys, setKeys] = useState<KVStoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingHtml, setViewingHtml] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKeys() {
      try {
        const res = await fetch(`/api/runs/${runId}/kv-keys`);
        if (!res.ok) throw new Error("Failed to fetch KV keys");
        const data = await res.json();
        setKeys(data.keys || []);
      } catch {
        // KV store might be empty or inaccessible
        setKeys([]);
      } finally {
        setLoading(false);
      }
    }
    fetchKeys();
  }, [runId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  // If no key listing available, show known keys from config
  const knownKeys: string[] = [];
  if (kvHtmlReportKey) knownKeys.push(kvHtmlReportKey);
  if (kvCsvReportKey) knownKeys.push(kvCsvReportKey);
  knownKeys.push("OUTPUT", "INPUT");

  const displayItems =
    keys.length > 0
      ? keys
      : knownKeys.map((k) => ({ key: k, size: 0 }));

  if (displayItems.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No Key-Value store items found.
      </div>
    );
  }

  function getIcon(key: string) {
    if (key === kvHtmlReportKey || key.endsWith(".html"))
      return <FileCode className="h-4 w-4 text-blue-400" />;
    if (key === kvCsvReportKey || key.endsWith(".csv"))
      return <FileSpreadsheet className="h-4 w-4 text-green-400" />;
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  }

  return (
    <div className="space-y-4">
      {viewingHtml && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between bg-accent px-4 py-2">
            <span className="text-sm font-medium">{viewingHtml}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewingHtml(null)}
            >
              Close
            </Button>
          </div>
          <iframe
            src={`/api/runs/${runId}/kv/${encodeURIComponent(viewingHtml)}`}
            className="w-full h-[600px] bg-white"
            sandbox="allow-same-origin"
            title="HTML Report"
          />
        </div>
      )}

      <div className="space-y-2">
        {displayItems.map((item) => {
          const isHtml =
            item.key === kvHtmlReportKey || item.key.endsWith(".html");
          const isHighlighted =
            item.key === kvHtmlReportKey || item.key === kvCsvReportKey;

          return (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getIcon(item.key)}
                <span className="text-sm font-mono">{item.key}</span>
                {isHighlighted && (
                  <Badge variant="secondary" className="text-xs">
                    {item.key === kvHtmlReportKey ? "HTML Report" : "CSV Report"}
                  </Badge>
                )}
                {item.size > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(item.size)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {isHtml && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setViewingHtml(item.key)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    window.open(
                      `/api/runs/${runId}/kv/${encodeURIComponent(item.key)}`,
                      "_blank"
                    );
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
