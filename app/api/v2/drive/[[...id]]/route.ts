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
    const files = await driveServices.getListFiles(id);

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
