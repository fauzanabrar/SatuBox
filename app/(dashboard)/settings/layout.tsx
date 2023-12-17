import { Menu } from "@/components/menu";
import { Sidebar } from "@/components/sidebar";

import { ReactNode } from "react";

export default function ListLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="hidden md:block">
        <Menu />
        <div className="border-t">
          <div className="bg-background">
            <div className="grid lg:grid-cols-5">
              <Sidebar activePath={"settings"} className="hidden lg:block" />
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}