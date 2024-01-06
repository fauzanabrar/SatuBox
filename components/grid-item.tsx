"use client";
import Image from "next/image";

import { cn } from "@/lib/utils";
import useListStore, { ListStore } from "@/lib/zustand/useListStore";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import React, { useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Loading from "./loading";
import { usePathname, useRouter } from "next/navigation";
import { LucideMoreVertical, LucidePlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogItem } from "@/components/dialog-item";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DialogItemRename from "@/components/dialog-item-rename";
import DialogItemRestrict from "./dialog-item-restrict";

type Item = {
  id: string;
  name: string;
  cover?: string;
  type: string;
  restrict?: boolean;
  whitelist?: string[];
};

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: Item;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
}

export function GridItem({
  item,
  aspectRatio = "portrait",
  width,
  height,
  className,
  ...props
}: GridItemProps) {
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

  const [inputEmail, setInputEmail] = useState("");
  const [restrictSelected, setRestrictSelected] = useState(
    item.restrict ? item.restrict : false
  );

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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasOpenDialog, setHasOpenDialog] = useState(false);
  const dropdownTriggerRef = useRef<null | HTMLButtonElement>(null);
  const focusRef = useRef<null | HTMLButtonElement>(null);

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current;
  };

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open);
    if (!open) {
      setDropdownOpen(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)} {...props}>
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
      <div className="space-y-1 text-sm flex align-middle items-center justify-between h-fit py-1">
        <h3 className="font-medium text-wrap leading-none px-2">{item.name}</h3>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <LucideMoreVertical className={"w-5 h-5"} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-40"
              align="start"
              hidden={hasOpenDialog}
              onCloseAutoFocus={(event) => {
                if (focusRef.current) {
                  focusRef.current.focus();
                  focusRef.current = null;
                  event.preventDefault();
                }
              }}
            >
              <DialogItemRename
                handleDialogItemSelect={handleDialogItemSelect}
                handleDialogItemOpenChange={handleDialogItemOpenChange}
                newName={newName}
                setNewName={setNewName}
                loadingRename={loadingRename}
                handleRename={handleRename}
                setIsRename={setIsRename}
                defaultName={item.name}
              />
              <DialogItemRestrict
                handleDialogItemSelect={handleDialogItemSelect}
                handleDialogItemOpenChange={handleDialogItemOpenChange}
                inputEmail={inputEmail}
                setInputEmail={setInputEmail}
                restrictSelected={restrictSelected}
                setRestrictSelected={setRestrictSelected}
                handleAddWhitelist={() => {
                  return Promise.resolve();
                }}
              />
              <DropdownMenuItem onClick={() => handleDelete()}>
                <span className={"text-destructive"}> Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
