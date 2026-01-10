import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore/lite";
import { firestoreApp } from "../init";

const earningsCol = collection(firestoreApp, "download_earning");
const withdrawCol = collection(firestoreApp, "withdraw_request");

export type DownloadEarning = {
  orderId: string;
  fileId: string;
  ownerUsername: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  status: "available" | "paid";
  createdAt: Date;
  updatedAt: Date;
};

export type WithdrawRequest = {
  id?: string;
  username: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  method: string;
  bankName?: string;
  provider?: string;
  accountName?: string;
  accountNumber?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getDownloadEarning(
  orderId: string,
): Promise<DownloadEarning | undefined> {
  const docRef = doc(earningsCol, orderId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return undefined;
  return snapshot.data() as DownloadEarning;
}

export async function createDownloadEarning(earning: DownloadEarning) {
  const existing = await getDownloadEarning(earning.orderId);
  if (existing) return;
  const docRef = doc(earningsCol, earning.orderId);
  await setDoc(docRef, earning);
}

export async function listDownloadEarningsByUsername(username: string) {
  const q = query(earningsCol, where("ownerUsername", "==", username));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DownloadEarning);
}

export async function createWithdrawRequest(
  payload: Omit<WithdrawRequest, "id">,
) {
  const docRef = await addDoc(withdrawCol, payload);
  return docRef.id;
}

export async function listWithdrawRequestsByUsername(username: string) {
  const q = query(withdrawCol, where("username", "==", username));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as WithdrawRequest;
    data.id = doc.id;
    return data;
  });
}

export async function listWithdrawRequests() {
  const snapshot = await getDocs(withdrawCol);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as WithdrawRequest;
    data.id = doc.id;
    return data;
  });
}

export async function updateWithdrawRequestStatus(
  id: string,
  status: WithdrawRequest["status"],
) {
  const docRef = doc(withdrawCol, id);
  await setDoc(
    docRef,
    {
      status,
      updatedAt: new Date(),
    },
    { merge: true },
  );
}
