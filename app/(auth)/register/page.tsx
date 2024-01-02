// @flow
import * as React from 'react';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import Link from "next/link";

type Props = {};

export default function Page(props: Props) {
  return (
    <div className="container flex justify-center items-center h-screen w-screen">
      <Card className="w-2/7">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
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
            <Button className="w-full">Create account</Button>
            <CardDescription className="mt-4">
              Already have an account? <Link href="/login" className="font-bold text-card-foreground">Login</Link>
            </CardDescription>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};