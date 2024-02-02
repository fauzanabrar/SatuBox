import { Suspense, lazy } from "react";
import { SidebarMenu } from "./sidebar-menu";
import { getUserSession } from "@/lib/next-auth/user-session";

const SheetSidebar = lazy(() => import("./sheet-sidebar"));

export async function Sidebar({ className }: { className?: string }) {
  const userSession = await getUserSession();

  return (
    <div>
      <div className="lg:hidden">
        <div className="flex justify-end p-2">
          <Suspense fallback={<div className={"ml-1 h-6 w-6"} />}>
            <SheetSidebar userSession={userSession} className={className} />
          </Suspense>
        </div>
      </div>
      <div className={"hidden lg:border-r lg:block"}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <SidebarMenu userSession={userSession} />
          </div>
        </div>
      </div>
    </div>
  );
}
