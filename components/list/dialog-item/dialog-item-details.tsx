"use client";

import { useEffect, useState } from "react";
import { DialogClose, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { DialogItem } from "./dialog-item";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { FileDrive } from "@/types/api/file";
import { Eye } from "lucide-react";
import { formatBytes } from "@/lib/formatters/bytes";
import { formatDateTime } from "@/lib/formatters/date";

type Props = {
  file: FileDrive;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleDialogItemSelect: () => void;
  handleDialogItemOpenChange: (open: boolean) => void;
};

const DialogItemDetails = ({
  file,
  isOpen,
  setIsOpen,
  handleDialogItemSelect,
  handleDialogItemOpenChange,
}: Props) => {
  const { toast } = useToast();
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        // Fetch additional file details if needed
        setFileDetails(file);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load details",
          description: error?.message || "Something went wrong.",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, file, toast]);

  return (
    <DialogItem
      isOpen={isOpen}
      triggerChildren={<span className="flex items-center gap-2"><Eye className="w-4 h-4" /> View Details</span>}
      onSelect={() => {
        setIsOpen(true);
        handleDialogItemSelect();
      }}
      onOpenChange={handleDialogItemOpenChange}
      className={"w-96"}
    >
      <DialogTitle>File Details</DialogTitle>
      {loading ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : fileDetails ? (
        <>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-border/50 pb-3">
                <span className="text-sm text-muted-foreground">Nama File</span>
                <span className="text-sm font-medium text-foreground break-words max-w-xs text-right">
                  {fileDetails.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-3">
                <span className="text-sm text-muted-foreground">Tipe</span>
                <span className="text-sm font-medium text-foreground">
                  {fileDetails.fileType || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-3">
                <span className="text-sm text-muted-foreground">Ukuran</span>
                <span className="text-sm font-medium text-foreground">
                  {formatBytes(fileDetails.size)}
                </span>
              </div>
              {fileDetails.createdTime && (
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-sm text-muted-foreground">Dibuat</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDateTime(fileDetails.createdTime)}
                  </span>
                </div>
              )}
              {fileDetails.modifiedTime && (
                <div className="flex justify-between pb-3">
                  <span className="text-sm text-muted-foreground">Diubah</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDateTime(fileDetails.modifiedTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              asChild
              variant="default"
              className="flex-1"
            >
              <Link href={`/api/v2/drive/download/${fileDetails.id}`} target="_blank" rel="noopener noreferrer">
                Download
              </Link>
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </>
      ) : (
        <div className="py-4 text-center text-sm text-destructive">
          Failed to load file details
        </div>
      )}
    </DialogItem>
  );
};

export default DialogItemDetails;
