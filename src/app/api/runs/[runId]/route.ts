import { NextRequest, NextResponse } from "next/server";
import { getApifyClient } from "@/lib/apify-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  try {
    const client = getApifyClient();
    const run = await client.run(runId).get();

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    return NextResponse.json({ run });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch run" },
      { status: 500 }
    );
  }
}
