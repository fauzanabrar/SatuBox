import {collection, getDocs, addDoc, deleteDoc, updateDoc} from 'firebase/firestore/lite';
import {firestoreApp} from '../init';

const restrictsCol = collection(firestoreApp, 'restrict');

export interface FireStoreRestrict {
  fileId: string;
  userId: string;
  whitelist: string[];
  createdAt: Date
}

// Get a list of all restricts from the database
export async function getRestricts() {
  const restrictsSnapshot = await getDocs(restrictsCol);

  const restrictsList: FireStoreRestrict[] = [];
  restrictsSnapshot.forEach((doc) => {
    restrictsList.push(doc.data() as FireStoreRestrict);
  });

  return restrictsList as FireStoreRestrict[];
}

// Find a restrict by their id
export async function getRestrictByFileId(fileId: string) {
  const restrictsList: FireStoreRestrict[] = await getRestricts();

  return restrictsList.find((restrict) => restrict.fileId === fileId) as FireStoreRestrict;
}

// Restrict File by ID
export async function createRestrictFile(fileId: string, userId: string) {
  const restrict = {
    fileId,
    userId,
    whitelist: [],
    createdAt: new Date()
  } as FireStoreRestrict;

  try {
    const docRef = await addDoc(restrictsCol, restrict);
    return docRef.id;
  } catch (e) {
    console.error("Error restrict document: ", e);
    throw Error('Error adding Restrict document');
  }

  return null;
}

// Delete a restrict by their id
export async function deleteRestrict(fileId: string) {
  const restrict = await getRestrictByFileId(fileId) as any;

  if (!restrict) throw Error('Restrict file not found');

  try {
    await deleteDoc(restrict);
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}

// Give whitelist access to a file
export async function addWhitelist(fileId: string, userId: string) {
  const restrict = await getRestrictByFileId(fileId) as any;

  if (!restrict) throw Error('Restrict file not found');

  restrict.whitelist.push(userId);

  try {
    await updateDoc(restrict, restrict);
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}
