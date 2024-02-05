import { clearCache } from "@/lib/node-cache";
import { NextResponse } from "next/server";

export async function DELETE() {
  clearCache();

  return NextResponse.json({
    status: 200,
    message: "Cache cleared",
  });
}
