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
    <div className="container flex h-screen w-screen items-center justify-center">
      <Card className="w-2/7">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter>
          <div className="flex-1">
            <CardDescription>
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-card-foreground">
                Login
              </Link>
            </CardDescription>
            <CardDescription className="mt-2 text-xs">
              By signing up, you agree to{" "}
              <Link href="/terms" className="font-bold text-card-foreground">
                Terms
              </Link>
              ,{" "}
              <Link href="/privacy" className="font-bold text-card-foreground">
                Privacy
              </Link>
              , and{" "}
              <Link
                href="/refund-policy"
                className="font-bold text-card-foreground"
              >
                Refunds
              </Link>
              .
            </CardDescription>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
