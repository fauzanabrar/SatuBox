"use client";

import { useEffect, useState } from "react";

type Props = {
  fileId: string;
  mimeType: string;
};

const MAX_PREVIEW_BYTES = 200 * 1024;
const PREVIEW_LABEL = "200 KB";

const parseContentRangeTotal = (contentRange: string | null) => {
  if (!contentRange) return null;
  const match = /\/(\d+)$/.exec(contentRange);
  if (!match) return null;
  const total = Number(match[1]);
  return Number.isFinite(total) ? total : null;
};

export default function TextPreview({ fileId, mimeType }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadPreview = async () => {
      setContent(null);
      setError(null);
      setTruncated(false);

      try {
        const previewUrl = `/api/v2/share/media/${fileId}`;
        let response = await fetch(previewUrl, {
          headers: {
            Range: `bytes=0-${MAX_PREVIEW_BYTES - 1}`,
          },
          signal: controller.signal,
        });

        if (response.status === 416) {
          response = await fetch(previewUrl, { signal: controller.signal });
        }

        if (!response.ok) {
          throw new Error("Preview not available for this file type.");
        }

        const totalBytes = parseContentRangeTotal(
          response.headers.get("content-range"),
        );
        if (totalBytes && totalBytes > MAX_PREVIEW_BYTES) {
          setTruncated(true);
        } else if (response.status === 206 && !totalBytes) {
          setTruncated(true);
        }

        const text = await response.text();
        if (!active) return;
        setContent(text);
      } catch (err: any) {
        if (!active || err?.name === "AbortError") return;
        setError(err?.message || "Failed to load preview.");
      }
    };

    loadPreview();

    return () => {
      active = false;
      controller.abort();
    };
  }, [fileId]);

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 text-sm text-muted-foreground">
        Loading preview...
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 text-sm text-muted-foreground">
        This file is empty.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
        <span>Text preview</span>
        <span>{truncated ? `Showing first ${PREVIEW_LABEL}` : mimeType}</span>
      </div>
      <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words px-4 py-3 text-sm font-mono text-foreground">
        {content}
      </pre>
    </div>
  );
}
