import { NextRequest, NextResponse } from "next/server";
import { getAllParentsFolder } from "@/lib/gdrive";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") as string;

  const parents: any = await getAllParentsFolder(id);

  return NextResponse.json({
    status: "200",
    message: "success",
    files: parents,
  });
}