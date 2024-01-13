import {
  createUser,
  deleteUser,
  getUserByUsername,
  getUsers,
  updateUser,
} from "@/lib/firebase/db/user";
import { RegisterUser, User } from "@/types/userTypes";

async function list() {
  try {
    const users = await getUsers();

    return users;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function getByUsername(username: string) {
  try {
    const user = await getUserByUsername(username);

    return user;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function add(registerUser: RegisterUser) {
  try {
    const user = await createUser(registerUser);

    return user;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function update(registerUser: User) {
  try {
    // check if the user exist
    const user = await getUserByUsername(registerUser.username);

    if (!user) throw new Error("User not found");

    const updatedUser = await updateUser(registerUser);

    return updatedUser;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function remove(username: string) {
  try {
    // check if the user exist
    const user = await getUserByUsername(username);

    if (!user) throw new Error("User not found");

    const removedUser = await deleteUser(username);

    return removedUser;
  } catch (error: any) {
    throw new Error(error);
  }
}

const userServices = {
  list,
  getByUsername,
  add,
  update,
  data: remove,
};

export default userServices;
