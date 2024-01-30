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
      <div className="w-full flex justify-center mt-8">
        <Loading size={60} loading={isLoading} />
      </div>
    );

  if (error)
    return (
      <div className="w-full flex justify-center mt-2 text-destructive font-semibold text-lg">
        Failed to load users!
      </div>
    );

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col">
        <div className="flex justify-center items-center align-middle p-4 border border-gray-600 rounded-md m-1">
          <p className="flex-1 text-center font-semibold">Name</p>
          <p className="flex-1 text-center font-semibold">Username</p>
          <p className="flex-1 text-center font-semibold">Role</p>
          <p className="flex-1 text-center font-semibold">Action</p>
        </div>
        {data?.map((user: User) => (
          <div
            className="flex p-4 border border-gray-400 rounded-md m-1"
            key={user.username}
          >
            <p className="flex-1 text-center">{user.name}</p>
            <p className="flex-1 text-center">{user.username}</p>
            <p className="flex-1 text-center">{user.role}</p>
            <div className="flex-1">
              <div className="flex gap-2 justify-center items-center">
                <DialogEditUser user={user} mutate={mutate}>
                  <Button variant={"outline"} size={"sm"}>
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
