import { NextRequest, NextResponse } from "next/server";
import { getFolderName } from "@/lib/gdrive";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") as string;

  const file: any = await getFolderName(id);

  return NextResponse.json({
    status: "200",
    message: "success",
    name: file.name,
  });
}
