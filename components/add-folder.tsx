"use client";
import React, { useState } from "react";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type ParamsType = {
  handleAddFolderSuccess: any;
};

export default function AddFolderDialog({
  handleAddFolderSuccess,
}: ParamsType) {
  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleAddFolder = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", folderName);

    try {
      const response = await fetch("http://localhost:3000/api/drive/folder", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("Add folder successfully");
        handleAddFolderSuccess();
      } else {
        console.error("Failed to add folder");
      }
    } catch (error) {
      console.error("Failed to add folder", error);
    }
    
    setLoading(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"ghost"}>
            {loading && (
              <Image
                src="./images/loading.svg"
                width={30}
                height={30}
                alt="loading"
                className="animate-spin"
              />
            )}
            <Button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="white"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus -ml-1 mr-1"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Folder
            </Button>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <div className="flex items-center gap-2">
              <Input
                id="name"
                placeholder="New Folder Name"
                onChange={handleInputChange}
                value={folderName}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogTrigger>
              <Button type="submit" onClick={handleAddFolder}>
                Add Folder
              </Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
