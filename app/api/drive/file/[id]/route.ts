import { NextResponse } from "next/server";
import { deleteFile, getFileContent } from "@/lib/gdrive";
import { NextApiRequest } from "next";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextApiRequest, { params }: ParamsType) {
  const files: string = (await getFileContent(params.id)) as string;

  return NextResponse.json({
    status: "success",
    files,
  });
}

export async function DELETE(request: NextApiRequest, { params }: ParamsType) {
  const response: any = await deleteFile(params.id);

  return NextResponse.json({
    status: 200,
    message: "success delete file",
    response,
  });
}
