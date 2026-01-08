import { FileDrive } from "@/types/api/file";
import useSWR, { mutate } from "swr";

const fetcher = async (
  url: string[],
  setLoading?: (loading: boolean) => void,
) => {
  const f = (u: string) =>
    fetch(u)
      .then((r) => r.json())
      .catch((e) => e);

  // if (setLoading) setLoading(true);

  try {
    return await Promise.all(url.map((u_2: string) => f(u_2)));
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const urlKey: string = "/api/v2/drive";

const getListUrls = (folderId?: string) => {
  const id = folderId || "";

  return id
    ? [`${urlKey}/${id}`, `${urlKey}/${id}?parents=true`]
    : [urlKey];
};

export default function useSWRList({
  folderId,
  setRefreshClicked,
}: {
  folderId?: string;
  setRefreshClicked?: (loading: boolean) => void;
}) {
  const urls = getListUrls(folderId);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    urls,
    (url: string[]) => fetcher(url, setRefreshClicked),
    {
      revalidateOnFocus: true,
      errorRetryCount: 2,
      refreshInterval: 0,
    },
  );

  const combineData = {
    files: data?.[0]?.files ? (data[0].files as FileDrive[]) : [],
    parents: data?.[1]?.parents ?? [],
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
  return mutate(getListUrls(folderId));
};
