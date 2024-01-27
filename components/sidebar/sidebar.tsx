"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TokensIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import {
  LucideCircleUserRound,
  LucideMenu,
  LucideSettings,
  LucideUser,
} from "lucide-react";
import LogoutButton from "@/components/logout-button";
import { UserSession } from "@/types/api/auth";
import { usePathname } from "next/navigation";
import { SidebarMenu } from "./sidebar-menu";
import SheetSidebar from "./sheet-sidebar";

export async function Sidebar({
  userSession,
  className,
}: {
  userSession: UserSession;
  className?: string;
}) {
  const pathname = usePathname();
  const activePath = pathname.split("/")[1];

  return (
    <>
      <div className="lg:hidden">
        <div className="flex justify-end p-2">
          <SheetSidebar userSession={userSession} className={className} />
        </div>
      </div>
      <div className={"hidden lg:border-r lg:block"}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <SidebarMenu userSession={userSession} />
          </div>
        </div>
      </div>
    </>
  );
}
