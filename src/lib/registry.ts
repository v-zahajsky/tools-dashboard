import { tools } from "@/config/tools";
import { CategoryId, ToolDefinition } from "@/types/tool";

export function getAllTools(): ToolDefinition[] {
  return tools;
}

export function getToolById(id: string): ToolDefinition | undefined {
  return tools.find((t) => t.id === id);
}

export function getToolsByCategory(category: CategoryId): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}

export function getToolsByType(type: ToolDefinition["type"]): ToolDefinition[] {
  return tools.filter((t) => t.type === type);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase();
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export function getToolCountsByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const tool of tools) {
    counts[tool.category] = (counts[tool.category] || 0) + 1;
  }
  return counts;
}
