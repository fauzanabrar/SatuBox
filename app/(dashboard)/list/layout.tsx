import { Menu } from "@/components/menu";
import { Sidebar } from "@/components/sidebar";
import { getUserSession } from "@/lib/next-auth/user-session";

import { ReactNode } from "react";

export const metadata = {
  title: "List",
};

export default async function ListSWRLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userSession = await getUserSession();

  return (
    <div className="flex flex-col w-screen h-screen">
      <Menu />
      <div className="border-t flex-grow">
        <div className="bg-background h-full">
          <div className="grid lg:grid-cols-5 h-full">
            <Sidebar
              userSession={userSession}
              className="hidden lg:border-r lg:block"
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
