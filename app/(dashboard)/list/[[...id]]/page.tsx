import InputFile from "@/components/list/input-file";
import AddFolder from "@/components/list/add-folder";
import ListSWR from "@/components/list/list";
import { Separator } from "@/components/ui/separator";
import { getUserSession } from "@/lib/next-auth/user-session";

export const metadata = {
  title: "List",
  description: "List",
};

export default async function ListPage() {
  const userSession = await getUserSession();

  return (
    <div className="col-span-5 h-full w-screen lg:col-span-4 lg:w-full">
      <div className="h-full px-4 py-2 lg:px-8 lg:py-4 ">
        <div className="mt-4 space-y-1">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Upload File
            </h2>
            <AddFolder />
          </div>
        </div>
        <div className="flex gap-2 align-middle">
          <InputFile />
        </div>
        <Separator className="my-1" />
        <ListSWR userSession={userSession} />
      </div>
    </div>
  );
}
