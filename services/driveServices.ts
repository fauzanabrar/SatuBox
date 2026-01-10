import { FileDrive, ParentsFolder } from "@/types/api/file";
import gdrive from "@/lib/gdrive";
import restrictServices from "./restrictServices";
import { Readable } from "node:stream";

const fileTypes: Record<string, string> = {
  "application/vnd.google-apps.folder": "folder",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "doc",
  "application/vnd.google-apps.document": "doc",
  "application/vnd.ms-excel": "sheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sheet",
  "application/vnd.google-apps.spreadsheet": "sheet",
  "application/vnd.ms-powerpoint": "slide",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "slide",
  "application/vnd.google-apps.presentation": "slide",
  "application/zip": "archive",
  "application/x-zip-compressed": "archive",
  "application/x-7z-compressed": "archive",
  "application/x-rar-compressed": "archive",
  "application/x-tar": "archive",
  "application/gzip": "archive",
  "image/jpeg": "image",
  "image/gif": "image",
  "image/png": "image",
};

type UserContext = {
  username: string;
  role: string;
};

async function list(
  user: UserContext,
  folderId?: string,
): Promise<FileDrive[]> {
  try {
    const [driveFiles, restricts] = await Promise.all([
      gdrive.listFiles(
        folderId ? folderId : (process.env.SHARED_FOLDER_ID_DRIVE as string),
      ),
      restrictServices.list(),
    ]);

    const listFiles: Promise<FileDrive[]> = Promise.all(
      driveFiles.map(async (file: any) => {
        const newfile: FileDrive = {
          id: file.id,
          fileType: file.mimeType,
          name: file.name,
        };

        // set the filetype
        const mimeType = (file.mimeType as string) || "";
        newfile.fileType =
          fileTypes[mimeType] ??
          (mimeType.startsWith("image/")
            ? "image"
            : mimeType.startsWith("video/")
              ? "video"
              : mimeType.startsWith("audio/")
                ? "audio"
                : mimeType.startsWith("text/")
                  ? "text"
                  : "file");

        // set the media (deprecated)
        // if (newfile.fileType === "image") {
        //   newfile.media = (await gdrive.getMedia(newfile.id)) as string;
        // }

        // set the restrict
        newfile.isRestrict = restricts
          .map((restrict) => restrict.fileId)
          .includes(newfile.id)
          ? true
          : false;

        // set the whitelist
        if (newfile.isRestrict) {
          const restrict = restricts.find(
            (restrict) => restrict.fileId === newfile.id,
          );
          if (restrict) {
            newfile.whitelist = restrict.whitelist;
          }
        }

        return newfile;
      }),
    );

    // skip the restrict if the user is user
    const files = (await listFiles).filter(
      (file) => !(file.isRestrict && !file.whitelist?.includes(user.username)),
    );

    if (user.role === "user") return files;

    return listFiles;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function reversedParentsFolder(
  folderId: string,
  stopAtId?: string,
): Promise<ParentsFolder[]> {
  try {
    if (stopAtId && folderId === stopAtId) {
      return [];
    }
    const parent: any = await gdrive.getAllParentsFolder(folderId);
    const newParent = {
      id: folderId,
      name: parent.currentName,
    };
    if (parent.id && (!stopAtId || parent.id !== stopAtId)) {
      const grandparents = await reversedParentsFolder(parent.id, stopAtId);
      return [newParent, ...grandparents];
    }
    return [newParent];
  } catch (error: any) {
    throw new Error(error);
  }
}

async function parentsFolder(
  folderId: string,
  stopAtId?: string,
): Promise<ParentsFolder[]> {
  const parents = await reversedParentsFolder(folderId, stopAtId);
  return parents.reverse();
}

type FileUpload = {
  name: string;
  mimeType: string;
  content: Readable;
};

async function addFile(file: FileUpload, folderId?: string) {
  const { name, mimeType, content } = file;

  try {
    return await gdrive.uploadFile(name, mimeType, content, [
      folderId ? folderId : (process.env.SHARED_FOLDER_ID_DRIVE as string),
    ]);
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

type NewFolder = {
  id: string;
  name: string;
};

async function addFolder(
  folderName: string,
  folderId?: string,
): Promise<NewFolder> {
  try {
    const newFolderId = await gdrive.createFolder(
      folderName,
      folderId ? [folderId] : [process.env.SHARED_FOLDER_ID_DRIVE as string],
    );
    return {
      id: newFolderId,
      name: folderName,
    };
  } catch (error: any) {
    throw new Error(error);
  }
}

async function checkId(id: string) {
  try {
    const file = await gdrive.getFile(id);
    return file.data;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function deleteFile(id: string) {
  // check the file first
  const file = await checkId(id);

  if (!file) {
    throw new Error("file not found");
  }

  const parents = await parentsFolder(id);
  const parentsId = parents.map((parent: any) => parent.id);

  if (parentsId.length === 1)
    parentsId.push(process.env.SHARED_FOLDER_ID_DRIVE as string);

  try {
    await gdrive.deleteFileOrFolder(id, parentsId);

    return file;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function renameFile(id: string, newName: string) {
  // check the file first
  const file = await checkId(id);

  if (!file) {
    throw new Error("file not found");
  }

  const parents = await parentsFolder(id);
  const parentsId = parents.map((parent: any) => parent.id);

  if (parentsId.length === 1)
    parentsId.push(process.env.SHARED_FOLDER_ID_DRIVE as string);

  try {
    const file = await gdrive.renameFileOrFolder(id, newName, parentsId);

    return file;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function folderName(id: string) {
  try {
    return await gdrive.getFolderName(id);
  } catch (error: any) {
    throw new Error(error);
  }
}

async function isDescendantOf(
  itemId: string,
  rootId: string,
): Promise<boolean> {
  if (itemId === rootId) return true;

  const parent = await gdrive.getAllParentsFolder(itemId);

  if (!parent?.id) return false;
  if (parent.id === rootId) return true;

  return isDescendantOf(parent.id, rootId);
}

const driveServices = {
  list,
  addFile,
  addFolder,
  folderName,
  parentsFolder,
  renameFile,
  deleteFile,
  checkId,
  isDescendantOf,
};

export default driveServices;
