"use client";

import { useState } from "react";
import useSWR from "swr";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type FolderShareProps = {
  className?: string;
  showHeading?: boolean;
};

export default function FolderShare({
  className,
  showHeading = true,
}: FolderShareProps) {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useSWR("/api/v2/folder-share", fetcher);
  const sharedUsers = (data?.data?.sharedWithUsernames as string[]) || [];

  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);

  const handleShare = async () => {
    const target = username.trim();
    if (!target) return;

    try {
      setBusy(true);
      const response = await fetch("/api/v2/folder-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: target }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Failed to share folder");
      }
      toast({
        variant: "success",
        title: "Access granted",
        description: `${target} can access your folder now.`,
        duration: 3000,
      });
      setUsername("");
      await mutate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Share failed",
        description: error?.message || "Something went wrong.",
        duration: 5000,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (target: string) => {
    try {
      setBusy(true);
      const response = await fetch("/api/v2/folder-share", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: target }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Failed to revoke access");
      }
      toast({
        variant: "success",
        title: "Access revoked",
        description: `${target} no longer has access.`,
        duration: 3000,
      });
      await mutate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Revoke failed",
        description: error?.message || "Something went wrong.",
        duration: 5000,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!pendingRemoval) return;
    await handleRevoke(pendingRemoval);
    setPendingRemoval(null);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        showHeading && "mt-4 md:w-1/2 lg:w-1/3",
        className,
      )}
    >
      {showHeading ? (
        <>
          <h3 className="text-md mb-4 font-semibold tracking-tight">
            Folder Sharing
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Grant another user access to your root folder by username.
          </p>
        </>
      ) : (
        <p className="mb-3 text-sm text-muted-foreground">
          Grant another user access to your root folder by username.
        </p>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <Button onClick={handleShare} disabled={busy || !username.trim()}>
          Share
        </Button>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        {isLoading && (
          <p className="text-muted-foreground">Loading shared users...</p>
        )}
        {!isLoading && sharedUsers.length === 0 && (
          <p className="text-muted-foreground">No shared users yet.</p>
        )}
        {sharedUsers.map((name) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <span>@{name}</span>
            <Button
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={() => setPendingRemoval(name)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      <AlertDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove access?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemoval
                ? `@${pendingRemoval} will lose access to your folder.`
                : "This user will lose access to your folder."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={busy}
              onClick={handleConfirmRevoke}
            >
              Remove access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
