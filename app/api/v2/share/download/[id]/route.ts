import { getRestrictByFileId } from "@/lib/supabase/db/restrict";
import {
  getDownloadToken,
  getPaidDownload,
} from "@/lib/supabase/db/paid-download";
import gdrive, { getDriveClient } from "@/lib/gdrive";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "node:stream";
import userServices from "@/services/userServices";

const folderMimeType = "application/vnd.google-apps.folder";
const googleAppsPrefix = "application/vnd.google-apps.";
const googleExportMime = "application/pdf";

const sanitizeFilename = (name: string) => {
  const sanitized = name
    .replace(/[^\x20-\x7E]+/g, "_")
    .replace(/["\\/]/g, "_")
    .trim();
  return sanitized.length > 0 ? sanitized : "download";
};

const ensureExtension = (name: string, extension: string) => {
  const lowerName = name.toLowerCase();
  const lowerExt = extension.toLowerCase();
  return lowerName.endsWith(lowerExt) ? name : `${name}${extension}`;
};

const parseOwnerUsername = (folderName: string) => {
  if (folderName.startsWith("user-")) {
    return folderName.slice(5);
  }
  return folderName;
};

const resolveOwnerFromParents = async (fileId: string) => {
  const sharedRootId = process.env.SHARED_FOLDER_ID_DRIVE;
  if (!sharedRootId) return null;

  let currentId = fileId;
  for (let i = 0; i < 20; i += 1) {
    const parent = await gdrive.getAllParentsFolder(currentId);
    if (!parent?.id) return null;
    if (parent.id === sharedRootId) {
      const ownerUsername = parseOwnerUsername(parent.currentName);
      return ownerUsername || null;
    }
    currentId = parent.id;
  }

  return null;
};

type ParamsType = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
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
    const paidDownload = await getPaidDownload(id);
    if (paidDownload?.enabled && paidDownload.price > 0) {
      const token = request.nextUrl.searchParams.get("token");
      if (!token) {
        return NextResponse.json(
          {
            status: 402,
            message: "Payment required",
          },
          { status: 402 },
        );
      }

      const tokenRecord = await getDownloadToken(token);
      if (!tokenRecord || tokenRecord.fileId !== id) {
        return NextResponse.json(
          {
            status: 402,
            message: "Payment required",
          },
          { status: 402 },
        );
      }
    }

    const ownerUsername = await resolveOwnerFromParents(id);
    if (ownerUsername) {
      const billing = await userServices.resolveBillingStatus(ownerUsername);
      if (billing.blocked) {
        return NextResponse.json(
          {
            status: 402,
            message: "Plan expired. Storage exceeds free limit.",
          },
          { status: 402 },
        );
      }
    }

    const driveClient = await getDriveClient();

    const metadata = await driveClient.files.get({
      fileId: id,
      fields: "id, name, mimeType",
    });

    const mimeType = metadata.data.mimeType || "application/octet-stream";

    if (mimeType === folderMimeType) {
      return NextResponse.json(
        {
          status: 400,
          message: "Folder cannot be downloaded",
        },
        { status: 400 },
      );
    }

    const baseName = sanitizeFilename(metadata.data.name || "download");

    if (mimeType.startsWith(googleAppsPrefix)) {
      const exportResponse = await driveClient.files.export(
        { fileId: id, mimeType: googleExportMime },
        { responseType: "stream" },
      );

      const stream = Readable.toWeb(exportResponse.data as any);
      const fileName = ensureExtension(baseName, ".pdf");

      return new NextResponse(stream as any, {
        headers: {
          "Content-Type": googleExportMime,
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    const mediaResponse = await driveClient.files.get(
      { fileId: id, alt: "media" },
      { responseType: "stream" },
    );

    const stream = Readable.toWeb(mediaResponse.data as any);
    const fileName = ensureExtension(baseName, "");

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
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
