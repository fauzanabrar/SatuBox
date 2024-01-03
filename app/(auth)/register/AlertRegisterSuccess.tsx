"use client"
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'
import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {LucideCheck} from "lucide-react";

export default function AlertRegisterSuccess() {
  return (
    <Alert className="flex flex-row bg-green-50">
      <div className="inline-block mr-4">
        <LucideCheck className="text-green-700"/>
      </div>
      <div>
        <AlertTitle> Register Success</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          You have successfully registered. You can Login now.
          <Button className="w-fit">
            <Link href="/login">Login Now!</Link>
          </Button>
        </AlertDescription>
      </div>
    </Alert>
  )
}
