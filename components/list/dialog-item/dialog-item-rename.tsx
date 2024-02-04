import { DialogClose, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { DialogItem } from "@/components/list/dialog-item/dialog-item";

type Props = {
  handleDialogItemSelect: () => void;
  handleDialogItemOpenChange: (open: boolean) => void;
  newName: string;
  setNewName: (name: string) => void;
  loading: boolean;
  handleRename: () => Promise<void>;
  setIsRename: (bool: boolean) => void;
  defaultName: string;
  isOpen: boolean;
};

const DialogItemRename = ({
  handleDialogItemSelect,
  handleDialogItemOpenChange,
  setIsRename,
  handleRename,
  defaultName,
  newName,
  setNewName,
  loading,
  isOpen,
}: Props) => {
  return (
    <div>
      <DialogItem
        className={"w-96"}
        triggerChildren={<span>Rename</span>}
        isOpen={isOpen}
        onSelect={() => {
          setIsRename(true);
          setNewName(defaultName);
          handleDialogItemSelect();
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
          <div className="flex gap-2 sm:flex-col sm:gap-4">
            <Button
              className="flex gap-1 px-2"
              type="submit"
              onClick={async () => {
                await handleRename();
              }}
            >
              <Loading loading={loading} size={20} />
              Submit
            </Button>
          </div>
          <DialogClose asChild={true}>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogItem>
    </div>
  );
};

export default DialogItemRename;
