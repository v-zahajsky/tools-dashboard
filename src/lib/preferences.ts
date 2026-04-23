import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_PREFERENCES, Preferences } from "@/types/tool";

const PREFS_PATH = path.join(process.cwd(), "preferences.json");

function sanitize(raw: unknown): Preferences {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Partial<Preferences>;
  return {
    executionMode:
      obj.executionMode === "offline" ? "offline" : "online",
    hideLocalOnly: Boolean(obj.hideLocalOnly),
  };
}

export async function readPreferences(): Promise<Preferences> {
  try {
    const text = await fs.readFile(PREFS_PATH, "utf8");
    return sanitize(JSON.parse(text));
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export async function writePreferences(
  patch: Partial<Preferences>
): Promise<Preferences> {
  const current = await readPreferences();
  const next = sanitize({ ...current, ...patch });
  await fs.writeFile(PREFS_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}
