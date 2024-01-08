import { auth, drive } from "@googleapis/drive";
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

async function listFiles(folderId?: string): Promise<FileGD[]> {
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

async function getFolderName(id: string): Promise<string> {
  const driveClient = await getDriveClient();

  const file = await driveClient.files.get({
    fileId: id,
    fields: "name",
  });

  return file.data.name as string;
}

async function getMedia(id: string): Promise<string> {
  const driveClient = await getDriveClient();

  const file = await driveClient.files.get(
    {
      fileId: id,
      alt: "media",
    },
    { responseType: "stream" }
  );

  return new Promise((resolve, reject) => {
    let buf: any = [];
    file.data
      .on("data", (d) => {
        buf.push(d);
      })
      .on("end", () => {
        let img = Buffer.concat(buf).toString("base64");
        resolve(img);
      });
  });
}

const gdrive = {
  listFiles,
  getMedia,
  getFolderName,
};

export default gdrive;
