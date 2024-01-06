"use client";
import Image from "next/image";

import {cn} from "@/lib/utils";
import useListStore, {ListStore} from "@/lib/zustand/useListStore";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import React, {useRef, useState} from "react";
import {Input} from "./ui/input";
import {Button} from "./ui/button";
import Loading from "./loading";
import {usePathname, useRouter} from "next/navigation";
import {LucideMoreVertical, LucidePlus} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {DialogItem} from "@/components/dialog-item";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";

type Item = {
  id: string;
  name: string;
  cover?: string;
  type: string;
  restrict?: string;
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

  const {refreshList, setLoadingList, setIsChanged, changeAllFilesWithId} =
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
  const [restrictSelected, setRestrictSelected] = useState(item.restrict ? item.restrict : false);

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

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hasOpenDialog, setHasOpenDialog] = useState(false)
  const dropdownTriggerRef = useRef<null | HTMLButtonElement>(null)
  const focusRef = useRef<null | HTMLButtonElement>(null)

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current
  }

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open)
    if (!open) {
      setDropdownOpen(false)
    }
  }

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
        <h3 className="font-medium text-wrap leading-none px-2">
          {item.name}
        </h3>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger>
                <LucideMoreVertical className={"w-5 h-5"}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-40"
              align="start"
              hidden={hasOpenDialog}
              onCloseAutoFocus={event => {
                if (focusRef.current) {
                  focusRef.current.focus()
                  focusRef.current = null
                  event.preventDefault()
                }
              }}
            >
              <DialogItem
                className={"w-96"}
                triggerChildren={
                  <>
                    <span>Rename</span>
                  </>
                }
                onSelect={() => {
                  setNewName(item.name)
                  handleDialogItemSelect()
                }}
                onOpenChange={handleDialogItemOpenChange}
              >
                <DialogTitle>Rename this file</DialogTitle>
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
                      {loadingRename && <Loading loading={loadingRename} size={30}/>}
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
                  <DialogClose asChild={true}>
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        setIsRename(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogItem>

              <DialogItem
                triggerChildren={
                  <>
                    <span>Restrict</span>
                  </>
                }
                onSelect={handleDialogItemSelect}
                onOpenChange={handleDialogItemOpenChange}
                className={"w-max"}
              >
                <DialogTitle>Restrict This File</DialogTitle>
                <div className="grid gap-4 py-1">
                  <div className={'flex gap-4 items-center justify-between mb-2'}>
                    <p className={'font-medium text-sm'}>Access</p>
                    <Select onValueChange={(value) => {
                      if(value === "Public") setRestrictSelected(false)
                      else setRestrictSelected(true)
                    }}>
                      <SelectTrigger className={'w-24'}>
                        <SelectValue placeholder={"Public"}/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={"Public"} >Public</SelectItem>
                        <SelectItem value={"Restrict"} >Restrict</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {restrictSelected && (
                    <>
                      <Separator/>
                      <span className={'font-bold text-sm'}>Add whitelist</span>
                      <div className="flex items-center gap-2">
                        <Input
                          id="name"
                          placeholder="example@gmail.com"
                          onChange={(e) => {
                            setInputEmail(e.target.value);
                          }}
                          value={newName}
                        />
                        <DialogTrigger asChild>
                          <div className="flex gap-2 sm:flex-col sm:gap-4">
                            {loadingRename && <Loading loading={loadingRename} size={30}/>}
                            <Button
                              variant={"outline"}
                              className="px-2"
                              type="submit"
                              onClick={async () => {
                                await handleRename();
                              }}
                            >
                              <LucidePlus className={"w-4 mr-1"}/>
                              Add
                            </Button>
                          </div>
                        </DialogTrigger>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild={true}>
                    <Button
                      variant={"default"}
                    >
                      Done
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogItem>
              <DropdownMenuItem
                onClick={() => handleDelete()}
              >
                <span className={"text-destructive"}>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
    ;
}
