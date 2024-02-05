"use client";
import { Button } from "@/components/ui/button";
import { TokensIcon } from "@radix-ui/react-icons";
import Link from "next/link";
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

export async function SidebarMenu({
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
  }, [userSession]);

  return (
    <div>
      {/* Account Profile */}
      <div className="flex flex-row gap-3 px-4 py-4 items-center">
        <LucideCircleUserRound className="font-semibold text-gray-700 h-10 w-10" />
        <div className="">
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm py-0 text-gray-600">
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
              <Link key={item.href} href={item.href}>
                <Button
                  variant={
                    activePath === item.href.split("/")[1]
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full justify-start mt-1"
                  onClick={toggle}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <h2 className="my-2 px-4 text-lg font-semibold tracking-tight">Menu</h2>
      <div>
        {sidebarMenu.user.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={
                activePath === item.href.split("/")[1] ? "secondary" : "ghost"
              }
              className="w-full justify-start mt-1"
              onClick={toggle}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        ))}
      </div>
      <LogoutButton
        className={"text-destructive border-destructive ml-4 mt-4"}
        variant="outline"
      />
    </div>
  );
}
