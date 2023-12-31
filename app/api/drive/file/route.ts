import { NextRequest, NextResponse } from "next/server";
import {
  deleteAllFiles,
  getFileContent,
  listFiles,
  listFilesWithToken,
} from "@/lib/gdrive";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: ParamsType) {
  const media: string = (await request.nextUrl.searchParams.get(
    "media"
  )) as string;
  const pageSize: string = (await request.nextUrl.searchParams.get(
    "pageSize"
  )) as string;
  const pageToken: string = (await request.nextUrl.searchParams.get(
    "pageToken"
  )) as string;

  if (pageSize && pageToken) {
    const list: any = await listFilesWithToken(
      process.env.SHARED_FOLDER_ID_DRIVE,
      parseInt(pageSize),
      pageToken
    );

    if (media === "true") {
      const newFiles: any = await getMedia(list.files);
      return NextResponse.json({
        status: "200",
        message: "success",
        files: newFiles,
        nextPageToken: list.nextPageToken,
      });
    }

    return NextResponse.json({
      status: "200",
      message: "success",
      files: list.files,
      nextPageToken: list.nextPageToken,
    });
  }

  if (pageSize) {
    const list: any = await listFilesWithToken(
      process.env.SHARED_FOLDER_ID_DRIVE,
      parseInt(pageSize)
    );

    if (media === "true") {
      const newFiles: any = await getMedia(list.files);
      return NextResponse.json({
        status: "200",
        message: "success",
        files: newFiles,
        nextPageToken: list.nextPageToken,
      });
    }

    return NextResponse.json({
      status: "200",
      message: "success",
      files: list.files,
      nextPageToken: list.nextPageToken,
    });
  }

  if (pageToken) {
    const list: any = await listFilesWithToken(
      process.env.SHARED_FOLDER_ID_DRIVE,
      10,
      pageToken
    );

    if (media === "true") {
      const newFiles: any = await getMedia(list.files);
      return NextResponse.json({
        status: "200",
        message: "success",
        files: newFiles,
        nextPageToken: list.nextPageToken,
      });
    }

    return NextResponse.json({
      status: "200",
      message: "success",
      files: list.files,
      nextPageToken: list.nextPageToken,
    });
  }

  const list: any = await listFiles(process.env.SHARED_FOLDER_ID_DRIVE);

  if (list.length < 1) {
    return NextResponse.json({
      status: "500",
      message: "failed",
      files: []
    });
  }

  if (media === "true") {
    const newFiles: any = await getMedia(list);
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

async function getMedia(list: any[]) {
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
