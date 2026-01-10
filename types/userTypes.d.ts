export interface User {


  name: string;
  username: string;
  email?: string;
  role: string;
  planId?: string;
  billingCycle?: string | null;
  storageLimitBytes?: number;
  storageUsedBytes?: number;
  lastPaymentAt?: Date | string | number | FirestoreTimestamp | null;
  lastPaymentAmount?: number | null;
  lastPaymentOrderId?: string | null;
  lastPaymentPlanId?: string | null;
  lastPaymentCycle?: string | null;
  nextBillingAt?: Date | string | number | FirestoreTimestamp | null;
  rootFolderId?: string;
  sharedRootFolderIds?: string[];
  sharedWithUsernames?: string[];


}

export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
};

export interface ChangedUser {
  name?: string;
  username: string;
  newUsername?: string;
  role: string;
}

export interface RegisterUser {


  name: string;
  username: string;
  email?: string;
  password: string;


}
