import React from "react";

export default function SettingsView({ userSession }: { userSession: any }) {
  return (
    <div>
      settings
      <div className="flex-row py-4 gap-4">
        <div>{userSession?.user?.name}</div>
        <div>{userSession?.user?.email}</div>
        <div>{userSession?.user?.role}</div>
        <div>{userSession?.user?.id}</div>
        <div>{userSession?.user?.image}</div>
      </div>
    </div>
  );
}
