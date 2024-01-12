import useSWR, { mutate } from "swr";

const fetcher = (url: string, setLoading?: (loading: boolean) => void) =>
  fetch(url)
    .then((res) => res.json())
    .finally(() => {
      if (setLoading) setLoading(false);
    });

export const urlKey: string = "/api/v2/drive";

export default function useSWRList({
  folderId,
  setRefreshClicked,
}: {
  folderId?: string;
  setRefreshClicked?: (loading: boolean) => void;
}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    [urlKey, folderId],
    () => fetcher(`${urlKey}/${folderId}`, setRefreshClicked),
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

export const mutateList = (folderId?: string) => mutate([urlKey, folderId]);
