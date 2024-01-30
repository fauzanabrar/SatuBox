import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await userServices.list();

    return NextResponse.json({
      status: 200,
      message: "success",
      users,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        message: "error",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { username, newUsername, name, role } = await request.json();

  if (!username || !role) {
    return NextResponse.json(
      {
        status: 400,
        message: "Bad Request! Username and Role is required!",
      },
      {
        status: 400,
      }
    );
  }

  // get user session
  const userSession = await getUserSession();

  if (!userSession) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  if (userSession.role !== "admin") {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  try {
    await userServices.update({ username, newUsername, name, role });

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
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { username } = await request.json();

  if (!username) {
    return NextResponse.json(
      {
        status: 400,
        message: "Bad Request! Username is required!",
      },
      {
        status: 400,
      }
    );
  }

  // get user session
  const userSession = await getUserSession();

  if (!userSession) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  if (userSession.role !== "admin") {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  try {
    await userServices.remove(username);

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
      {
        status: 500,
      }
    );
  }
}
