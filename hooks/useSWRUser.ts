import useSWR from "swr";

const fetcher = async (
  url: string,
  setLoading?: (loading: boolean) => void,
) => {
  const response = await fetch(url)

  const data = await response.json()

  return data

};

export const useSWRUser = () => {
  const { data, error, mutate } = useSWR(
    "/api/user",
    (url: string) => fetcher(url),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      refreshInterval: 5000,
    },
  );

  return {
    data,
    error,
    mutate,
  };
}