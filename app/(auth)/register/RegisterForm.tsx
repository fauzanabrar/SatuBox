"use client";
import React, { ChangeEvent, useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RegisterUser } from "@/types/userTypes";
import Link from "next/link";

const LoginButton = () => (
  <Button>
    <Link href={"/login"} prefetch={true}>
      Login
    </Link>
  </Button>
);

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  const { toast } = useToast();

  const [error, setError] = useState("");

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setLoading(true);

        const user: RegisterUser = {
          username: formValues.username,
          email: formValues.email,
          password: formValues.password,
          name: formValues.name,
        };

        const createUser = (await import("@/lib/firebase/db/user")).createUser;
        await createUser(user);

        toast({
          title: "Register Success",
          variant: "success",
          description: "You can login now!",
          duration: 3000,
          action: <LoginButton />,
        });
        setLoading(false);
        setFormValues({ username: "", email: "", password: "", name: "" });
      } catch (error: any) {
        setLoading(false);
        setError(error.message);
      }
    },
    [formValues],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  return (
    <div>
      <form method="POST" className="grid gap-4" onSubmit={onSubmit}>
        {error && (
          <p className="bg-destructive-foreground p-2 text-center font-sans font-medium text-destructive">
            {error}
          </p>
        )}
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            name="name"
            onChange={handleChange}
            value={formValues.name}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            name="username"
            onChange={handleChange}
            value={formValues.username}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            onChange={handleChange}
            value={formValues.email}
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            onChange={handleChange}
            value={formValues.password}
            required
          />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Register"}
        </Button>
      </form>
    </div>
  );
}

export default RegisterForm;
