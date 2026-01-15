import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/next-auth/user-session";
import { updateUserByUsername } from "@/lib/supabase/db/users";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const { email } = await request.json();
  if (typeof email !== "string") {
    return NextResponse.json(
      {
        status: 400,
        message: "Email is required",
      },
      {
        status: 400,
      },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
    return NextResponse.json(
      {
        status: 400,
        message: "Invalid email address",
      },
      {
        status: 400,
      },
    );
  }

  try {
    await updateUserByUsername(userSession.username, {
      email: normalizedEmail,
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
