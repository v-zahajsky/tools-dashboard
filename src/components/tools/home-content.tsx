"use client";

import { useSearchParams } from "next/navigation";
import { getAllTools, searchTools, getToolsByCategory } from "@/lib/registry";
import { CategoryId } from "@/types/tool";
import { ToolGrid } from "./tool-grid";
import { CategoryFilter } from "./category-filter";

export function HomeContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const category = searchParams.get("category") as CategoryId | null;

  let tools = getAllTools();

  if (search) {
    tools = searchTools(search);
  } else if (category) {
    tools = getToolsByCategory(category);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tools.length} tool{tools.length !== 1 ? "s" : ""} available
        </p>
      </div>
      <CategoryFilter />
      <ToolGrid tools={tools} />
    </div>
  );
}
