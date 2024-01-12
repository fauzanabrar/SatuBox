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
import { usePathname } from "next/navigation";
import Loading from "../loading";
import { mutateList } from "@/hooks/useSWRList";

export default function AddFolderDialog() {
  const [loadingFolder, setLoadingFolder] = useState(false);

  const [folderName, setFolderName] = useState("");

  const pathnames = usePathname();
  const lastPath = pathnames.split("/").pop();

  let folderId = "";

  if (lastPath !== "list-swr" && lastPath) {
    folderId = lastPath;
  }

  const handleAddFolder = async () => {
    if (folderName !== "") {
      try {
        setLoadingFolder(true);
        const body = {
          folderName,
        };
        const response = await fetch(`/api/v2/drive/folder/${folderId}`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (response.ok) {
          mutateList();
          console.log("Add folder successfully");
        } else {
          console.error("Failed to add folder");
        }
      } catch (error) {
        console.error("Failed to add folder", error);
      } finally {
        setLoadingFolder(false);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex gap-5">
            <Loading size={30} loading={loadingFolder} />
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
          </div>
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
            <DialogTrigger asChild>
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
