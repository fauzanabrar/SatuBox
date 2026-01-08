"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import Loading from "../loading";
import { mutateList } from "@/hooks/useSWRList";
import axios from "axios";
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

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length < 1) {
      setErrorMessage("Please choose a file to upload.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const uploadUrl = folderId
        ? `/api/v2/drive/file/${folderId}`
        : "/api/v2/drive/file";
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          let percent = Math.floor((loaded * 80) / (total as number));
          setProgress(percent);
        },
      });
      if (response.status === 200) {
        setProgress(100);
        setFiles([]);
        if (inputFileRef.current) {
          inputFileRef.current.value = "";
        }
      } else {
        setErrorMessage("Failed to upload file.");
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string) ||
          "Failed to upload file."
        : "Failed to upload file.";
      console.error("Failed to upload file", error);
      setErrorMessage(message);
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

      if (response.ok) {
        setFileUrl("");
      } else {
        const data = await response.json().catch(() => null);
        const message =
          data?.message || "Failed to upload file from URL.";
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
          onSubmit={
            uploadMode === "file" ? handleFileSubmit : handleUrlSubmit
          }
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
          {uploadMode === "file" && loading && (
            <Progress value={progress} />
          )}
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
