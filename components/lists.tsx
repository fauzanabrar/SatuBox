"use client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ListItem from "./list-item";
import { cn } from "@/lib/utils";
import { GridItem } from "./grid-item";
import Image from "next/image";
import useListStore from "@/lib/zustand/useListStore";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Breadcumbs from "./breadcumbs";

interface ListsProps {
  canScroll?: boolean;
  type?: "list" | "grid";
}

export default function Lists({
  canScroll = false,
  type = "list",
}: ListsProps) {
  const { loadingList: loading, files } = useListStore((store: any) => ({
    files: store.files,
    loadingList: store.loadingList,
  }));

  const memoizedList = useMemo(() => files, [files]);

  const listItems = memoizedList;

  return (
    <div className="relative">
      <Breadcumbs />
      <ScrollArea className={cn(canScroll ? "h-auto" : "h-full")}>
        <div className="flex flex-wrap gap-2">
          {loading ? (
            <Image
              src="/images/loading.svg"
              width={100}
              height={100}
              alt="loading"
              className="animate-spin m-auto py-8"
            />
          ) : !listItems ? (
            <Image
              src="/images/loading.svg"
              width={100}
              height={100}
              alt="loading"
              className="animate-spin m-auto py-8"
            />
          ) : listItems.length === 0 ? (
            <p className="flex m-auto py-2 font-bold">Empty. No File.</p>
          ) : (
            listItems?.map((item: any) => {
              if (type === "list") {
                return (
                  <ListItem key={item.id} item={item} className="w-full" />
                );
              } else if (type === "grid") {
                return (
                  <GridItem
                    key={item.id}
                    item={item}
                    className="w-[150px] border-2 border-gray-200 rounded-md"
                    aspectRatio="square"
                    width={150}
                    height={200}
                  />
                );
              }
            })
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
