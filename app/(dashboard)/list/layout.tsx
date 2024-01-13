import {Menu} from "@/components/menu";
import { Sidebar } from "@/components/sidebar";

import { ReactNode } from "react";

export default function ListSWRLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col w-screen">
      <Menu />
      <div className="border-t flex-grow">
        <div className="bg-background h-full">
          <div className="grid lg:grid-cols-5 h-full">
            <Sidebar activePath={"upload"} className="hidden lg:border-r lg:block" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
