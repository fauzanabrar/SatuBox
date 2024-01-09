import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RegisterForm from "@/app/(auth)/register/RegisterForm";
import Link from "next/link";

export const metadata = {
  title: "Register",
  description: "Register page.",
};

export default function RegisterPage() {
  return (
    <div className="container flex justify-center items-center h-screen w-screen">
      <Card className="w-2/7">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter>
          <CardDescription>
            Already have an account?{" "}
            <Link href={"/login"} className="font-bold text-card-foreground">
              Login
            </Link>
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
