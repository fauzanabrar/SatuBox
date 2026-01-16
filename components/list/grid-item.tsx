import { FileDrive } from "@/types/api/file";
import { LucideLock, LucideMoreVertical, Link, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { useMemo, useRef, useState } from "react";
import { mutateList } from "@/hooks/useSWRList";
import dynamic from "next/dynamic";
import DialogItemDelete from "./dialog-item/dialog-item-delete";
import { UserSession } from "@/types/api/auth";
import { useToast } from "../ui/use-toast";
import Switch from "../switch";
import Match from "../match";
import Show from "../show";

const Image = dynamic(() => import("next/image"), { ssr: false });

const DialogItemRename = dynamic(
  () => import("./dialog-item/dialog-item-rename"),
  {
    ssr: false,
  },
);

const DialogItemRestrict = dynamic(
  () => import("./dialog-item/dialog-item-restrict"),
  {
    ssr: false,
  },
);

const DialogItemPaidDownload = dynamic(
  () => import("./dialog-item/dialog-item-paid-download"),
  {
    ssr: false,
  },
);

const DialogItemDetails = dynamic(
  () => import("./dialog-item/dialog-item-details"),
  {
    ssr: false,
  },
);

type GridItemSWRProps = {
  item: FileDrive;
  folderId: string;
  userSession: UserSession;
};

export default function GridItemSWR({
  item,
  folderId,
  userSession,
}: GridItemSWRProps) {
  const router = useRouter();

  const { toast } = useToast();

  // Rename
  const [newName, setNewName] = useState("");
  const [isRename, setIsRename] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  // Restrict
  const [inputWhitelist, setInputWhitelist] = useState("");
  const [isRestrict, setIsRestrict] = useState(false);
  const [restrictLoading, setRestrictLoading] = useState<boolean>(false);
  const [restrictSelected, setRestrictSelected] = useState(item.isRestrict!!);

  // Delete
  const [isDelete, setIsDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Paid download
  const [isPaidDownload, setIsPaidDownload] = useState(false);

  // Details
  const [isDetails, setIsDetails] = useState(false);

  // Dropdown Dialog
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasDialogOpen, setHasDialogOpen] = useState(false);
  const dropdownTriggerRef = useRef<null | HTMLButtonElement>(null);
  const focusRef = useRef<null | HTMLButtonElement>(null);

  const fileIcons: Record<string, string> = {
    pdf: "/images/file-pdf.svg",
    doc: "/images/file-doc.svg",
    sheet: "/images/file-sheet.svg",
    slide: "/images/file-slide.svg",
    archive: "/images/file-zip.svg",
    audio: "/images/file-audio.svg",
    text: "/images/file-text.svg",
    file: "/images/file.svg",
  };

  const image = (item: FileDrive) => {
    if (item.fileType === "folder") {
      return "/images/folder.svg";
    } else if (item.fileType === "image") {
      return `https://drive.google.com/uc?id=${item.id}&export=download`;
    } else if (item.fileType === "video") {
      return "/images/play.svg";
    } else {
      return fileIcons[item.fileType] ?? fileIcons.file;
    }
  };

  const handleOpen = () => {
    if (item.fileType === "folder") {
      router.push(`/list/${item.id}`);
      return;
    }
    window.open(`/share/${item.id}`, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    window.open(`/share/${item.id}`, "_blank", "noopener,noreferrer");
    setDropdownOpen(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${item.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        variant: "success",
        title: "Share link copied",
        duration: 3000,
      });
    } catch (error: any) {
      window.prompt("Copy share link", shareUrl);
    } finally {
      setDropdownOpen(false);
    }
  };

  const handleRename = async () => {
    setRenameLoading(true);
    const body = {
      newName,
    };
    try {
      if (newName === item.name) throw Error("Newname is same!");

      const response = await fetch(`/api/v2/drive/${item.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status === 200) {

        toast({
          variant: "success",
          title: "Rename Success",
          duration: 3000,
        });

        mutateList(folderId);
        handleDialogItemOpenChange(false);
        setDropdownOpen(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Rename Failed",
        description: error.message,
        duration: 5000,
      });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      const response = await fetch(`/api/v2/drive/${item.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.status === 200) {

        toast({
          variant: "success",
          title: "Delete Success",
          duration: 3000,
        });

        mutateList(folderId);
        handleDialogItemOpenChange(false);
        setDropdownOpen(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
        duration: 5000,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddWhitelist = async () => {
    try {
      const body = {
        fileId: item.id,
        whitelist: inputWhitelist,
        remove: false,
      };

      const response = await fetch(`/api/v2/restrict`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        mutateList(folderId);
        setInputWhitelist("");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Add Whitelist Failed",
        description: error.message,
        duration: 5000,
      });
    }
  };

  const handleRemoveWhitelist = (username: string) => async () => {
    try {
      const body = {
        fileId: item.id,
        whitelist: username,
        remove: true,
      };

      const response = await fetch(`/api/v2/restrict`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        mutateList(folderId);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Remove Whitelist Failed",
        description: error.message,
        duration: 5000,
      });
    }
  };

  const changeRestrict = async (newRestrict: boolean) => {
    try {
      const body = {
        fileId: item.id,
      };

      const response = await fetch(`/api/v2/restrict`, {
        method: newRestrict ? "POST" : "DELETE",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        mutateList(folderId);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleRestrict = async (newRestrict: boolean) => {
    setRestrictLoading(true);
    try {
      await changeRestrict(newRestrict);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Restrict Failed",
        description: error.message,
        duration: 5000,
      });
    } finally {
      handleDialogItemOpenChange(false);
      setDropdownOpen(false);
      setRestrictLoading(false);
    }
  };

  // Dropdown Handler
  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current;
  };

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasDialogOpen((prev) => open);

    setIsRestrict(false);
    setRestrictSelected(item.isRestrict!!);
    setIsRename(false);
    setIsDelete(false);
    setIsPaidDownload(false);
    setIsDetails(false);
  };

  return (
    <div>
      <div className="w-[150px] space-y-3 rounded-md border-2 border-gray-200">
        <div className="overflow-hidden rounded-md">
          <Image
            src={image(item) as string}
            alt={item.name}
            width={150}
            height={200}
            fetchPriority="low"
            className="aspect-square h-full w-full object-cover transition-all hover:scale-105"
            onClick={handleOpen}
          />
        </div>
        <div className="flex h-fit items-center justify-between space-y-1 py-1 align-middle text-sm">
          <h3 className="line-clamp-3 px-2 py-1 font-medium leading-none">
            {item.name}
          </h3>
          <div className="flex items-center justify-center gap-1 align-middle">
            <Show when={item.isRestrict! && userSession.role === "admin"}>
              <LucideLock className="h-4 w-4" />
            </Show>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger>
                <LucideMoreVertical className={"h-5 w-5"} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-40"
                align="start"
                hidden={hasDialogOpen}
                onCloseAutoFocus={(event) => {
                  if (focusRef.current) {
                    focusRef.current.focus();
                    focusRef.current = null;
                    event.preventDefault();
                  }
                }}
              >
                <DialogItemRename
                  isOpen={isRename}
                  setIsRename={setIsRename}
                  handleDialogItemSelect={handleDialogItemSelect}
                  handleDialogItemOpenChange={handleDialogItemOpenChange}
                  handleRename={handleRename}
                  newName={newName}
                  setNewName={setNewName}
                  defaultName={item.name}
                  loading={renameLoading}
                />
                <Show when={userSession.role === "admin"}>
                  <DialogItemRestrict
                    loading={restrictLoading}
                    isOpen={isRestrict}
                    setIsOpen={setIsRestrict}
                    handleDialogItemSelect={handleDialogItemSelect}
                    handleDialogItemOpenChange={handleDialogItemOpenChange}
                    handleAddWhitelist={handleAddWhitelist}
                    handleRemoveWhitelist={handleRemoveWhitelist}
                    handleSubmit={handleRestrict}
                    changeRestrict={changeRestrict}
                    inputWhitelist={inputWhitelist}
                    setInputWhitelist={setInputWhitelist}
                    restrictSelected={restrictSelected}
                    setRestrictSelected={setRestrictSelected}
                    whitelist={item.whitelist}
                  />
                </Show>
                <Show when={item.fileType !== "folder"}>
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-2"
                    onSelect={(event) => {
                      event.preventDefault();
                      handleShare();
                    }}
                  >
                    <Link className="w-4 h-4" /> Share link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-2"
                    onSelect={(event) => {
                      event.preventDefault();
                      handleDownload();
                    }}
                  >
                    <Download className="w-4 h-4" /> Download
                  </DropdownMenuItem>
                  <DialogItemDetails
                    file={item}
                    isOpen={isDetails}
                    setIsOpen={setIsDetails}
                    handleDialogItemSelect={handleDialogItemSelect}
                    handleDialogItemOpenChange={handleDialogItemOpenChange}
                  />
                  <DialogItemPaidDownload
                    fileId={item.id}
                    isOpen={isPaidDownload}
                    setIsOpen={setIsPaidDownload}
                    handleDialogItemSelect={handleDialogItemSelect}
                    handleDialogItemOpenChange={handleDialogItemOpenChange}
                  />
                </Show>

                <DialogItemDelete
                  isOpen={isDelete}
                  setIsOpen={setIsDelete}
                  handleDialogItemSelect={handleDialogItemSelect}
                  handleDialogItemOpenChange={handleDialogItemOpenChange}
                  handleDelete={handleDelete}
                  loading={deleteLoading}
                  itemName={item.name}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
