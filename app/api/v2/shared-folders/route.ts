import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";
import driveServices from "@/services/driveServices";

const parseOwnerUsername = (folderName: string) => {
  if (folderName.startsWith("user-")) {
    return folderName.slice(5);
  }
  return folderName;
};

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
    const userProfile = await userServices.ensureProfile(userSession.username);
    const sharedRootFolderIds = userProfile.shared_root_folder_ids ?? [];

    const sharedFolders = await Promise.all(
      sharedRootFolderIds.map(async (folderId) => {
        try {
          const name = await driveServices.folderName(folderId);
          return {
            id: folderId,
            name,
            ownerUsername: parseOwnerUsername(name),
          };
        } catch {
          return null;
        }
      }),
    );

    return NextResponse.json({
      status: 200,
      message: "success",
      data: sharedFolders.filter(Boolean),
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
  const { folderId } = await request.json();

  if (!folderId) {
    return NextResponse.json(
      {
        status: 400,
        message: "folderId is required",
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
    await userServices.removeSharedRootFolder(userSession.username, folderId);

    try {
      const folderName = await driveServices.folderName(folderId);
      const ownerUsername = parseOwnerUsername(folderName);
      if (ownerUsername && ownerUsername !== userSession.username) {
        await userServices.removeSharedWithUsername(
          ownerUsername,
          userSession.username,
        );
      }
    } catch {
      // ignore owner cleanup errors
    }

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
