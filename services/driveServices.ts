import { FileDrive, ParentsFolder } from "@/types/api/drive/file";
import gdrive from "@/lib/gdrive2";
import restrictServices from "./restrictServices";
import userServices from "./userServices";

const fileTypes: Record<string, string> = {
  "application/vnd.google-apps.folder": "folder",
  "image/jpeg": "image",
  "image/gif": "image",
  "image/png": "image",
};

async function list(username: string, folderId?: string): Promise<FileDrive[]> {
  try {
    const driveFiles = await gdrive.listFiles(
      folderId ? folderId : (process.env.SHARED_FOLDER_ID_DRIVE as string),
    );

    const restricts = await restrictServices.list();
    const user = await userServices.getByUsername(username);

    const listFiles: Promise<FileDrive[]> = Promise.all(
      driveFiles.map(async (file: any) => {
        const newfile: FileDrive = {
          id: file.id,
          fileType: file.mimeType,
          name: file.name,
        };

        // set the filetype
        newfile.fileType = fileTypes[file.mimeType];
        if (!newfile.fileType) {
          newfile.fileType = "file";
        }

        // set the media (deprecated)
        // if (newfile.fileType === "image") {
        //   newfile.media = (await gdrive.getMedia(newfile.id)) as string;
        // }

        // set the restrict
        newfile.isRestrict =
          user.role === "admin"
            ? false
            : restricts.map((restrict) => restrict.fileId).includes(newfile.id)
              ? true
              : false;

        return newfile;
      }),
    );
    return listFiles;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function reversedParentsFolder(
  folderId: string,
): Promise<ParentsFolder[]> {
  try {
    const parent: any = await gdrive.getAllParentsFolder(folderId);
    const newParent = {
      id: folderId,
      name: parent.currentName,
    };
    if (parent.id && parent.id !== process.env.SHARED_FOLDER_ID_DRIVE) {
      const grandparents = await reversedParentsFolder(parent.id);
      return [newParent, ...grandparents];
    }
    return [newParent];
  } catch (error: any) {
    throw new Error(error);
  }
}

async function parentsFolder(folderId: string): Promise<ParentsFolder[]> {
  const parents = await reversedParentsFolder(folderId);
  return parents.reverse();
}

type FileUpload = {
  name: string;
  mimeType: string;
  content: Buffer;
};

async function addFile(file: FileUpload, folderId?: string) {
  const { name, mimeType, content } = file;

  try {
    const newFile = await gdrive.uploadFile(name, mimeType, content, [
      folderId ? folderId : (process.env.SHARED_FOLDER_ID_DRIVE as string),
    ]);
    return newFile;
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
    return file;
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
    const file = await gdrive.deleteFileOrFolder(id, parentsId);

    return file;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function renameFile(id: string, newName: string) {
  // check the file first
  console.log(id);
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

const driveServices = {
  list,
  addFile,
  addFolder,
  folderName,
  parentsFolder,
  renameFile,
  deleteFile,
  checkId,
};

export default driveServices;
