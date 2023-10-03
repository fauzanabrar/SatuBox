import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ListItem from "./list-item";
import { cn } from "@/lib/utils";
import { GridItem } from "./grid-item";

export default function Lists({
  listItems,
  canScroll = false,
  type = "list",
}: {
  listItems: any;
  canScroll?: boolean;
  type?: "list" | "grid";
  }) {
  console.log('gundul ',listItems);
  return (
    <div className="relative">
      {!listItems && "heheh"}
      <ScrollArea className={cn(canScroll ? "h-80" : "h-auto")}>
        <div className="flex flex-wrap gap-2">
          {listItems?.map((item: any) => {
            if (type === "list") {
              return (
                <ListItem key={item.name} item={item} className="w-full" />
              );
            } else if (type === "grid") {
              return (
                <GridItem
                  key={item.name}
                  item={item}
                  className="w-[150px] border-2 border-gray-200 rounded-md"
                  aspectRatio="square"
                  width={150}
                  height={200}
                />
              );
            }
          })}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
