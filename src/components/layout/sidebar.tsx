"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitBranch,
  Users,
  Shield,
  Database,
  Activity,
  Globe,
  Zap,
  LayoutDashboard,
  Settings,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "@/config/categories";
import { getToolCountsByCategory } from "@/lib/registry";

const iconMap: Record<string, React.ElementType> = {
  GitBranch,
  Users,
  Shield,
  Database,
  Activity,
  Globe,
  Zap,
};

export function Sidebar() {
  const pathname = usePathname();
  const counts = getToolCountsByCategory();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Wrench className="h-5 w-5 text-primary" />
        <span className="text-lg font-semibold">Tools Dashboard</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          All Tools
        </Link>

        <div className="mt-4 mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Categories
        </div>

        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Zap;
          const isActive = pathname === `/?category=${cat.id}`;
          const count = counts[cat.id] || 0;

          return (
            <Link
              key={cat.id}
              href={`/?category=${cat.id}`}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", cat.color)} />
                {cat.label}
              </span>
              {count > 0 && (
                <span className="text-xs text-muted-foreground">{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/settings"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
