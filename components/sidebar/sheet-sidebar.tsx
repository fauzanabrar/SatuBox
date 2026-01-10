"use client";
import { LucideMenu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserSession } from "@/types/api/auth";
import { SidebarMenu } from "./sidebar-menu";
import { useState } from "react";

export default function SheetSidebar({
  userSession,
  className,
}: {
  userSession: UserSession;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          className={
            "flex items-center justify-center align-middle " + className
          }
        >
          <LucideMenu className={"ml-1 h-6 w-6"} />
        </SheetTrigger>
        <SheetContent side={"right"} className={"w-80 pt-10"}>
          <SheetTitle className="sr-only">Sidebar</SheetTitle>
          <SidebarMenu userSession={userSession} toggle={toggle} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
