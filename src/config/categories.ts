import { Category } from "@/types/tool";

export const categories: Category[] = [
  {
    id: "github-analysis",
    label: "GitHub Analysis",
    icon: "GitBranch",
    description: "Tools for analyzing GitHub repositories, code ownership, and developer activity",
    color: "text-blue-400",
  },
  {
    id: "hr-people",
    label: "HR & People",
    icon: "Users",
    description: "Employee statistics, performance reviews, and team analytics",
    color: "text-green-400",
  },
  {
    id: "security",
    label: "Security",
    icon: "Shield",
    description: "Security scanning, commit signing verification, and compliance",
    color: "text-red-400",
  },
  {
    id: "data-ingestion",
    label: "Data Ingestion",
    icon: "Database",
    description: "Data collection and ingestion pipelines",
    color: "text-purple-400",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    icon: "Activity",
    description: "Backlog monitoring, stale ticket detection, and workflow tracking",
    color: "text-yellow-400",
  },
  {
    id: "scrapers",
    label: "Scrapers",
    icon: "Globe",
    description: "Web scraping tools for external data sources",
    color: "text-orange-400",
  },
  {
    id: "productivity",
    label: "Productivity",
    icon: "Zap",
    description: "Developer productivity and workflow tools",
    color: "text-cyan-400",
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
