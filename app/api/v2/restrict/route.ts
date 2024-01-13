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
  const { fileId, username } = await request.json();

  if (!fileId || !username) {
    return NextResponse.json({
      status: 400,
      message: "fileId and username are required",
    });
  }

  try {
    const restrictId = await restrictServices.addFile(fileId, username);

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
  const { fileId, username, whitelist, remove } = await request.json();

  if (!fileId || !username || !whitelist) {
    return NextResponse.json({
      status: 400,
      message: "fileId, username, and whitelist are required",
    });
  }

  if (remove) {
    try {
      await restrictServices.removeWhitelist(fileId, username, whitelist);

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
    await restrictServices.addWhitelist(fileId, username, whitelist);

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
  const { fileId, username } = await request.json();

  if (!fileId || !username) {
    return NextResponse.json({
      status: 400,
      message: "fileId and username are required",
    });
  }

  try {
    await restrictServices.deleteFile(fileId, username);

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
