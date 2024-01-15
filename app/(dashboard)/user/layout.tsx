import { Menu } from "@/components/menu";
import { Sidebar } from "@/components/sidebar";

import { ReactNode } from "react";

export const metadata = {
  title: "User",
};

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Menu />
      <div className="border-t">
        <div className="bg-background">
          <div className="grid lg:grid-cols-5">
            <Sidebar activePath={"user"} className="hidden lg:block" />
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
