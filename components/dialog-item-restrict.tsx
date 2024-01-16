import React, { useState } from "react";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { LucidePlus } from "lucide-react";
import { DialogItem } from "./dialog-item";

type Props = {
  handleDialogItemSelect: () => void;
  handleDialogItemOpenChange: (open: boolean) => void;
  setRestrictSelected: (bool: boolean) => void;
  restrictSelected: boolean;
  inputEmail: string;
  setInputEmail: (email: string) => void;
  handleAddWhitelist: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const DialogItemRestrict = ({
  handleDialogItemSelect,
  handleDialogItemOpenChange,
  setRestrictSelected,
  restrictSelected,
  handleAddWhitelist,
  handleSubmit,
  setInputEmail,
  inputEmail,
  isOpen,
  setIsOpen,
}: Props) => {
  return (
    <DialogItem
      isOpen={isOpen}
      triggerChildren={<span>Restrict</span>}
      onSelect={() => {
        setIsOpen(true);
        handleDialogItemSelect();
      }}
      onOpenChange={handleDialogItemOpenChange}
      className={"w-96"}
    >
      <DialogTitle>Restrict This File</DialogTitle>

      <div className="grid gap-4 py-1">
        <div className={"flex gap-4 items-center justify-between"}>
          <p className={"font-medium text-sm"}>Access</p>
          <Select
            onValueChange={(value) => {
              if (value === "Public") setRestrictSelected(false);
              else setRestrictSelected(true);
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
            <span className={"font-bold text-sm"}>Add whitelist</span>
            <div className="flex items-center gap-2">
              <Input
                id="name"
                placeholder="example@gmail.com"
                onChange={(e) => {
                  setInputEmail(e.target.value);
                }}
                value={inputEmail}
              />
              <div className="flex gap-2 sm:flex-col sm:gap-4">
                <Button
                  variant={"outline"}
                  className="px-2"
                  type="submit"
                  onClick={async () => {
                    await handleAddWhitelist();
                  }}
                >
                  <LucidePlus className={"w-4 mr-1"} />
                  Add
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <DialogFooter>
        <Button variant={"default"} onClick={handleSubmit}>
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
