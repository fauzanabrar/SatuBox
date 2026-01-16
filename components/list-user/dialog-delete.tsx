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
import { useToast } from "../ui/use-toast";

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

  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        body: JSON.stringify({ username: user.username }),
      });

      if (!response.ok) throw new Error("Something went wrong");

      mutate();

      toast({
        variant: "success",
        title: "Success Delete User",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error delete user!",
        description: error.message,
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="w-fit rounded-lg p-10 pb-4">
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
                  <Loading loading={loading} size={20} className="-ml-2 mr-2" />
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
