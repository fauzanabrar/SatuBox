"use client";
import { Menubar } from "@/components/ui/menubar";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";

export function Menu() {
  const { data: sessionUser } = useSession();

  useEffect(() => {}, [sessionUser]);

  return (
    <Menubar className="justify-end rounded-none border-b border-none px-2 lg:px-4">
      {sessionUser ? (
        <>
          <p>{sessionUser.user?.name}</p>
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
          <Link href="/login" className="px-2 py-1.5 text-sm font-semibold">
            Login
          </Link>
          <Link href="/register" className="px-2 py-1.5 text-sm font-semibold">
            Register
          </Link>
        </>
      )}
    </Menubar>
  );
}
