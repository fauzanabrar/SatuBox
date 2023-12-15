import useListStore from "@/lib/zustand/useListStore";
import DashboardView from "./DashboardView";
import { getFiles } from "./drive";
import useStore from "@/lib/zustand/useStore";
import { useBearStore } from "@/lib/zustand/useBearStore";

export default async function DashboardPage() {

  return (
    <>
      <div className="col-span-3 lg:col-span-4 lg:border-l">
        <div className="h-full px-4 py-6 lg:px-8">
          <DashboardView />
        </div>
      </div>
    </>
  );
}
