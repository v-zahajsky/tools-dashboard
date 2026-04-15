import { NextRequest, NextResponse } from "next/server";
import { getApifyClient } from "@/lib/apify-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  try {
    const client = getApifyClient();
    const log = await client.run(runId).log().get();

    return new NextResponse(log || "No log available", {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch log" },
      { status: 500 }
    );
  }
}
