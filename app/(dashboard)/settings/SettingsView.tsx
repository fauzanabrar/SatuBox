import { UserSession } from "@/types/api/auth";

export default function SettingsView({ userSession }: { userSession: UserSession }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
      <div className="flex-row py-4 gap-4">
        <div>{userSession.name}</div>
        <div>{userSession.role}</div>
        <div>{userSession.id}</div>
        <div>{userSession.image}</div>
      </div>
    </div>
  );
}
