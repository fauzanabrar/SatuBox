import { getUserSession } from "@/lib/next-auth/user-session";
import FormEditUser from "./form-edit-user";
import ClearCache from "./clear-cache";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const userSession = await getUserSession();

  return (
    <div className="col-span-3 lg:col-span-4">
      <div className="h-full px-4 py-4 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <div className="mt-4 rounded-2xl border p-4 md:w-1/2 lg:w-1/3">
          <h3 className="text-md mb-4 font-semibold tracking-tight">
            Change Profile Name
          </h3>
          <FormEditUser
            user={userSession}
            hidden={["oldUsername", "role", "username"]}
          />
        </div>
        {/* Remove cache */}
        {/* <ClearCache /> */}
      </div>
    </div>
  );
}
