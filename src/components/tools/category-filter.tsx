"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/config/categories";
import { getToolCountsByCategory } from "@/lib/registry";
import { cn } from "@/lib/utils";

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const counts = getToolCountsByCategory();

  const handleFilter = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    params.delete("search");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={!activeCategory ? "default" : "outline"}
        className={cn(
          "cursor-pointer transition-colors",
          !activeCategory && "bg-primary text-primary-foreground"
        )}
        onClick={() => handleFilter(null)}
      >
        All
      </Badge>
      {categories.map((cat) => {
        const count = counts[cat.id] || 0;
        if (count === 0) return null;
        const isActive = activeCategory === cat.id;
        return (
          <Badge
            key={cat.id}
            variant={isActive ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              isActive && "bg-primary text-primary-foreground"
            )}
            onClick={() => handleFilter(cat.id)}
          >
            {cat.label} ({count})
          </Badge>
        );
      })}
    </div>
  );
}
