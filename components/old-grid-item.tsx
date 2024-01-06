"use client";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import useListStore, { ListStore } from "@/lib/zustand/useListStore";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Loading from "./loading";
import { usePathname, useRouter } from "next/navigation";
import { LucideMoreVertical } from "lucide-react";

type Item = {
  id: string;
  name: string;
  cover?: string;
  type: string;
};

interface OldGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: Item;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
}

export function OldGridItem({
  item,
  aspectRatio = "portrait",
  width,
  height,
  className,
  ...props
}: OldGridItemProps) {
  const router = useRouter();
  const pathnames = usePathname();

  const lastPath = pathnames.split("/").pop();

  let folderId = "";

  if (lastPath !== "list" && lastPath) {
    folderId = lastPath;
  }

  const { refreshList, setLoadingList, setIsChanged, changeAllFilesWithId } =
    useListStore((store: ListStore) => ({
      refreshList: store.refreshList,
      setLoadingList: store.setLoadingList,
      setIsChanged: store.setIsChanged,
      changeAllFilesWithId: store.changeAllFilesWithId,
    }));

  const [newName, setNewName] = useState("");
  const [isRename, setIsRename] = useState(false);
  const [loadingRename, setLoadingRename] = useState(false);

  const image = (item: Item) => {
    if (item.type.includes("image")) return item.cover;
    if (item.type.includes("video")) return "/images/play.svg";
    if (item.type.includes("folder")) return "/images/folder.svg";
    return "/images/file.svg";
  };

  const handleDetail = () => {
    console.log("detail");
    console.log(item);
  };

  const handleRename = async () => {
    console.log("rename");
    setLoadingList(true);
    setLoadingRename(true);
    const formData = new FormData();
    formData.append("name", newName);
    try {
      const response = await fetch(
        `http://localhost:3000/api/drive/file/${item.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.status === 200) {
        console.log("rename berhasil");
        changeAllFilesWithId(item.id);
        setIsChanged(true);
        refreshList(folderId);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingRename(false);
      setIsRename(false);
    }
  };

  const handleOpen = () => {
    console.log("open");
    window.open(`https://drive.google.com/file/d/${item.id}/view`, "_blank");
  };

  const handleOpenFolder = () => {
    setLoadingList(true);
    setIsChanged(true);
    router.push(`${pathnames}/${item.id}`);
  };

  const handleDelete = async () => {
    console.log("delete");
    setLoadingList(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/drive/file/${item.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      console.log(data);
      if (data.status === 200) {
        console.log("delete berhasil");
        changeAllFilesWithId(item.id);
        setIsChanged(true);
        refreshList(folderId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Dialog open={isRename} onOpenChange={setIsRename}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="overflow-hidden rounded-md">
              <Image
                src={image(item) as string}
                alt={item.name}
                width={width}
                height={height}
                className={cn(
                  "h-full w-full object-cover transition-all hover:scale-105",
                  aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                )}
                onClick={() => {
                  if (image(item) === "/images/folder.svg") {
                    handleOpenFolder();
                  } else {
                    handleOpen();
                  }
                }}
              />
            </div>
          </ContextMenuTrigger>
          <div className="space-y-1 text-sm flex align-middle items-center justify-between h-fit py-1">
            <h3 className="font-medium leading-none break-all px-2">
              {item.name}
            </h3>
            <div>
              <ContextMenuTrigger
                onMouseDown={(e) => {
                  if (e.button === 0) {
                    // 0 is the left mouse button
                    e.preventDefault(); // prevent the default left click behavior
                    e.target.dispatchEvent(
                      new MouseEvent("contextmenu", {
                        // dispatch a right click event
                        bubbles: true,
                        cancelable: false,
                        view: window,
                        button: 2, // 2 is the right mouse button
                        buttons: 2,
                        clientX: e.clientX,
                        clientY: e.clientY,
                      })
                    );
                  }
                }}
              >
                <Button variant={"ghost"} className={"px-1"}>
                  <LucideMoreVertical className={"w-5 h-5"} />
                </Button>
              </ContextMenuTrigger>
            </div>
          </div>
          <ContextMenuContent className="w-40">
            <ContextMenuItem onClick={() => handleOpen()}>Open</ContextMenuItem>
            <DialogTrigger asChild>
              <ContextMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setNewName(item.name);
                  setIsRename(true);
                }}
              >
                <span>Rename</span>
              </ContextMenuItem>
            </DialogTrigger>
            <ContextMenuItem onClick={() => handleDetail()}>
              Detail
            </ContextMenuItem>
            <ContextMenuItem
              className="text-red-600"
              onClick={() => handleDelete()}
            >
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <div className="flex items-center gap-2">
              <Input
                id="name"
                placeholder="New File Name"
                onChange={(e) => {
                  setNewName(e.target.value);
                }}
                value={newName}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogTrigger asChild>
              <div className="flex gap-2 sm:flex-col sm:gap-4">
                {loadingRename && <Loading loading={loadingRename} size={30} />}
                <Button
                  className=""
                  type="submit"
                  onClick={async () => {
                    await handleRename();
                  }}
                >
                  Submit
                </Button>
              </div>
            </DialogTrigger>
            <Button
              variant={"outline"}
              onClick={() => {
                setIsRename(false);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
