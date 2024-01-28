import ListUser from "@/components/list-user/list-user";

export const metadata = {
  title: "User",
};

export default async function UserPage() {
  return (
    <>
      <div className="col-span-3 lg:col-span-4 lg:border-l">
        <div className="h-full px-4 py-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Users
          </h2>
          
          <ListUser />
        </div>
      </div>
    </>
  );
}
