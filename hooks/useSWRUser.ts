import { User } from "@/types/userTypes";
import useSWR from "swr";

const fetcher = async (
  url: string,
  setLoading?: (loading: boolean) => void,
) => {
  const response = await fetch(url);

  const result = await response.json();

  if (setLoading) setLoading(false);

  // Return the full response object
  return result;
}

export const useSWRUser = (setLoading: (loading: boolean) => void) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "/api/users",
    (url: string) => fetcher(url, setLoading),
    {
      revalidateOnFocus: true,
      errorRetryCount: 2,
      refreshInterval: 0,
    },
  );

  const sortedData = data?.users?.sort((a: User, b: User) => {
    return a.name.localeCompare(b.name);
  }) || [];

  return {
    data: sortedData,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};
