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
import useListStore from "@/lib/zustand/useListStore";
import Loading from "./loading";
import { usePathname, useRouter } from "next/navigation";

export default function AddFolderDialog() {
  const [loadingFolder, setLoadingFolder] = useState(false);
  const { refreshList } = useListStore((store: any) => ({
    refreshList: store.refreshList,
  }));

  const [folderName, setFolderName] = useState("");

  const pathnames = usePathname();
  const lastPath = pathnames.split("/").pop();

  let folderId = ""

  if (lastPath !== "list" && lastPath) {
    folderId = lastPath
  }


  const handleAddFolder = async () => {
    if (folderName !== "") {
      const formData = new FormData();
      formData.append("name", folderName);
      formData.append("id", folderId);

      try {
        setLoadingFolder(true);
        const response = await fetch("http://localhost:3000/api/drive/folder", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          console.log("Add folder successfully");
          refreshList(folderId);
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
