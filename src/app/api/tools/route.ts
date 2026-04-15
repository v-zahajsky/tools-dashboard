import { NextRequest, NextResponse } from "next/server";
import { getAllTools, searchTools } from "@/lib/registry";
import { CategoryId } from "@/types/tool";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") as CategoryId | null;
  const search = searchParams.get("search");

  let tools = getAllTools();
  if (search) {
    tools = searchTools(search);
  } else if (category) {
    tools = tools.filter((t) => t.category === category);
  }

  return NextResponse.json({ tools });
}
