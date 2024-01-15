import { NextRequest, NextResponse } from "next/server";
import { listFiles, listFilesWithToken } from "@/lib/gdrive";
import { getMedia } from "@/app/api/drive/media";

type ParamsType = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: ParamsType) {
  const media: string = request.nextUrl.searchParams.get("media") as string;
  const pageSize: string = request.nextUrl.searchParams.get(
    "pageSize",
  ) as string;
  const pageToken: string = request.nextUrl.searchParams.get(
    "pageToken",
  ) as string;

  if (pageSize && pageToken) {
    const list: any = await listFilesWithToken(
      process.env.SHARED_FOLDER_ID_DRIVE,
      parseInt(pageSize),
      pageToken,
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
      parseInt(pageSize),
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
      pageToken,
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
      files: [],
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
