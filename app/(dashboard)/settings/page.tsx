import { getUserSession } from "@/lib/next-auth/user-session";
import FormEditUser from "./form-edit-user";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const userSession = await getUserSession();

  return (
    <div className="col-span-3 lg:col-span-4">
      <div className="h-full px-4 py-4 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <div className="w-1/3 border rounded-2xl p-4 mt-4">
          <h3 className="text-md font-semibold tracking-tight mb-4">
            Change Profile Name
          </h3>
          <FormEditUser
            user={userSession}
            hidden={["oldUsername", "role", "username"]}
          />
        </div>
      </div>
    </div>
  );
}
