import { FileDrive, ParentsFolder } from "@/types/api/file";
import gdrive from "@/lib/gdrive";
import restrictServices from "./restrictServices";
import { Readable } from "node:stream";
import { resolveDriveFileType } from "@/lib/constants/drive";

type UserContext = {
  username: string;
  role: string;
};

const sortDriveItems = (items: FileDrive[]) => {
  return [...items].sort((a, b) => {
    const aIsFolder = a.fileType === "folder";
    const bIsFolder = b.fileType === "folder";

    if (aIsFolder !== bIsFolder) {
      return aIsFolder ? -1 : 1;
    }

    const aName = a.name?.toLowerCase() ?? "";
    const bName = b.name?.toLowerCase() ?? "";
    if (aName === bName) return 0;
    return aName < bName ? -1 : 1;
  });
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

    const mappedFiles = await Promise.all(
      driveFiles.map(async (file: any) => {
        const newfile: FileDrive = {
          id: file.id,
          fileType: file.mimeType,
          name: file.name,
          size: file.size,
        };

        // set the filetype
        newfile.fileType = resolveDriveFileType(file.mimeType as string);

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
    const files = mappedFiles.filter(
      (file) => !(file.isRestrict && !file.whitelist?.includes(user.username)),
    );

    if (user.role === "user") return sortDriveItems(files);

    return sortDriveItems(mappedFiles);
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
