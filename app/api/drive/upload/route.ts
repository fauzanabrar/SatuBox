import { NextRequest, NextResponse } from "next/server";
import { uploadBufferFile, uploadFile, uploadSingleFile } from "@/lib/gdrive";
import { NextApiRequest } from "next";

export async function POST(request: NextRequest) {
  // const { name, type, content } = await request.json();

  const data = await request.formData();
  const file = JSON.parse(data.get('file'));
  const encoder = new TextEncoder();
  const content = data.get('content');
  const fileSend = {
    ...file,
    content: encoder.encode(content).buffer
  }
  console.log(fileSend);
  // const json = await request.json();
  // console.log(json);
  // const response: any = await uploadFile(name, type, content, [
    //   process.env.SHARED_FOLDER_ID_DRIVE,
    // ] as string[]);
    
  const response: any = await uploadBufferFile(file, [process.env.SHARED_FOLDER_ID_DRIVE] as string[]);
  return NextResponse.json({
    status: "200",
    message: "success",
    files: response,
  });
}
