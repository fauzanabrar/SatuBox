"use client";
import { useMemo, useState } from "react";
import Loading from "../loading";
import { FileDrive } from "@/types/api/file";
import useSWRList from "@/hooks/useSWRList";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { UserSession } from "@/types/api/auth";

const GridItemSWR = dynamic(() => import("./grid-item"), { ssr: false });

const BreadcumbsSWR = dynamic(() => import("./breadcumbs-swr"), {
  ssr: false,
});

const RefreshButtonSWR = dynamic(() => import("./refresh-button"), {
  ssr: false,
});

const ScrollArea = dynamic(
  async () => (await import("../ui/scroll-area")).ScrollArea,
  { ssr: false }
);

const ScrollBar = dynamic(
  async () => (await import("../ui/scroll-area")).ScrollBar,
  { ssr: false }
);

type ListSWRProps = {
  userSession: UserSession;
  canScroll?: boolean;
  type?: "list" | "grid";
};

export default function ListSWR({
  userSession,
  canScroll = false,
  type = "grid",
}: ListSWRProps) {
  // Set the Folder id
  const pathnames = usePathname();
  const lastPath = pathnames.split("/").pop();

  let folderId = process.env.SHARED_FOLDER_ID_DRIVE as string;

  if (lastPath !== "list" && lastPath) {
    folderId = lastPath;
  }

  const [refreshClicked, setRefreshClicked] = useState<boolean>(true);

  const { data, error, mutate, isLoading } = useSWRList({
    folderId,
    setRefreshClicked,
  });

  const handleRefresh = () => {
    setRefreshClicked(true);
    mutate();
  };

  const loading = refreshClicked || isLoading;

  const dataItems = useMemo(() => data?.files, [data?.files]);

  return (
    <div className="relative">
      <div className="flex items-center w-full">
        <div className="grow w-[90%]">
          <BreadcumbsSWR items={data.parents} />
        </div>
        <div className="shrink">
          <RefreshButtonSWR handleClick={handleRefresh} />
        </div>
      </div>
      <div className="mt-4">
        {renderContent(
          loading,
          error,
          dataItems,
          canScroll,
          folderId,
          userSession
        )}
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

function renderData(
  data: FileDrive[],
  canScroll: boolean,
  folderId: string,
  userSession: UserSession
) {
  return (
    <ScrollArea className={canScroll ? "h-auto" : "h-full"}>
      <div className="flex flex-wrap gap-2">
        {data.map((item: FileDrive) => {
          return (
            <GridItemSWR
              key={item.id}
              item={item}
              folderId={folderId}
              userSession={userSession}
            />
          );
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
  folderId: string,
  userSession: UserSession
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

  return renderData(data as FileDrive[], canScroll, folderId, userSession);
}
