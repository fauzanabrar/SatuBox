"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

export function InputFile() {
  const [file, setFile] = React.useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileUpload: any = event.target.files ? event.target.files[0] : null;
    setFile(fileUpload);
  };

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:3000/api/drive/upload", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          console.log("File uploaded successfully");
        } else {
          console.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Failed to upload file", error);
      }
    }
  };

  const handleGetFile = async () => {
    const id = "1rqcRIZ_fqWOncpsqcwtY6H0Jz0DjdJ49";
    try {
      const response = await fetch(
        `http://localhost:3000/api/drive/file/${id}`
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        console.log("File uploaded successfully");
      } else {
        console.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Failed to upload file", error);
    }
  };

  return (
    <>
      <form onSubmit={(event) => handleFileSubmit(event)}>
        <div className="flex w-full max-w-sm items-center space-x-2 my-4">
          <Input type="file" onChange={handleFileChange} />
          <Button>Upload</Button>
        </div>
      </form>
      <Button onClick={handleGetFile}>GetFile</Button>
    </>
  );
}
