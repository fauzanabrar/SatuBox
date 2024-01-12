"use client";
import { Button } from "../ui/button";
import { LucideRefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";
import useListStore, { ListStore } from "@/lib/zustand/useListStore";

export default function RefreshButton() {
  const { refreshList } = useListStore((store: ListStore) => ({
    refreshList: store.refreshList,
  }));

  const pathname = usePathname();
  const folderId = pathname.split("/").pop();

  return (
    <div>
      <Button
        variant={"outline"}
        className="w-fit px-2"
        onClick={() => refreshList(folderId)}
      >
        <LucideRefreshCw className="mr-1 h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
}
