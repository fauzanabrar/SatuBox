import ListUser from "@/components/list-user/list-user";
import { getUserSession } from "@/lib/next-auth/user-session";
import { UserSession } from "@/types/api/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "User",
};

export default async function UserPage() {
  const userSession: UserSession = await getUserSession();

  if (userSession.role !== "admin") redirect("/list");

  return (
    <div className="col-span-3 lg:col-span-4 lg:border-l">
      <div className="h-full px-4 py-6 lg:px-8">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Users</h2>
        <ListUser userSession={userSession} />
      </div>
    </div>
  );
}
