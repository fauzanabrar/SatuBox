import { NextRequest, NextResponse } from "next/server";
import driveServices from "@/services/driveServices";

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
): Promise<NextResponse> {
  const id = params.id?.pop();
  const limit = request.nextUrl.searchParams.get("limit") as string;
  const page = request.nextUrl.searchParams.get("page") as string;

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
    const files = await driveServices.list(id);

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
export async function POST(request: NextRequest, { params }: ParamsType) {
  const id = params.id?.pop();
  const { folderName } = await request.json();

  if (!folderName) {
    return NextResponse.json({
      status: 400,
      message: "Bad Request! Folder Name is required!",
    });
  }

  try {
    const folder = await driveServices.addFolder(folderName, id);

    return NextResponse.json({
      status: 200,
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
