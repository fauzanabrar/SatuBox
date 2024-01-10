"use client";
import React from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ListSWR() {
  const { data, error, isLoading, isValidating } = useSWR(
    "/api/fake",
    fetcher,
    {
      revalidateOnFocus: false,
      // refreshInterval: 1000,
    }
  );

  if (error) return <div>failed to load</div>;

  if (isLoading) return <div>loading...</div>;

  if (isValidating) return <>Is isValidating</>;

  return (
    <div>
      ListSWR success : {data?.message}
      <button
        className={"block p-4 bg-accent"}
        disabled={isValidating}
        onClick={() => mutate("/api/fake", { message: "loading dulu heheh" })}
      >
        mutate
      </button>
    </div>
  );
}
