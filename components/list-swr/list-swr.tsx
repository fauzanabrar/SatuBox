"use client";
import { useMemo, useState } from "react";
import Loading from "../loading";
import RefreshButtonSWR from "./refresh-button";
import BreadcumbsSWR, { BreadcumbsItem } from "./breadcumbs-swr";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { FileDrive } from "@/types/api/drive/file";
import GridItemSWR from "./grid-item";
import useSWRList from "@/hooks/useSWRList";
import { usePathname } from "next/navigation";

type ListSWRProps = {
  canScroll?: boolean;
  type?: "list" | "grid";
};

export default function ListSWR({
  canScroll = false,
  type = "grid",
}: ListSWRProps) {
  // Set the Folder id
  const pathnames = usePathname();
  const lastPath = pathnames.split("/").pop();

  let folderId = "";

  if (lastPath !== "list" && lastPath) {
    folderId = lastPath;
  }

  const [refreshClicked, setRefreshClicked] = useState<boolean>(true);
  const {
    data,
    error,
    mutate,
    isValidating: isLoading,
  } = useSWRList({
    folderId,
    setRefreshClicked,
  });

  const handleRefresh = () => {
    setRefreshClicked(true);
    mutate();
  };

  const loading = refreshClicked || isLoading;

  const dataItems = useMemo(() => data?.files, [data?.files]);

  // const reversedParents = useMemo(() => [...data.parents].reverse(), [data.parents]);

  return (
    <div className="relative">
      <div className="flex justify-between w-auto items-center h-10">
        <BreadcumbsSWR items={data.parents}/>
        <RefreshButtonSWR handleClick={handleRefresh} />
      </div>
      <div className=" mt-4">
        {renderContent(loading, error, dataItems, canScroll, folderId)}
      </div>
    </div>
  );
}

function renderLoading() {
  return (
    <div className="flex justify-center">
      <Loading loading={true} size={100} />
    </div>
  );
}

function renderError() {
  return (
    <p className="flex justify-center m-auto py-2 font-bold text-destructive">
      Error to get data!
    </p>
  );
}

function renderEmpty() {
  return (
    <p className="flex justify-center m-auto py-2 font-bold">Empty. No File.</p>
  );
}

function renderData(data: FileDrive[], canScroll: boolean, folderId?: string) {
  return (
    <ScrollArea className={canScroll ? "h-auto" : "h-full"}>
      <div className="flex flex-wrap gap-2">
        {data.map((item: FileDrive) => {
          return <GridItemSWR key={item.id} item={item} folderId={folderId} />;
        })}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}

function renderContent(
  loading: boolean,
  error: Error | undefined,
  data: FileDrive[] | undefined,
  canScroll: boolean,
  folderId?: string
) {
  if (loading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  if (data === undefined || data?.length < 1) {
    return renderEmpty();
  }


  return renderData(data as FileDrive[], canScroll, folderId);
}
