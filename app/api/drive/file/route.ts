import { NextRequest, NextResponse } from "next/server";
import { deleteAllFiles, getFileContent, listFiles } from "@/lib/gdrive";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: ParamsType) {
  console.log('get file')
  const media: string = (await request.nextUrl.searchParams.get(
    "media"
  )) as string;
  const list: any = await listFiles(process.env.SHARED_FOLDER_ID_DRIVE);

  if (media === "true") {
    console.log("media true")
    const newFiles: any = [];
    for (const item of list) {
      if (!item.mimeType.includes("image")) {
        newFiles.push({ id: item.id, name: item.name, type: item.mimeType });
      } else {
        const image: any = await getFileContent(item.id);
        newFiles.push({
          id: item.id,
          name: item.name,
          cover: `data:${item.mimeType};base64,${image.files}`,
          type: item.mimeType,
        });
      }
    }
    return NextResponse.json({
      status: "200",
      message: "success",
      files: newFiles,
    });
  }

  return NextResponse.json({
    status: "200",
    message: "success",
    files: list,
  });
}

export async function DELETE(request: NextRequest, { params }: ParamsType) {
  // const list: any = await deleteAllFiles();

  return NextResponse.json({
    status: "Not Implemented yet",
  });

  // return NextResponse.json({
  //   status: "200",
  //   message: "success",
  //   files: list,
  // });
}

export const dynamic = "force-dynamic";
