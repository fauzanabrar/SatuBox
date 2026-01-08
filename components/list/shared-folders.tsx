"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";

type SharedFolder = {
  id: string;
  name: string;
  ownerUsername: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SharedFolders() {
  const pathname = usePathname();
  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname],
  );
  const isRootList = segments.length === 1 && segments[0] === "list";

  const { toast } = useToast();
  const { data, isLoading, mutate } = useSWR(
    isRootList ? "/api/v2/shared-folders" : null,
    fetcher,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const sharedFolders = (data?.data as SharedFolder[]) || [];

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

  if (!isRootList) return null;

  return (
    <div className="mt-4 rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-md font-semibold tracking-tight">
            Shared with you
          </h3>
          <p className="text-sm text-muted-foreground">
            Open folders other users shared with you.
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        {isLoading && (
          <p className="text-muted-foreground">Loading shared folders...</p>
        )}
        {!isLoading && sharedFolders.length === 0 && (
          <p className="text-muted-foreground">No shared folders yet.</p>
        )}
        {sharedFolders.map((folder) => (
          <div
            key={folder.id}
            className="flex flex-col gap-2 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{folder.name}</p>
              <p className="text-xs text-muted-foreground">
                Shared by @{folder.ownerUsername}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/list/${folder.id}`}>Open</Link>
              </Button>
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
                    disabled={busyId === folder.id}
                  >
                    <span className="text-destructive">Leave</span>
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
          </div>
        ))}
      </div>
    </div>
  );
}
