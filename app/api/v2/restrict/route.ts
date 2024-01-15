import { getUserSession } from "@/lib/next-auth/user-session";
import restrictServices from "@/services/restrictServices";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fileId = await request.nextUrl.searchParams.get("fileId");

  if (fileId) {
    try {
      const restrict = await restrictServices.getById(fileId);

      return NextResponse.json({
        status: 200,
        message: "success get by id",
        data: restrict,
      });
    } catch (error: any) {
      return NextResponse.json({
        status: 500,
        message: error.message,
      });
    }
  }

  try {
    const restricts = await restrictServices.list();

    return NextResponse.json({
      status: 200,
      message: "success list",
      data: restricts,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
}

export async function POST(request: NextRequest) {
  const { fileId } = await request.json();

  if (!fileId) {
    return NextResponse.json({
      status: 400,
      message: "fileId are required",
    });
  }

  // get user session
  const userSession = await getUserSession();

  if (!userSession) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }

  try {
    const restrictId = await restrictServices.addFile(
      fileId,
      userSession.username
    );

    return NextResponse.json({
      status: 201,
      message: "success add file",
      data: restrictId,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
}

export async function PUT(request: NextRequest) {
  const { fileId, whitelist, remove } = await request.json();

  if (!fileId || !whitelist) {
    return NextResponse.json({
      status: 400,
      message: "fileId and whitelist are required",
    });
  }

  // get user session
  const userSession = await getUserSession();

  if (!userSession) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }

  if (remove) {
    try {
      await restrictServices.removeWhitelist(
        fileId,
        userSession.username,
        whitelist
      );

      return NextResponse.json({
        status: 200,
        message: "success remove whitelist",
      });
    } catch (error: any) {
      return NextResponse.json({
        status: 500,
        message: error.message,
      });
    }
  }

  try {
    await restrictServices.addWhitelist(
      fileId,
      userSession.username,
      whitelist
    );

    return NextResponse.json({
      status: 200,
      message: "success add whitelist",
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
}

export async function DELETE(request: NextRequest) {
  const { fileId } = await request.json();

  if (!fileId) {
    return NextResponse.json({
      status: 400,
      message: "fileId are required",
    });
  }

  // get user session
  const userSession = await getUserSession();

  if (!userSession) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized",
    });
  }

  try {
    await restrictServices.deleteFile(fileId, userSession.username);

    return NextResponse.json({
      status: 200,
      message: "success delete file",
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
}
