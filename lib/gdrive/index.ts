import { drive, auth } from "@googleapis/drive";
import { Readable } from "stream";
import fs, { readFileSync } from 'fs';
import { Buffer, File } from "buffer";

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
      q: folderId ? `'${folderId}' in parents` : "trashed = false",
      fields: "files(id, mimeType, name)",
    });

    console.log('adakah? ',list.data.files);

    if (!list.data.files  || list.data.files.length === 0 || !list.data.files === undefined) {
      return [];
    }

    return list.data.files;

  } catch (error: any) {
    console.log(error);
    return {
      error: error.message
    };
  }

}

export async function uploadFile(
  name: string,
  mimeType: string,
  content: string,
  parent?: string[]
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

  const file = await driveClient.files.create({
    requestBody: fileMetadata,
    media,
  });
  console.log(file.data);
  return file.data;
}

export async function uploadSingleFile(
  fileRead: any,
  parent?: string[]
) {
  const driveClient = await getDriveClient();

  const fileMetadata = {
    name: fileRead.name,
    parents: parent,
  };

  const buffer = Buffer.from(fileRead)

  const fileUrl = URL.createObjectURL(fileRead);

  const media = {
    mimeType: fileRead.type,
    body: toReadableStream(buffer),
  };

  const file = await driveClient.files.create({
    requestBody: fileMetadata,
    media,
  });
  console.log(file.data);
  return file.data;
}
export async function uploadBufferFile(
  fileRead: any,
  parent?: string[]
) {
  const driveClient = await getDriveClient();

  const fileMetadata = {
    name: fileRead.name,
    parents: parent,
  };

  const media = {
    mimeType: fileRead.type,
    body: new ReadableStream({
      start(controller) {
        const array = new Uint8Array(fileRead.content);
        controller.enqueue(array);
        controller.close();
      }
    }),
  };

  const file = await driveClient.files.create({
    requestBody: fileMetadata,
    media,
  });
  console.log(file.data);
  return file.data;
}

function arrayBufferToWritableStream(buffer: ArrayBuffer): WritableStream<Uint8Array> {
  const stream = new WritableStream({
    write(chunk) {
      // Do something with the chunk
    }
  });
  const writer = stream.getWriter();
  const array = new Uint8Array(buffer);
  writer.write(array);
  writer.close();
  return stream;
}

function arrayBufferToReadableStream(buffer: ArrayBuffer): ReadableStream<Uint8Array> {
  const array = new Uint8Array(buffer);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(array);
      controller.close();
    }
  });
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

  return file.data;
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
