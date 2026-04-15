import Link from "next/link";
import {
  FileCode, Bell, Database, TrendingUp, Search, ShieldCheck,
  Users, FileSpreadsheet, GitCompare, Calendar, Timer, Globe, Wrench,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToolDefinition } from "@/types/tool";
import { getCategoryById } from "@/config/categories";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  FileCode, Bell, Database, TrendingUp, Search, ShieldCheck,
  Users, FileSpreadsheet, GitCompare, Calendar, Timer, Globe,
};

const typeLabels: Record<string, string> = {
  apify: "Apify Actor",
  "google-apps-script": "Google Apps Script",
  "chrome-extension": "Chrome Extension",
  manual: "Manual Tool",
  webhook: "Webhook",
};

const typeColors: Record<string, string> = {
  apify: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "google-apps-script": "bg-green-500/10 text-green-400 border-green-500/20",
  "chrome-extension": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  manual: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  webhook: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function ToolHeader({ tool }: { tool: ToolDefinition }) {
  const Icon = iconMap[tool.icon || ""] || Wrench;
  const category = getCategoryById(tool.category);

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tools
      </Link>

      <div className="flex items-start gap-4">
        <div className={cn("rounded-xl bg-accent p-3", category?.color)}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{tool.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tool.description}
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge
              variant="outline"
              className={cn("text-xs", typeColors[tool.type])}
            >
              {typeLabels[tool.type]}
            </Badge>
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.label}
              </Badge>
            )}
            {tool.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
