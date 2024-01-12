import { FileDrive } from "@/types/api/drive/file";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type GridItemSWRProps = {
  item: FileDrive;
};

export default function GridItemSWR({ item }: GridItemSWRProps) {
  const router = useRouter();

  const image = (item: FileDrive) => {
    if (item.fileType === "folder") {
      return "/images/folder.svg";
    } else if (item.fileType === "image") {
      return `https://drive.google.com/uc?id=${item.id}&export=download`;
    } else {
      return "/images/file.svg";
    }
  };

  const handleOpen = () => {
    console.log("open");
    if (item.fileType === "folder") {
      router.push(`/list-swr/${item.id}`);
      return;
    }
    window.open(`https://drive.google.com/file/d/${item.id}/view`, "_blank");
  };

  return (
    <div className="space-y-3 w-[150px] border-2 border-gray-200 rounded-md">
      <div className="overflow-hidden rounded-md">
        <Image
          src={image(item) as string}
          alt={item.name}
          width={150}
          height={200}
          fetchPriority="low"
          className="h-full w-full object-cover transition-all hover:scale-105 aspect-square"
          onClick={handleOpen}
        />
        {item.name}
      </div>
    </div>
  );
}
