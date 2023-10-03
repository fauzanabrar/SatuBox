"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { madeForYouAlbums } from "@/data/albums";
import DashboardLayout from "@/layouts/DashboardLayouts";
import Lists from "@/components/lists";
import { InputFile } from "@/components/input-file";
import { useEffect, useState } from "react";
import Image from "next/image";
import AddFolderDialog from "@/components/add-folder";

export default function HomePage() {
  const [files, setFiles] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    setLoadingList(true);
    handleUpload();
    setLoadingList(false);
  }, [loadingList]);

  const handleUpload = () => {
    console.log("fetching data");
    async function getData2() {
      try {
        const response = await fetch(`http://localhost:3000/api/drive/file`);
        const data = await response.json();
        const newFiles = [];
        for (const item of data.files) {
          if (!item.mimeType.includes("image")) {
            newFiles.push({ name: item.name });
          } else {
            const fetchImage = await fetch(
              `http://localhost:3000/api/drive/file/${item.id}`
            );
            const data = await fetchImage.json();
            newFiles.push({
              name: item.name,
              cover: `data:${item.mimeType};base64,${data.files}`,
            });
          }
        }
        console.log("fetching berhasil");
        setFiles(newFiles);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    }

    getData2();
  };

  const handleAddFolder = () => {
    setLoadingList(true)
  };

  return (
    <>
      <DashboardLayout>
        <div className="col-span-3 lg:col-span-4 lg:border-l">
          <div className="h-full px-4 py-6 lg:px-8">
            <Tabs defaultValue="upload" className="h-full space-y-6">
              <div className=" flex items-center">
                <TabsList>
                  <TabsTrigger value="upload" className="relative">
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
                <div className="ml-auto mr-4">
                  <AddFolderDialog handleAddFolderSuccess={handleAddFolder} />
                </div>
              </div>
              <TabsContent
                value="upload"
                className="border-none p-0 outline-none"
              >
                <div className="mt-6 space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Lists
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    list that can be scrolled horizontally
                  </p>
                </div>
                <div className="flex align-middle gap-2">
                  <InputFile onUpload={handleUpload} setLoading={setLoading} />
                  {loading && (
                    <Image
                      src="./images/loading.svg"
                      alt="loading"
                      width={30}
                      height={30}
                      className="animate-spin"
                    />
                  )}
                </div>
                <Separator className="my-4" />
                <Lists
                  listItems={files}
                  canScroll={true}
                  type="grid"
                  loading={loadingList}
                />
              </TabsContent>
              <TabsContent
                value="list"
                className="h-full flex-col border-none p-0 data-[state=active]:flex"
              >
                <div className="mt-6 space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Lists
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    list that can be scrolled horizontally
                  </p>
                </div>
                <Separator className="my-4" />
                <Lists listItems={madeForYouAlbums} canScroll={true} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
