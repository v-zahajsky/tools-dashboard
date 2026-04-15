import { NextRequest, NextResponse } from "next/server";
import { getApifyClient } from "@/lib/apify-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "25");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const client = getApifyClient();
    const run = await client.run(runId).get();
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const result = await client
      .dataset(run.defaultDatasetId)
      .listItems({ limit, offset });

    return NextResponse.json({
      items: result.items,
      total: result.total,
      count: result.count,
      limit,
      offset,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch dataset",
      },
      { status: 500 }
    );
  }
}
