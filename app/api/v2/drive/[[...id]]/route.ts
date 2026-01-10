import { NextRequest, NextResponse } from "next/server";
import driveServices from "@/services/driveServices";
import { FileResponse } from "@/types/api/file";
import { UserSession } from "@/types/api/auth";
import { getUserSession } from "@/lib/next-auth/user-session";
import { Readable } from "node:stream";
import { deleteCache } from "@/lib/node-cache";
import userServices from "@/services/userServices";

type RouteParams = {
  id?: string[];
};

type ParamsType = {
  params: Promise<RouteParams>;
};

const getFilenameFromContentDisposition = (
  contentDisposition: string | null,
) => {
  if (!contentDisposition) return "";

  const filenameStarMatch =
    /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (filenameStarMatch?.[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1]);
    } catch {
      return filenameStarMatch[1];
    }
  }

  const filenameMatch = /filename=\"?([^\";]+)\"?/i.exec(
    contentDisposition,
  );
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

const getUserAccessContext =
  async (): Promise<UserAccessContext | null> => {
    const userSession = await getUserSession();
    if (!userSession?.username) return null;

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
  const ownerUsername = await getStorageOwnerUsername(
    folderId,
    context,
  );
  if (!ownerUsername) return null;

  const billing = await userServices.resolveBillingStatus(ownerUsername);
  const ownerProfile = billing.profile;
  const usedBytes = ownerProfile.storageUsedBytes ?? 0;
  const limitBytes = ownerProfile.storageLimitBytes ?? 0;

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
      return NextResponse.json({
        status: 500,
        message: "error",
        error: error.message,
      });
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
      const folder = await driveServices.addFolder(
        folderName,
        targetFolderId,
      );

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
      });
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
        response.headers.get("content-type") ||
        "application/octet-stream";
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

      const uploaded = await driveServices.addFile(
        newFile,
        targetFolderId,
      );

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
      return NextResponse.json({
        status: 500,
        message: "error",
        error: error.message,
      });
    }
  }

  if (type === "file") {
    const data = await request.formData();

    const files: File[] = data.getAll("files") as File[];

    if (files.length < 1) {
      return NextResponse.json({
        status: 400,
        message: "Your files not found",
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

      const totalBytes = files.reduce(
        (sum, file) => sum + (file.size || 0),
        0,
      );
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

      for (const file of files) {
        const newFile = {
          name: file.name,
          mimeType: file.type,
          content: Readable.fromWeb(file.stream() as any),
        };

        await driveServices.addFile(newFile, targetFolderId);
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
      return NextResponse.json({
        status: 500,
        message: "error",
        error: error.message,
      });
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
