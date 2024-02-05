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

const driveCache = new NodeCache({ stdTTL: 3600 });

export function cache(key: CacheKey): [any, (data: any) => void] {
  const cacheData = driveCache.get(key);

  const setCacheData = (data: any) => {
    driveCache.set(key, data);
  };
  return [cacheData, setCacheData];
}

export function deleteCache(key: CacheKey) {
  const list = driveCache.keys();
  list.forEach((k) => {
    if (k.includes(key)) {
      driveCache.del(k);
    }
  });
}

export function deleteCaches(keys: CacheKey[]) {
  keys.forEach((key) => {
    deleteCache(key);
  });
}

export function clearCache() {
  driveCache.flushAll();
}
