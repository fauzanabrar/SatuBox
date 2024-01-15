import { Menu } from "@/components/menu";
import { Sidebar } from "@/components/sidebar";
import { getUserSession } from "@/lib/next-auth/user-session";

import { ReactNode } from "react";

export const metadata = {
  title: "Settings",
};

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userSession = await getUserSession();
  return (
    <div className="h-screen flex flex-col">
      <Menu />
      <div className="border-t h-full">
        <div className="bg-background h-full">
          <div className="grid lg:grid-cols-5 h-full">
            <Sidebar
              className="hidden lg:border-r lg:block"
              userSession={userSession}
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
