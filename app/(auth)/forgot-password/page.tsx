import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ForgotPasswordForm from "@/app/(auth)/forgot-password/ForgotPasswordForm";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Forgot password page.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container flex h-screen w-screen items-center justify-center">
      <Card className="w-2/7">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Suspense fallback={<div className="h-36 w-full"></div>}>
            <ForgotPasswordForm />
          </Suspense>
        </CardContent>
        <CardFooter>
          <div className="flex-1">
            <CardDescription className="mt-1">
              Remember your password?{" "}
              <Link href="/login" className="font-bold text-card-foreground">
                Login
              </Link>
            </CardDescription>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
