"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
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
import Loading from "@/components/loading";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Enter a valid email address.",
  }),
});

export default function FormChangeEmail({
  currentEmail = "",
}: {
  currentEmail?: string;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: currentEmail ?? "",
    },
  });

  useEffect(() => {
    form.reset({ email: currentEmail ?? "" });
  }, [currentEmail, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const email = values.email.trim();
    try {
      setLoading(true);
      const response = await fetch("/api/users/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Failed to update email");
      }
      toast({
        variant: "success",
        title: "Email updated",
        description: "Your email has been updated.",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error?.message || "Something went wrong.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          <Loading loading={loading} size={18} className="-ml-2 mr-2" />
          {loading ? "Saving..." : "Save Email"}
        </Button>
      </form>
    </Form>
  );
}
