"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import Loading from "../loading";
import { mutateList } from "@/hooks/useSWRList";
import axios from "axios";
import { Progress } from "../ui/progress";

interface InputFileProps extends React.HTMLAttributes<HTMLInputElement> {}

export default function InputFile({}: InputFileProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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
  };

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length > 0) {
      setLoading(true);
      setProgress(0);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      try {
        const response = await axios.post(
          `/api/v2/drive/file/${folderId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const { loaded, total } = progressEvent;
              let percent = Math.floor((loaded * 80) / (total as number));
              setProgress(percent);
            },
          }
        );
        if (response.status === 200) {
          setProgress(100);
          setFiles([]);
          if (inputFileRef.current) {
            inputFileRef.current.value = "";
          }
        } else {
          console.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Failed to upload file", error);
      } finally {
        setLoading(false);
        mutateList(folderId);
      }
    }
  };

  return (
    <div className="flex gap-5 items-center">
      <form onSubmit={(event) => handleFileSubmit(event)}>
        <div className="flex w-full max-w-sm items-center space-x-2 my-2">
          <Input
            type="file"
            onChange={handleFileChange}
            ref={inputFileRef}
            multiple
          />
          <Button>Upload</Button>
        </div>
        {loading && <Progress value={progress} />}
      </form>
      <Loading loading={loading} size={30} />
    </div>
  );
}
