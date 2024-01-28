import {
  createUser,
  deleteUser,
  getUserByUsername,
  getUsers,
  updateUser,
} from "@/lib/firebase/db/user";
import { ChangedUser, RegisterUser, User } from "@/types/userTypes";

async function list() {
  try {
    const users = await getUsers();

    // convert to User[]
    const usersData = users.map((user) => {
      return {
        name: user.name,
        username: user.username,
        role: user.role,
      };
    });

    return usersData;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function getByUsername(username: string) {
  try {
    console.log(username);
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

async function update(registerUser: ChangedUser) {
  try {
    // check if the user exist
    const user = await getUserByUsername(registerUser.username);

    if (!user) throw new Error("User not found");

    const changedUser = {
      name: registerUser.name ?? user.name,
      username: registerUser.username,
      role: registerUser.role,
    };

    console.log(changedUser);

    const updatedUser = await updateUser(changedUser);

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
  remove,
};

export default userServices;
