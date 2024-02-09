import SidebarSubMenuItem from "./sidebar-submenu-item";
import Match from "../match";
import Switch from "../switch";

export interface SidebarMenuItemProps {
  item: {
    name: string;
    href: string;
    icon: any;
    submenu?: { name: string; href: string }[];
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
    <div className="w-full">
      <Switch>
        <Match when={item.submenu?.length! > 0}>
          <div key={item.href}>
            <div
              className={
                "mt-1 inline-flex h-9 items-center justify-start px-4 py-2 text-sm" +
                (activePath === item.href.split("/")[1] ? " font-bold" : "")
              }
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </div>
            {item.submenu && (
              <div className="pl-8">
                {item.submenu.map((subitem) => (
                  <SidebarSubMenuItem
                    key={subitem.href}
                    item={subitem}
                    activePath={activePath}
                    toggle={toggle}
                  />
                ))}
              </div>
            )}
          </div>
        </Match>
        <Match when={true}>
          <SidebarSubMenuItem
            item={item}
            activePath={activePath}
            toggle={toggle}
          />
        </Match>
      </Switch>
    </div>
  );
}
