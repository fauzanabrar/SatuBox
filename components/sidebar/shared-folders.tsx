"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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

type SharedFolder = {
  id: string;
  name: string;
  ownerUsername: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SharedFoldersSidebar({
  toggle,
}: {
  toggle?: () => void;
}) {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useSWR(
    "/api/v2/shared-folders",
    fetcher,
  );
  const sharedFolders = (data?.data as SharedFolder[]) || [];
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleLeave = async (folderId: string) => {
    try {
      setBusyId(folderId);
      const response = await fetch("/api/v2/shared-folders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Failed to leave folder");
      }
      toast({
        variant: "success",
        title: "Left shared folder",
        duration: 3000,
      });
      setConfirmId(null);
      await mutate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to leave folder",
        description: error?.message || "Something went wrong.",
        duration: 5000,
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-6 space-y-2 px-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Shared
      </p>
      {isLoading && (
        <p className="text-xs text-muted-foreground">
          Loading shared folders...
        </p>
      )}
      {!isLoading && sharedFolders.length === 0 && (
        <p className="text-xs text-muted-foreground">No shared folders.</p>
      )}
      <div className="space-y-1">
        {sharedFolders.map((folder) => (
          <div
            key={folder.id}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-accent"
          >
            <div className="min-w-0">
              <Link
                href={`/list/${folder.id}`}
                onClick={toggle}
                className="block truncate text-sm font-medium"
              >
                {folder.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                @{folder.ownerUsername}
              </p>
            </div>
            <AlertDialog
              open={confirmId === folder.id}
              onOpenChange={(open) =>
                setConfirmId(open ? folder.id : null)
              }
            >
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={busyId === folder.id}
                >
                  Leave
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave shared folder?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will lose access to {folder.name}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleLeave(folder.id)}
                  >
                    Leave
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}
