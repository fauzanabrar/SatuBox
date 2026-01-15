import { DialogClose, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LucidePlus, LucideTrash2, Shield } from "lucide-react";
import { DialogItem } from "./dialog-item";
import Loading from "../../loading";
import { useEffect, type Dispatch, type SetStateAction } from "react";

type Props = {
  handleDialogItemSelect: () => void;
  handleDialogItemOpenChange: (open: boolean) => void;
  handleAddWhitelist: () => Promise<void>;
  handleRemoveWhitelist: (username: string) => () => void;
  handleSubmit: (bool: boolean) => Promise<void>;
  changeRestrict: (bool: boolean) => Promise<void>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  restrictSelected: boolean;
  setRestrictSelected: (bool: boolean) => void;
  inputWhitelist: string;
  setInputWhitelist: (email: string) => void;
  whitelist?: string[];
  loading: boolean;
};

const DialogItemRestrict = ({
  handleDialogItemSelect,
  handleDialogItemOpenChange,
  handleAddWhitelist,
  handleRemoveWhitelist,
  handleSubmit,
  changeRestrict,
  isOpen,
  setIsOpen,
  restrictSelected,
  setRestrictSelected,
  inputWhitelist,
  setInputWhitelist,
  whitelist,
  loading,
}: Props) => {
  return (
    <DialogItem
      isOpen={isOpen}
      triggerChildren={<span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Restrict</span>}
      onSelect={() => {
        setIsOpen(true);
        handleDialogItemSelect();
      }}
      onOpenChange={handleDialogItemOpenChange}
      className={"w-96"}
    >
      <DialogTitle>Restrict This File</DialogTitle>

      <div className="grid gap-4 py-1">
        <div className={"flex items-center justify-between gap-4"}>
          <p className={"text-sm font-medium"}>Access</p>
          <Select
            defaultValue={restrictSelected ? "Restrict" : "Public"}
            onValueChange={(value) => {
              let newRestrictSelected = false;

              if (value === "Restrict") {
                newRestrictSelected = true;
              }
              setRestrictSelected(newRestrictSelected);
              changeRestrict(newRestrictSelected);
            }}
          >
            <SelectTrigger className={"w-24"}>
              <SelectValue placeholder={"Public"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"Public"}>Public</SelectItem>
              <SelectItem value={"Restrict"}>Restrict</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {restrictSelected && (
          <>
            <Separator />
            <span className={"text-sm font-bold"}>Add whitelist</span>
            <div className="flex items-center gap-2">
              <Input
                id="username"
                placeholder="username"
                onChange={(e) => {
                  setInputWhitelist(e.target.value);
                }}
                value={inputWhitelist}
              />
              <div className="flex gap-2 sm:flex-col sm:gap-4">
                <Button
                  variant={"outline"}
                  className="px-2"
                  onClick={async (e) => {
                    e.preventDefault();
                    await handleAddWhitelist();
                  }}
                >
                  <LucidePlus className={"mr-1 w-4"} />
                  Add
                </Button>
              </div>
            </div>
            <div>
              {whitelist?.map((username) => {
                return (
                  <div
                    className="border-1 flex justify-between border p-2"
                    key={username}
                  >
                    {username}
                    <Button
                      variant={"ghost"}
                      onClick={handleRemoveWhitelist(username)}
                    >
                      <LucideTrash2 className={"text-destructive"} />
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <DialogFooter>
        <Button
          className="flex gap-1 px-3"
          variant={"default"}
          onClick={() => {
            handleSubmit(restrictSelected);
          }}
        >
          <Loading loading={loading} size={20} />
          Done
        </Button>
        <DialogClose asChild={true}>
          <Button variant={"outline"}>Cancel</Button>
        </DialogClose>
      </DialogFooter>
    </DialogItem>
  );
};

export default DialogItemRestrict;
