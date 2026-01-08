import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";

export async function GET() {
  const userSession = await getUserSession();
  if (!userSession?.username) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const userProfile = await userServices.ensureProfile(
      userSession.username,
    );

    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        sharedWithUsernames: userProfile.sharedWithUsernames ?? [],
      },
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

export async function POST(request: NextRequest) {
  const { username } = await request.json();

  if (!username) {
    return NextResponse.json(
      {
        status: 400,
        message: "username is required",
      },
      { status: 400 },
    );
  }

  const userSession = await getUserSession();
  if (!userSession?.username) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    if (username === userSession.username) {
      return NextResponse.json(
        {
          status: 400,
          message: "Cannot share with yourself",
        },
        { status: 400 },
      );
    }

    const targetUser = await userServices.getByUsername(username);
    if (!targetUser) {
      return NextResponse.json(
        {
          status: 404,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const rootFolderId = await userServices.ensureRootFolder(
      userSession.username,
    );

    await userServices.addSharedRootFolder(username, rootFolderId);
    await userServices.addSharedWithUsername(
      userSession.username,
      username,
    );

    return NextResponse.json({
      status: 200,
      message: "success",
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

export async function DELETE(request: NextRequest) {
  const { username } = await request.json();

  if (!username) {
    return NextResponse.json(
      {
        status: 400,
        message: "username is required",
      },
      { status: 400 },
    );
  }

  const userSession = await getUserSession();
  if (!userSession?.username) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const rootFolderId = await userServices.ensureRootFolder(
      userSession.username,
    );

    await userServices.removeSharedRootFolder(username, rootFolderId);
    await userServices.removeSharedWithUsername(
      userSession.username,
      username,
    );

    return NextResponse.json({
      status: 200,
      message: "success",
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
