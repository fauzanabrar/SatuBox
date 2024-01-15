import { NextRequest, NextResponse } from "next/server";
import { deleteFile, getFileContent, renameFile } from "@/lib/gdrive";

interface ParamsType {
  params: {
    id: string;
    name?: string;
  };
}

export async function GET(request: NextRequest, { params }: ParamsType) {
  const files: string = (await getFileContent(params.id)) as string;

  return NextResponse.json({
    status: "success",
    files,
  });
}
export async function PUT(request: NextRequest, { params }: ParamsType) {
  const formData = await request.formData();
  const newName = formData.get("name") as string;

  const files = await renameFile(params.id, newName);

  return NextResponse.json({
    status: 200,
    message: "success rename file",
    files,
  });
}

export async function DELETE(request: NextRequest, { params }: ParamsType) {
  const response: any = await deleteFile(params.id);

  return NextResponse.json({
    status: 200,
    message: "success delete file",
    response,
  });
}

export const dynamic = "force-dynamic";
