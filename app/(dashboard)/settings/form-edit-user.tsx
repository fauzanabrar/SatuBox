"use client";

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
import { capitalize } from "@/lib/utils";
import { User } from "@/types/userTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Loading from "@/components/loading";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { userAtom } from "@/lib/jotai/user-atom";
import { useAtom } from "jotai";

const formSchema = z.object({
  name: z.string().min(4, {
    message: "Name must be at least 4 characters.",
  }),
  username: z.string(),
  oldUsername: z.string().min(4, {
    message: "Username must be at least 4 characters.",
  }),
  role: z.string(),
});

export default function FormEditUser({
  user,
  hidden = [],
}: {
  user: User;
  hidden?: string[];
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const [userSession, setUserSession] = useAtom(userAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      oldUsername: user.username,
      role: user.role,
    },
  });

  const oldName = user.name;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Something went wrong");
      setUserSession((prev) => ({ ...prev, name: values.name }));
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          id="editName"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {Object.entries(formSchema.shape)
            .filter((schema) => !hidden.includes(schema[0]))
            .map(([fieldName, _]) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as keyof typeof formSchema.shape} // Cast the fieldName to the specific keys defined in formSchema.shape
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{capitalize(fieldName)}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button>Change</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure to change ?</AlertDialogTitle>
                <AlertDialogDescription>
                  The name will be changed from{" "}
                  <span className="font-semibold text-primary">{oldName}</span>{" "}
                  to{" "}
                  <span className="font-semibold text-primary">
                    {form.watch("name")}
                  </span>
                  .
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" form="editName" className="flex px-4">
                  <Loading loading={loading} size={20} className="-ml-2 mr-2" />
                  Change
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </Form>
    </div>
  );
}
