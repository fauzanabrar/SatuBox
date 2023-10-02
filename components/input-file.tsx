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

  return (
    <div className="flex w-full max-w-sm items-center space-x-2 my-4">
      <form onSubmit={(event) => handleFileSubmit(event)}>
        <Input type="file" onChange={handleFileChange} />
        <Button>Upload</Button>
      </form>
    </div>
  );
}
