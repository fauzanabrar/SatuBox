import Link from "next/link";
import { Button } from "../ui/button";
import Show from "../show";

interface SidebarSubMenuItemProps {
  item: {
    name: string;
    href: string;
    icon?: any;
  };
  activePath: string;
  toggle?: () => void;
}

export default function SidebarSubMenuItem({
  item,
  activePath,
  toggle,
}: SidebarSubMenuItemProps) {
  return (
    <Link key={item.href} href={item.href}>
      <Button
        variant={activePath === item.href.split("/")[1] ? "secondary" : "ghost"}
        className="mt-1 w-full justify-start"
        onClick={toggle}
      >
        <Show when={item.icon}>
          <item.icon className="mr-2 h-4 w-4" />
        </Show>
        {item.name}
      </Button>
    </Link>
  );
}
