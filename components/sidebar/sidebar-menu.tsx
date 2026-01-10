"use client";
import { TokensIcon } from "@radix-ui/react-icons";
import {
  LucideCircleUserRound,
  LucideCreditCard,
  LucideSettings,
  LucideUsers2,
} from "lucide-react";
import useSWR from "swr";
import LogoutButton from "@/components/logout-button";
import { UserSession } from "@/types/api/auth";
import { usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/jotai/user-atom";
import { useEffect } from "react";
import SidebarMenuItem from "./sidebar-menu-item";
import SharedFoldersSidebar from "./shared-folders";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_PLAN_ID, PLANS, type PlanId } from "@/lib/billing/plans";

const sidebarMenu = {
  user: [
    {
      name: "List",
      href: "/list",
      icon: TokensIcon,
    },
    {
      name: "Billing",
      href: "/billing",
      icon: LucideCreditCard,
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
  const { data: billingData } = useSWR(
    userSession?.username ? "/api/v2/billing" : null,
    (url: string) => fetch(url).then((res) => res.json()),
  );
  const planId =
    (billingData?.data?.planId as PlanId) ?? DEFAULT_PLAN_ID;
  const plan = PLANS[planId] ?? PLANS[DEFAULT_PLAN_ID];
  const planVariant =
    planId === "pro"
      ? "default"
      : planId === "starter"
        ? "secondary"
        : "secondary";

  useEffect(() => {
    setUser(userSession);
  }, [setUser, userSession]);

  return (
    <div>
      {/* Account Profile */}
      <div className="flex flex-row items-center gap-3 px-4 py-4">
        <LucideCircleUserRound className="h-10 w-10 font-semibold text-gray-700" />
        <div className="">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{user.name}</p>
            <Badge
              variant={planVariant}
              className="rounded-full px-2 py-0 text-[10px] uppercase"
            >
              {plan.name}
            </Badge>
          </div>
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
      <SharedFoldersSidebar toggle={toggle} />
      <LogoutButton
        className={"ml-4 mt-4 border-destructive text-destructive"}
        variant="outline"
      />
    </div>
  );
}
