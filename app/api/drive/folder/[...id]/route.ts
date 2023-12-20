import { NextRequest, NextResponse } from "next/server";
import { listFiles } from "@/lib/gdrive";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: ParamsType) {

  console.log(params.id);

  // TODO Create lib drive to get listFiles in the last id folder or use below
  
  // const files: any = await listFiles(params.id);

  // if (files.error) {
  //   return NextResponse.json({
  //   status: "500",
  //   message: "error",
  //   error: files.error,
  // });}

  return NextResponse.json({
    status: "200",
    message: "success",
    // files,
  });
}
