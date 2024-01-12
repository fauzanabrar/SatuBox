import React from "react";
import Link from "next/link";

type BreadcumbsItem = {
  url: string;
  name: string;
};

type BreadcumbsItemProps = {
  item: BreadcumbsItem;
  isLastItem: boolean;
};

type BreadcumbsSWRProps = {
  items: BreadcumbsItem[];
};

const BreadcrumbItem = ({ item, isLastItem }: BreadcumbsItemProps) => (
  <>
    <Link href={`/${item.url}`} className="link-ghost">
      <span className="font-semibold">{item.name}</span>
    </Link>
    {!isLastItem && ">"}
  </>
);

const BreadcrumbsSWR = ({ items }: BreadcumbsSWRProps) => (
  <div className="my-2 h-auto flex items-center">
    <div className="w-fit py-2 px-2 h-auto flex justify-start items-center">
      <Link href={"/"} className="link-ghost">
        <span className="font-semibold">root</span>
      </Link>
      {items.length > 0 && ">"}
      {items.map((item: BreadcumbsItem, index: number) => (
        <BreadcrumbItem
          key={item.url}
          item={item}
          isLastItem={index === items.length - 1}
        />
      ))}
    </div>
  </div>
);

export default BreadcrumbsSWR;
