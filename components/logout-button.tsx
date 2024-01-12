"use client"
import {Button} from "@/components/ui/button";
import {LucideLogOut} from "lucide-react";
import Link from "next/link";
import {signOut} from "next-auth/react";

LogoutButton.propTypes = {};

function LogoutButton() {
  return (
    <div className={"pl-4 pt-3"}>
      <Button variant={"outline"} className={"text-destructive border-destructive"} onClick={() => signOut()}>
        <LucideLogOut className="mr-2 h-4 w-4"/>
        Logout
      </Button>
    </div>
  );
}

export default LogoutButton;