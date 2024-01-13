export interface FireStoreRestrict {
  fileId: string;
  username: string;
  whitelist: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface FireStoreRestrictWithDocId {
  id: string;
  fileId: string;
  username: string;
  whitelist: string[];
  createdAt: Date;
  updatedAt?: Date;
}
