import { User } from "@/types/userTypes";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { ReactNode, useState } from "react";
import { Button } from "../ui/button";
import Loading from "../loading";

export default function DialogDeleteUser({
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

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        body: JSON.stringify({ username: user.username }),
      });

      if (!response.ok) throw new Error("Something went wrong");

      mutate();
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="p-10 pb-4 rounded-lg w-fit">
          <div className="grid gap-2 py-1">
            <div className="flex items-center gap-4">
              <span>
                Are you sure to delete{" "}
                <span className="font-bold">{user.username}</span> ?
              </span>
            </div>
            <DialogFooter className="mt-4">
              <div className="flex justify-end gap-2 ">
                <Button
                  variant="destructive"
                  className="flex px-4"
                  onClick={handleDelete}
                >
                  <Loading loading={loading} size={20} className="mr-2 -ml-2" />
                  Delete
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
