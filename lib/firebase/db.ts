import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { app } from './init';
import { User } from '@/types/userTypes';

const db = getFirestore(app);

// Get a list of all users from the database
export async function getUsers() {
  const usersCol = collection(db, 'user');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => doc.data());
  return userList;
}

// Find a user by their email
export async function getUserByEmail(email: string) {
  const usersCol = collection(db, 'user');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => doc.data());
  const user = userList.find(user => user.email === email);
  return user;
}