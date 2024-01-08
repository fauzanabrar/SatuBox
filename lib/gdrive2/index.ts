import { auth, drive } from "@googleapis/drive";
import { Readable } from "stream";
import { Buffer } from "buffer";

let dClient: ReturnType<typeof drive> | undefined;

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT as string);

export async function getDriveClient() {
  if (!dClient) {
    dClient = drive({
      version: "v3",
      auth: new auth.GoogleAuth({
        credentials,
        scopes: "https://www.googleapis.com/auth/drive",
      }),
    });
  }

  return dClient;
}

type FileGD = {
  id: string;
  mimeType: string;
  name: string;
};

export async function listFiles(folderId?: string): Promise<FileGD[]> {
  try {
    const driveClient = await getDriveClient();

    const list = await driveClient.files.list({
      q: folderId
        ? `'${folderId}' in parents AND trashed = false`
        : "trashed = false",
      fields: "files(id, mimeType, name)",
    });

    if (
      !list.data.files ||
      list.data.files.length === 0 ||
      !list.data.files === undefined
    ) {
      return [];
    }

    return list.data.files as FileGD[];
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

const gdrive = {
  listFiles,
};

export default gdrive;
