import NodeCache from "node-cache";

type CacheKey = string;

export const cacheKey = {
  folder: (id: string) => `folder-${id}`,
  file: (fileId: string, folderId?: string) =>
    `folder-${folderId}-file-${fileId}`,
  // deprecated
  media: (mediaId: string, fileId?: string, folderId?: string) =>
    `folder-${folderId}-file-${fileId}-media-${mediaId}`,
  folderName: (nameId: string, folderId?: string) =>
    `folder-${folderId}-name-${nameId}`,
  parentsFolder: (folderId: string) => `parents-${folderId}`,
};

const myCache = new NodeCache({ stdTTL: 3600 });

export function cache(key: CacheKey): [any, (data: any) => void] {
  const cacheData = myCache.get(key);

  const setCacheData = (data: any) => {
    myCache.set(key, data);
  };
  return [cacheData, setCacheData];
}

export function deleteCache(key: CacheKey) {
  const list = myCache.keys();
  list.forEach((k) => {
    if (k.includes(key)) {
      myCache.del(k);
    }
  });
}

export function deleteCaches(keys: CacheKey[]) {
  keys.forEach((key) => {
    deleteCache(key);
  });
}

export function clearCache() {
  myCache.flushAll();
}
