import { ToolDefinition } from "@/types/tool";

export const tools: ToolDefinition[] = [
  // ===== APIFY ACTORS =====
  {
    id: "github-analyzator-codeowners",
    name: "GitHub CODEOWNERS Analyzer",
    description:
      "Analyzes GitHub CODEOWNERS files across organizations and generates comprehensive reports with team ownership data. Exports to CSV and optionally Google Sheets.",
    category: "github-analysis",
    type: "apify",
    icon: "FileCode",
    tags: ["github", "codeowners", "ownership", "csv"],
    status: "active",
    actorId: "YOUR_USERNAME/github-analyzator-codeowners",
    defaultInput: {
      organizations: [],
      outputFormat: "both",
      googleSheetsEnabled: false,
      verboseLogging: false,
    },
    outputConfig: {
      hasDataset: true,
      hasKvStore: true,
    },
  },
  {
    id: "cr-reminder",
    name: "Backlog Reminder",
    description:
      "Monitors ZenHub backlog pipelines for stale tickets and notifies via Slack with per-workspace statistics and CSV report.",
    category: "monitoring",
    type: "apify",
    icon: "Bell",
    tags: ["zenhub", "backlog", "slack", "stale-tickets"],
    status: "active",
    actorId: "YOUR_USERNAME/cr-reminder",
    defaultInput: {
      targetPipelines: ["Product Backlog"],
      warningThresholdDays: 180,
      urgentThresholdDays: 240,
      criticalThresholdDays: 300,
      maxIssues: 100,
      sendEmptyReport: false,
    },
    outputConfig: {
      hasDataset: true,
      hasKvStore: true,
      kvCsvReportKey: "backlog-report",
    },
  },
  {
    id: "github-data-ingestion",
    name: "GitHub Data Ingestion",
    description:
      "Ingests GitHub activity data (commits, issues, PRs, comments, projects, members) into Snowflake, SQLite, or Apify Dataset.",
    category: "data-ingestion",
    type: "apify",
    icon: "Database",
    tags: ["github", "data", "snowflake", "ingestion", "sync"],
    status: "active",
    actorId: "YOUR_USERNAME/github-data-ingestion",
    defaultInput: {
      organization: "",
      repositories: [],
      sync: "incremental",
      storage: { type: "dataset" },
      enableCheckpointing: true,
    },
    outputConfig: {
      hasDataset: true,
      hasKvStore: true,
      externalOutputs: [
        { label: "Snowflake", type: "snowflake" },
      ],
    },
  },
  {
    id: "github-dev-performance",
    name: "Developer Performance Analyzer",
    description:
      "Analyzes developer performance, code quality metrics, and rework rates across GitHub organization repositories. Generates 0-100 scores.",
    category: "github-analysis",
    type: "apify",
    icon: "TrendingUp",
    tags: ["github", "performance", "developers", "metrics", "rework"],
    status: "active",
    actorId: "YOUR_USERNAME/github-dev-performance",
    defaultInput: {
      organization: "",
      monthsBack: 12,
      excludeBots: true,
      excludeUsers: [],
    },
    outputConfig: {
      hasDataset: true,
      hasKvStore: true,
      kvHtmlReportKey: "report",
    },
  },
  {
    id: "claude-file-check",
    name: "Claude/AI File Scanner",
    description:
      "Scans GitHub repositories for CLAUDE.md, AGENTS.md, and copilot-instructions.md files. Generates an interactive HTML report.",
    category: "github-analysis",
    type: "apify",
    icon: "Search",
    tags: ["github", "claude", "agents", "copilot", "ai-config"],
    status: "active",
    actorId: "YOUR_USERNAME/claude-file-check",
    defaultInput: {
      organizations: [],
      repositories: [],
      topics: [],
      maxAgeMonths: 12,
      recursiveSearch: false,
      targetFiles: [
        "CLAUDE.md",
        "AGENTS.md",
        ".github/copilot-instructions.md",
      ],
    },
    outputConfig: {
      hasDataset: true,
      hasKvStore: true,
      kvHtmlReportKey: "report",
    },
  },
  {
    id: "github-sign-commits",
    name: "Commit Signing Checker",
    description:
      "Checks whether the last PR commit by each org member is GPG/SSH-signed. Generates an interactive HTML report.",
    category: "security",
    type: "apify",
    icon: "ShieldCheck",
    tags: ["github", "gpg", "signing", "security", "compliance"],
    status: "active",
    actorId: "YOUR_USERNAME/github-sign-commits",
    defaultInput: {
      organizations: [],
      teams: [],
      recursiveTeams: false,
      ignoreUsernames: [],
      includePrivateRepos: false,
    },
    outputConfig: {
      hasDataset: true,
      hasKvStore: true,
      kvHtmlReportKey: "report",
    },
  },
  {
    id: "bamboo-employee-stats",
    name: "BambooHR Employee Stats",
    description:
      "Extracts employee data and statistics from BambooHR. Exports hierarchy, statistics, and optionally salary data with raise recommendations.",
    category: "hr-people",
    type: "apify",
    icon: "Users",
    tags: ["bamboohr", "employees", "hr", "statistics", "hierarchy"],
    status: "active",
    actorId: "YOUR_USERNAME/bamboo-employee-stats",
    defaultInput: {
      subdomain: "",
      managerEmail: "",
      hierarchyMode: true,
      onlyActive: true,
      includeSalaryReport: false,
    },
    outputConfig: {
      hasDataset: true,
      hasKvStore: true,
      kvCsvReportKey: "OUTPUT_CSV",
    },
  },

  // ===== GOOGLE APPS SCRIPTS =====
  {
    id: "performance-review-consolidator",
    name: "Performance Review Consolidator",
    description:
      "Consolidates multiple Google Sheet performance reviews from different team members into a single summary sheet with structured competency data and scoring.",
    category: "hr-people",
    type: "google-apps-script",
    icon: "FileSpreadsheet",
    tags: ["performance-review", "google-sheets", "hr", "consolidation"],
    status: "active",
    triggerInstructions:
      "Open the Apps Script editor, select `consolidateReviews()` function, and click Run. Requires access to all source spreadsheets listed in the SOURCE_SHEETS config.",
    outputs: [
      {
        label: "Consolidated Review Sheet",
        url: "https://docs.google.com/spreadsheets/d/SHEET_ID",
        type: "google-sheet",
      },
    ],
  },
  {
    id: "delta-perf-review",
    name: "Performance Review Comparator",
    description:
      "Compares 3 versions of a performance review document (Master, Manager, Dev self-evaluation) and creates a merged output with visual diff highlights.",
    category: "hr-people",
    type: "google-apps-script",
    icon: "GitCompare",
    tags: ["performance-review", "comparison", "google-docs", "hr"],
    status: "active",
    triggerInstructions:
      "Open the Apps Script editor, select `comparePerformanceReviews()` function, and click Run. Configure MASTER_ID, MANAGER_ID, DEV_ID at the top of the script.",
    outputs: [
      {
        label: "Comparison Document",
        url: "https://docs.google.com/spreadsheets/d/SHEET_ID",
        type: "google-sheet",
      },
    ],
  },
  {
    id: "dev-ooo-analyzer",
    name: "Dev OOO Calendar Analyzer",
    description:
      "Processes a shared team calendar (vacation/OOO events) and exports analytics to a Google Sheet with vacation patterns and duration analysis.",
    category: "hr-people",
    type: "google-apps-script",
    icon: "Calendar",
    tags: ["vacation", "ooo", "calendar", "google-sheets", "analytics"],
    status: "active",
    triggerInstructions:
      "Open the Apps Script editor, select `main()` or `exportAllOOOAnalysis()` function, and click Run.",
    outputs: [
      {
        label: "OOO Analytics Sheet",
        url: "https://docs.google.com/spreadsheets/d/SHEET_ID",
        type: "google-sheet",
      },
    ],
  },

  // ===== CHROME EXTENSIONS =====
  {
    id: "zenhub-column-life",
    name: "ZenHub Column Life Tracker",
    description:
      "Chrome extension that tracks how long issues stay in each column of a ZenHub board. Displays duration directly in the ZenHub UI.",
    category: "monitoring",
    type: "chrome-extension",
    icon: "Timer",
    tags: ["zenhub", "chrome", "tracking", "duration"],
    status: "active",
    hostPermissions: ["https://app.zenhub.com/*", "https://github.com/*"],
    permissions: ["storage", "activeTab"],
  },
  {
    id: "github-column-life",
    name: "GitHub Column Life",
    description:
      "Chrome extension that shows how long an issue card has been in its current GitHub Project column.",
    category: "github-analysis",
    type: "chrome-extension",
    icon: "Timer",
    tags: ["github", "projects", "chrome", "tracking", "duration"],
    status: "active",
    hostPermissions: ["https://github.com/*"],
    permissions: ["storage"],
  },
];
