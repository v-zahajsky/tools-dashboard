// ---- Category ----
export type CategoryId =
  | "github-analysis"
  | "hr-people"
  | "security"
  | "scrapers"
  | "data-ingestion"
  | "productivity"
  | "monitoring";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  description: string;
  color: string;
}

// ---- Local execution ----
export interface LocalCommand {
  command: string;
  args?: string[];
}

// ---- Base tool type ----
export interface ToolBase {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  icon?: string;
  tags: string[];
  status: "active" | "beta" | "deprecated" | "planned";
  lastUpdated?: string;
  documentationUrl?: string;
  owner?: string;
  // Path to local project checkout. When set, the tool can be run offline.
  // For apify tools this defaults to `apify run` inside localPath if localCommand is not provided.
  // For other tool types, localCommand is required alongside localPath.
  localPath?: string;
  localCommand?: LocalCommand;
}

// ---- Apify ----
export interface ApifyOutputConfig {
  hasDataset: boolean;
  hasKvStore: boolean;
  kvHtmlReportKey?: string;
  kvCsvReportKey?: string;
  externalOutputs?: Array<{
    label: string;
    url?: string;
    type: "google-sheet" | "google-doc" | "slack" | "snowflake" | "other";
  }>;
}

export interface ApifyInputSchemaProperty {
  title: string;
  type: "string" | "boolean" | "integer" | "number" | "array" | "object";
  description?: string;
  editor?:
    | "textfield"
    | "textarea"
    | "select"
    | "checkbox"
    | "number"
    | "stringList"
    | "json"
    | "datepicker";
  default?: unknown;
  enum?: string[];
  enumTitles?: string[];
  isSecret?: boolean;
  prefill?: unknown;
  sectionCaption?: string;
  sectionDescription?: string;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  pattern?: string;
}

export interface ApifyInputSchema {
  title: string;
  type: "object";
  schemaVersion: number;
  properties: Record<string, ApifyInputSchemaProperty>;
  required?: string[];
  description?: string;
}

export interface ApifyTool extends ToolBase {
  type: "apify";
  // Optional — may be absent for local-only tools.
  // At least one of `actorId` or `localPath` must be set.
  actorId?: string;
  defaultInput: Record<string, unknown>;
  inputSchema?: ApifyInputSchema | null;
  outputConfig: ApifyOutputConfig;
  buildTag?: string;
  memoryMbytes?: number;
  timeoutSecs?: number;
}

// ---- Google Apps Script ----
export interface GoogleAppsScriptTool extends ToolBase {
  type: "google-apps-script";
  scriptUrl?: string;
  triggerUrl?: string;
  triggerInstructions: string;
  outputs: Array<{
    label: string;
    url: string;
    type: "google-sheet" | "google-doc";
  }>;
}

// ---- Chrome Extension ----
export interface ChromeExtensionTool extends ToolBase {
  type: "chrome-extension";
  installUrl?: string;
  repositoryUrl?: string;
  permissions: string[];
  hostPermissions: string[];
}

// ---- Manual ----
export interface ManualTool extends ToolBase {
  type: "manual";
  instructions: string;
  outputUrl?: string;
}

// ---- Webhook (future) ----
export interface WebhookTool extends ToolBase {
  type: "webhook";
  webhookUrl: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
  bodyTemplate?: Record<string, unknown>;
}

// ---- Discriminated union ----
export type ToolDefinition =
  | ApifyTool
  | GoogleAppsScriptTool
  | ChromeExtensionTool
  | ManualTool
  | WebhookTool;

// ---- User preferences ----
export interface Preferences {
  // "online" = running a tool invokes the Apify cloud actor (when actorId is set)
  // "offline" = running a tool spawns a local subprocess (when localPath is set)
  executionMode: "online" | "offline";
  // When true, tools that have only a local variant (no actorId) are hidden from the dashboard.
  hideLocalOnly: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  executionMode: "online",
  hideLocalOnly: false,
};

// ---- Apify Run types ----
export type ApifyRunStatus =
  | "READY"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "TIMED-OUT"
  | "ABORTED"
  | "ABORTING";

export interface ApifyRun {
  id: string;
  actId: string;
  status: ApifyRunStatus;
  startedAt: string | null;
  finishedAt: string | null;
  buildNumber: string;
  defaultDatasetId: string;
  defaultKeyValueStoreId: string;
  stats?: {
    inputBodyLen?: number;
    durationMillis?: number;
    computeUnits?: number;
  };
  options?: {
    memoryMbytes?: number;
    timeoutSecs?: number;
  };
  usageTotalUsd?: number;
}
