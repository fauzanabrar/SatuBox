import useSWR from "swr";

const fetcher = (url: string, setLoading?: (loading: boolean) => void) =>
  fetch(url)
    .then((res) => res.json())
    .finally(() => {
      if (setLoading) setLoading(false);
    });

export default function useSWRList(
  key: string,
  setRefreshClicked?: (clicked: boolean) => void
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    (url: string) => fetcher(url, setRefreshClicked),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      // refreshInterval: 1000,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
