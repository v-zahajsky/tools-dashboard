"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface DatasetBrowserProps {
  runId: string;
}

const PAGE_SIZE = 25;

export function DatasetBrowser({ runId }: DatasetBrowserProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/runs/${runId}/dataset?limit=${PAGE_SIZE}&offset=${offset}`
        );
        if (!res.ok) throw new Error("Failed to fetch dataset");
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items || []);
          setTotal(data.total || 0);
          setError(null);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to fetch dataset"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [runId, offset]);

  if (loading && items.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-muted-foreground py-4">{error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No dataset items found.
      </div>
    );
  }

  const columns = Object.keys(items[0]).filter((k) => k !== "#");
  const displayColumns = columns.slice(0, 8);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} item{total !== 1 ? "s" : ""} total
          {columns.length > displayColumns.length &&
            ` (showing ${displayColumns.length} of ${columns.length} columns)`}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            const url = `/api/runs/${runId}/dataset?limit=999999&offset=0`;
            window.open(url, "_blank");
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Download JSON
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              {displayColumns.map((col) => (
                <TableHead key={col} className="text-xs whitespace-nowrap">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                {displayColumns.map((col) => {
                  const value = item[col];
                  const display =
                    value === null || value === undefined
                      ? ""
                      : typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value);

                  return (
                    <TableCell
                      key={col}
                      className="text-xs max-w-[200px] truncate"
                      title={display}
                    >
                      {display}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + PAGE_SIZE >= total}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
