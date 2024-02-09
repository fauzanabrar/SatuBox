import { User } from "@/types/userTypes";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { ReactNode, useState } from "react";

import FormEditProfile from "@/components/form-edit-profile";

export default function DialogEditUser({
  children,
  user,
  mutate,
}: {
  children: ReactNode;
  user: User;
  mutate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="w-1/2 rounded-lg md:w-1/4">
          <h2 className="font-semibold">Edit User {user.username}</h2>
          <FormEditProfile
            hidden={["oldUsername"]}
            {...{ user, open, setOpen, loading, setLoading, mutate }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
