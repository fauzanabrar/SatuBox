import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Show from "@/components/show";

export type BreadcumbsItem = {
  id: string;
  name: string;
};

type BreadcumbsItemProps = {
  item: BreadcumbsItem;
  isLastItem: boolean;
};

type BreadcumbsSWRProps = {
  items?: BreadcumbsItem[];
};

const BreadcrumbItem = ({ item, isLastItem }: BreadcumbsItemProps) => (
  <span>
    <Link href={`/list/${item.id}`} className="link-ghost">
      <span className="font-semibold">{item.name}</span>
    </Link>
    {!isLastItem && ">"}
  </span>
);

const BreadcrumbsSWR = ({ items = [] }: BreadcumbsSWRProps) => {
  return (
    <div className="flex max-w-full items-center">
      <div className="flex max-w-full items-center justify-start px-2 py-2">
        <ScrollArea className="overflow-x-auto whitespace-nowrap">
          <Link href={"/list"} className="link-ghost">
            <span className="font-semibold">root</span>
          </Link>

          <Show when={items.length > 0}>
            {">"}
            {items.map((item: BreadcumbsItem, index: number) => (
              <BreadcrumbItem
                key={index}
                item={item}
                isLastItem={index === items.length - 1}
              />
            ))}
          </Show>

          {/* scroll to the last */}
          <ScrollBar orientation="horizontal" className="mt-1" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default BreadcrumbsSWR;
