import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore/lite";
import { firestoreApp } from "../init";
import { RegisterUser, User } from "@/types/userTypes";

const usersCol = collection(firestoreApp, "user");

export interface FireStoreUser {
  id?: string;
  username: string;
  password: string;
  name: string;
  role: string;
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
export async function getUserByUsername(username: string) {
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map((doc) => doc.data());
  const user = userList.find((user) => user.username === username);
  return user as FireStoreUser;
}

// Get a user by their username with doc Id from the database
export async function getUserByUsernameWithDocId(username: string) {
  const userList = await getUsersWithDocId();

  const user = userList.find((user) => user.username === username);

  return user as FireStoreUser;
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
export async function updateUser(user: User) {
  const updatedAt = new Date();

  const userDoc: FireStoreUpdateUser = {
    username: user.username,
    name: user.name,
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
