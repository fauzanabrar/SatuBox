"use client";
import React, { useState } from "react";
import useSWR from "swr";
import Loading from "../loading";
import RefreshButtonSWR from "./refresh-button";

const fetcher = (url: string, setLoading: (loading: boolean) => void) =>
  fetch(url)
    .then((res) => res.json())
    .finally(() => setLoading(false));

const listSWRKey = "/api/fake";

type ListSWRProps = {
  canScroll?: boolean;
  type?: "list" | "grid";
};

export default function ListSWR({
  canScroll = false,
  type = "grid",
}: ListSWRProps) {
  const [refreshClicked, setRefreshClicked] = useState<boolean>(true);
  const { data, error, isLoading, isValidating, mutate } = useSWR(
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

  return (
    <div className="relative">
      <div className="flex justify-between w-auto items-center">
        {/* <Breadcumbs /> */}
        <RefreshButtonSWR handleClick={handleRefresh} />
      </div>
      <div className="flex justify-center mt-4">
        {renderContent(loading, error, data)}
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

function renderData(data: any) {
  return <p>{data?.message}</p>;
}

function renderContent(loading: boolean, error: any, data: any) {
  if (loading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  if (data?.message.length < 1) {
    return renderEmpty();
  }

  return renderData(data);
}
