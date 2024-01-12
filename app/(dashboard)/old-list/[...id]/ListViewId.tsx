"use client";
import Lists from "@/components/old-list/lists";
import useListStore, { ListStore } from "@/lib/zustand/useListStore";
import { Separator } from "@radix-ui/react-menubar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";
import dynamic from "next/dynamic";

const AddFolderDialog = dynamic(
  () => import("@/components/old-list/add-folder"),
  {
    ssr: false,
  }
);

const InputFile = dynamic(() => import("@/components/old-list/input-file"), {
  ssr: false,
});

export default function ListViewId() {
  const {
    setFiles,
    setLoadingList,
    setAllFiles,
    setIsChanged,
    isChanged,
    files,
  } = useListStore((store: ListStore) => ({
    setFiles: store.setFiles,
    setLoadingList: store.setLoadingList,
    setAllFiles: store.setAllFiles,
    isChanged: store.isChanged,
    setIsChanged: store.setIsChanged,
    files: store.files,
  }));

  const pathname = usePathname();
  const folderId = pathname.split("/").pop();

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const apiUrl = "/api/drive/folder/" + folderId;
  const { data } = useSWRImmutable(apiUrl, fetcher, {
    revalidateOnMount: true,
  });

  useEffect(() => {
    if (isChanged || pathname) {
      useListStore.persist.rehydrate();
      setLoadingList(true);
      if (data?.files) {
        setFiles(data?.files);
        setAllFiles(data?.files);
        setIsChanged(false);
        setLoadingList(false);
      }
      mutate(apiUrl);
    } else {
      setLoadingList(false);
    }
  }, [data, pathname, isChanged]);

  return (
    <div>
      {/* Image */}
      {/* <Image src={'https://drive.google.com/uc?export=view&id=14knCAAMPY1Jej6pnXBSnflGgQf2DRACY'} width={200} height={200} alt="tes" /> */}
      {/* Thumbnail of image */}
      {/* <Image src={'https://drive.google.com/thumbnail?id=14knCAAMPY1Jej6pnXBSnflGgQf2DRACY'} width={200} height={200} alt="tes" /> */}
      {/* Thumbnail of video */}
      {/* <Image src={'https://drive.google.com/thumbnail?id=1t2QYviFna-sPGXa1S_BPge5VuYacvcNX'} width={200} height={200} alt="tes" /> */}
      {/* Video but got hydration error */}
      {/* <video src="https://drive.google.com/uc?export=view&id=1t2QYviFna-sPGXa1S_BPge5VuYacvcNX" controls></video> */}
      {/* <div className=" flex items-center">
        <div className="ml-auto mr-4">
          <div className="flex gap-2"></div>
        </div>
      </div> */}
      <div className="mt-4 space-y-1">
        <div className="flex justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Upload File</h2>
          <AddFolderDialog />
        </div>
      </div>
      <div className="flex align-middle gap-2">
        <InputFile />
      </div>
      <Separator className="my-4" />
      <Lists canScroll={true} type="grid" />
    </div>
  );
}
