import { drive, auth } from "@googleapis/drive";
import { Readable } from "stream";
import { Buffer } from "buffer";

let dClient: ReturnType<typeof drive> | undefined;

export async function getDriveClient() {
  if (!dClient) {
    dClient = drive({
      version: "v3",
      auth: new auth.GoogleAuth({
        keyFile: "./credentials.json",
        scopes: "https://www.googleapis.com/auth/drive",
      }),
    });
  }

  return dClient;
}

export async function createFolder(name: string, parent?: string[]) {
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

  return folder.data;
}

interface File {
  id: string;
  name: string;
  mimeType: string;
  children?: File[];
}

export async function listFiles(folderId?: string) {
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

    return list.data.files;
  } catch (error: any) {
    console.log(error);
    return {
      error: error.message,
    };
  }
}

export async function uploadFile(
  name: string,
  mimeType: string,
  content: Buffer,
  parent?: string[]
) {
  const driveClient = await getDriveClient();

  const fileMetadata = {
    name,
    parents: parent,
  };

  const media = {
    mimeType,
    body: await toReadableStream(content),
  };

  const file = await driveClient.files.create({
    requestBody: fileMetadata,
    media,
  });
  console.log(file.data);
  return file.data;
}

export async function toReadableStream(file: any) {
  const readable = new Readable();
  readable.push(file);
  readable.push(null);

  return readable;
}

export async function getFile(id: string) {
  const driveClient = await getDriveClient();

  const file = await driveClient.files.get({
    fileId: id,
    fields: "id, name, mimeType",
  });

  return file.data;
}

export async function getFileContent(id: string) {
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

export async function getAllFilesAndFolder(parentId: string): Promise<any> {
  const driveClient = await getDriveClient();

  const list = await driveClient.files.list({
    q: `'${parentId}' in parents`,
    fields: "files(id, mimeType, name)",
  });

  if (!list.data.files || list.data.files.length === 0) {
    return [];
  }

  const files = list.data.files;

  const result = await Promise.all(
    files.map(async (file) => {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        const children = await getAllFilesAndFolder(file.id!);

        return {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          children,
        };
      }

      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
      };
    })
  );

  return result;
}

export async function downloadFile(id: string) {
  const driveClient = await getDriveClient();

  const file = await driveClient.files.get({
    fileId: id,
    alt: "media",
  });

  return file.data;
}

export async function deleteFile(id: string) {
  const driveClient = await getDriveClient();

  const file = await driveClient.files.delete({
    fileId: id,
  });

  return "success";
}

export async function updateFile(id: string, content: string) {
  const driveClient = await getDriveClient();

  const media = {
    mimeType: "text/plain",
    body: content,
  };

  const file = await driveClient.files.update({
    fileId: id,
    media,
  });

  return file.data;
}

export async function copyFile(id: string, name: string) {
  const driveClient = await getDriveClient();

  const fileMetadata = {
    name,
  };

  const file = await driveClient.files.copy({
    fileId: id,
    requestBody: fileMetadata,
  });

  return file.data;
}

export async function emptyTrash() {
  const driveClient = await getDriveClient();

  const file = await driveClient.files.emptyTrash({});

  return file.data;
}

export async function renameFile(id: string, name: string) {
  const driveClient = await getDriveClient();

  const fileMetadata = {
    name,
  };

  const file = await driveClient.files.update({
    fileId: id,
    requestBody: fileMetadata,
  });

  return file.data;
}

export async function deleteAllFiles(folderId?: string): Promise<any> {
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

    const files = list.data.files;

    const result = await Promise.all(
      files.map(async (file: any) => {
        // if (file.mimeType === "application/vnd.google-apps.folder") {
        //   const children = await deleteAllFiles(file.id!);

        //   return {
        //     id: file.id,
        //     name: file.name,
        //     mimeType: file.mimeType,
        //     children,
        //   };
        // }

        const response = await driveClient.files.delete({
          fileId: file.id,
        });

        return {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
        };
      })
    );

    return result;
  } catch (error: any) {
    console.log(error);
    return {
      error: error.message,
    };
  }
}
