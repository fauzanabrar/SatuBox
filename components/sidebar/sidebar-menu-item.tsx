import Link from "next/link";
import { Button } from "../ui/button";

export interface SidebarMenuItemProps {
  item: {
    name: string;
    href: string;
    icon: any;
  };
  activePath: string;
  toggle?: () => void;
}

export default function SidebarMenuItem({
  item,
  activePath,
  toggle,
}: SidebarMenuItemProps) {
  return (
    <Link key={item.href} href={item.href}>
      <Button
        variant={activePath === item.href.split("/")[1] ? "secondary" : "ghost"}
        className="w-full justify-start mt-1"
        onClick={toggle}
      >
        <item.icon className="mr-2 h-4 w-4" />
        {item.name}
      </Button>
    </Link>
  );
}
