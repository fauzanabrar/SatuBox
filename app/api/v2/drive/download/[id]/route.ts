import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/next-auth/user-session";
import { getRestrictByFileId } from "@/lib/firebase/db/restrict";
import { getDriveClient } from "@/lib/gdrive";
import { Readable } from "node:stream";
import driveServices from "@/services/driveServices";
import userServices from "@/services/userServices";

const folderMimeType = "application/vnd.google-apps.folder";
const googleAppsPrefix = "application/vnd.google-apps.";
const googleExportMime = "application/pdf";

const parseOwnerUsername = (folderName: string) => {
  if (folderName.startsWith("user-")) {
    return folderName.slice(5);
  }
  return folderName;
};

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

type ParamsType = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: ParamsType,
): Promise<Response> {
  const { id } = await params;

  const userSession = await getUserSession();
  if (!userSession?.username) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }

  if (!id) {
    return NextResponse.json({
      status: 400,
      message: "Bad Request! File id is required!",
    });
  }

  if (userSession.role !== "admin") {
    const restrict = await getRestrictByFileId(id);
    if (
      restrict &&
      !restrict.whitelist?.includes(userSession.username)
    ) {
      return NextResponse.json({
        status: 403,
        message: "Forbidden",
      });
    }
  }

  if (userSession.role !== "admin") {
    const userProfile = await userServices.ensureProfile(
      userSession.username,
    );
    const rootFolderId = await userServices.ensureRootFolder(
      userSession.username,
    );
    const allowedRootFolderIds = [
      rootFolderId,
      ...(userProfile.sharedRootFolderIds ?? []),
    ].filter(Boolean);

    let canAccess = false;
    let accessRootId: string | null = null;
    for (const rootId of allowedRootFolderIds) {
      if (await driveServices.isDescendantOf(id, rootId)) {
        canAccess = true;
        accessRootId = rootId;
        break;
      }
    }

    if (!canAccess) {
      return NextResponse.json(
        {
          status: 403,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    const ownerUsername =
      accessRootId === rootFolderId
        ? userSession.username
        : accessRootId
          ? parseOwnerUsername(
              await driveServices.folderName(accessRootId),
            ) || userSession.username
          : userSession.username;
    const billing = await userServices.resolveBillingStatus(
      ownerUsername,
    );
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

  try {
    const driveClient = await getDriveClient();

    const metadata = await driveClient.files.get({
      fileId: id,
      fields: "id, name, mimeType",
    });

    const mimeType =
      metadata.data.mimeType || "application/octet-stream";

    if (mimeType === folderMimeType) {
      return NextResponse.json({
        status: 400,
        message: "Folder cannot be downloaded",
      });
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
    return NextResponse.json({
      status: 500,
      message: "error",
      error: error.message,
    });
  }
}
