import { spawn } from "node:child_process";
import {
  createWriteStream,
  mkdirSync,
  existsSync,
  statSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import path from "node:path";
import { ToolDefinition } from "@/types/tool";

const LOGS_DIR = path.join(process.cwd(), ".local-runs");

export interface LocalRunPlan {
  command: string;
  args: string[];
  cwd: string;
}

export class LocalRunError extends Error {}

export function resolveLocalRunPlan(tool: ToolDefinition): LocalRunPlan {
  if (!tool.localPath) {
    throw new LocalRunError(
      `Tool "${tool.id}" does not have a localPath configured.`
    );
  }
  const cwd = path.resolve(tool.localPath);
  if (!existsSync(cwd) || !statSync(cwd).isDirectory()) {
    throw new LocalRunError(`localPath does not exist: ${cwd}`);
  }

  if (tool.localCommand) {
    return {
      command: tool.localCommand.command,
      args: tool.localCommand.args ?? [],
      cwd,
    };
  }

  if (tool.type === "apify") {
    return { command: "apify", args: ["run", "--purge"], cwd };
  }

  throw new LocalRunError(
    `Tool "${tool.id}" has localPath but no localCommand. Non-apify tools must specify how to run locally.`
  );
}

export interface StartedLocalRun {
  runId: string;
  logFile: string;
  pid: number | undefined;
}

export function startLocalRun(
  tool: ToolDefinition,
  plan: LocalRunPlan
): StartedLocalRun {
  mkdirSync(LOGS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runId = `${tool.id}-${stamp}`;
  const logFile = path.join(LOGS_DIR, `${runId}.log`);
  const log = createWriteStream(logFile, { flags: "a" });

  const header =
    `[${new Date().toISOString()}] starting local run\n` +
    `cwd: ${plan.cwd}\n` +
    `command: ${plan.command} ${plan.args.join(" ")}\n` +
    `---\n`;
  log.write(header);

  const child = spawn(plan.command, plan.args, {
    cwd: plan.cwd,
    shell: true,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout?.pipe(log, { end: false });
  child.stderr?.pipe(log, { end: false });

  child.on("close", (code) => {
    log.write(`\n---\n[${new Date().toISOString()}] process exited with code ${code}\n`);
    log.end();
  });
  child.on("error", (err) => {
    log.write(`\n---\n[${new Date().toISOString()}] spawn error: ${err.message}\n`);
    log.end();
  });

  return { runId, logFile, pid: child.pid };
}

export interface LocalRunSummary {
  runId: string;
  logFile: string;
  size: number;
  mtime: string;
}

export function listLocalRuns(toolId: string): LocalRunSummary[] {
  if (!existsSync(LOGS_DIR)) return [];
  const files = readdirSync(LOGS_DIR).filter(
    (f) => f.startsWith(`${toolId}-`) && f.endsWith(".log")
  );
  return files
    .map((f) => {
      const full = path.join(LOGS_DIR, f);
      const s = statSync(full);
      return {
        runId: f.replace(/\.log$/, ""),
        logFile: full,
        size: s.size,
        mtime: s.mtime.toISOString(),
      };
    })
    .sort((a, b) => b.mtime.localeCompare(a.mtime));
}

export function readLocalRunLog(runId: string): string {
  const file = path.join(LOGS_DIR, `${runId}.log`);
  if (!existsSync(file)) throw new LocalRunError(`Log not found: ${runId}`);
  return readFileSync(file, "utf8");
}
