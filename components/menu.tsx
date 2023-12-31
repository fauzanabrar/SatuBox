"use client";
import { Menubar } from "@/components/ui/menubar";
import { User } from "@/types/userTypes";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export function Menu() {
  const { data: sessionUser } = useSession();

  useEffect(() => {
  }, [sessionUser])
  
  return (
    <Menubar className="justify-end rounded-none border-b border-none px-2 lg:px-4">
      {sessionUser ? (
        <>
          <p>{ sessionUser.user?.name }</p>
          <a
            href="#"
            className="px-2 py-1.5 text-sm font-semibold"
            onClick={() => signOut()}
          >
            Logout
          </a>
        </>
      ) : (
        <>
          <a
            href="#"
            onClick={() => signIn()}
            className="px-2 py-1.5 text-sm font-semibold"
          >
            Login
          </a>
          <a href="#" className="px-2 py-1.5 text-sm font-semibold">
            Register
          </a>
        </>
      )}
    </Menubar>
  );
}
