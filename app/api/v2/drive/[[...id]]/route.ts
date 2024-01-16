import { NextRequest, NextResponse } from "next/server";
import driveServices from "@/services/driveServices";
import { FileResponse } from "@/types/api/file";
import { getUserSession } from "@/lib/next-auth/user-session";

type ParamsType = {
  params: {
    id?: string[];
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
  { params }: ParamsType
): Promise<NextResponse<FileResponse>> {
  const id = params.id?.pop();

  const limit = request.nextUrl.searchParams.get("limit") as string;
  const page = request.nextUrl.searchParams.get("page") as string;

  const parents = request.nextUrl.searchParams.get("parents") as string;

  // get user session
  const userSession = await getUserSession();

  if (!userSession) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
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
    const files = await driveServices.list(userSession.username, id);

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
  { params }: ParamsType
): Promise<NextResponse<FileResponse>> {
  const type = params.id ? params.id[0] : "";
  const folderId: string | null = params.id ? params.id[1] : "";

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

    const file: File | null = data.get("file") as File;

    if (!file) {
      return NextResponse.json({
        status: 400,
        message: "Your file not found",
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const newFile = {
      name: file.name,
      mimeType: file.type,
      content: buffer,
    };

    try {
      const response: any = await driveServices.addFile(newFile, folderId);
      return NextResponse.json({
        status: 200,
        message: "success",
        files: response,
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
  { params }: ParamsType
): Promise<NextResponse<FileResponse>> {
  const id = params.id?.pop() as string;
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
  { params }: ParamsType
): Promise<NextResponse<FileResponse>> {
  const id = params.id?.pop() as string;

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
