import { FileDrive } from "@/types/api/drive/file";
import React from "react";

type GridItemSWRProps = {
  item: FileDrive
};

export default function GridItemSWR({ item }: GridItemSWRProps) {
  return (
    <div className="space-y-3 w-[150px] border-2 border-gray-200 rounded-md">
      {item.name}
    </div>
  );
}
