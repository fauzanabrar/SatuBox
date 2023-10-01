import { drive, auth } from "@googleapis/drive";

export async function getDriveClient() {
  const driveClient = drive({
    version: "v3",
    auth: new auth.GoogleAuth({
      keyFile: "./credentials.json",
      scopes: "https://www.googleapis.com/auth/drive",
    }),
  });

  return driveClient;
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

export async function listFiles() {
  const driveClient = await getDriveClient();

  const lis = await driveClient.files.list({
    fields: "files(id, name)",
  });

  return lis.data;
}

export async function uploadFile(
  name: string,
  parent: string[],
  content: string
) {
  const driveClient = await getDriveClient();

  const fileMetadata = {
    name,
    parents: parent,
  };

  const media = {
    mimeType: "text/plain",
    body: content,
  };

  const file = await driveClient.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id",
  });

  return file.data;
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
