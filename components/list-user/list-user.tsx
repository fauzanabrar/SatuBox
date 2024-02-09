"use client";

import { useSWRUser } from "@/hooks/useSWRUser";
import Loading from "../loading";
import { User } from "@/types/userTypes";
import { useState } from "react";
import { Button } from "../ui/button";
import { UserSession } from "@/types/api/auth";
import dynamic from "next/dynamic";

const DialogDeleteUser = dynamic(() => import("./dialog-delete"), {
  ssr: false,
});

const DialogEditUser = dynamic(() => import("./dialog-edit"), { ssr: false });

export default function ListUser({
  userSession,
}: {
  userSession: UserSession;
}) {
  const [loading, setLoading] = useState(false);

  const { data, error, isLoading, mutate } = useSWRUser(setLoading);

  if (isLoading && !data)
    return (
      <div className="mt-8 flex w-full justify-center">
        <Loading size={60} loading={isLoading} />
      </div>
    );

  if (error)
    return (
      <div className="mt-2 flex w-full justify-center text-lg font-semibold text-destructive">
        Failed to load users!
      </div>
    );

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col">
        <div className="m-1 flex items-center justify-center rounded-md border border-gray-600 p-4 align-middle">
          <p className="flex-1 text-center font-semibold">Name</p>
          <p className="flex-1 text-center font-semibold">Username</p>
          <p className="flex-1 text-center font-semibold">Role</p>
          <p className="flex-1 text-center font-semibold">Action</p>
        </div>
        {data?.map((user: User) => (
          <div
            className="m-1 flex items-center justify-center rounded-md border border-gray-400 p-4 align-middle"
            key={user.username}
          >
            <p className="flex-1 text-center">{user.name}</p>
            <p className="flex-1 text-center">{user.username}</p>
            <p className="flex-1 text-center">{user.role}</p>
            <div className="flex-1">
              <div className="flex items-center justify-center gap-2">
                <DialogEditUser user={user} mutate={mutate}>
                  <Button
                    variant={"outline"}
                    size={"sm"}
                    disabled={user.username === userSession.username}
                  >
                    Edit
                  </Button>
                </DialogEditUser>
                <DialogDeleteUser user={user} mutate={mutate}>
                  <Button
                    variant={"destructive"}
                    size={"sm"}
                    disabled={user.username === userSession.username}
                  >
                    Delete
                  </Button>
                </DialogDeleteUser>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
