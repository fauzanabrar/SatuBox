import { NextRequest, NextResponse } from "next/server";
import {  uploadFile } from "@/lib/gdrive";

export async function POST(request: NextRequest) {
  const data = await request.formData();

  const file: File | null = data.get("file") as File;
  const folderId = data.get("id") as string;

  if (!file) {
    return NextResponse.json({ status: "400", message: "file not found" });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const response: any = await uploadFile(file.name, file.type, buffer, [
    folderId ? folderId : process.env.SHARED_FOLDER_ID_DRIVE,
  ] as string[]);

  return NextResponse.json({
    status: "200",
    message: "success",
    files: response,
  });
}

export const dynamic = "force-dynamic";
