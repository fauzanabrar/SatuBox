import { NextRequest, NextResponse } from "next/server";
import { getDriveClient } from "@/lib/gdrive";
import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";

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

  try {
    const userSession = await getUserSession();

    if (!userSession) {
      return NextResponse.json(
        {
          status: 401,
          message: "Unauthorized",
          isOwner: false,
        },
        { status: 401 },
      );
    }

    // Get user details from database to access email
    const user = await userServices.getByUsername(userSession.username);
    if (!user || !user.email) {
      return NextResponse.json(
        {
          status: 401,
          message: "Unauthorized - email not found",
          isOwner: false,
        },
        { status: 401 },
      );
    }

    const driveClient = await getDriveClient();
    const fileInfo = await driveClient.files.get({
      fileId: id,
      fields: "owners",
    });

    const isOwner = fileInfo.data.owners?.some(owner =>
      user.email && owner.emailAddress?.toLowerCase() === user.email.toLowerCase()
    ) || false;

    return NextResponse.json({
      status: 200,
      message: "success",
      isOwner,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        message: "error",
        error: error.message,
        isOwner: false,
      },
      { status: 500 },
    );
  }
}