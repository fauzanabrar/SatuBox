import { NextRequest, NextResponse } from "next/server";
import { listFiles } from "@/lib/gdrive";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: ParamsType) {
  const list: any = await listFiles(process.env.SHARED_FOLDER_ID_DRIVE);
  return NextResponse.json({
    status: "200",
    message: "success",
    files: list,
  });
}

export const dynamic = 'force-dynamic';