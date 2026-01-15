import { auth, drive } from "@googleapis/drive";
import { Buffer } from "buffer";
import { Readable } from "stream";
import { cache, cacheKey, deleteCache, deleteCaches } from "../node-cache";

let dClient: ReturnType<typeof drive> | undefined;
let parsedCredentials: auth.GoogleAuthOptions["credentials"] | null = null;

const getCredentials = () => {
  if (parsedCredentials) return parsedCredentials;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT is not defined");
  }

  try {
    parsedCredentials = JSON.parse(raw);
  } catch (error: any) {
    throw new Error(
      `Failed to parse GOOGLE_SERVICE_ACCOUNT: ${error?.message ?? error}`,
    );
  }

  return parsedCredentials;
};

export async function getDriveClient() {
  if (!dClient) {
    dClient = drive({
      version: "v3",
      auth: new auth.GoogleAuth({
        credentials: getCredentials(),
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
  size?: string;
};

async function listFiles(folderId: string): Promise<FileGD[]> {
  const [cacheData, setCacheData] = cache(cacheKey.folder(folderId));

  if (cacheData) return cacheData as FileGD[];

  try {
    const driveClient = await getDriveClient();

    const list = await driveClient.files.list({
      q: folderId
        ? `'${folderId}' in parents AND trashed = false`
        : "trashed = false",
      fields: "files(id, mimeType, name, size, parents)",
    });

    if (
      !list.data.files ||
      list.data.files.length === 0 ||
      !list.data.files === undefined
    ) {
      return [];
    }
    setCacheData(list.data.files as FileGD[]);

    return list.data.files as FileGD[];
  } catch (error: any) {
    throw new Error(error);
  }
}

async function getFile(id: string) {
  const [cacheData, setCacheData] = cache(cacheKey.file(id));

  if (cacheData) return cacheData;

  const driveClient = await getDriveClient();

  const file = await driveClient.files.get({
    fileId: id,
    fields: "id, name, mimeType, size, parents",
  });

  setCacheData(file.data);

  return file;
}

async function getFolderName(id: string): Promise<string> {
  const [cacheData, setCacheData] = cache(cacheKey.folderName(id));

  if (cacheData) return cacheData;

  const driveClient = await getDriveClient();

  const file = await driveClient.files.get({
    fileId: id,
    fields: "name",
  });

  setCacheData(file.data.name);

  return file.data.name as string;
}

async function getMedia(id: string): Promise<string> {
  const [cacheData, setCacheData] = cache(cacheKey.media(id));

  if (cacheData) return cacheData;

  const driveClient = await getDriveClient();

  const file = await driveClient.files.get(
    {
      fileId: id,
      alt: "media",
    },
    { responseType: "stream" },
  );

  return new Promise((resolve, reject) => {
    let buf: any = [];
    file.data
      .on("data", (d) => {
        buf.push(d);
      })
      .on("end", () => {
        const img = Buffer.concat(buf).toString("base64");

        setCacheData(img);

        resolve(img);
      });
  });
}

async function getAllParentsFolder(folderId: string): Promise<any> {
  const [cacheData, setCacheData] = cache(cacheKey.parentsFolder(folderId));

  if (cacheData) return cacheData;

  const driveClient = await getDriveClient();

  const file = await driveClient.files.get({
    fileId: folderId,
    fields: "id, name, mimeType, parents",
  });

  if (!file.data.parents || file.data.parents.length === 0) {
    return [];
  }

  const parents = {
    currentId: file.data.id,
    currentName: file.data.name,
    id: file.data.parents[0],
  };

  setCacheData(parents);

  return parents;
}

async function createFolder(name: string, parent: string[]) {
  const driveClient = await getDriveClient();

  const folderMetadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: parent,
  };

  const folder = await driveClient.files.create({
    requestBody: folderMetadata,
    fields: "id",
  });

  deleteCache(parent[0]);

  return folder.data.id as string;
}

async function renameFileOrFolder(id: string, name: string, parents: string[]) {
  const driveClient = await getDriveClient();

  const fileMetadata = {
    name,
  };

  const file = await driveClient.files.update({
    fileId: id,
    requestBody: fileMetadata,
  });

  deleteCaches(parents);

  return file.data as { id: string; name: string };
}

async function uploadFile(
  name: string,
  mimeType: string,
  content: Readable,
  parent?: string[],
) {
  const driveClient = await getDriveClient();

  const fileMetadata = {
    name,
    parents: parent,
  };

  const media = {
    mimeType,
    body: content,
  };

  const response = await driveClient.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, size",
  });

  deleteCaches((parent as string[]) ?? [process.env.GOOGLE_SERVICE_ACCOUNT]);

  return response.data as { id?: string; size?: string };
}

async function deleteFileOrFolder(id: string, parents: string[]) {
  const driveClient = await getDriveClient();

  const file = await driveClient.files.delete({
    fileId: id,
  });

  deleteCaches(parents);

  return file;
}

const gdrive = {
  listFiles,
  getMedia,
  getFolderName,
  getFile,
  getAllParentsFolder,
  createFolder,
  uploadFile,
  renameFileOrFolder,
  deleteFileOrFolder,
};

export default gdrive;
