"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TokensIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { LucideSettings, LucideUser } from "lucide-react";
import LogoutButton from "@/components/logout-button";
import { UserSession } from "@/types/api/auth";
import { usePathname } from "next/navigation";

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
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {userSession?.role === "admin" && (
            <div>
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Admin
              </h2>
              <div className="space-y-1">
                <Link href={"/user"}>
                  <Button
                    variant={activePath === "user" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <LucideUser className="mr-2 h-4 w-4" />
                    User
                  </Button>
                </Link>
                <Link href={"/settings"}>
                  <Button
                    variant={activePath === "settings" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <LucideSettings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <h2 className="my-2 px-4 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <div className="space-y-1">
            <Link href={"/list"}>
              <Button
                variant={activePath === "list" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <TokensIcon className="mr-2 h-4 w-4" />
                List
              </Button>
            </Link>
            <Link href={"/settings"}>
              <Button
                variant={activePath === "settings" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <LucideSettings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
          <LogoutButton
            className={"text-destructive border-destructive ml-4 mt-4"}
            variant="outline"
          />
        </div>
      </div>
    </div>
  );
}
