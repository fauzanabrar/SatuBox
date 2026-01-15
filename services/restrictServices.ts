import {
  addWhitelistRestrict,
  createRestrictFile,
  deleteRestrict,
  getRestrictByFileId,
  getRestricts,
  removeWhitelistRestrict,
} from "@/lib/supabase/db/restrict";
import { DatabaseRestriction } from "@/lib/supabase/db/restrict";
import driveServices from "@/services/driveServices";
import userServices from "./userServices";

async function list(): Promise<DatabaseRestriction[]> {
  try {
    const restricts = await getRestricts();

    return restricts;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function getById(id: string): Promise<DatabaseRestriction> {
  try {
    // check if the file is exist in drive
    const file = await driveServices.checkId(id);

    if (!file) throw new Error("file not found");

    const restrict = await getRestrictByFileId(id);

    if (!restrict) throw new Error("restrict not found");

    return restrict;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function addFile(fileId: string, username: string): Promise<string> {
  try {
    // check if the file is exist in drive
    const file = await driveServices.checkId(fileId);

    if (!file) throw new Error("file not found");

    // check if the user is exist in database
    const user = await userServices.getByUsername(username);

    if (!user) throw new Error("user not found");

    // check user role is admin
    if (user.role !== "admin") throw new Error("user is not admin");

    const restrictId = await createRestrictFile(fileId, username);

    return restrictId;
  } catch (error: any) {
    throw new Error(error);
  }
}

async function addWhitelist(
  fileId: string,
  username: string,
  whitelist: string,
) {
  try {
    // check if the file is exist in drive
    const file = await driveServices.checkId(fileId);

    if (!file) throw new Error("file not found");

    // check if the user is exist in database
    const user = await userServices.getByUsername(username);

    if (!user) throw new Error("user not found");

    // check user role is admin
    if (user.role !== "admin") throw new Error("user is not admin");

    // check if the whitelist user is exist in database
    const whitelistUser = await userServices.getByUsername(whitelist);

    if (!whitelistUser) throw new Error("user not found");

    await addWhitelistRestrict(fileId, whitelist);
  } catch (error: any) {
    throw new Error(error);
  }
}

async function removeWhitelist(
  fileId: string,
  username: string,
  whitelist: string,
) {
  try {
    // check if the file is exist in drive
    const file = await driveServices.checkId(fileId);

    if (!file) throw new Error("file not found");

    // check if the user is exist in database
    const user = await userServices.getByUsername(username);

    if (!user) throw new Error("user not found");

    // check user role is admin
    if (user.role !== "admin") throw new Error("user is not admin");

    // check if the whitelist user is exist in database
    const whitelistUser = await userServices.getByUsername(whitelist);

    if (!whitelistUser) throw new Error("user not found");

    await removeWhitelistRestrict(fileId, whitelist);
  } catch (error: any) {
    throw new Error(error);
  }
}

async function deleteFile(fileId: string, username: string) {
  try {
    // check if the file is exist in drive
    const file = await driveServices.checkId(fileId);

    if (!file) throw new Error("file not found");

    // check if the user is exist in database
    const user = await userServices.getByUsername(username);

    if (!user) throw new Error("user not found");

    // check user role is admin
    if (user.role !== "admin") throw new Error("user is not admin");

    await deleteRestrict(fileId);
  } catch (error: any) {
    throw new Error(error);
  }
}

const restrictServices = {
  list,
  getById,
  addFile,
  addWhitelist,
  removeWhitelist,
  deleteFile,
};

export default restrictServices;
