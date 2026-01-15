import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { getUserSession } from "@/lib/next-auth/user-session";
import {
  getUserByUsername,
  updateUserByUsername,
} from "@/lib/supabase/db/users";

export async function PUT(request: NextRequest) {
  const userSession = await getUserSession();

  if (!userSession?.username) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { currentPassword, newPassword } = await request.json();
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return NextResponse.json(
      {
        status: 400,
        message: "Current password and new password are required",
      },
      {
        status: 400,
      },
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      {
        status: 400,
        message: "New password must be at least 6 characters",
      },
      {
        status: 400,
      },
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      {
        status: 400,
        message: "New password must be different",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const user = await getUserByUsername(userSession.username);
    if (!user) {
      return NextResponse.json(
        {
          status: 404,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          status: 400,
          message: "Current password is incorrect",
        },
        {
          status: 400,
        },
      );
    }

    const hashedPassword = await hash(newPassword, 10);
    await updateUserByUsername(userSession.username, {
      password: hashedPassword,
    });

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
      },
    );
  }
}
