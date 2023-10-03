import Image from "next/image";
import React from "react";

type ParamsType = {
  loading: boolean;
  size: number;
};

export default function loading({ loading, size }: ParamsType) {
  return (
    <>
      {loading && (
        <Image
          src="./images/loading.svg"
          alt="loading"
          width={size}
          height={size}
          className="animate-spin"
        />
      )}
    </>
  );
}
