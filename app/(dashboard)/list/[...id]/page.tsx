import ListViewId from "./ListViewId";

export const metadata = {
  title: "List",
};

export default async function ListIdPage() {
  return (
    <>
      <div className="col-span-3 lg:col-span-4 lg:border-l">
        <div className="h-full px-4 py-6 lg:px-8">
          <ListViewId />
        </div>
      </div>
    </>
  );
}
