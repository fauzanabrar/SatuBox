import { User } from "@/types/userTypes";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "../ui/dialog";
import { ReactNode, useEffect, useState } from "react";
import Loading from "../loading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const formSchema = z.object({
  name: z.string().min(4, {
    message: "Name must be at least 4 characters.",
  }),
  username: z.string().min(4, {
    message: "Username must be at least 4 characters.",
  }),
  newUsername: z.string().min(4, {
    message: "Username must be at least 4 characters.",
  }),
  role: z.string(),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      newUsername: user.username,
      role: user.role,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        username: user.username,
        newUsername: user.username,
        role: user.role,
      });
    }
  }, [open]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Something went wrong");
      mutate();
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="rounded-lg w-1/2 md:w-1/4">
          <h2 className="font-semibold">Edit User {user.username}</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4 ">
                <Button variant="default" className="flex px-4" type="submit">
                  <Loading loading={loading} size={20} className="-ml-2 mr-2" />
                  Edit
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
