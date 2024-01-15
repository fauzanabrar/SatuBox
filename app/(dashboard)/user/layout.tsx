import { Menu } from "@/components/menu";
import { Sidebar } from "@/components/sidebar";
import { getUserSession } from "@/lib/next-auth/user-session";

import { ReactNode } from "react";

export const metadata = {
  title: "User",
};

export default async function UserLayout({ children }: { children: ReactNode }) {
  const userSession = await getUserSession();
  return (
    <>
      <Menu />
      <div className="border-t">
        <div className="bg-background">
          <div className="grid lg:grid-cols-5">
            <Sidebar userSession={userSession} className="hidden lg:block" />
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
