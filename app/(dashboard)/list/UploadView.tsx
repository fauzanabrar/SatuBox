"use client";
import AddFolderDialog from "@/components/add-folder";
import { InputFile } from "@/components/input-file";
import Lists from "@/components/lists";
import useListStore from "@/lib/zustand/useListStore";
import { Separator } from "@radix-ui/react-menubar";
import React, { useEffect } from "react";
import useSWRImmutable from "swr/immutable";

export default function UploadView() {
  const { setFiles, setLoadingList, setAllFiles }: any = useListStore((store: any) => ({
    setFiles: store.setFiles,
    setAllFiles: store.setAllFiles,
    setLoadingList: store.setLoadingList,
  }));

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data } = useSWRImmutable(
    "/api/drive/file?media=true&pageSize=10",
    fetcher,
    {
      revalidateOnMount: true,
    }
  );

  useEffect(() => {
    setLoadingList(true);
    if (data?.files) {
      setFiles(data?.files);
      setAllFiles(data?.files);
      setLoadingList(false);
    }
  }, [data]);

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
