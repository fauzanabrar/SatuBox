"use client"
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React from 'react'

export default function SettingsView() {
  const { data: sessionUser }: any = useSession() ;
  return (
    <div>SettingsView</div>
  )
}
