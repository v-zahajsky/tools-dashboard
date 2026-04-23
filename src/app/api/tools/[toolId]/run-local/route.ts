import { NextRequest, NextResponse } from "next/server";
import { getToolById } from "@/lib/registry";
import {
  LocalRunError,
  listLocalRuns,
  resolveLocalRunPlan,
  startLocalRun,
} from "@/lib/local-runner";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  const { toolId } = await params;
  const tool = getToolById(toolId);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }
  return NextResponse.json({ runs: listLocalRuns(toolId) });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  const { toolId } = await params;
  const tool = getToolById(toolId);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  try {
    const plan = resolveLocalRunPlan(tool);
    const run = startLocalRun(tool, plan);
    return NextResponse.json({ run, plan });
  } catch (err) {
    const status = err instanceof LocalRunError ? 400 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start local run" },
      { status }
    );
  }
}
