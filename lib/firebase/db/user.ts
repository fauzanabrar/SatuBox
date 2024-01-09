import { collection, getDocs, addDoc } from "firebase/firestore/lite";
import { firestoreApp } from "../init";
import { RegisterUser } from "@/app/(auth)/register/RegisterForm";

const usersCol = collection(firestoreApp, "user");

export interface FireStoreUser {
  username: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Get a list of all users from the database
export async function getUsers() {
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map((doc) => doc.data());
  return userList as FireStoreUser[];
}

// Find a user by their username
export async function getUserByUsername(username: string) {
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map((doc) => doc.data());
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
