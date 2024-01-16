import { FileDrive } from "@/types/api/file";
import { LucideMoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRef, useState } from "react";
import { mutateList } from "@/hooks/useSWRList";
import dynamic from "next/dynamic";

const Image = dynamic(() => import("next/image"), { ssr: false });

const DialogItemRename = dynamic(() => import("../dialog-item-rename"), {
  ssr: false,
});

const DialogItemRestrict = dynamic(() => import("../dialog-item-restrict"), {
  ssr: false,
});

type GridItemSWRProps = {
  item: FileDrive;
  folderId?: string;
};

export default function GridItemSWR({ item, folderId }: GridItemSWRProps) {
  const router = useRouter();

  // Rename
  const [newName, setNewName] = useState("");
  const [, setIsRename] = useState(false);
  const [loadingRename, setLoadingRename] = useState(false);

  // Restrict
  const [inputEmail, setInputEmail] = useState("");
  const [restrictSelected, setRestrictSelected] = useState(
    item.isRestrict ? item.isRestrict : false
  );

  // Dropdown Dialog
  const [, setDropdownOpen] = useState(false);
  const [hasOpenDialog, setHasOpenDialog] = useState(false);
  const dropdownTriggerRef = useRef<null | HTMLButtonElement>(null);
  const focusRef = useRef<null | HTMLButtonElement>(null);

  const image = (item: FileDrive) => {
    if (item.fileType === "folder") {
      return "/images/folder.svg";
    } else if (item.fileType === "image") {
      return `https://drive.google.com/uc?id=${item.id}&export=download`;
    } else {
      return "/images/file.svg";
    }
  };

  const handleOpen = () => {
    console.log("open");
    if (item.fileType === "folder") {
      router.push(`/list/${item.id}`);
      return;
    }
    window.open(`https://drive.google.com/file/d/${item.id}/view`, "_blank");
  };

  const handleRename = async () => {
    console.log("rename");
    setLoadingRename(true);
    const body = {
      newName,
    };
    try {
      const response = await fetch(`/api/v2/drive/${item.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.status === 200) {
        console.log("rename berhasil");
        mutateList(folderId);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingRename(false);
      setIsRename(false);
    }
  };

  const handleDelete = async () => {
    console.log("delete");
    try {
      const response = await fetch(`/api/v2/drive/${item.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.status === 200) {
        console.log("delete berhasil");
        mutateList(folderId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Dropdown Handler
  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current;
  };

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open);
    if (!open) {
      setDropdownOpen(false);
    }
  };

  if (item.isRestrict) return null;

  return (
    <div className="space-y-3 w-[150px] border-2 border-gray-200 rounded-md">
      <div className="overflow-hidden rounded-md">
        <Image
          src={image(item) as string}
          alt={item.name}
          width={150}
          height={200}
          fetchPriority="low"
          className="h-full w-full object-cover transition-all hover:scale-105 aspect-square"
          onClick={handleOpen}
        />
      </div>
      <div className="space-y-1 text-sm flex align-middle items-center justify-between h-fit py-1">
        <h3 className="font-medium line-clamp-3 leading-none px-2 py-1">
          {item.name}
        </h3>
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
