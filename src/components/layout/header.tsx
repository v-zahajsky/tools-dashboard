"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search tools..."
        className="pl-9 bg-background"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-6">
      <Suspense>
        <SearchBar />
      </Suspense>
    </header>
  );
}
