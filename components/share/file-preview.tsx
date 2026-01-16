import Image from "next/image";
import TextPreview from "@/components/share/text-preview";
import { isTextMimeType } from "@/lib/constants/drive";

type FilePreviewProps = {
  fileId: string;
  mimeType: string;
  fileName: string;
};

export default function FilePreview({
  fileId,
  mimeType,
  fileName,
}: FilePreviewProps) {
  const mediaUrl = `/api/v2/share/media/${fileId}`;

  if (mimeType.startsWith("image/")) {
    return (
      <Image
        src={mediaUrl}
        alt={`Preview of ${fileName}`}
        width={1200}
        height={1200}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="h-auto w-full rounded-xl border border-border object-contain"
      />
    );
  }

  if (mimeType.startsWith("video/")) {
    return (
      <video
        controls
        preload="metadata"
        className="w-full rounded-xl border border-border"
        src={mediaUrl}
      />
    );
  }

  if (mimeType.startsWith("audio/")) {
    return (
      <audio
        controls
        preload="metadata"
        className="w-full rounded-xl border border-border"
        src={mediaUrl}
      />
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <iframe
        title={`PDF preview for ${fileName}`}
        src={mediaUrl}
        className="h-[70vh] w-full rounded-xl border border-border"
      />
    );
  }

  if (isTextMimeType(mimeType)) {
    return <TextPreview fileId={fileId} mimeType={mimeType} />;
  }

  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 text-sm text-muted-foreground">
      Preview is not available for this file type.
    </div>
  );
}
