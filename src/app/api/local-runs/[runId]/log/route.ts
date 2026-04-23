import { NextRequest, NextResponse } from "next/server";
import { LocalRunError, readLocalRunLog } from "@/lib/local-runner";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  try {
    const text = readLocalRunLog(runId);
    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    const status = err instanceof LocalRunError ? 404 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read log" },
      { status }
    );
  }
}
