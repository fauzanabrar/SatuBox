import { NextRequest, NextResponse } from "next/server";
import { getFileContent, listFiles } from "@/lib/gdrive";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: ParamsType) {
 
  const listFile: any = await listFiles(params.id.at(-1));
  
  const files = await getMedia(listFile)
  
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

async function getMedia(list: any) {
  const newFiles: any = [];
  for (const item of list) {
    if (!item.mimeType.includes("image")) {
      newFiles.push({ id: item.id, name: item.name, type: item.mimeType });
    } else {
      const image: any = await getFileContent(item.id);
      newFiles.push({
        id: item.id,
        name: item.name,
        cover: `data:${item.mimeType};base64,${image}`,
        type: item.mimeType,
      });
    }
  }
  return newFiles;
}
