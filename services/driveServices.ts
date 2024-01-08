import { FileDrive } from "@/types/api/drive/file";
import gdrive from "@/lib/gdrive2";

const fileTypes: Record<string, string> = {
  folder: "application/vnd.google-apps.folder",
  image: "image/jpeg" || "image/png",
};

async function list(folderId?: string): Promise<FileDrive[]> {
  try {
    const driveFiles = await gdrive.listFiles(
      folderId ? folderId : (process.env.SHARED_FOLDER_ID_DRIVE as string)
    );
    const listFiles: Promise<FileDrive[]> = Promise.all(
      driveFiles.map(async (file: any) => {
        const newfile: FileDrive = {
          id: file.id,
          fileType: file.mimeType,
          name: file.name,
        };

        // set the filetype
        newfile.fileType =
          Object.keys(fileTypes).find(
            (fileType: any) => fileTypes[fileType] === file.mimeType
          ) || "file";

        // set the media
        if (newfile.fileType === "image") {
          newfile.media = (await gdrive.getMedia(newfile.id)) as string;
        }

        // set the restrict

        return newfile;
      })
    );
    return listFiles;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

type ParentsFolder = {
  id: string;
  name: string;
  currentName?: string;
};

async function parentsFolder(folderId: string): Promise<ParentsFolder[]> {
  try {
    const parent: any = await gdrive.getAllParentsFolder(folderId);
    const newParent = {
      id: folderId,
      name: parent.currentName,
    };
    if (parent.id && parent.id !== process.env.SHARED_FOLDER_ID_DRIVE) {
      const grandparents = await parentsFolder(parent.id);
      const newGrandparents = [{
        id: parent.id as string,
        name: grandparents[0].name as string,
      }]
      return [newParent, ...grandparents];
    }
    return [newParent];
  } catch (error: any) {
    throw new Error(error);
  }
}

async function addFile(file: any, folderId?: string) {}

type NewFolder = {
  id: string;
  name: string;
};

async function addFolder(
  folderName: string,
  folderId?: string
): Promise<NewFolder> {
  try {
    const newFolderId = await gdrive.createFolder(
      folderName,
      folderId ? [folderId] : [process.env.SHARED_FOLDER_ID_DRIVE as string]
    );
    return {
      id: newFolderId,
      name: folderName,
    };
  } catch (error: any) {
    throw new Error(error);
  }
}

async function deleteFile(id: string) {}

async function deleteFolder(id: string) {}

async function folderName(id: string) {
  try {
    return await gdrive.getFolderName(id);
  } catch (error: any) {
    throw new Error(error);
  }
}

const driveServices = {
  list,
  addFolder,
  folderName,
};

export default driveServices;
