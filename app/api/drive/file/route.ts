import { NextResponse } from "next/server";
import { getFileContent, listFiles } from "@/lib/gdrive";
import { NextApiRequest } from "next";


type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextApiRequest, { params }: ParamsType) {

  const list: any = await listFiles(process.env.SHARED_FOLDER_ID_DRIVE);

  return NextResponse.json({
    status: "200",
    message: "success",
    files: list,
  });
}
