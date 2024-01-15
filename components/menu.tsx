import { Menubar } from "@/components/ui/menubar";
import Link from "next/link";
import { getUserSession } from "@/lib/next-auth/user-session";
import dynamic from "next/dynamic";
import LogoutButton from "@/components/logout-button";

const SheetSidebar = dynamic(() => import("./sheet-sidebar"), { ssr: false });

export async function Menu() {
  const userSession = await getUserSession();

  return (
    <Menubar className="flex items-center justify-between lg:justify-end rounded-none border-b border-none px-2 lg:px-4">
      <SheetSidebar userSession={userSession} className="block lg:hidden" />
      <div className="flex items-center">
        {userSession ? (
          <>
            <p className="text-md">{userSession.name}</p>
            <LogoutButton variant={"ghost"} className="" icon={false}/>
          </>
        ) : (
          <>
            <Link href="/login" className="px-2 py-1.5 text-sm font-semibold">
              Login
            </Link>
            <Link
              href="/register"
              className="px-2 py-1.5 text-sm font-semibold"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </Menubar>
  );
}
