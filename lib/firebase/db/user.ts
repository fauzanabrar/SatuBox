import {collection, getDocs, addDoc} from 'firebase/firestore/lite';
import {firestoreApp} from '../init';
import {RegisterUser} from "@/app/(auth)/register/RegisterForm";
import {hash} from "bcryptjs";

const usersCol = collection(firestoreApp, 'user');

export interface FireStoreUser {
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Get a list of all users from the database
export async function getUsers() {
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => doc.data());
  return userList as FireStoreUser[];
}

// Find a user by their email
export async function getUserByEmail(email: string) {
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => doc.data());
  const user = userList.find(user => user.email === email);
  return user as FireStoreUser;
}

// Create new User
export async function createUser(user: RegisterUser) {
  const createdAt = new Date();
  const hashedPassword = await hash(user.password, 10);

  const userDoc: FireStoreUser = {
    email: user.email,
    password: hashedPassword,
    name: user.name,
    role: "user",
    createdAt: createdAt,
    updatedAt: createdAt
  }
  console.log(userDoc)

  // Check if user already exists
  const userSnapshot = await getUserByEmail(user.email);
  if (userSnapshot) {
    throw new Error("Email already exists");
  }

  try {
    const docRef = await addDoc(usersCol, userDoc);
    console.log(`Document written with ID: ${docRef.id}`);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

