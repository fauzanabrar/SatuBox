import useSWR, { mutate } from "swr";

const fetcher = (url: string, setLoading?: (loading: boolean) => void) =>
  fetch(url)
    .then((res) => res.json())
    .finally(() => {
      if (setLoading) setLoading(false);
    });

const urlKey = "/api/v2/drive";

export default function useSWRList(
  setRefreshClicked?: (clicked: boolean) => void
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    urlKey,
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

export const mutateList = () => mutate(urlKey);
