"use client";
import { Button } from "@/components/ui/button";
import { LucideLogOut } from "lucide-react";
import { signOut } from "next-auth/react";

LogoutButton.propTypes = {};

function LogoutButton({
  variant,
  className,
  icon = true,
}: {
  variant?: "ghost" | "default" | "outline";
  className?: string;
  icon?: boolean;
}) {
  return (
    <Button variant={variant} className={className} onClick={() => signOut()}>
      <LucideLogOut className={icon ? "mr-2 h-4 w-4" : "mr-2 hidden h-4 w-4"} />
      Logout
    </Button>
  );
}

export default LogoutButton;
