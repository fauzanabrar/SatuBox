"use client";
import React, { useMemo, useState } from "react";
import useSWR from "swr";
import Loading from "../loading";
import RefreshButtonSWR from "./refresh-button";
import BreadcumbsSWR from "./breadcumbs-swr";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { FileDrive, FileResponse } from "@/types/api/drive/file";
import GridItemSWR from "./grid-item";

const fetcher = (url: string, setLoading: (loading: boolean) => void) =>
  fetch(url)
    .then((res) => res.json())
    .finally(() => setLoading(false));

const listSWRKey = "/api/v2/drive";

type ListSWRProps = {
  canScroll?: boolean;
  type?: "list" | "grid";
};

export default function ListSWR({
  canScroll = false,
  type = "grid",
}: ListSWRProps) {
  const [refreshClicked, setRefreshClicked] = useState<boolean>(true);
  const { data, error, isLoading, mutate } = useSWR<FileResponse>(
    listSWRKey,
    (url: string) => fetcher(url, setRefreshClicked),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      // refreshInterval: 1000,
    }
  );

  const handleRefresh = () => {
    setRefreshClicked(true);
    mutate();
  };

  const loading = refreshClicked || isLoading;

  const dataItems = useMemo(
    () => (data?.files ? data?.files : []),
    [data?.files]
  );

  return (
    <div className="relative">
      <div className="flex justify-between w-auto items-center h-10">
        <BreadcumbsSWR />
        <RefreshButtonSWR handleClick={handleRefresh} />
      </div>
      <div className="flex justify-center mt-4">
        {renderContent(loading, error, dataItems, canScroll)}
      </div>
    </div>
  );
}

function renderLoading() {
  return <Loading loading={true} size={100} />;
}

function renderError() {
  return (
    <p className="flex m-auto py-2 font-bold text-destructive">
      Error to get data!
    </p>
  );
}

function renderEmpty() {
  return (
    <p className="flex m-auto py-2 font-bold text-destructive">
      Empty. No File.
    </p>
  );
}

function renderData(data: FileDrive[], canScroll: boolean) {
  return (
    <ScrollArea className={canScroll ? "h-auto" : "h-full"}>
      <div className="flex flex-wrap gap-2">
        {data.map((item: FileDrive) => {
          return <GridItemSWR key={item.id} item={item} />;
        })}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}

function renderContent(
  loading: boolean,
  error: any,
  data: FileDrive[],
  canScroll: boolean
) {
  if (loading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  if (data.length < 1) {
    return renderEmpty();
  }

  return renderData(data, canScroll);
}
