import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore/lite";
import { firestoreApp } from "../init";

const paidDownloadsCol = collection(firestoreApp, "paid_download");
const downloadOrdersCol = collection(firestoreApp, "download_order");
const downloadTokensCol = collection(firestoreApp, "download_token");

export type PaidDownload = {
  fileId: string;
  ownerUsername: string;
  price: number;
  currency: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DownloadOrder = {
  orderId: string;
  fileId: string;
  ownerUsername: string;
  amount: number;
  currency: string;
  status: "pending" | "paid";
  token?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DownloadToken = {
  token: string;
  fileId: string;
  orderId: string;
  amount: number;
  currency: string;
  createdAt: Date;
};

export async function getPaidDownload(
  fileId: string,
): Promise<PaidDownload | undefined> {
  const docRef = doc(paidDownloadsCol, fileId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return undefined;
  return snapshot.data() as PaidDownload;
}

export async function setPaidDownload(
  fileId: string,
  data: Omit<PaidDownload, "fileId" | "createdAt" | "updatedAt">,
) {
  const now = new Date();
  const docRef = doc(paidDownloadsCol, fileId);
  const existing = await getPaidDownload(fileId);
  const payload: PaidDownload = {
    fileId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...data,
  };
  await setDoc(docRef, payload);
}

export async function deletePaidDownload(fileId: string) {
  const docRef = doc(paidDownloadsCol, fileId);
  await deleteDoc(docRef);
}

export async function createDownloadOrder(order: DownloadOrder) {
  const now = new Date();
  const docRef = doc(downloadOrdersCol, order.orderId);
  await setDoc(docRef, {
    ...order,
    createdAt: order.createdAt ?? now,
    updatedAt: order.updatedAt ?? now,
  });
}

export async function getDownloadOrder(
  orderId: string,
): Promise<DownloadOrder | undefined> {
  const docRef = doc(downloadOrdersCol, orderId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return undefined;
  return snapshot.data() as DownloadOrder;
}

export async function updateDownloadOrder(
  orderId: string,
  updates: Partial<DownloadOrder>,
) {
  const docRef = doc(downloadOrdersCol, orderId);
  await updateDoc(docRef, { ...updates, updatedAt: new Date() });
}

export async function createDownloadToken(token: DownloadToken) {
  const docRef = doc(downloadTokensCol, token.token);
  await setDoc(docRef, token);
}

export async function getDownloadToken(
  token: string,
): Promise<DownloadToken | undefined> {
  const docRef = doc(downloadTokensCol, token);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return undefined;
  return snapshot.data() as DownloadToken;
}
