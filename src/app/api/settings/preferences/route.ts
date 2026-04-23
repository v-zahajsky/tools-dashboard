import { NextRequest, NextResponse } from "next/server";
import { readPreferences, writePreferences } from "@/lib/preferences";
import { Preferences } from "@/types/tool";

export async function GET() {
  const prefs = await readPreferences();
  return NextResponse.json(prefs);
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Preferences>;
    const next = await writePreferences(body);
    return NextResponse.json(next);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save preferences" },
      { status: 500 }
    );
  }
}
