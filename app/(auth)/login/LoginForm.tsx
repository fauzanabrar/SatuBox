"use client"
import React, {ChangeEvent, useState} from 'react';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useRouter, useSearchParams} from 'next/navigation';
import {signIn} from "next-auth/react";
import {Button} from "@/components/ui/button";


function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/list";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFormValues({email: "", password: ""});

      const res = await signIn("credentials", {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
        callbackUrl,
      });

      setLoading(false);

      console.log(res);
      if (!res?.error) {
        router.push(callbackUrl);
      } else {
        setError("Invalid email or password");
      }
    } catch (error: any) {
      setLoading(false);
      setError(error);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target;
    setFormValues({...formValues, [name]: value});
  };


  return (
    <div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        {error && (
          <p className="text-center font-medium font-sans bg-destructive-foreground p-2 text-destructive">{error}</p>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" placeholder="email@example.com" onChange={handleChange}/>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" onChange={handleChange}/>
        </div>
        <Button className="w-full">
          {loading ? "Loading..." : "Login"}
        </Button>
      </form>
    </div>
  );
}

export default LoginForm;