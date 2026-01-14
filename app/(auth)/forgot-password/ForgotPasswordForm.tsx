"use client";

import React, { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const LoginButton = () => (
  <Button>
    <Link href="/login" prefetch={true}>
      Login
    </Link>
  </Button>
);

const MIN_PASSWORD_LENGTH = 6;

function ForgotPasswordForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formValues.newPassword.length < MIN_PASSWORD_LENGTH) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formValues.newPassword !== formValues.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/users/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formValues.username.trim(),
          email: formValues.email.trim(),
          newPassword: formValues.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to reset password");
      }

      toast({
        title: "Password reset",
        variant: "success",
        description: "You can login now.",
        duration: 3000,
        action: <LoginButton />,
      });

      setFormValues({
        username: "",
        email: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form method="POST" className="grid gap-4" onSubmit={onSubmit}>
      {error && (
        <p className="bg-destructive-foreground p-2 text-center font-sans font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          name="username"
          onChange={handleChange}
          value={formValues.username}
          autoComplete="username"
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
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          onChange={handleChange}
          value={formValues.newPassword}
          autoComplete="new-password"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          onChange={handleChange}
          value={formValues.confirmPassword}
          autoComplete="new-password"
          required
        />
      </div>
      <Button className="w-full" disabled={loading}>
        {loading ? "Loading..." : "Reset password"}
      </Button>
    </form>
  );
}

export default ForgotPasswordForm;
