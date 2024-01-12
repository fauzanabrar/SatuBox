import { Button } from "../ui/button";

type Item = {
  name: string;
};

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: Item;
}

export default function ListItem({ item, className }: ListItemProps) {
  return (
    <>
      <div className={"flex h-16 items-center rounded-md border  " + className}>
        <div className="flex flex-row justify-between w-full px-4 items-center">
          <p>{item?.name ? item.name : "halo"}</p>
          <Button variant={"outline"}>Detail</Button>
        </div>
      </div>
    </>
  );
}
