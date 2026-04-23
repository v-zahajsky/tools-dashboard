import { NextRequest, NextResponse } from "next/server";
import { getToolById } from "@/lib/registry";
import { getApifyClient } from "@/lib/apify-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  const { toolId } = await params;
  const tool = getToolById(toolId);
  if (!tool || tool.type !== "apify") {
    return NextResponse.json({ error: "Not an Apify tool" }, { status: 400 });
  }
  if (!tool.actorId) {
    return NextResponse.json({ runs: [] });
  }

  try {
    const client = getApifyClient();
    const { items } = await client.actor(tool.actorId).runs().list({
      limit: 20,
      desc: true,
    });

    return NextResponse.json({ runs: items });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch runs",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  const { toolId } = await params;
  const tool = getToolById(toolId);
  if (!tool || tool.type !== "apify") {
    return NextResponse.json({ error: "Not an Apify tool" }, { status: 400 });
  }
  if (!tool.actorId) {
    return NextResponse.json(
      { error: "This tool has no online (Apify) variant configured." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const input = { ...tool.defaultInput, ...body.input };

    const client = getApifyClient();
    const run = await client.actor(tool.actorId).start(input, {
      memory: tool.memoryMbytes,
      timeout: tool.timeoutSecs,
      build: tool.buildTag || "latest",
    });

    return NextResponse.json({ run });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to start run",
      },
      { status: 500 }
    );
  }
}
