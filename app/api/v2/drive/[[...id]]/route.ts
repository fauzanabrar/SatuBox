import { NextRequest, NextResponse } from "next/server";
import driveServices from "@/services/driveServices";
import { FileResponse } from "@/types/api/file";
import { UserSession } from "@/types/api/auth";
import { getUserSession } from "@/lib/next-auth/user-session";
import { Readable, Transform } from "node:stream";
import Busboy from "busboy";
import { deleteCache } from "@/lib/node-cache";
import userServices from "@/services/userServices";

export const runtime = "nodejs";
export const maxDuration = 300;

type RouteParams = {
  id?: string[];
};

type ParamsType = {
  params: Promise<RouteParams>;
};

type UploadResult = {
  id?: string;
  size: number;
};

const createByteCounter = () => {
  let bytes = 0;
  const counter = new Transform({
    transform(chunk, _encoding, callback) {
      bytes += chunk.length;
      callback(null, chunk);
    },
  });

  return { counter, getBytes: () => bytes };
};

const streamUploadFiles = async (
  request: NextRequest,
  targetFolderId: string,
  uploadedIds: string[],
) => {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    throw new Error("Invalid content type");
  }

  if (!request.body) {
    throw new Error("Missing request body");
  }

  const uploads: Promise<UploadResult>[] = [];
  let fileCount = 0;

  const busboy = Busboy({
    headers: {
      "content-type": contentType,
    },
  });

  busboy.on(
    "file",
    (_fieldname, file, info: { filename: string; mimeType: string }) => {
      const filename = info.filename?.trim();
      if (!filename) {
        file.resume();
        return;
      }

      fileCount += 1;

      const { counter, getBytes } = createByteCounter();
      file.pipe(counter);

      const uploadPromise = driveServices
        .addFile(
          {
            name: filename,
            mimeType: info.mimeType || "application/octet-stream",
            content: counter,
          },
          targetFolderId,
        )
        .then((uploaded) => {
          const sizeFromDrive = uploaded?.size ? Number(uploaded.size) : NaN;
          const size = Number.isFinite(sizeFromDrive)
            ? sizeFromDrive
            : getBytes();

          if (uploaded?.id) {
            uploadedIds.push(uploaded.id);
          }

          return {
            id: uploaded?.id,
            size,
          };
        });

      uploads.push(uploadPromise);
    },
  );

  const bodyStream = Readable.fromWeb(request.body as any);
  const finished = new Promise<void>((resolve, reject) => {
    busboy.once("close", resolve);
    busboy.once("finish", resolve);
    busboy.once("error", reject);
    bodyStream.once("error", reject);
  });

  bodyStream.pipe(busboy);
  await finished;

  return {
    fileCount,
    uploadedIds,
    results: uploads.length > 0 ? await Promise.all(uploads) : [],
  };
};

const getFilenameFromContentDisposition = (
  contentDisposition: string | null,
) => {
  if (!contentDisposition) return "";

  const filenameStarMatch = /filename\*=UTF-8''([^;]+)/i.exec(
    contentDisposition,
  );
  if (filenameStarMatch?.[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1]);
    } catch {
      return filenameStarMatch[1];
    }
  }

  const filenameMatch = /filename=\"?([^\";]+)\"?/i.exec(contentDisposition);
  return filenameMatch?.[1] ?? "";
};

const getFilenameFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const name = urlObj.pathname.split("/").pop();
    return name ? decodeURIComponent(name) : "";
  } catch {
    return "";
  }
};

const parseOwnerUsername = (folderName: string) => {
  if (folderName.startsWith("user-")) {
    return folderName.slice(5);
  }
  return folderName;
};

type UserAccessContext = {
  userSession: UserSession;
  userProfile: Awaited<ReturnType<typeof userServices.ensureProfile>>;
  rootFolderId: string;
  allowedRootFolderIds: string[];
};

