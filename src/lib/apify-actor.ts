import { ApifyTool } from "@/types/tool";

/**
 * Resolve the full Apify actor ID for a tool, combining the global APIFY_USERNAME
 * env var with the tool's `actorName`. An explicit `actorId` always wins.
 * Returns null if the tool is local-only or the username is missing.
 *
 * NOTE: server-only — relies on process.env.
 */
export function resolveApifyActorId(tool: ApifyTool): string | null {
  if (tool.actorId) return tool.actorId;
  if (!tool.actorName) return null;
  const username = process.env.APIFY_USERNAME;
  if (!username || username === "your-apify-username") return null;
  return `${username}/${tool.actorName}`;
}

/**
 * Whether the tool has a cloud variant configured (independent of env).
 * Safe to call from the client — does not rely on env vars.
 */
export function hasCloudVariant(tool: ApifyTool): boolean {
  return Boolean(tool.actorId || tool.actorName);
}
