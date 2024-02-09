import { Sidebar } from "@/components/sidebar/sidebar";
import { ReactNode } from "react";

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="border-t">
        <div className="bg-background">
          <div className="block lg:grid lg:grid-cols-5">
            <Sidebar />
            <div className="lg:col-span-4 lg:pt-4">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;
