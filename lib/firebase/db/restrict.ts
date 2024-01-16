import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore/lite";
import { firestoreApp } from "../init";
import {
  FireStoreRestrict,
  FireStoreRestrictWithDocId,
} from "@/types/api/restrict";

const restrictsCol = collection(firestoreApp, "restrict");

// Get a list of all restricts from the database
export async function getRestricts() {
  const restrictsSnapshot = await getDocs(restrictsCol);

  const restrictsList: FireStoreRestrict[] = [];
  restrictsSnapshot.forEach((doc) => {
    restrictsList.push(doc.data() as FireStoreRestrict);
  });

  return restrictsList as FireStoreRestrict[];
}

// Get a list of all restricts with doc Id from the database
export async function getRestrictsWithDocId() {
  const restrictsSnapshot = await getDocs(restrictsCol);

  const restrictsList: FireStoreRestrictWithDocId[] = [];
  restrictsSnapshot.forEach((doc) => {
    const restrict = doc.data();
    restrict.id = doc.id;
    restrictsList.push(restrict as FireStoreRestrictWithDocId);
  });
  return restrictsList as FireStoreRestrictWithDocId[];
}

// Find a restrict by their id
export async function getRestrictByFileId(fileId: string) {
  const restrictsList: FireStoreRestrict[] = await getRestricts();

  return restrictsList.find(
    (restrict) => restrict.fileId === fileId
  ) as FireStoreRestrict;
}

// Restrict File by ID
export async function createRestrictFile(fileId: string, username: string) {
  const restrict = {
    fileId,
    username,
    whitelist: [],
    createdAt: new Date(),
  } as FireStoreRestrict;

  const restrictExists = await getRestrictByFileId(fileId);

  if (restrictExists) throw Error("Restrict file already exists");

  try {
    const docRef = await addDoc(restrictsCol, restrict);
    return docRef.id;
  } catch (e: any) {
    console.error("Error restrict document: ", e.message);
    throw Error("Error adding Restrict document");
  }
}

// Get a restrict by their id with doc Id
export async function getRestrictByFileIdWithDocId(fileId: string) {
  const restrictsList: FireStoreRestrictWithDocId[] =
    await getRestrictsWithDocId();

  return restrictsList.find(
    (restrict) => restrict.fileId === fileId
  ) as FireStoreRestrictWithDocId;
}

// Give whitelist access to a file
export async function addWhitelistRestrict(fileId: string, username: string) {
  const restrict = await getRestrictByFileIdWithDocId(fileId);

  if (!restrict) throw Error("Restrict file not found");

  const restrictDoc = doc(restrictsCol, restrict.id);

  if (restrict.whitelist.includes(username))
    throw Error("User already has access to this file");

  restrict.whitelist.push(username);
  restrict.updatedAt = new Date();

  try {
    await updateDoc(restrictDoc, restrict as any);
  } catch (e: any) {
    console.error("Error updating document: ", e.message);
  }
}

// Remove whitelist access to a file
export async function removeWhitelistRestrict(
  fileId: string,
  username: string
) {
  const restrict = await getRestrictByFileIdWithDocId(fileId);

  if (!restrict) throw Error("Restrict file not found");

  const restrictDoc = doc(restrictsCol, restrict.id);

  if (!restrict.whitelist.includes(username))
    throw Error("User does not have access to this file");

  restrict.whitelist = restrict.whitelist.filter((id) => id !== username);
  restrict.updatedAt = new Date();

  try {
    await updateDoc(restrictDoc, restrict as any);
  } catch (e: any) {
    console.error("Error updating document: ", e.message);
  }
}

// Delete a restrict by their id
export async function deleteRestrict(fileId: string) {
  const restrict = await getRestrictByFileIdWithDocId(fileId);

  if (!restrict) throw Error("Restrict file not found");

  const restrictDoc = doc(restrictsCol, restrict.id);

  try {
    await deleteDoc(restrictDoc);
    console.log("Document successfully deleted!");
  } catch (e: any) {
    console.error("Error deleting document: ", e.message);
  }
}
