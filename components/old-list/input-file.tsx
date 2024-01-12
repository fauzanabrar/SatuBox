"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useListStore, { ListStore } from "@/lib/zustand/useListStore";
import React from "react";
import Loading from "../loading";
import { usePathname } from "next/navigation";

interface InputFileProps extends React.HTMLAttributes<HTMLInputElement> {}

export default function InputFile({}: InputFileProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { refreshList, setIsChanged } = useListStore((store: ListStore) => ({
    refreshList: store.refreshList,
    setIsChanged: store.setIsChanged,
  }));

  const pathnames = usePathname();
  const lastPath = pathnames.split("/").pop();

  let folderId = "";

  if (lastPath !== "list" && lastPath) {
    folderId = lastPath;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileUpload: any = event.target.files ? event.target.files[0] : null;
    setFile(fileUpload);
  };

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      formData.append("id", folderId);

      try {
        const response = await fetch("http://localhost:3000/api/drive/upload", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          setIsChanged(true);
          refreshList(folderId);
          console.log("File uploaded successfully");
        } else {
          console.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Failed to upload file", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="flex gap-5">
        <form onSubmit={(event) => handleFileSubmit(event)}>
          <div className="flex w-full max-w-sm items-center space-x-2 my-2">
            <Input type="file" onChange={handleFileChange} />
            <Button>Upload</Button>
          </div>
        </form>
        <Loading loading={loading} size={30} />
      </div>
    </>
  );
}
