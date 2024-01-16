import { LucideLoader2 } from "lucide-react";
import Image from "next/image";
import React from "react";

type ParamsType = {
  loading: boolean;
  size: number;
  className?: string;
};

export default function Loading({ loading, size, className }: ParamsType) {
  return (
    <>
      {loading && (
        <LucideLoader2
          width={size}
          height={size}
          className={className + " animate-spin"}
        />
      )}
    </>
  );
}
