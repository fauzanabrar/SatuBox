import { Menu } from "@/components/menu";
import { Sidebar } from "@/components/sidebar";

import { ReactNode } from "react";

export default function ListLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Menu />
      <div className="border-t">
        <div className="bg-background">
          <div className="grid lg:grid-cols-5">
            <Sidebar activePath={"list"} className="hidden lg:block" />
            <div className="col-span-3 lg:col-span-4 lg:border-l">
              <div className="h-full px-4 py-6 lg:px-8">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
