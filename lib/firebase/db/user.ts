import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  limit,
} from "firebase/firestore/lite";
import { firestoreApp } from "../init";
import { ChangedUser, RegisterUser } from "@/types/userTypes";
import { DEFAULT_PLAN_ID, PLANS } from "@/lib/billing/plans";

const usersCol = collection(firestoreApp, "user");

export interface FireStoreUser {
  id?: string;
  username: string;
  password: string;
  name: string;
  role: string;
  planId?: string;
  billingCycle?: string | null;
  storageLimitBytes?: number;
  storageUsedBytes?: number;
  lastPaymentAt?: Date | null;
  lastPaymentAmount?: number | null;
  lastPaymentOrderId?: string | null;
  lastPaymentPlanId?: string | null;
  lastPaymentCycle?: string | null;
  nextBillingAt?: Date | null;
  rootFolderId?: string;
  sharedRootFolderIds?: string[];
  sharedWithUsernames?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface FireStoreUpdateUser {
  username: string;
  name: string;
  role: string;
  updatedAt: Date;
}

// Get a list of all users from the database
export async function getUsers() {
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map((doc) => doc.data());
  return userList as FireStoreUser[];
}

// Get a list of all users with doc Id from the database
export async function getUsersWithDocId() {
  const userSnapshot = await getDocs(usersCol);

  const userList = userSnapshot.docs.map((doc) => {
    const user = doc.data();
    user.id = doc.id;
    return user;
  });

  return userList as FireStoreUser[];
}

// Find a user by their username
export async function getUserByUsername(
  username: string,
): Promise<FireStoreUser | undefined> {
  const q = query(usersCol, where("username", "==", username), limit(1));
  const userSnapshot = await getDocs(q);
  const userDoc = userSnapshot.docs[0];
  if (!userDoc) return undefined as FireStoreUser | undefined;
  return userDoc.data() as FireStoreUser;
}

// Get a user by their username with doc Id from the database
export async function getUserByUsernameWithDocId(
  username: string,
): Promise<FireStoreUser | undefined> {
  const q = query(usersCol, where("username", "==", username), limit(1));
  const userSnapshot = await getDocs(q);
  const userDoc = userSnapshot.docs[0];
  if (!userDoc) return undefined as FireStoreUser | undefined;
  const user = userDoc.data() as FireStoreUser;
  user.id = userDoc.id;
  return user;
}

// Create new User
export async function createUser(user: RegisterUser) {
  const createdAt = new Date();
  const { hash } = await import("bcryptjs");
  const hashedPassword = await hash(user.password, 10);

  const userDoc: FireStoreUser = {
    username: user.username,
    password: hashedPassword,
    name: user.name,
    role: "user",
    planId: DEFAULT_PLAN_ID,
    billingCycle: null,
    storageLimitBytes: PLANS[DEFAULT_PLAN_ID].storageLimitBytes,
    storageUsedBytes: 0,
    lastPaymentAt: null,
    lastPaymentAmount: null,
    lastPaymentOrderId: null,
    lastPaymentPlanId: null,
    lastPaymentCycle: null,
    nextBillingAt: null,
    rootFolderId: "",
    sharedRootFolderIds: [],
    sharedWithUsernames: [],
    createdAt: createdAt,
    updatedAt: createdAt,
  };

  // Check if user already exists
  const userSnapshot = await getUserByUsername(user.username);
  if (userSnapshot) {
    throw new Error("Username already exists");
  }

  try {
    const docRef = await addDoc(usersCol, userDoc);
    console.log(`Document written with ID: ${docRef.id}`);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Update User
export async function updateUser(user: ChangedUser) {
  const updatedAt = new Date();

  const userDoc: FireStoreUpdateUser = {
    username: user.newUsername ?? user.username,
    name: user.name!,
    role: user.role,
    updatedAt: updatedAt,
  };

  // Check if user already exists
  const userSnapshot = await getUserByUsernameWithDocId(user.username);

  if (!userSnapshot) throw new Error("User not found");

  const changedUser = {
    ...userDoc,
    password: userSnapshot.password,
  };

  const userDocRef = doc(usersCol, userSnapshot.id);

  if (userDocRef === null) throw new Error("User not found");

  try {
    await updateDoc(userDocRef, changedUser);
    console.log(`Document updated with ID: ${userDocRef.id}`);
  } catch (e) {
    console.error("Error update document: ", e);
  }
}

export async function updateUserByUsername(
  username: string,
  updates: Partial<FireStoreUser>,
) {
  const userSnapshot = await getUserByUsernameWithDocId(username);

  if (!userSnapshot) throw new Error("User not found");

  const userDocRef = doc(usersCol, userSnapshot.id);

  if (userDocRef === null) throw new Error("User not found");

  const updatedAt = new Date();

  try {
    await updateDoc(userDocRef, { ...updates, updatedAt });
  } catch (e) {
    console.error("Error update document: ", e);
  }
}

// Remove User
export async function deleteUser(username: string) {
  const userSnapshot = await getUserByUsernameWithDocId(username);

  if (!userSnapshot) throw new Error("User not found");

  const userDocRef = doc(usersCol, userSnapshot.id);

  try {
    await deleteDoc(userDocRef);
    console.log(`Document deleted with ID: ${userDocRef.id}`);
  } catch (e) {
    console.error("Error delete document: ", e);
  }
}
