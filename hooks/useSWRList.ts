import { FileDrive } from "@/types/api/file";
import useSWR, { mutate } from "swr";

const fetcher = (url: string[], setLoading?: (loading: boolean) => void) => {
  const f = (u: string) =>
    fetch(u)
      .then((r) => r.json())
      .catch((e) => e);

  // if (setLoading) setLoading(true);

  return Promise.all(url.map((u: string) => f(u))).finally(() => {
    if (setLoading) setLoading(false);
  });
};

export const urlKey: string = "/api/v2/drive";

export default function useSWRList({
  folderId,
  setRefreshClicked,
}: {
  folderId?: string;
  setRefreshClicked?: (loading: boolean) => void;
}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    [`${urlKey}/${folderId}`, `${urlKey}/${folderId}?parents=true`],
    (url: string[]) => fetcher(url, setRefreshClicked),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      refreshInterval: 5000,
    }
  );

  const combineData = {
    files: data ? (data[0].files as FileDrive[]) : [],
    parents: data ? data[1].parents : [],
  };

  return {
    data: combineData,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export const mutateList = (folderId?: string) =>
  mutate([`${urlKey}/${folderId}`, `${urlKey}/${folderId}?parents=true`]);
