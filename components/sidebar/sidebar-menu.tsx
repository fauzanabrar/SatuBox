"use client";
import { TokensIcon } from "@radix-ui/react-icons";
import {
  LucideCircleUserRound,
  LucideSettings,
  LucideUsers2,
} from "lucide-react";
import LogoutButton from "@/components/logout-button";
import { UserSession } from "@/types/api/auth";
import { usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/jotai/user-atom";
import { useEffect } from "react";
import SidebarMenuItem from "./sidebar-menu-item";

const sidebarMenu = {
  user: [
    {
      name: "List",
      href: "/list",
      icon: TokensIcon,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: LucideSettings,
    },
  ],
  admin: [
    {
      name: "Users",
      href: "/users",
      icon: LucideUsers2,
    },
  ],
};

export function SidebarMenu({
  userSession,
  toggle,
}: {
  userSession: UserSession;
  toggle?: () => void;
}) {
  const pathname = usePathname();
  const activePath = pathname.split("/")[1];

  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    setUser(userSession);
  }, [setUser, userSession]);

  return (
    <div>
      {/* Account Profile */}
      <div className="flex flex-row items-center gap-3 px-4 py-4">
        <LucideCircleUserRound className="h-10 w-10 font-semibold text-gray-700" />
        <div className="">
          <p className="font-semibold">{user.name}</p>
          <p className="py-0 text-sm text-gray-600">
            @{user.username} ({user.role})
          </p>
        </div>
      </div>

      {/* Menu Admin */}
      {userSession?.role === "admin" && (
        <div>
          <h2 className="my-2 px-4 text-lg font-semibold tracking-tight">
            Admin
          </h2>
          <div className="space-y-1">
            {sidebarMenu.admin.map((item) => (
              <SidebarMenuItem
                key={item.href}
                item={item}
                activePath={activePath}
                toggle={toggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <h2 className="my-2 px-4 text-lg font-semibold tracking-tight">Menu</h2>
      <div>
        {sidebarMenu.user.map((item) => (
          <SidebarMenuItem
            key={item.href}
            item={item}
            activePath={activePath}
            toggle={toggle}
          />
        ))}
      </div>
      <LogoutButton
        className={"ml-4 mt-4 border-destructive text-destructive"}
        variant="outline"
      />
    </div>
  );
}
