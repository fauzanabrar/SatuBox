import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type Item = {
  name: string;
  cover?: string;
};

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: Item;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
}

export function GridItem({
  item,
  aspectRatio = "portrait",
  width,
  height,
  className,
  ...props
}: GridItemProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="overflow-hidden rounded-md">
            <Image
              src={item.cover ? item.cover : './images/folder.svg'}
              alt={item.name}
              width={width}
              height={height}
              className={cn(
                "h-full w-full object-cover transition-all hover:scale-105",
                aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
              )}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem>Open</ContextMenuItem>
          <ContextMenuItem className="text-red-600">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm flex align-center items-start justify-start h-12">
        <h3 className="font-medium leading-none break-all px-1 py-1" >{item.name}</h3>
      </div>
    </div>
  );
}
