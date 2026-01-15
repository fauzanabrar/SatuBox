"use client";

import { SessionProvider } from "next-auth/react";
import PaidDownloadActions from "@/components/share/paid-download-actions";

export default function PaidDownloadActionsWrapper(props: any) {
  return (
    <SessionProvider>
      <PaidDownloadActions {...props} />
    </SessionProvider>
  );
}