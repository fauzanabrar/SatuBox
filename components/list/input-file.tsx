"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import Loading from "../loading";
import { mutateList } from "@/hooks/useSWRList";
import { Progress } from "../ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";

interface InputFileProps extends React.HTMLAttributes<HTMLInputElement> {}

const CHUNK_SIZE = 100 * 1024 * 1024;

export default function InputFile({}: InputFileProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [loading, setLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const inputFileRef = useRef<HTMLInputElement>(null);

  const pathnames = usePathname();
  const lastPath = pathnames.split("/").pop();

  let folderId = "";

  if (lastPath !== "list" && lastPath) {
    folderId = lastPath;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesUpload = event.target.files ? event.target.files : [];
    setFiles(Array.from(filesUpload));
    setErrorMessage("");
  };

  const parseRangeEnd = (range: string | null | undefined) => {
    if (!range) return null;
    const match = /bytes(?:=| )0-(\d+)/i.exec(range);
    if (!match) return null;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const startResumableUpload = async (file: File) => {
    const startUrl = folderId
      ? `/api/v2/drive/resumable/${folderId}`
      : "/api/v2/drive/resumable";
    const response = await fetch(startUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status !== 200 || !data?.uploadId) {
      const message =
        data?.error || data?.message || "Failed to start upload session.";
      throw new Error(message);
    }

    return data.uploadId as string;
  };

  const uploadChunk = async (
    uploadId: string,
    chunk: Blob,
    start: number,
    end: number,
    total: number,
  ) => {
    const chunkUrl = `/api/v2/drive/chunk/${uploadId}`;
    const response = await fetch(chunkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-upload-start": start.toString(),
        "x-upload-end": end.toString(),
        "x-upload-total": total.toString(),
        "x-upload-size": chunk.size.toString(),
      },
      body: chunk,
    });

    const data = await response.json().catch(() => null);

    if (response.status === 308) {
      return {
        completed: false,
        rangeEnd: parseRangeEnd(data?.range),
      };
    }

    if (!response.ok || data?.status !== 200) {
      const message =
        data?.error || data?.message || "Failed to upload chunk.";
      throw new Error(message);
    }

    return { completed: true, rangeEnd: null };
  };

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length < 1) {
      setErrorMessage("Please choose a file to upload.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    setProgress(0);

    try {
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
      let uploadedBytes = 0;

      for (const file of files) {
        const uploadId = await startResumableUpload(file);
        let offset = 0;

        while (offset < file.size) {
          const chunk = file.slice(offset, offset + CHUNK_SIZE);
          const start = offset;
          const end = offset + chunk.size - 1;

          const result = await uploadChunk(
            uploadId,
            chunk,
            start,
            end,
            file.size,
          );

          const nextOffset =
            result.rangeEnd !== null ? result.rangeEnd + 1 : end + 1;
          offset = Math.min(nextOffset, file.size);

          const totalUploaded = uploadedBytes + offset;
          const percent =
            totalBytes > 0
              ? Math.min(100, Math.round((totalUploaded / totalBytes) * 100))
              : 0;
          setProgress(percent);
        }

        uploadedBytes += file.size;
      }

      setProgress(100);
      setFiles([]);
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload file", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload file.",
      );
    } finally {
      setLoading(false);
      mutateList(folderId);
    }
  };

  const handleUploadModeChange = (mode: "file" | "url") => {
    setUploadMode(mode);
    setFiles([]);
    setFileUrl("");
    setErrorMessage("");
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  const handleUrlSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUrl = fileUrl.trim();
    if (!trimmedUrl) {
      setErrorMessage("Please enter a file URL.");
      return;
    }

    setErrorMessage("");
    setUrlLoading(true);

    const urlPath = folderId
      ? `/api/v2/drive/url/${folderId}`
      : "/api/v2/drive/url";

    try {
      const response = await fetch(urlPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.status === 200) {
        setFileUrl("");
      } else {
        const message =
          data?.error || data?.message || "Failed to upload file from URL.";
        console.error("Failed to upload file from url");
        setErrorMessage(message);
      }
    } catch (error) {
      console.error("Failed to upload file from url", error);
      setErrorMessage("Failed to upload file from URL.");
    } finally {
      setUrlLoading(false);
      mutateList(folderId);
    }
  };

  const isBusy = loading || urlLoading;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-5">
        <form
          onSubmit={uploadMode === "file" ? handleFileSubmit : handleUrlSubmit}
        >
          <div className="my-2 flex w-full max-w-sm items-center space-x-2">
            {uploadMode === "file" ? (
              <Input
                key="upload-file"
                type="file"
                onChange={handleFileChange}
                ref={inputFileRef}
                multiple
              />
            ) : (
              <Input
                key="upload-url"
                type="url"
                placeholder="https://example.com/file.pdf"
                value={fileUrl}
                onChange={(event) => setFileUrl(event.target.value)}
              />
            )}
            <div className="flex items-center">
              <Button className="rounded-r-none">Upload</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="rounded-l-none border-l border-primary/30 px-2"
                    type="button"
                    disabled={isBusy}
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup
                    value={uploadMode}
                    onValueChange={(value) =>
                      handleUploadModeChange(value as "file" | "url")
                    }
                  >
                    <DropdownMenuRadioItem value="file">
                      Upload from local
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="url">
                      Upload from URL
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {uploadMode === "file" && loading && <Progress value={progress} />}
          {errorMessage && (
            <p className="text-sm font-medium text-destructive">
              {errorMessage}
            </p>
          )}
        </form>
        <Loading loading={isBusy} size={30} />
      </div>
    </div>
  );
}
