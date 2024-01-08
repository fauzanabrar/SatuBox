import { FileDrive } from "@/types/api/drive/file";
import gdrive from "@/lib/gdrive2";

const fileTypes: Record<string, string> = {
  folder: "application/vnd.google-apps.folder",
  image: "image/jpeg" || "image/png",
};

async function getListFiles(folderId?: string): Promise<FileDrive[]> {
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

async function createFile(file: any) {}

async function createFolder(folderName: string) {}

const driveServices = {
  getListFiles,
};

export default driveServices;
