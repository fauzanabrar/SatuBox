import { authOptions } from "@/lib/next-auth/auth";
import { getServerSession } from "next-auth";
import SettingsView from "./SettingsView";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const userSession: any = await getServerSession(authOptions);

  return (
    <>
      <div className="col-span-3 lg:col-span-4 lg:border-l">
        <div className="h-full px-4 py-6 lg:px-8">
          <SettingsView userSession={userSession} />
        </div>
      </div>
    </>
  );
}
