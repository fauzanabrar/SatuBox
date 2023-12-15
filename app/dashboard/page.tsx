import DashboardView from "./DashboardView";

export const metadata = {
  title: 'Dashboard'
}

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
