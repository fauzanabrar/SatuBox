export const DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

const DRIVE_FILE_TYPE_MAP: Record<string, string> = {
  "application/vnd.google-apps.folder": "folder",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "doc",
  "application/vnd.google-apps.document": "doc",
  "application/vnd.ms-excel": "sheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sheet",
  "application/vnd.google-apps.spreadsheet": "sheet",
  "application/vnd.ms-powerpoint": "slide",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "slide",
  "application/vnd.google-apps.presentation": "slide",
  "application/zip": "archive",
  "application/x-zip-compressed": "archive",
  "application/x-7z-compressed": "archive",
  "application/x-rar-compressed": "archive",
  "application/x-tar": "archive",
  "application/gzip": "archive",
  "image/jpeg": "image",
  "image/gif": "image",
  "image/png": "image",
};

export const resolveDriveFileType = (mimeType?: string | null) => {
  const resolved = mimeType ? DRIVE_FILE_TYPE_MAP[mimeType] : undefined;
  if (resolved) return resolved;

  if (!mimeType) return "file";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("text/")) return "text";
  return "file";
};

export const isTextMimeType = (mimeType?: string | null) =>
  Boolean(mimeType && mimeType.startsWith("text/"));
