import { Sidebar } from "@/components/sidebar/sidebar";
import { getUserSession } from "@/lib/next-auth/user-session";

import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userSession = await getUserSession();
  return (
    <>
      <div className="border-t">
        <div className="bg-background">
          <div className="block lg:grid lg:grid-cols-5">
            <Sidebar userSession={userSession} />
            <div className="lg:pt-4 lg:col-span-4">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
