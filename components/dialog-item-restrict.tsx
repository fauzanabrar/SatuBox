import React from 'react';
import {DialogClose, DialogFooter, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import Loading from "@/components/loading";
import {Button} from "@/components/ui/button";
import {LucidePlus} from "lucide-react";
import {DialogItem} from "@/components/dialog-item";

type Props = {
  handleDialogItemSelect: () => void
  handleDialogItemOpenChange: (open: boolean) => void
  setRestrictSelected: (bool: boolean) => void
  restrictSelected: boolean
  inputEmail: string
  setInputEmail: (email: string) => void
  handleRestrict: () => Promise<void>
  loadingRestrict: boolean
}

const DialogItemRestrict = ({handleDialogItemSelect, handleDialogItemOpenChange, setRestrictSelected, restrictSelected, handleRestrict, setInputEmail, loadingRestrict, inputEmail}: Props) => {
  return (
    <DialogItem
      triggerChildren={
        <>
          <span>Restrict</span>
        </>
      }
      onSelect={handleDialogItemSelect}
      onOpenChange={handleDialogItemOpenChange}
      className={"w-96"}
    >
      <DialogTitle>Restrict This File</DialogTitle>
      <div className="grid gap-4 py-1">
        <div className={'flex gap-4 items-center justify-between'}>
          <p className={'font-medium text-sm'}>Access</p>
          <Select onValueChange={(value) => {
            if (value === "Public") setRestrictSelected(false)
            else setRestrictSelected(true)
          }}>
            <SelectTrigger className={'w-24'}>
              <SelectValue placeholder={"Public"}/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"Public"}>Public</SelectItem>
              <SelectItem value={"Restrict"}>Restrict</SelectItem>
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
                value={inputEmail}
              />
              <DialogTrigger asChild>
                <div className="flex gap-2 sm:flex-col sm:gap-4">
                  {loadingRestrict && <Loading loading={loadingRestrict} size={30}/>}
                  <Button
                    variant={"outline"}
                    className="px-2"
                    type="submit"
                    onClick={async () => {
                      await handleRestrict();
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
  );
};

export default DialogItemRestrict;