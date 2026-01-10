import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";
import driveServices from "@/services/driveServices";
import {
  deletePaidDownload,
  getPaidDownload,
  setPaidDownload,
} from "@/lib/firebase/db/paid-download";

const ensureOwnerAccess = async (
  fileId: string,
  username: string,
  role?: string | null,
) => {
  if (role === "admin") return true;
  const rootFolderId = await userServices.ensureRootFolder(username);
  return driveServices.isDescendantOf(fileId, rootFolderId);
};

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json(
      {
        status: 400,
        message: "fileId is required",
      },
      { status: 400 },
    );
  }

  try {
    const paid = await getPaidDownload(fileId);
    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        enabled: Boolean(paid?.enabled && paid?.price > 0),
        price: paid?.price ?? 0,
        currency: paid?.currency ?? "IDR",
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

  const { fileId, price } = await request.json();
  if (!fileId) {
    return NextResponse.json(
      {
        status: 400,
        message: "fileId is required",
      },
      { status: 400 },
    );
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return NextResponse.json(
      {
        status: 400,
        message: "Price must be greater than zero",
      },
      { status: 400 },
    );
  }
  if (!Number.isInteger(numericPrice)) {
    return NextResponse.json(
      {
        status: 400,
        message: "Price must be a whole number (IDR)",
      },
      { status: 400 },
    );
  }
  if (numericPrice < 1000) {
    return NextResponse.json(
      {
        status: 400,
        message: "Minimum price is 1000 IDR",
      },
      { status: 400 },
    );
  }

  const hasAccess = await ensureOwnerAccess(
    fileId,
    userSession.username,
    userSession.role,
  );
  if (!hasAccess) {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      { status: 403 },
    );
  }

  try {
    await setPaidDownload(fileId, {
      ownerUsername: userSession.username,
      price: numericPrice,
      currency: "IDR",
      enabled: true,
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
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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

  const { fileId } = await request.json();
  if (!fileId) {
    return NextResponse.json(
      {
        status: 400,
        message: "fileId is required",
      },
      { status: 400 },
    );
  }

  const hasAccess = await ensureOwnerAccess(
    fileId,
    userSession.username,
    userSession.role,
  );
  if (!hasAccess) {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      { status: 403 },
    );
  }

  try {
    await deletePaidDownload(fileId);
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