const getUserAccessContext = async (): Promise<UserAccessContext | null> => {
  const userSession = await getUserSession();
  if (!userSession?.username) return null;

  const userProfile = await userServices.ensureProfile(userSession.username);
  const rootFolderId = await userServices.ensureRootFolder(
    userSession.username,
  );
  const allowedRootFolderIds = [
    rootFolderId,
    ...(userProfile.shared_root_folder_ids ?? []),
  ].filter(Boolean);

  return {
    userSession,
    userProfile,
    rootFolderId,
    allowedRootFolderIds,
  };
};

const getAccessRootId = async (
  folderId: string,
  context: UserAccessContext,
) => {
  if (context.userSession.role === "admin") {
    return context.rootFolderId;
  }

  for (const rootId of context.allowedRootFolderIds) {
    if (await driveServices.isDescendantOf(folderId, rootId)) {
      return rootId;
    }
  }

  return null;
};

const canAccessFolder = async (
  folderId: string,
  context: UserAccessContext,
) => {
  const rootId = await getAccessRootId(folderId, context);
  return Boolean(rootId);
};

const getStorageOwnerUsername = async (
  folderId: string,
  context: UserAccessContext,
) => {
  const accessRootId = await getAccessRootId(folderId, context);
  if (!accessRootId) return null;

  if (accessRootId === context.rootFolderId) {
    return context.userSession.username;
  }

  try {
    const rootName = await driveServices.folderName(accessRootId);
    const ownerUsername = parseOwnerUsername(rootName);
    return ownerUsername || context.userSession.username;
  } catch {
    return context.userSession.username;
  }
};

const getStorageStatus = async (
  folderId: string,
  context: UserAccessContext,
) => {
  const ownerUsername = await getStorageOwnerUsername(folderId, context);
  if (!ownerUsername) return null;

  const billing = await userServices.resolveBillingStatus(ownerUsername);
  const ownerProfile = billing.profile;
  const usedBytes = ownerProfile.storage_used_bytes ?? 0;
  const limitBytes = ownerProfile.storage_limit_bytes ?? 0;

  return {
    ownerUsername,
    usedBytes,
    limitBytes,
    blocked: billing.blocked,
  };
};

/**
 *
 * @param request
 * @query
 * @params id
 * @queryParam limit
 * @queryParam page
 *
 */
