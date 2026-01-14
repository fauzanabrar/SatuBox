import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "@/app/(auth)/login/LoginForm";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
  description: "Login page.",
};

export default function AuthenticationPage() {
  return (
    <div className="container flex h-screen w-screen items-center justify-center">
      <Card className="w-2/7">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username and password below to login
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Suspense fallback={<div className="h-36 w-full"></div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
        <CardFooter>
          <div className="flex-1">
            <CardDescription className="mt-1">
              {"Don't"} have an account?{" "}
              <Link href="/register" className="font-bold text-card-foreground">
                Register
              </Link>
            </CardDescription>
            <CardDescription className="mt-2 text-xs">
              By continuing, you agree to{" "}
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
