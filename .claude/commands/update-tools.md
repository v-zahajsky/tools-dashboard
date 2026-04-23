# Update Tools Registry

Scan all project directories for `dashboard.json` manifests and regenerate `src/config/tools.ts`.

## What you do

You are updating the tools registry for the Tools Dashboard. The dashboard reads all tool definitions from a single file: `src/config/tools.ts`. Each tool project can opt-in by placing a `dashboard.json` in its root.

## Step-by-step process

### 1. Discover tool projects

Scan `c:/_PROJEKTY/` (one level deep — direct children only) for directories that contain a `dashboard.json` file. Use glob: `c:/_PROJEKTY/*/dashboard.json`.

### 2. For each `dashboard.json` found, read it and auto-detect missing fields

The schema is defined in `c:/_PROJEKTY/tools-dashboard/dashboard.schema.json`. Read it for reference.

**Auto-detection rules by tool type:**

#### type: "apify"
- **`description`** — if missing, read the first paragraph from the project's `README.md`
- **`apify.actorId`** — if missing, read `.actor/actor.json` and use the `name` field (format: `username/actor-name`). May be intentionally omitted for **local-only** tools (in that case `local.path` must be set).
- **`apify.defaultInput`** — if missing, read `storage/key_value_stores/default/INPUT.json`. Remove any fields where `isSecret: true` in the input schema.
- **`apify.inputSchema`** — always try to read from `.actor/INPUT_SCHEMA.json` or `.actor/input_schema.json` (case varies). Do NOT embed the full schema in tools.ts — set it to `null` (it can be fetched at runtime).
- **`apify.outputConfig`** — CANNOT be auto-detected. If missing from `dashboard.json`, set `{ hasDataset: true, hasKvStore: false }` as safe default and add a `// TODO: verify outputConfig` comment.

#### `local` section (any tool type)
- **`local.path`** — if `dashboard.json` is found at `c:/_PROJEKTY/{name}/dashboard.json`, default to that directory's absolute path when `local` is present but `path` is omitted.
- **`local.command` / `local.args`** — for apify tools, defaults to `apify run --purge` and is optional. For other tool types, both are required.
- Map `local.path` → `localPath`, and `local.{command, args}` → `localCommand: { command, args }` on the generated tool entry.

#### type: "google-apps-script"
- **`description`** — if missing, read from `README.md` or the first comment block in `.gs` files
- All other fields (`gas.triggerInstructions`, `gas.outputs`) must be in `dashboard.json` — they cannot be auto-detected.

#### type: "chrome-extension"
- **`description`** — if missing, read from `manifest.json` → `description` field
- **`permissions`** — auto-detect from `manifest.json` → `permissions` array
- **`hostPermissions`** — auto-detect from `manifest.json` → `host_permissions` array
- **`chromeExtension.repositoryUrl`** — if missing, check for `.git/config` and extract remote URL

#### type: "manual" / "webhook"
- Nothing is auto-detected. All fields must be in `dashboard.json`.

### 3. Validate

For each tool, verify:
- `id` is unique across all tools
- `type` has the required type-specific section (`apify`, `gas`, `chromeExtension`, etc.)
- For Apify tools: **at least one** of `actorId` (from dashboard.json or auto-detected) or `local.path` must be set. An entry with neither is invalid.
- For GAS tools: `triggerInstructions` exists
- For any tool that declares a `local` section: if `type !== "apify"`, `local.command` is required.

Report any validation errors to the user before proceeding.

### 4. Read current tools.ts

Read `src/config/tools.ts` to see what tools already exist. This is important for:
- Preserving any **manual overrides** the user made directly in tools.ts that aren't in dashboard.json
- Detecting tools that were **removed** (dashboard.json deleted)

### 5. Generate updated tools.ts

Write the updated `src/config/tools.ts` file. Follow this format exactly:

```typescript
import { ToolDefinition } from "@/types/tool";

export const tools: ToolDefinition[] = [
  // ===== APIFY ACTORS =====
  {
    id: "...",
    name: "...",
    // ... all fields
  },

  // ===== GOOGLE APPS SCRIPTS =====
  // ...

  // ===== CHROME EXTENSIONS =====
  // ...

  // ===== MANUAL / OTHER =====
  // ...
];
```

**Grouping:** Sort tools by type (apify first, then google-apps-script, chrome-extension, manual, webhook), then alphabetically by id within each group.

**Formatting rules:**
- Use double quotes for strings
- `defaultInput` — inline small objects, multi-line for complex ones
- `inputSchema` — always `null` (never embed, too large)
- Never include secrets in `defaultInput`
- Add `// TODO:` comments for any fields that couldn't be resolved

### 6. Verify the build compiles

Run `npm run build` in `c:/_PROJEKTY/tools-dashboard/` and fix any TypeScript errors.

### 7. Report summary

Tell the user:
- How many tools were found / added / updated / removed
- Any warnings (missing outputConfig, unresolved actorId, etc.)
- Any tools in tools.ts that DON'T have a dashboard.json (these are "orphaned" — ask if they should be kept or removed)

## Important

- NEVER include secret tokens, API keys, or passwords in the generated tools.ts
- Preserve the `$schema` reference in dashboard.json files if present
- If a dashboard.json has fields not in the schema, ignore them (forward-compatible)
- The categories list is defined in `src/config/categories.ts` — if a dashboard.json uses a category not in that list, warn the user
