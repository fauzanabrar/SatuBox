import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = {
  triggerChildren: ReactNode;
  children: ReactNode;
  onSelect: () => void;
  onOpenChange: (open: boolean) => void;
  className?: string;
  isOpen?: boolean;
};

export const DialogItem = ({
  triggerChildren,
  children,
  onSelect,
  onOpenChange,
  className,
  isOpen,
}: Props) => {
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onSelect && onSelect();
            }}
            className="cursor-pointer"
          >
            {triggerChildren}
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogPortal>
          <DialogContent className={className}>{children}</DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};
