export interface User {
  name: string;
  username: string;
  role: string;
  planId?: string;
  billingCycle?: string | null;
  storageLimitBytes?: number;
  storageUsedBytes?: number;
  rootFolderId?: string;
  sharedRootFolderIds?: string[];
  sharedWithUsernames?: string[];
}

export interface ChangedUser {
  name?: string;
  username: string;
  newUsername?: string;
  role: string;
}

export interface RegisterUser {
  name: string;
  username: string;
  password: string;
}
