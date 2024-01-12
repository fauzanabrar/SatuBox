import {DialogClose, DialogFooter, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import Loading from "@/components/loading";
import {Button} from "@/components/ui/button";
import {DialogItem} from "@/components/dialog-item";

type Props = {
  handleDialogItemSelect: () => void
  handleDialogItemOpenChange: (open: boolean) => void
  newName: string
  setNewName: (name: string) => void
  loadingRename: boolean
  handleRename: () => Promise<void>
  setIsRename: (bool: boolean) => void
  defaultName: string
}

const DialogItemRename = ({handleDialogItemSelect, handleDialogItemOpenChange, setIsRename, handleRename, defaultName, newName, setNewName, loadingRename}: Props) => {
  return (
    <DialogItem
      className={"w-96"}
      triggerChildren={
        <>
          <span>Rename</span>
        </>
      }
      onSelect={() => {
        setNewName(defaultName)
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
  );
};

export default DialogItemRename;