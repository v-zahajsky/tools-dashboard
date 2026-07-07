import { NextRequest, NextResponse } from "next/server";
import { getToolById } from "@/lib/registry";
import { listLocalRuns } from "@/lib/local-runner";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  const { toolId } = await params;
  const tool = getToolById(toolId);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }
  if (!tool.localPath) {
    return NextResponse.json({ runs: [] });
  }

  const runs = listLocalRuns(toolId);
  return NextResponse.json({ runs });
}
