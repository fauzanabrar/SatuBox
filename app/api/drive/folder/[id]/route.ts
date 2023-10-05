import { NextRequest, NextResponse } from "next/server";
import { listFiles } from "@/lib/gdrive";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: ParamsType) {

  const files: any = await listFiles(params.id);

  if (files.error) {
    return NextResponse.json({
    status: "500",
    message: "error",
    error: files.error,
  });}

  return NextResponse.json({
    status: "200",
    message: "success",
    files,
  });
}
