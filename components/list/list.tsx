"use client";
import { useMemo, useState } from "react";
import useSWRList from "@/hooks/useSWRList";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { UserSession } from "@/types/api/auth";

const BreadcumbsSWR = dynamic(() => import("./breadcumbs"), {
  ssr: false,
});

const RefreshButtonSWR = dynamic(() => import("./refresh-button"), {
  ssr: false,
});

const ListData = dynamic(() => import("./list-data"), { ssr: false });

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

  const handleRefresh = async () => {
    await fetch(`/api/v2/drive/${folderId}?clear=true`);
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
      <ListData
        {...{ dataItems, loading, error, folderId, userSession, canScroll }}
      />
    </div>
  );
}
