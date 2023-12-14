import { NextRequest, NextResponse } from "next/server";
import { deleteAllFiles, listFiles } from "@/lib/gdrive";

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

export async function DELETE(request: NextRequest, { params }: ParamsType) {
  // const list: any = await deleteAllFiles();
  
  return NextResponse.json({
    status: 'Not Implemented yet',
  })

  // return NextResponse.json({
  //   status: "200",
  //   message: "success",
  //   files: list,
  // });
}

export const dynamic = 'force-dynamic';