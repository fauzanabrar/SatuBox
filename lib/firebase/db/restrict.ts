import {collection, getDocs, addDoc, deleteDoc, updateDoc, getDoc, doc} from 'firebase/firestore/lite';
import {firestoreApp} from '../init';

const restrictsCol = collection(firestoreApp, 'restrict');

export interface FireStoreRestrict {
  fileId: string;
  userId: string;
  whitelist: string[];
  createdAt: Date
}

interface FireStoreRestrictWithDocId {
  id: string;
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

// Get a list of all restricts with doc Id from the database
export async function getRestrictsWithDocId() {
  const restrictsSnapshot = await getDocs(restrictsCol);

  const restrictsList: FireStoreRestrictWithDocId[] = [];
  restrictsSnapshot.forEach((doc) => {
    const restrict = doc.data();
    restrict.id = doc.id;
    restrictsList.push(restrict as FireStoreRestrictWithDocId);
  });
  console.log(restrictsList)
  return restrictsList as FireStoreRestrictWithDocId[];
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

  const restrictExists = await getRestrictByFileId(fileId);

  if (restrictExists) throw Error('Restrict file already exists');

  try {
    const docRef = await addDoc(restrictsCol, restrict);
    return docRef.id;
  } catch (e: any) {
    console.error("Error restrict document: ", e.message);
    throw Error('Error adding Restrict document');
  }
}

// Get a restrict by their id with doc Id
export async function getRestrictByFileIdWithDocId(fileId: string) {
  const restrictsList: FireStoreRestrictWithDocId[] = await getRestrictsWithDocId();

  return restrictsList.find((restrict) => restrict.fileId === fileId) as FireStoreRestrictWithDocId;
}

// Give whitelist access to a file
export async function addWhitelist(fileId: string, userId: string) {
  const restrict = await getRestrictByFileIdWithDocId(fileId)

  const restrictDoc = doc(restrictsCol, restrict.id);

  if (!restrict) throw Error('Restrict file not found');

  if(restrict.whitelist.includes(userId)) throw Error('User already has access to this file');

  restrict.whitelist.push(userId);

  try {
    await updateDoc(restrictDoc, restrict as any);
  } catch (e: any) {
    console.error("Error updating document: ", e.message);
  }
}

// Delete a restrict by their id
export async function deleteRestrict(fileId: string) {
  const restrict = await getRestrictByFileIdWithDocId(fileId)
  console.log(restrict);
  const restrictDoc = doc(restrictsCol, restrict.id);

  if (!restrict) throw Error('Restrict file not found');
  try {
    await deleteDoc(restrictDoc);
    console.log('Document successfully deleted!')
  } catch (e: any) {
    console.error("Error deleting document: ", e.message);
  }
}

