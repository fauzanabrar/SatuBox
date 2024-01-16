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
import DialogItemDelete from "../dialog-item-delete";

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
  const [isRename, setIsRename] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  // Restrict
  const [inputEmail, setInputEmail] = useState("");
  const [isRestrict, setIsRestrict] = useState(false);
  const [restrictLoading, setRestrictLoading] = useState<boolean>(false);
  const [restrictSelected, setRestrictSelected] = useState(
    item.isRestrict ? item.isRestrict : false
  );

  // Delete
  const [isDelete, setIsDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Dropdown Dialog
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasDialogOpen, setHasDialogOpen] = useState(false);
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
        console.log("rename berhasil");
        mutateList(folderId);
        handleDialogItemOpenChange(false);
        setDropdownOpen(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDelete = async () => {
    console.log("delete");
    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/v2/drive/${item.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.status === 200) {
        console.log("delete berhasil");
        mutateList(folderId);
        handleDialogItemOpenChange(false);
        setDropdownOpen(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddWhitelist = async () => {};

  const handleRestrict = async () => {};

  // Dropdown Handler
  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current;
  };

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasDialogOpen((prev) => open);
    // if (!open) {
    //   setDropdownOpen(prev => !prev)
    // }
    console.log(open);
    // setDropdownOpen(!open)
    // setDropdownOpen(!open);
    setIsRestrict(false);
    setIsRename(false);
    setIsDelete(false);
  };

  if (item.isRestrict) return <></>;

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
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger>
              <LucideMoreVertical className={"w-5 h-5"} />
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
              <DialogItemRestrict
                setIsOpen={setIsRestrict}
                isOpen={isRestrict}
                handleDialogItemSelect={handleDialogItemSelect}
                handleDialogItemOpenChange={handleDialogItemOpenChange}
                inputEmail={inputEmail}
                setInputEmail={setInputEmail}
                restrictSelected={restrictSelected}
                setRestrictSelected={setRestrictSelected}
                handleAddWhitelist={handleAddWhitelist}
                handleSubmit={handleRestrict}
              />
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
  );
}