export async function GET(
  request: NextRequest,
  { params }: ParamsType,
): Promise<NextResponse<FileResponse>> {
  const { id: idParam } = await params;
  const id = idParam?.[idParam.length - 1];

  const limit = request.nextUrl.searchParams.get("limit") as string;
  const page = request.nextUrl.searchParams.get("page") as string;

  const parents = request.nextUrl.searchParams.get("parents") as string;

  const clear = request.nextUrl.searchParams.get("clear") as boolean | null;

  const context = await getUserAccessContext();
  if (!context) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }

  const requestedId = id && id !== "undefined" ? id : undefined;
  const targetFolderId = requestedId ?? context.rootFolderId;

  if (clear) {
    deleteCache(targetFolderId);
  }

  if (parents === "true" && !id) {
    return NextResponse.json({
      status: 200,
      message: "success",
      parents: [],
    });
  }

  if (parents === "true" && requestedId) {
    const accessRootId = await getAccessRootId(requestedId, context);
    if (!accessRootId) {
      return NextResponse.json(
        {
          status: 403,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }
    try {
      const parents = await driveServices.parentsFolder(
        requestedId,
        accessRootId,
      );
      if (accessRootId !== context.rootFolderId) {
        const rootName = await driveServices.folderName(accessRootId);
        parents.unshift({ id: accessRootId, name: rootName });
      }

      return NextResponse.json({
        status: 200,
        message: "success",
        parents,
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

  // get list files in limit and page
  if (limit && page) {
    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        limit,
        page,
      },
    });
  }

  // get all list files
  try {
    if (!(await canAccessFolder(targetFolderId, context))) {
      return NextResponse.json(
        {
          status: 403,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    const files = await driveServices.list(
      {
        username: context.userSession.username,
        role: context.userSession.role ?? "user",
      },
      targetFolderId,
    );

    return NextResponse.json({
      status: 200,
      message: "success",
      files,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: "error",
      error: error.message,
    });
  }
}
/**
 *
 * @param request
 * @query id?
 * @body folderName
 */
export async function POST(
  request: NextRequest,
  { params }: ParamsType,
): Promise<NextResponse<FileResponse>> {
  const { id } = await params;
  const type = id ? id[0] : "";
  const rawFolderId: string = id ? id[1] : "";

  const context = await getUserAccessContext();
  if (!context) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }

  const targetFolderId = rawFolderId || context.rootFolderId;

  if (targetFolderId && !(await canAccessFolder(targetFolderId, context))) {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      { status: 403 },
    );
  }

  if (!type) {
    return NextResponse.json({
      status: 400,
      message: "Bad Request! Type is required!",
    });
  }

  if (type === "folder") {
    const { folderName } = await request.json();

    if (!folderName) {
      return NextResponse.json({
        status: 400,
        message: "Bad Request! Folder Name is required!",
      });
    }

    try {
      const folder = await driveServices.addFolder(folderName, targetFolderId);

      return NextResponse.json({
        status: 201,
        message: "Success Create New Folder!",
        id: folder.id,
      });
    } catch (error: any) {
      return NextResponse.json({
        status: 500,
        message: "error",
        error: error.message,
      }, { status: 500 });
    }
  }

  if (type === "url") {
    const { url, fileName } = await request.json();

    if (!url) {
      return NextResponse.json({
        status: 400,
        message: "Bad Request! Url is required!",
      });
    }

    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json({
        status: 400,
        message: "Bad Request! Url is invalid!",
      });
    }

    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return NextResponse.json({
        status: 400,
        message: "Bad Request! Url protocol is invalid!",
      });
    }

    try {
      const response = await fetch(urlObj.toString());

      if (!response.ok) {
        return NextResponse.json({
          status: 400,
          message: "Failed to download file",
          error: response.statusText,
        });
      }

      if (!response.body) {
        return NextResponse.json({
          status: 400,
          message: "Failed to read file body",
        });
      }

      const contentType =
        response.headers.get("content-type") || "application/octet-stream";
      const headerName = getFilenameFromContentDisposition(
        response.headers.get("content-disposition"),
      );
      const urlName = getFilenameFromUrl(urlObj.toString());
      const name = fileName || headerName || urlName || "download";

      const newFile = {
        name,
        mimeType: contentType,
        content: Readable.fromWeb(response.body as any),
      };

      const storage = await getStorageStatus(targetFolderId, context);
      if (!storage) {
        return NextResponse.json(
          {
            status: 403,
            message: "Forbidden",
          },
          { status: 403 },
        );
      }
      if (storage.blocked) {
        return NextResponse.json(
          {
            status: 402,
            message: "Plan expired. Storage exceeds free limit.",
          },
          { status: 402 },
        );
      }

      const contentLength = response.headers.get("content-length");
      const contentSize = contentLength ? Number(contentLength) : null;
      if (
        storage.limitBytes > 0 &&
        contentSize !== null &&
        !Number.isNaN(contentSize) &&
        storage.usedBytes + contentSize > storage.limitBytes
      ) {
        return NextResponse.json(
          {
            status: 413,
            message: "Storage limit exceeded",
          },
          { status: 413 },
        );
      }

      const uploaded = await driveServices.addFile(newFile, targetFolderId);

      let uploadedSize =
        contentSize !== null && !Number.isNaN(contentSize)
          ? contentSize
          : uploaded?.size
            ? Number(uploaded.size)
            : 0;

      if (Number.isNaN(uploadedSize)) {
        uploadedSize = 0;
      }

      if (uploadedSize > 0) {
        const totalBytes = storage.usedBytes + uploadedSize;
        if (storage.limitBytes > 0 && totalBytes > storage.limitBytes) {
          if (uploaded?.id) {
            await driveServices.deleteFile(uploaded.id);
          }
          return NextResponse.json(
            {
              status: 413,
              message: "Storage limit exceeded",
            },
            { status: 413 },
          );
        }
        await userServices.incrementStorageUsage(
          storage.ownerUsername,
          uploadedSize,
        );
      }

      return NextResponse.json({
        status: 200,
        message: "success upload file from url",
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

  if (type === "file") {
    const uploadedIds: string[] = [];

    try {
      const storage = await getStorageStatus(targetFolderId, context);
      if (!storage) {
        return NextResponse.json(
          {
            status: 403,
            message: "Forbidden",
          },
          { status: 403 },
        );
      }
      if (storage.blocked) {
        return NextResponse.json(
          {
            status: 402,
            message: "Plan expired. Storage exceeds free limit.",
          },
          { status: 402 },
        );
      }

      const { fileCount, results } = await streamUploadFiles(
        request,
        targetFolderId,
        uploadedIds,
      );

      if (fileCount < 1) {
        return NextResponse.json({
          status: 400,
          message: "Your files not found",
        });
      }

      const totalBytes = results.reduce((sum, result) => {
        const size = Number.isFinite(result.size) ? result.size : 0;
        return sum + size;
      }, 0);

      if (
        storage.limitBytes > 0 &&
        totalBytes > 0 &&
        storage.usedBytes + totalBytes > storage.limitBytes
      ) {
        if (uploadedIds.length > 0) {
          await Promise.all(
            uploadedIds.map((id) => driveServices.deleteFile(id)),
          );
        }
        return NextResponse.json(
          {
            status: 413,
            message: "Storage limit exceeded",
          },
          { status: 413 },
        );
      }

      if (totalBytes > 0) {
        await userServices.incrementStorageUsage(
          storage.ownerUsername,
          totalBytes,
        );
      }

      return NextResponse.json({
        status: 200,
        message: "success upload all files",
      });
    } catch (error: any) {
      if (uploadedIds.length > 0) {
        await Promise.all(
          uploadedIds.map((id) => driveServices.deleteFile(id)),
        );
      }

      if (error?.message === "Invalid content type") {
        return NextResponse.json(
          {
            status: 400,
            message: "Invalid content type",
          },
          { status: 400 },
        );
      }

      if (error?.message === "Missing request body") {
        return NextResponse.json(
          {
            status: 400,
            message: "Missing request body",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        status: 500,
        message: "error",
        error: error.message,
      }, { status: 500 });
    }
  }

  return NextResponse.json({
    status: 400,
    message: "Bad Request! Type is required!",
  });
}

/**
 *
 * @param request
 * @param id?
 * @body newName
 */
export async function PUT(
  request: NextRequest,
  { params }: ParamsType,
): Promise<NextResponse<FileResponse>> {
  const { id: idParam } = await params;
  const id = idParam?.[idParam.length - 1] as string;
  const { newName } = await request.json();

  const context = await getUserAccessContext();
  if (!context) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }

  if (!(await canAccessFolder(id, context))) {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      { status: 403 },
    );
  }

  if (!newName) {
    return NextResponse.json({
      status: 400,
      message: "Bad Request! New Name is required!",
    });
  }

  try {
    const file = await driveServices.renameFile(id, newName);

    return NextResponse.json({
      status: 200,
      message: "success rename file",
      id: file.id,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: "error",
      error: error.message,
    });
  }
}

/**
 *
 * @param request
 * @param id?
 *
 * @returns
 */
export async function DELETE(
  request: NextRequest,
  { params }: ParamsType,
): Promise<NextResponse<FileResponse>> {
  const { id: idParam } = await params;
  const id = idParam?.[idParam.length - 1] as string;

  const context = await getUserAccessContext();
  if (!context) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }

  if (!(await canAccessFolder(id, context))) {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      { status: 403 },
    );
  }

  try {
    const storageOwnerUsername = await getStorageOwnerUsername(id, context);
    const deleted = await driveServices.deleteFile(id);
    const deletedSize = deleted?.size ? Number(deleted.size) : 0;
    if (storageOwnerUsername && deletedSize > 0) {
      await userServices.incrementStorageUsage(
        storageOwnerUsername,
        -deletedSize,
      );
    }

    return NextResponse.json({
      status: 200,
      message: "success delete folder",
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: "error",
      error: error.message,
    });
  }
}
