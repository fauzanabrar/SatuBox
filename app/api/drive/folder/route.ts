import { NextRequest, NextResponse } from "next/server";
import { createFolder, listFiles } from "@/lib/gdrive";

export async function GET() {
  const list: any = await listFiles(process.env.SHARED_FOLDER_ID_DRIVE);

  return NextResponse.json({
    status: "200",
    message: "success",
    files: list,
  });
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  
  const folderName = data.get("name") as string;
  const folderId = data.get("id") as string;

  const list: any = await createFolder(folderName, [
    folderId ? folderId : process.env.SHARED_FOLDER_ID_DRIVE as string,
  ]);

  return NextResponse.json({
    status: "200",
    message: "success",
    files: list,
  });
}

export const dynamic = "force-dynamic";