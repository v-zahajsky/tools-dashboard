import { Badge } from "@/components/ui/badge";
import { ApifyRunStatus } from "@/types/tool";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  ApifyRunStatus,
  { label: string; className: string }
> = {
  READY: {
    label: "Ready",
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
  RUNNING: {
    label: "Running",
    className:
      "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
  },
  SUCCEEDED: {
    label: "Succeeded",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  "TIMED-OUT": {
    label: "Timed Out",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  ABORTED: {
    label: "Aborted",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  ABORTING: {
    label: "Aborting",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
};

export function RunStatusBadge({ status }: { status: ApifyRunStatus }) {
  const config = statusConfig[status] || statusConfig.READY;
  return (
    <Badge variant="outline" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
