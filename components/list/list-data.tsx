import React from "react";
import Switch from "@/components/switch";
import Match from "@/components/match";
import Loading from "@/components/loading";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import GridItemSWR from "@/components/list/grid-item";
import { FileDrive } from "@/types/api/file";
import { UserSession } from "@/types/api/auth";

interface ListDataProps {
  dataItems: FileDrive[] | undefined;
  loading: boolean;
  error: any;
  folderId: string;
  userSession: UserSession;
  canScroll: boolean;
}

export default function ListData({
  dataItems,
  loading,
  error,
  folderId,
  userSession,
  canScroll,
}: ListDataProps) {
  return (
    <div className="mt-4">
      <Switch>
        <Match when={loading}>
          <div className="flex justify-center">
            <Loading loading={true} size={100} />
          </div>
        </Match>
        <Match when={error}>
          <p className="flex justify-center m-auto py-2 font-bold text-destructive">
            Error to get data!
          </p>
        </Match>
        <Match when={dataItems === undefined || dataItems?.length < 1}>
          <p className="flex justify-center m-auto py-2 font-bold">
            Empty. No File.
          </p>
        </Match>
        <Match when={true}>
          <ScrollArea className={canScroll ? "h-auto" : "h-full"}>
            <div className="flex flex-wrap gap-2">
              {dataItems?.map((item: FileDrive) => {
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
        </Match>
      </Switch>
    </div>
  );
}
