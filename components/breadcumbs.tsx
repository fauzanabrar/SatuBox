"use client";
import React, { useEffect } from "react";
import { Card } from "./ui/card";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import useListStore from "@/lib/zustand/useListStore";

export default function Breadcumbs() {
  const router = useRouter();

  const pathname = usePathname();
  const pathnames = pathname.split("/");

  const { allFiles } = useListStore((store: any) => ({
    allFiles: store.allFiles,
  }));

  return (
    <div className="my-2">
      <Card className="w-fit py-1 px-2 h-fit flex justify-start items-center mb-4">
        {pathnames.map((item, index) => {
          if (item === "") return null;

          let link = pathnames.slice(0, index + 1).join("/");

          const isLastItem = index === pathnames.length - 1;

          if (item === "list") {
            item = "root";
            link = "/list";
          }
          if (item.length === 33) {
            let itemName = allFiles?.find(
              (file: any) => file.id === item
            )?.name;
            item = itemName ? itemName : item;
          }

          if (isLastItem) {
            return (
              <div key={index} className="mx-4 inline-block">
                <span className="font-bold ">{item} </span>
              </div>
            );
          }

          return (
            <span key={index}>
              <Button
                className="w-fit h-1"
                variant={"ghost"}
                onClick={() => {
                  router.push(link);
                }}
              >
                <span className="">{item} </span>
              </Button>
              <span className="text-gray-400">/</span>
            </span>
          );
        })}
      </Card>
    </div>
  );
}
