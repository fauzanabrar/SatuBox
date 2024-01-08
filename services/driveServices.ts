import { FileDrive } from "@/types/api/drive/file";
import gdrive from "@/lib/gdrive2";

async function getListFiles(): Promise<FileDrive[]> {
  const listFiles: FileDrive[] = [];
  try {
    const driveFiles = await gdrive.listFiles(
      process.env.SHARED_FOLDER_ID_DRIVE as string
    );
    driveFiles.map((file: any) => {
      listFiles.push({
        id: file.id,
        fileType: file.mimeType,
        name: file.name,
      });
    });
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }

  return listFiles;
}

const driveServices = {
  getListFiles,
};

export default driveServices;
