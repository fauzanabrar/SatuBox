import { NextRequest, NextResponse } from "next/server";
import driveServices from "@/services/driveServices";
import { FileResponse } from "@/types/api/file";
import { getUserSession } from "@/lib/next-auth/user-session";
import { Readable } from "node:stream";
import { deleteCache } from "@/lib/node-cache";

type RouteParams = {
  id?: string[];
};

type ParamsType = {
  params: Promise<RouteParams>;
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

  if (clear) {
    if (id && id !== "undefined") deleteCache(id);
    else deleteCache(process.env.SHARED_FOLDER_ID_DRIVE as string);
  }

  // get user session
  const userSession = await getUserSession();

  if (!userSession?.username) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }

  if (parents === "true" && !id) {
    return NextResponse.json({
      status: 200,
      message: "success",
      parents: [],
    });
  }

  if (parents === "true" && id) {
    try {
      const parents = await driveServices.parentsFolder(id);

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
    const files = await driveServices.list(
      {
        username: userSession.username,
        role: userSession.role ?? "user",
      },
      id,
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
  const folderId: string = id ? id[1] : "";

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
      const folder = await driveServices.addFolder(folderName, folderId);

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
      for (const file of files) {
        const newFile = {
          name: file.name,
          mimeType: file.type,
          content: Readable.fromWeb(file.stream() as any),
        };

        await driveServices.addFile(newFile, folderId);
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

  try {
    await driveServices.deleteFile(id);

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
