import { GoogleAppsScriptTool } from "@/types/tool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileSpreadsheet, FileText, Play } from "lucide-react";

export function GASAdapter({ tool }: { tool: GoogleAppsScriptTool }) {
  return (
    <div className="space-y-6">
      {tool.scriptUrl && (
        <a
          href={tool.scriptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Play className="h-4 w-4" />
          Open in Apps Script Editor
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            How to Run
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {tool.triggerInstructions}
          </p>
        </CardContent>
      </Card>

      {tool.outputs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Output Documents</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {tool.outputs.map((output, i) => {
              const Icon =
                output.type === "google-sheet" ? FileSpreadsheet : FileText;
              return (
                <a
                  key={i}
                  href={output.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent transition-colors group"
                >
                  <Icon className="h-8 w-8 text-green-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {output.label}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {output.type === "google-sheet"
                        ? "Google Sheets"
                        : "Google Docs"}
                    </Badge>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
