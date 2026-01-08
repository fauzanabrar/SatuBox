import { getRestrictByFileId } from "@/lib/firebase/db/restrict";
import { getDriveClient } from "@/lib/gdrive";
import { NextResponse } from "next/server";
import { Readable } from "node:stream";

const folderMimeType = "application/vnd.google-apps.folder";
const googleAppsPrefix = "application/vnd.google-apps.";

type ParamsType = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: ParamsType,
): Promise<Response> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      {
        status: 400,
        message: "Bad Request! File id is required!",
      },
      { status: 400 },
    );
  }

  const restrict = await getRestrictByFileId(id);
  if (restrict) {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      { status: 403 },
    );
  }

  try {
    const driveClient = await getDriveClient();

    const metadata = await driveClient.files.get({
      fileId: id,
      fields: "id, name, mimeType, size",
    });

    const mimeType =
      metadata.data.mimeType || "application/octet-stream";

    if (mimeType === folderMimeType) {
      return NextResponse.json(
        {
          status: 400,
          message: "Folder cannot be previewed",
        },
        { status: 400 },
      );
    }

    if (mimeType.startsWith(googleAppsPrefix)) {
      return NextResponse.json(
        {
          status: 400,
          message: "Preview not available for this file type",
        },
        { status: 400 },
      );
    }

    const range = request.headers.get("range") ?? undefined;
    const mediaResponse = await driveClient.files.get(
      { fileId: id, alt: "media" },
      {
        responseType: "stream",
        headers: range ? { Range: range } : undefined,
      },
    );

    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set("Accept-Ranges", "bytes");

    const contentLength = mediaResponse.headers?.["content-length"];
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    } else if (metadata.data.size) {
      headers.set("Content-Length", metadata.data.size);
    }

    const contentRange = mediaResponse.headers?.["content-range"];
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    const stream = Readable.toWeb(mediaResponse.data as any);

    return new NextResponse(stream as any, {
      status: mediaResponse.status,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        message: "error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
