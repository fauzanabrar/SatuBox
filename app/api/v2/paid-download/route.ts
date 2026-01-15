import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";
import driveServices from "@/services/driveServices";
import {
  deletePaidDownload,
  getPaidDownload,
  setPaidDownload,
} from "@/lib/supabase/db/paid-download";

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
    console.log('GET /api/v2/paid-download: fileId is required'); // Debug log
    return NextResponse.json(
      {
        status: 400,
        message: "fileId is required",
      },
      { status: 400 },
    );
  }

  console.log('GET /api/v2/paid-download: checking file', fileId); // Debug log
  try {
    const paid = await getPaidDownload(fileId);
    console.log('GET /api/v2/paid-download: result for file', fileId, ':', paid); // Debug log

    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        enabled: Boolean(paid?.enabled && (paid?.price ?? 0) > 0),
        price: paid?.price ?? 0,
        currency: paid?.currency ?? "IDR",
        previewEnabled: paid?.previewEnabled ?? true,
      },
    });
  } catch (error: any) {
    console.error('GET /api/v2/paid-download: error for file', fileId, error); // Debug log
    console.error('Error stack:', error.stack); // Debug log
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

  // Handle both JSON and form data
  let fileId, price, previewEnabled;

  const contentType = request.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    // Handle JSON request
    const requestData = await request.json();
    fileId = requestData.fileId;
    price = requestData.price;
    previewEnabled = requestData.previewEnabled !== undefined ? requestData.previewEnabled : true;
  } else {
    // Handle form data request
    const formData = await request.formData();
    fileId = formData.get("fileId") as string;
    price = formData.get("price") as string;
    // For checkboxes, if the checkbox is not checked, it won't be present in the form data
    // So if previewEnabled is not in the form data, it means it was unchecked
    const previewEnabledFormData = formData.get("previewEnabled");
    previewEnabled = previewEnabledFormData !== null; // true if checkbox was checked, false if unchecked
  }

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
      previewEnabled,
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
