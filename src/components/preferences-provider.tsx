"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DEFAULT_PREFERENCES, Preferences } from "@/types/tool";

interface PreferencesContextValue {
  preferences: Preferences;
  loading: boolean;
  save: (patch: Partial<Preferences>) => Promise<void>;
  refresh: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/preferences", { cache: "no-store" });
      if (res.ok) {
        setPreferences((await res.json()) as Preferences);
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (patch: Partial<Preferences>) => {
    const res = await fetch("/api/settings/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      throw new Error("Failed to save preferences");
    }
    setPreferences((await res.json()) as Preferences);
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, loading, save, refresh }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used inside <PreferencesProvider>");
  }
  return ctx;
}
