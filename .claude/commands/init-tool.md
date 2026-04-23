# Initialize dashboard.json for a Tool Project

Generate a `dashboard.json` manifest for a tool project so it can be registered with the Tools Dashboard.

## Arguments

The user provides a path to a tool project directory (e.g. `c:/_PROJEKTY/github-sign-commits` or just the folder name under `c:/_PROJEKTY/`). If they provide just a name, resolve it to `c:/_PROJEKTY/{name}`.

If no argument is given, ask the user which project they want to initialize.

## Step-by-step process

### 1. Detect the tool type

Check the project directory for these markers, in order:

| Check | Tool type |
|-------|-----------|
| `.actor/` directory OR `apify.json` exists | `apify` |
| Any `.gs` file OR `appsscript.json` exists | `google-apps-script` |
| `manifest.json` with `"manifest_version"` key | `chrome-extension` |
| Otherwise | Ask the user to pick: `manual` or `webhook` |

Tell the user what type you detected and why.

### 2. Auto-detect fields based on type

#### For `apify`:

1. **`id`** — derive from directory name, lowercase, hyphens only (e.g. `github-sign-commits`)
2. **`name`** — read `README.md` title (first `# Heading`), or `.actor/actor.json` → `title`. Fallback: humanize the directory name.
3. **`description`** — read `README.md` first paragraph after the title. If README is missing, read `.actor/actor.json` → `description`. Fallback: read the first docblock/comment in `src/main.ts`.
4. **`actorId`** — read `.actor/actor.json` → look for `name` field (format `username/actor-name`). If not found, set to `"YOUR_USERNAME/{directory-name}"` with a TODO.
5. **`defaultInput`** — read `storage/key_value_stores/default/INPUT.json`. If it exists, include it but **remove any fields** whose key matches a property with `"isSecret": true` in the input schema. If INPUT.json doesn't exist, try to build a default from the input schema's `default` and `prefill` values.
6. **`outputConfig`** — search the main source files (`src/main.ts`, `src/actor.ts`, `src/runner.ts`, `src/index.ts`) for these patterns:
   - `Actor.pushData` or `dataset.pushData` → `hasDataset: true`
   - `Actor.setValue` or `kvStore.setValue` → `hasKvStore: true`
   - Look for the key name in `setValue('report'` or `setValue('OUTPUT'` calls → suggest `kvHtmlReportKey` / `kvCsvReportKey` based on content type hints (`text/html` → html, `text/csv` → csv)
   - Look for Google Sheets, Slack, Snowflake references → suggest `externalOutputs`
   - If nothing found, default to `{ hasDataset: true, hasKvStore: false }` with a `// TODO` note

7. **`inputSchema`** — read `.actor/INPUT_SCHEMA.json` or `.actor/input_schema.json`. Do NOT put it into dashboard.json (too large). But use it to:
   - Extract `sectionCaption` values to suggest `tags`
   - Identify secret fields to exclude from defaultInput

#### For `google-apps-script`:

1. **`id`** — derive from directory name
2. **`name`** — read the script's main `.gs` file looking for a leading comment or function doc. Or use the directory name humanized.
3. **`description`** — read `README.md` or extract from the main function's JSDoc comment
4. **`triggerInstructions`** — list all top-level exported functions found in `.gs` files. Format as: "Open the Apps Script editor, select `{functionName}()`, and click Run."
5. **`outputs`** — search `.gs` files for `SpreadsheetApp.openById("...")` or `DocumentApp.openById("...")` calls. Extract the IDs and build output entries with Google Sheets/Docs URLs.
6. **`scriptUrl`** — cannot be auto-detected (Apps Script project IDs are not in the source). Leave empty, tell the user to fill it in.

#### For `chrome-extension`:

1. **`id`** — derive from directory name
2. **`name`** — read `manifest.json` → `name`
3. **`description`** — read `manifest.json` → `description`
4. **`permissions`** — read `manifest.json` → `permissions` array
5. **`hostPermissions`** — read `manifest.json` → `host_permissions` array
6. **`repositoryUrl`** — check `.git/config` for `[remote "origin"]` → `url`. Convert SSH URLs to HTTPS format.
7. **`installUrl`** — cannot be auto-detected. Leave empty.

#### For `manual` / `webhook`:

These can't be auto-detected. Ask the user to describe:
- What the tool does (→ description)
- How to run it (→ instructions / webhookUrl)
- Where the output goes (→ outputUrl / expected response)

### 3. Suggest a category

Based on detected tags and description, suggest one of the valid categories:
- `github-analysis` — if tags/description mention github, git, repo, PR, commit, code
- `hr-people` — if mentions employee, bamboo, review, performance, OOO, vacation, team
- `security` — if mentions security, signing, GPG, vulnerability, compliance
- `data-ingestion` — if mentions ingestion, sync, snowflake, database, ETL
- `monitoring` — if mentions monitor, backlog, stale, alert, notification, slack
- `scrapers` — if mentions scrape, crawl, extract, google maps, amazon
- `productivity` — fallback for anything else

Present the suggestion and let the user confirm or change it.

### 4. Suggest an icon

Based on the category and description, suggest a Lucide icon:
- GitHub/code tools → `GitBranch`, `FileCode`, `GitCompare`
- Search/scan tools → `Search`, `ScanLine`
- Security → `Shield`, `ShieldCheck`, `Lock`
- Database/data → `Database`, `HardDrive`
- HR/people → `Users`, `UserCheck`
- Notifications → `Bell`, `MessageSquare`
- Sheets/docs → `FileSpreadsheet`, `FileText`
- Calendar → `Calendar`
- Timer/tracking → `Timer`, `Clock`
- Performance/metrics → `TrendingUp`, `BarChart`
- Chrome extensions → `Chrome`, `Puzzle`
- General → `Wrench`, `Zap`

### 5. Show the user what you found

Present a summary of all detected and suggested fields. Clearly mark:
- **Auto-detected** — found in project files
- **Suggested** — inferred from context, user should verify
- **Missing** — user needs to provide

### 6. Add the `local` section (optional, recommended)

If the user wants to be able to run this tool from their local checkout (offline mode in the dashboard), add a `local` section:

- **Apify tools** — just set `local.path` to the project's absolute directory path (e.g. `c:/_PROJEKTY/{name}`). `command`/`args` default to `apify run --purge`.
- **Other tool types** — `local.path` + `local.command` are both required. Ask the user what command runs the tool locally (e.g. `npm`/`run start`, `python`/`main.py`).

Skip the `local` section entirely if the tool is meant to be **online-only** (runs exclusively via Apify cloud).

### 7. Write the dashboard.json

After user confirms (or provides corrections), write `dashboard.json` to the project root. Include the `$schema` reference:

```json
{
  "$schema": "c:/_PROJEKTY/tools-dashboard/dashboard.schema.json",
  ...
}
```

### 8. Offer to run update-tools

After writing the manifest, ask: "Run `/update-tools` now to register this tool in the dashboard?"

## Tips

- Be thorough in source code scanning but don't read more than the first 200 lines of any file
- For Apify actors, the most reliable source of truth is `.actor/actor.json` + `.actor/INPUT_SCHEMA.json`
- If a `dashboard.json` already exists, read it first and offer to update it (preserve existing values, fill in missing ones)
- Always present findings to the user before writing — never write silently
