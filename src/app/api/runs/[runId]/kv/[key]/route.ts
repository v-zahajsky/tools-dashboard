import { NextRequest, NextResponse } from "next/server";
import { getApifyClient } from "@/lib/apify-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string; key: string }> }
) {
  const { runId, key } = await params;

  try {
    const client = getApifyClient();
    const run = await client.run(runId).get();
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const record = await client
      .keyValueStore(run.defaultKeyValueStoreId)
      .getRecord(key);

    if (!record) {
      return NextResponse.json(
        { error: "Key not found" },
        { status: 404 }
      );
    }

    if (
      record.contentType?.includes("text/html")
    ) {
      return new NextResponse(record.value as string, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (record.contentType?.includes("text/csv")) {
      return new NextResponse(record.value as string, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${key}.csv"`,
        },
      });
    }

    return NextResponse.json(record.value);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch KV item",
      },
      { status: 500 }
    );
  }
}
