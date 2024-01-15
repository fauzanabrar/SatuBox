import { NextRequest, NextResponse } from "next/server";
import { listFiles } from "@/lib/gdrive";
import { getMedia } from "@/app/api/drive/media";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: ParamsType) {
  if (!params.id)
    return NextResponse.json({
      status: "500",
      message: "error",
      error: "no params",
    });

  const listFile: any = await listFiles(params.id.at(-1));

  const files = await getMedia(listFile);

  if (files.error) {
    return NextResponse.json({
      status: "500",
      message: "error",
      error: files.error,
    });
  }

  return NextResponse.json({
    status: "200",
    message: "success",
    files,
  });
}

export const dynamic = "force-dynamic";
