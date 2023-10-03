import { NextResponse } from "next/server";
import { listFiles } from "@/lib/gdrive";

export async function GET() {
  const list: any = await listFiles(process.env.SHARED_FOLDER_ID_DRIVE);

  return NextResponse.json({
    status: "200",
    message: "success",
    files: list,
  });
}

export async function POST() {
  const list: any = await listFiles(process.env.SHARED_FOLDER_ID_DRIVE);

  return NextResponse.json({
    status: "200",
    message: "success",
    files: list,
  });
}
