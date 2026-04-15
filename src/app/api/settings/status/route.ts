import { NextResponse } from "next/server";
import { getApifyClient } from "@/lib/apify-client";

export async function GET() {
  try {
    const client = getApifyClient();
    const user = await client.user("me").get();

    return NextResponse.json({
      connected: true,
      username: user?.username,
      email: user?.email,
      plan: user?.plan?.id,
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
