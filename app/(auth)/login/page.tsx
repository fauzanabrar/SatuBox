import {Metadata} from "next"
import Link from "next/link"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import * as React from "react";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

export default function AuthenticationPage() {
  return (
    <>
      <div className="container flex justify-center items-center h-screen w-screen">
        <Card className="w-2/7">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email and password below to login
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@example.com"/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password"/>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex-1">
              <Button className="w-full">Login</Button>
              <CardDescription className="mt-4">
                Don't have an account? <Link href="/register" className="font-bold text-card-foreground">Register</Link>
              </CardDescription>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
