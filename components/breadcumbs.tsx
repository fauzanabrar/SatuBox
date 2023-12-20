"use client";
import React from "react";
import { Card } from "./ui/card";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function Breadcumbs() {
  const router = useRouter();

  const pathname = usePathname();
  const pathnames = pathname.split("/");

  return (
    <div className="my-2">
      <Card className="w-fit py-2 px-4 h-14 flex justify-start items-center">
        {pathnames.map((item, index) => {
          if (item === "") return null;

          let link = pathnames.slice(0, index + 1).join("/");

          const isLastItem = index === pathnames.length - 1;

          if (item === "list") {
            item = "root";
            link = "/list";
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
                className="w-fit"
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
