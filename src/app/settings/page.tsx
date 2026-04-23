"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Info, Cloud, HardDrive } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePreferences } from "@/components/preferences-provider";
import { toast } from "sonner";

export default function SettingsPage() {
  const [status, setStatus] = useState<{
    connected: boolean;
    username?: string;
    email?: string;
    plan?: string;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const { preferences, loading: loadingPrefs, save } = usePreferences();

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/settings/status");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStatus(data);
      } catch {
        setStatus({ connected: false });
      } finally {
        setLoadingStatus(false);
      }
    }
    checkStatus();
  }, []);

  const setMode = async (checked: boolean) => {
    try {
      await save({ executionMode: checked ? "offline" : "online" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const setHideLocalOnly = async (checked: boolean) => {
    try {
      await save({ hideLocalOnly: checked });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execution Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <Label htmlFor="execution-mode" className="flex items-center gap-2">
                {preferences.executionMode === "offline" ? (
                  <>
                    <HardDrive className="h-4 w-4" /> Offline (local subprocess)
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4" /> Online (Apify Console)
                  </>
                )}
              </Label>
              <p className="text-xs text-muted-foreground">
                Which variant the primary Run button uses when a tool offers both.
                Online starts an Apify cloud run; offline runs{" "}
                <code className="px-1 py-0.5 rounded bg-accent font-mono text-[11px]">
                  apify run
                </code>{" "}
                (or the tool&apos;s custom command) inside its local checkout.
              </p>
            </div>
            <Switch
              id="execution-mode"
              checked={preferences.executionMode === "offline"}
              onCheckedChange={setMode}
              disabled={loadingPrefs}
            />
          </div>

          <div className="flex items-start justify-between gap-6 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label htmlFor="hide-local-only">Hide local-only tools</Label>
              <p className="text-xs text-muted-foreground">
                Tools without an{" "}
                <code className="px-1 py-0.5 rounded bg-accent font-mono text-[11px]">
                  actorId
                </code>{" "}
                (no online variant) are filtered out of the dashboard list.
              </p>
            </div>
            <Switch
              id="hide-local-only"
              checked={preferences.hideLocalOnly}
              onCheckedChange={setHideLocalOnly}
              disabled={loadingPrefs}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Apify Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingStatus ? (
            <div className="text-sm text-muted-foreground">Checking...</div>
          ) : status?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium">Connected</span>
                <Badge variant="secondary" className="text-xs ml-auto">
                  {status.plan || "Free"}
                </Badge>
              </div>
              {status.username && (
                <p className="text-sm text-muted-foreground">
                  Account: {status.username}
                  {status.email && ` (${status.email})`}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm font-medium">Not connected</span>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Set <code className="px-1 py-0.5 rounded bg-accent font-mono text-xs">APIFY_TOKEN</code> in your{" "}
                  <code className="px-1 py-0.5 rounded bg-accent font-mono text-xs">.env.local</code> file
                  and restart the dev server.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adding New Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To add a new tool, edit{" "}
            <code className="px-1 py-0.5 rounded bg-accent font-mono text-xs">
              src/config/tools.ts
            </code>{" "}
            and add a new entry to the <code className="px-1 py-0.5 rounded bg-accent font-mono text-xs">tools</code> array.
            A tool can have{" "}
            <code className="px-1 py-0.5 rounded bg-accent font-mono text-xs">actorId</code> (online),{" "}
            <code className="px-1 py-0.5 rounded bg-accent font-mono text-xs">localPath</code> (offline), or both.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
