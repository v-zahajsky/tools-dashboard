import Link from "next/link";
import {
  FileCode,
  Bell,
  Database,
  TrendingUp,
  Search,
  ShieldCheck,
  Users,
  FileSpreadsheet,
  GitCompare,
  Calendar,
  Timer,
  Globe,
  Wrench,
  Cloud,
  HardDrive,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApifyTool, ToolDefinition } from "@/types/tool";
import { getCategoryById } from "@/config/categories";
import { cn } from "@/lib/utils";
import { ToolCardActions } from "./tool-card-actions";

const iconMap: Record<string, React.ElementType> = {
  FileCode,
  Bell,
  Database,
  TrendingUp,
  Search,
  ShieldCheck,
  Users,
  FileSpreadsheet,
  GitCompare,
  Calendar,
  Timer,
  Globe,
};

const typeLabels: Record<string, string> = {
  apify: "Apify Actor",
  "google-apps-script": "Apps Script",
  "chrome-extension": "Chrome Ext",
  manual: "Manual",
  webhook: "Webhook",
};

const typeColors: Record<string, string> = {
  apify: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "google-apps-script": "bg-green-500/10 text-green-400 border-green-500/20",
  "chrome-extension": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  manual: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  webhook: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function getVariantBadges(tool: ToolDefinition) {
  const badges: Array<{
    key: string;
    icon: React.ElementType;
    label: string;
    title: string;
  }> = [];
  if (tool.type === "apify") {
    const apify = tool as ApifyTool;
    if (apify.actorId) {
      badges.push({
        key: "online",
        icon: Cloud,
        label: "Online",
        title: "Runs on Apify cloud",
      });
    }
    if (apify.localPath) {
      badges.push({
        key: "offline",
        icon: HardDrive,
        label: "Local",
        title: "Runs from local checkout",
      });
    }
  }
  return badges;
}

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const Icon = iconMap[tool.icon || ""] || Wrench;
  const category = getCategoryById(tool.category);
  const variantBadges = getVariantBadges(tool);

  return (
    <Card className="group relative h-full transition-colors hover:bg-accent/30 hover:border-accent">
      {/* Stretched link covers the whole card — content sits above it via z-index where needed. */}
      <Link
        href={`/tools/${tool.id}`}
        aria-label={`View ${tool.name}`}
        className="absolute inset-0 rounded-xl z-0"
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("rounded-lg bg-accent p-2 shrink-0", category?.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1 shrink-0">
            <ToolCardActions tool={tool} />
            {tool.status !== "active" && (
              <Badge variant="outline" className="text-xs capitalize">
                {tool.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {tool.description}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn("text-xs", typeColors[tool.type])}
          >
            {typeLabels[tool.type]}
          </Badge>
          {variantBadges.map((b) => {
            const BIcon = b.icon;
            return (
              <Badge
                key={b.key}
                variant="outline"
                className="text-xs gap-1"
                title={b.title}
              >
                <BIcon className="h-3 w-3" />
                {b.label}
              </Badge>
            );
          })}
          {tool.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
