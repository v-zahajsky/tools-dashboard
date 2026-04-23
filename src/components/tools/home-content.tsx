"use client";

import { useSearchParams } from "next/navigation";
import { getAllTools, searchTools, getToolsByCategory } from "@/lib/registry";
import { CategoryId, ToolDefinition } from "@/types/tool";
import { ToolGrid } from "./tool-grid";
import { CategoryFilter } from "./category-filter";
import { usePreferences } from "@/components/preferences-provider";

function isLocalOnly(tool: ToolDefinition): boolean {
  if (tool.type !== "apify") return false;
  return Boolean(tool.localPath) && !tool.actorId;
}

export function HomeContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const category = searchParams.get("category") as CategoryId | null;
  const { preferences } = usePreferences();

  let tools = getAllTools();

  if (search) {
    tools = searchTools(search);
  } else if (category) {
    tools = getToolsByCategory(category);
  }

  if (preferences.hideLocalOnly) {
    tools = tools.filter((t) => !isLocalOnly(t));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tools.length} tool{tools.length !== 1 ? "s" : ""} available
          {preferences.hideLocalOnly && (
            <span className="ml-2 text-xs">(local-only hidden)</span>
          )}
        </p>
      </div>
      <CategoryFilter />
      <ToolGrid tools={tools} />
    </div>
  );
}
