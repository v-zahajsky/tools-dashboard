import { ChromeExtensionTool } from "@/types/tool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, Globe, Lock } from "lucide-react";

export function ChromeExtAdapter({ tool }: { tool: ChromeExtensionTool }) {
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {tool.installUrl && (
          <a
            href={tool.installUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Install Extension
          </a>
        )}
        {tool.repositoryUrl && (
          <a
            href={tool.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Source Code
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tool.permissions.length > 0 ? (
                tool.permissions.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs">
                    {p}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No special permissions
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Host Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tool.hostPermissions.map((h) => (
                <Badge key={h} variant="outline" className="text-xs font-mono">
                  {h}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
