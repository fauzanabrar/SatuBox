import { Menu } from "@/components/menu";
import { Sidebar } from "@/components/sidebar";
import Loading from "@/components/loading";
import { getUserSession } from "@/lib/next-auth/user-session";

export default async function LoadingDashboard() {
  const userSession = await getUserSession();
  return (
    <>
      <Menu />
      <div className="border-t">
        <div className="bg-background">
          <div className="grid lg:grid-cols-5">
            <Sidebar userSession={userSession} className="hidden lg:block" />
            <div className="col-span-4 flex justify-center items-center">
              <Loading loading={true} size={150} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
