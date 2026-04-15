# Tools Dashboard

Centralized portal for all developer tools — Apify actors, Google Apps Scripts, Chrome extensions, and more. Browse, run, and view results from a single dark-themed UI.

## Quick Start

```bash
# 1. Set your Apify token
cp .env.example .env.local
# Edit .env.local and add your APIFY_TOKEN

# 2. Install and run
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── config/tools.ts          # Tool registry — single source of truth
├── config/categories.ts     # Category definitions
├── types/tool.ts            # TypeScript types (discriminated union by tool type)
├── lib/apify-client.ts      # Server-side Apify client (token never reaches browser)
├── lib/registry.ts          # Lookup helpers
├── app/
│   ├── page.tsx             # Home — tool grid with search + category filter
│   ├── tools/[toolId]/      # Tool detail — delegates to type-specific adapter
│   ├── settings/            # API token status
│   └── api/                 # Proxy routes to Apify API
└── components/
    ├── adapters/            # UI adapter per tool type
    ├── apify/               # Run button, history, dataset browser, KV viewer
    └── tools/               # Grid, cards, filters
```

**Key design:** The tool registry (`src/config/tools.ts`) drives everything. Adding a tool = adding a JSON entry. The adapter pattern renders different UI for each tool type.

## Registering Tools

Each tool project in `c:/_PROJEKTY/` can opt-in to the dashboard by adding a `dashboard.json` file in its root. Two Claude Code skills automate this:

### `/init-tool` — Create a dashboard.json for a project

Scans a tool project, auto-detects what it can, and generates the manifest.

```
/init-tool github-sign-commits
```

**What it auto-detects by tool type:**

| Tool Type | Auto-detected | You must provide |
|-----------|--------------|------------------|
| **Apify Actor** | `actorId` (from `.actor/actor.json`), `defaultInput` (from `INPUT.json`, secrets stripped), `description` (from README) | `outputConfig` (what outputs the actor produces — dataset, HTML report, CSV, external services) |
| **Google Apps Script** | `description` (from README or `.gs` comments), function names for trigger instructions | `triggerInstructions`, `outputs` (URLs to output Google Sheets/Docs), `scriptUrl` |
| **Chrome Extension** | `name`, `description`, `permissions`, `hostPermissions` (all from `manifest.json`), `repositoryUrl` (from git remote) | `installUrl` (if published to Chrome Web Store) |
| **Manual / Webhook** | Nothing | Everything — describe what it does, how to run it, where output goes |

**Always required** (all types): `id`, `name`, `type`, `category`

### `/update-tools` — Sync all dashboard.json files into the registry

Scans `c:/_PROJEKTY/*/dashboard.json`, merges auto-detected data, validates, and regenerates `src/config/tools.ts`.

```
/update-tools
```

What it does:
1. Finds all `dashboard.json` files in `c:/_PROJEKTY/` subdirectories
2. Auto-detects missing fields from project config files
3. Validates required fields and uniqueness
4. Regenerates `src/config/tools.ts` (grouped by type, sorted alphabetically)
5. Runs `npm run build` to verify
6. Reports: added / updated / removed / warnings

### Typical workflow

```bash
# 1. You just created a new Apify actor
cd c:/_PROJEKTY/my-new-actor

# 2. In Claude Code (in the tools-dashboard project), run:
/init-tool my-new-actor
# → Scans the project, asks you to confirm detected fields, writes dashboard.json

# 3. Then sync the registry:
/update-tools
# → Reads all dashboard.json files, regenerates tools.ts

# 4. Start the dashboard
npm run dev
# → New tool appears automatically
```

## dashboard.json Reference

Minimal example for an Apify actor:

```json
{
  "$schema": "c:/_PROJEKTY/tools-dashboard/dashboard.schema.json",
  "id": "github-sign-commits",
  "name": "Commit Signing Checker",
  "type": "apify",
  "category": "security",
  "icon": "ShieldCheck",
  "tags": ["github", "gpg", "signing"],

  "apify": {
    "actorId": "vladimir-zahajsky/github-sign-commits",
    "outputConfig": {
      "hasDataset": true,
      "hasKvStore": true,
      "kvHtmlReportKey": "report"
    }
  }
}
```

Full schema: [`dashboard.schema.json`](dashboard.schema.json). Examples for each type: [`examples/`](examples/).

### Categories

| ID | Label | Use for |
|----|-------|---------|
| `github-analysis` | GitHub Analysis | Repo scanning, code ownership, developer metrics |
| `hr-people` | HR & People | Employee stats, performance reviews, OOO |
| `security` | Security | Signing checks, vulnerability scanning, compliance |
| `data-ingestion` | Data Ingestion | ETL pipelines, Snowflake sync |
| `monitoring` | Monitoring | Backlog monitoring, alerts, Slack notifications |
| `scrapers` | Scrapers | Web scraping (Google Maps, Amazon, etc.) |
| `productivity` | Productivity | Developer workflow tools |

### Icons

Use any [Lucide icon](https://lucide.dev/icons/) name. Common picks:

`FileCode` `GitBranch` `GitCompare` `Search` `Shield` `ShieldCheck` `Users` `Database` `Bell` `Timer` `TrendingUp` `FileSpreadsheet` `Calendar` `Globe` `Wrench` `Zap`

## Tool Types

### Apify Actor (`type: "apify"`)

Full integration: trigger runs from the dashboard, poll for status, browse dataset results, view HTML/CSV reports from KV store, download outputs.

The `outputConfig` field tells the dashboard what to expect:
- `hasDataset: true` — show Dataset tab with paginated table
- `hasKvStore: true` — show KV Store tab with file listing
- `kvHtmlReportKey: "report"` — add "View Report" button (renders in iframe)
- `kvCsvReportKey: "OUTPUT_CSV"` — add "Download CSV" button
- `externalOutputs` — links to Google Sheets, Slack, Snowflake, etc.

### Google Apps Script (`type: "google-apps-script"`)

Shows trigger instructions and direct links to output documents (Google Sheets/Docs).

### Chrome Extension (`type: "chrome-extension"`)

Shows install info, permissions, host permissions, and repository link.

### Manual / Webhook (future)

Placeholder types for tools that don't fit other categories.

## Docker

```bash
docker compose up --build
```

Reads `.env.local` for tokens. Exposes on port 3000.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui (dark theme)
- **apify-client** for Apify API communication
- **Inter** + **JetBrains Mono** fonts
