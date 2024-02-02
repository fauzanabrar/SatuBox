import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";

export default function ChangeAlert({
  children,
  oldName,
  newName,
  onSubmit,
  open,
  setOpen,
}: {
  children: ReactNode;
  oldName: string;
  newName: string;
  onSubmit: (values: any) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure to change ?</AlertDialogTitle>
            <AlertDialogDescription>
              The name will be changed from{" "}
              <span className="font-semibold text-primary">{oldName}</span> to{" "}
              <span className="font-semibold text-primary">{newName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={onSubmit}>Change</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
