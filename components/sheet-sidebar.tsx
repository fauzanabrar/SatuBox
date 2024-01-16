import { LucideMenu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserSession } from "@/types/api/auth";
import { Sidebar } from "./sidebar";

export default function SheetSidebar({
  userSession,
  className,
}: {
  userSession: UserSession;
  className?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger
        className={"flex items-center justify-center align-middle " + className}
      >
        <LucideMenu className={"ml-1 h-6 w-6"} />
      </SheetTrigger>
      <SheetContent side={"left"} className={"w-80 pt-10"}>
        <Sidebar userSession={userSession} />
      </SheetContent>
    </Sheet>
  );
}
