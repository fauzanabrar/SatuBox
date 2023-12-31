import { authOptions } from "@/lib/next-auth/auth";
import { getServerSession } from "next-auth";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const userSession: any = await getServerSession(authOptions);

  return (
    <>
      <div className="col-span-3 lg:col-span-4 lg:border-l">
        <div className="h-full px-4 py-6 lg:px-8">
          {/* <DashboardView /> */}
          settings
          <div className="flex-row py-4 gap-4">
            <div>{userSession?.user?.name}</div>
            <div>{userSession?.user?.email}</div>
            <div>{userSession?.user?.role}</div>
            <div>{userSession?.user?.id}</div>
            <div>{userSession?.user?.image}</div>
          </div>
        </div>
      </div>
    </>
  );
}
