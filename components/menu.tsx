"use client";
import { Menubar } from "@/components/ui/menubar";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { LucideMenu, LucideSettings, LucideUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { UserSession } from "@/lib/next-auth/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TokensIcon } from "@radix-ui/react-icons";
import LogoutButton from "@/components/logout-button";

export function Menu() {
  const { data } = useSession({ required: true });

  const sessionUser = useMemo(() => data as UserSession, [data]);
  const pathname = usePathname();
  const activePath = pathname.split("/")[1];

  useEffect(() => {}, [sessionUser]);

  return (
    <Menubar className="flex items-center justify-between lg:justify-end rounded-none border-b border-none px-2 lg:px-4">
      <div className={"block lg:hidden"}>
        <Sheet>
          <SheetTrigger
            className={" flex items-center justify-center align-middle"}
          >
            <LucideMenu className={"ml-1 h-6 w-6"} />
          </SheetTrigger>
          <SheetContent side={"left"} className={"w-80 pt-10"}>
            {sessionUser?.user.role === "admin" && (
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
                      variant={
                        activePath === "settings" ? "secondary" : "ghost"
                      }
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
              <LogoutButton />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center">
        {sessionUser ? (
          <>
            <p>{sessionUser.user?.name}</p>
            <a
              href="#"
              className="px-2 py-1.5 text-sm font-semibold"
              onClick={() => signOut()}
            >
              Logout
            </a>
          </>
        ) : (
          <>
            <Link href="/login" className="px-2 py-1.5 text-sm font-semibold">
              Login
            </Link>
            <Link
              href="/register"
              className="px-2 py-1.5 text-sm font-semibold"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </Menubar>
  );
}
