import { Button } from "@/components/ui/button";
import { getRestrictByFileId } from "@/lib/firebase/db/restrict";
import { getDriveClient } from "@/lib/gdrive";
import { notFound } from "next/navigation";

const folderMimeType = "application/vnd.google-apps.folder";

const formatBytes = (size?: number | null) => {
  if (size === null || size === undefined || Number.isNaN(size)) {
    return "Size unavailable";
  }
  if (size === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  const value = size / Math.pow(1024, power);
  return `${value.toFixed(value >= 10 || power === 0 ? 0 : 1)} ${
    units[power]
  }`;
};

const buildPreview = (id: string, mimeType: string) => {
  if (mimeType.startsWith("image/")) {
    return (
      <img
        src={`/api/v2/share/media/${id}`}
        alt="Shared file preview"
        className="h-auto w-full rounded-xl border border-slate-200 object-contain"
      />
    );
  }

  if (mimeType.startsWith("video/")) {
    return (
      <video
        controls
        preload="metadata"
        className="w-full rounded-xl border border-slate-200"
        src={`/api/v2/share/media/${id}`}
      />
    );
  }

  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
      Preview is not available for this file type.
    </div>
  );
};

export default async function ShareFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const restrict = await getRestrictByFileId(id);
  if (restrict) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Access Restricted
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">
            This file is private
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The owner restricted access to this file.
          </p>
        </div>
      </div>
    );
  }

  let file:
    | { name?: string | null; mimeType?: string | null; size?: string | null }
    | null = null;
  try {
    const driveClient = await getDriveClient();
    const response = await driveClient.files.get({
      fileId: id,
      fields: "id, name, mimeType, size",
    });
    file = response.data;
  } catch (error: any) {
    notFound();
  }

  if (!file || file.mimeType === folderMimeType) {
    notFound();
  }

  const mimeType = file.mimeType || "application/octet-stream";
  const fileName = file.name || "Untitled file";
  const size = file.size ? Number(file.size) : null;
  const sizeLabel = formatBytes(size);
  const downloadLabel = `Download (${sizeLabel})`;
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Shared file
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {fileName}
              </h1>
              <p className="text-sm text-slate-500">
                {`Size: ${sizeLabel}`}
              </p>
            </div>
            <Button asChild>
              <a
                href={`/api/v2/share/download/${id}`}
                className="w-full sm:w-auto"
              >
                {downloadLabel}
              </a>
            </Button>
          </div>
          <div className="mt-6">
            {buildPreview(id, mimeType)}
          </div>
        </div>
        <div className="text-center text-xs text-slate-400">
          Shared with a public link.
        </div>
      </div>
    </div>
  );
}
