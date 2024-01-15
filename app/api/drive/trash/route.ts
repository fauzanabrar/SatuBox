import { emptyTrash } from "@/lib/gdrive";
import { NextResponse } from "next/server";

export async function GET() {
  // const response: any = await emptyTrash();

  return NextResponse.json({
    status: "Not Implemented et",
  });
}
