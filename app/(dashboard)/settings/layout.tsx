import { Menu } from "@/components/menu";
import { Sidebar } from "@/components/sidebar";

import { ReactNode } from "react";

export const metadata = {
  title: "Settings",
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <Menu />
      <div className="border-t h-full">
        <div className="bg-background h-full">
          <div className="grid lg:grid-cols-5 h-full">
            <Sidebar
              activePath={"settings"}
              className="hidden lg:border-r lg:block"
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
