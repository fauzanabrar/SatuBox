import { DialogClose, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { DialogItem } from "@/components/dialog-item";

type Props = {
  handleDialogItemSelect: () => void;
  handleDialogItemOpenChange: (open: boolean) => void;
  handleDelete: () => Promise<void>;
  loading: boolean;
  itemName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const DialogItemDelete = ({
  handleDialogItemSelect,
  handleDialogItemOpenChange,
  handleDelete,
  itemName,
  loading,
  isOpen,
  setIsOpen,
}: Props) => {
  return (
    <DialogItem
      isOpen={isOpen}
      className={"w-96"}
      triggerChildren={<span className="text-destructive">Delete</span>}
      onSelect={() => {
        setIsOpen(true);
        handleDialogItemSelect();
      }}
      onOpenChange={handleDialogItemOpenChange}
    >
      <DialogTitle>Delete this file</DialogTitle>
      <div className="grid gap-4 py-1">
        <div className="flex items-center gap-2">
          <span>Are you sure to delete <span className="font-bold">{itemName}</span> ?</span>
        </div>
      </div>
      <DialogFooter className="">
        <Button
          variant={"destructive"}
          onClick={async () => {
            await handleDelete();
          }}
          className="flex gap-1"
        >
          <Loading loading={loading} size={20} />
          Delete
        </Button>
        <DialogClose asChild={true}>
          <Button variant={"outline"}>Cancel</Button>
        </DialogClose>
      </DialogFooter>
    </DialogItem>
  );
};

export default DialogItemDelete;
