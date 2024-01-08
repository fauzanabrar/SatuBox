import { NextRequest, NextResponse } from "next/server";
import driveServices from "@/services/driveServices";

/**
 *
 * @param request
 * @query
 * @queryParam limit
 * @queryParam page
 *
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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
    const files = await driveServices.getListFiles();

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
