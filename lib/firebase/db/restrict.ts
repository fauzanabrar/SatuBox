import { collection, getDocs, addDoc} from 'firebase/firestore/lite';
import { firestoreApp} from '../init';

const restrictsCol = collection(firestoreApp, 'restrict');

export interface FireStoreRestrict {

}

// Get a list of all restricts from the database
export async function getRestricts() {

}

// Find a restrict by their id
export async function getRestrictById(id: string) {

}

// Restrict File by ID
export async function createRestrict(restrict: FireStoreRestrict) {

}

