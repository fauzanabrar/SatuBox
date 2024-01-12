import { FileDrive, FileResponse } from "@/types/api/drive/file";
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
  const { data, error, isLoading, isValidating, mutate } = useSWR<FileResponse>(
    `${urlKey}/${folderId}`,
    (url: string) => fetcher(url, setRefreshClicked),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      // refreshInterval: 1000,
    }
  );

  const { data: fetcher2 } = useSWR<FileResponse>(
    `${urlKey}/${folderId}?parents=true`,
    (url: string) => fetcher(url, setRefreshClicked),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      keepPreviousData: true,
      // refreshInterval: 1000,
    }
  );

  const parents = (
    fetcher2 as unknown as FileResponse | undefined
  )?.parents?.map((item) => {
    return {
      url: item.id,
      name: item.name,
    };
  });

  const combineData = {
    files: (data as unknown as FileResponse | undefined)?.files as FileDrive[],
    parents: parents ? parents : [],
  };

  return {
    data: combineData,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export const mutateList = (folderId?: string) => {
  mutate(`${urlKey}/${folderId}`);
  mutate(`${urlKey}/${folderId}?parents=true`);
};
