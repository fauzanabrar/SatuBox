import { NextRequest, NextResponse } from "next/server";
import driveServices from "@/services/driveServices";
import { FileResponse } from "@/types/api/file";
import { UserSession } from "@/types/api/auth";
import { getUserSession } from "@/lib/next-auth/user-session";
import { randomUUID } from "node:crypto";
import { Readable, Transform } from "node:stream";
import Busboy from "busboy";
import { deleteCache } from "@/lib/node-cache";
import userServices from "@/services/userServices";
import { getDriveAccessToken } from "@/lib/gdrive";

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

type ResumableUploadSession = {
  uploadUrl: string;
  targetFolderId: string;
  uploaderUsername: string;
  mimeType: string;
  fileName: string;
  totalBytes: number;
  createdAt: number;
};

const RESUMABLE_UPLOAD_TTL_MS = 6 * 60 * 60 * 1000;
const resumableUploads = new Map<string, ResumableUploadSession>();

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

const cleanupResumableUploads = () => {
  const now = Date.now();
  for (const [key, session] of resumableUploads) {
    if (now - session.createdAt > RESUMABLE_UPLOAD_TTL_MS) {
      resumableUploads.delete(key);
    }
  }
};

const parseUploadHeaderNumber = (value: string | null) => {
  if (!value) return NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
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

const createResumableSession = async (
  name: string,
  mimeType: string,
  size: number,
  folderId: string,
) => {
  const accessToken = await getDriveAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json; charset=UTF-8",
    "X-Upload-Content-Type": mimeType,
  };

  if (Number.isFinite(size) && size > 0) {
    headers["X-Upload-Content-Length"] = size.toString();
  }

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,size",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        name,
        parents: [folderId],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Failed to create resumable upload session");
  }

  const uploadUrl = response.headers.get("location");
  if (!uploadUrl) {
    throw new Error("Missing resumable upload session URL");
  }

  return uploadUrl;
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

  const isChunkUpload = type === "chunk";
  const targetFolderId = isChunkUpload
    ? ""
    : rawFolderId || context.rootFolderId;

  if (
    !isChunkUpload &&
    targetFolderId &&
    !(await canAccessFolder(targetFolderId, context))
  ) {
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

  if (type === "resumable") {
    const { name, mimeType, size } = await request.json();
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const contentType =
      typeof mimeType === "string" && mimeType
        ? mimeType
        : "application/octet-stream";
    const totalBytes = Number(size);

    if (!trimmedName) {
      return NextResponse.json({
        status: 400,
        message: "Bad Request! File name is required!",
      });
    }

    if (!Number.isFinite(totalBytes) || totalBytes <= 0) {
      return NextResponse.json({
        status: 400,
        message: "Bad Request! File size is required!",
      });
    }

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

      if (
        storage.limitBytes > 0 &&
        storage.usedBytes + totalBytes > storage.limitBytes
      ) {
        return NextResponse.json(
          {
            status: 413,
            message: "Storage limit exceeded",
          },
          { status: 413 },
        );
      }

      cleanupResumableUploads();

      const uploadUrl = await createResumableSession(
        trimmedName,
        contentType,
        totalBytes,
        targetFolderId,
      );

      const uploadId = randomUUID();
      resumableUploads.set(uploadId, {
        uploadUrl,
        targetFolderId,
        uploaderUsername: context.userSession.username,
        mimeType: contentType,
        fileName: trimmedName,
        totalBytes,
        createdAt: Date.now(),
      });

      return NextResponse.json({
        status: 200,
        message: "resumable upload created",
        uploadId,
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

  if (type === "chunk") {
    const uploadId = rawFolderId?.trim();
    if (!uploadId) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad Request! Upload id is required!",
        },
        { status: 400 },
      );
    }

    cleanupResumableUploads();
    const session = resumableUploads.get(uploadId);
    if (!session) {
      return NextResponse.json(
        {
          status: 404,
          message: "Upload session not found",
        },
        { status: 404 },
      );
    }

    if (session.uploaderUsername !== context.userSession.username) {
      return NextResponse.json(
        {
          status: 403,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    const start = parseUploadHeaderNumber(
      request.headers.get("x-upload-start"),
    );
    const end = parseUploadHeaderNumber(request.headers.get("x-upload-end"));
    const total = parseUploadHeaderNumber(
      request.headers.get("x-upload-total"),
    );
    const declaredSize = parseUploadHeaderNumber(
      request.headers.get("x-upload-size"),
    );

    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(total)) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad Request! Invalid upload range headers!",
        },
        { status: 400 },
      );
    }

    if (total !== session.totalBytes) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad Request! Upload size mismatch!",
        },
        { status: 400 },
      );
    }

    if (start < 0 || end < start || end >= total) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad Request! Upload range is invalid!",
        },
        { status: 400 },
      );
    }

    const chunkLength = end - start + 1;
    if (Number.isFinite(declaredSize) && declaredSize !== chunkLength) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad Request! Chunk size mismatch!",
        },
        { status: 400 },
      );
    }

    const bodyStream = request.body;
    if (!bodyStream) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad Request! Missing upload body!",
        },
        { status: 400 },
      );
    }

    try {
      const accessToken = await getDriveAccessToken();
      const driveResponse = await fetch(session.uploadUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Length": chunkLength.toString(),
          "Content-Range": `bytes ${start}-${end}/${total}`,
          "Content-Type": session.mimeType || "application/octet-stream",
        },
        body: bodyStream,
        duplex: "half",
      } as RequestInit & { duplex: "half" });

      if (driveResponse.status === 308) {
        const range = driveResponse.headers.get("range");
        return NextResponse.json(
          {
            status: 308,
            message: "resume upload",
            range,
          },
          { status: 308 },
        );
      }

      if (!driveResponse.ok) {
        const errorText = await driveResponse.text().catch(() => "");
        return NextResponse.json(
          {
            status: driveResponse.status,
            message: "Failed to upload chunk",
            error: errorText,
          },
          { status: driveResponse.status },
        );
      }

      const uploaded = await driveResponse.json().catch(() => ({}));
      const sizeFromDrive = uploaded?.size ? Number(uploaded.size) : NaN;
      const uploadedSize = Number.isFinite(sizeFromDrive)
        ? sizeFromDrive
        : session.totalBytes;

      const storage = await getStorageStatus(session.targetFolderId, context);
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
        if (uploaded?.id) {
          await driveServices.deleteFile(uploaded.id);
        }
        resumableUploads.delete(uploadId);
        return NextResponse.json(
          {
            status: 402,
            message: "Plan expired. Storage exceeds free limit.",
          },
          { status: 402 },
        );
      }

      if (
        storage.limitBytes > 0 &&
        uploadedSize > 0 &&
        storage.usedBytes + uploadedSize > storage.limitBytes
      ) {
        if (uploaded?.id) {
          await driveServices.deleteFile(uploaded.id);
        }
        resumableUploads.delete(uploadId);
        return NextResponse.json(
          {
            status: 413,
            message: "Storage limit exceeded",
          },
          { status: 413 },
        );
      }

      if (uploadedSize > 0) {
        await userServices.incrementStorageUsage(
          storage.ownerUsername,
          uploadedSize,
        );
      }

      resumableUploads.delete(uploadId);

      return NextResponse.json({
        status: 200,
        message: "success upload file",
        id: uploaded?.id,
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
