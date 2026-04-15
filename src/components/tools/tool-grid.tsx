"use client";

import { ToolDefinition } from "@/types/tool";
import { ToolCard } from "./tool-card";

export function ToolGrid({ tools }: { tools: ToolDefinition[] }) {
  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">No tools found</p>
        <p className="text-sm">Try adjusting your search or filter</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
