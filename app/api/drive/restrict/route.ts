import {NextRequest, NextResponse} from "next/server";
import {
  addWhitelist,
  createRestrictFile,
  deleteRestrict,
  getRestrictByFileId,
  getRestricts
} from "@/lib/firebase/db/restrict";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    const list = await getRestricts();
    return NextResponse.json({
      status: 200,
      message: "success",
      files: list
    })
  }

  const file = await getRestrictByFileId(id);
  return NextResponse.json({
    status: 200,
    message: "success",
    files: file
  })
}

export async function POST(req: NextRequest) {
  const {fileId, userId} = await req.json();

  if (!fileId || !userId) {
    return NextResponse.json({
      status: 400,
      message: "Bad Request",
      error: "Missing fileId or userId"
    })
  }

  try {
    const res = await createRestrictFile(fileId, userId);
    return NextResponse.json({
      status: 200,
      message: "success",
      restrictId: res
    })
  } catch (e: any) {
    return NextResponse.json({
      status: 500,
      message: "Internal Server Error",
      error: e.message
    })
  }
}

export async function PUT(req: NextRequest) {
  const {fileId, userId} = await req.json();

  if (!fileId || !userId) {
    return NextResponse.json({
      status: 400,
      message: "Bad Request",
      error: "Missing fileId or userId"
    })
  }

  try {
    await addWhitelist(fileId, userId);
    return NextResponse.json({
      status: 200,
      message: `File or Folder fileId ${fileId} whitelisted to userId ${userId}`,
    })
  } catch (e: any) {
    return NextResponse.json({
      status: 500,
      message: `Failed to whitelisted fileId ${fileId} to userId ${userId}`,
      error: e.message,
    })
  }
}


export async function DELETE(req: NextRequest) {
  const {fileId} = await req.json();

  if (!fileId) {
    return NextResponse.json({
      status: 400,
      message: "Bad Request",
      error: "Missing fileId"
    })
  }

  try {
    await deleteRestrict(fileId);
    return NextResponse.json({
      status: 200,
      message: `File or Folder fileId ${fileId} restricted removed `,
    })
  } catch (e: any) {
    return NextResponse.json({
      status: 500,
      message: `Failed to remove restrict to fileId ${fileId}`,
      error: e.message,
    })
  }
}





