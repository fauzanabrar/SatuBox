import InputFile from "@/components/list-swr/input-file";
import AddFolder from "@/components/list-swr/add-folder";
import ListSWR from "@/components/list-swr/list-swr";
import { Separator } from "@/components/ui/separator";

export default function ListSWRPage() {
  return (
    <div className="col-span-5 lg:col-span-4 h-full">
      <div className="px-4 py-6 lg:px-8 h-full ">
        <div className="mt-4 space-y-1">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Upload File
            </h2>
            <AddFolder />
          </div>
        </div>
        <div className="flex align-middle gap-2">
          <InputFile />
        </div>
        <Separator className="my-1" />
        <ListSWR />
      </div>
    </div>
  );
}
