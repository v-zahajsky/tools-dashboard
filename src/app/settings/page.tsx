"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const [status, setStatus] = useState<{
    connected: boolean;
    username?: string;
    email?: string;
    plan?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Apify Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
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
            The dashboard will pick it up automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
