import {
  createUser,
  deleteUser,
  getUserByUsername,
  getUserByUsernameWithId,
  getUsers,
  updateUserByUsername,
  updateUser,
  type DatabaseUser,
} from "@/lib/supabase/db/users";

import { ChangedUser, RegisterUser } from "@/types/userTypes";

import { DEFAULT_PLAN_ID, PLANS, type PlanId } from "@/lib/billing/plans";

import gdrive from "@/lib/gdrive";

async function list() {
  try {
    const users = await getUsers();

    // convert to User[]

    const usersData = users.map((user) => {
      return {
        name: user.name,

        username: user.username,

        email: user.email ?? "",

        role: user.role,

        planId: user.planId ?? DEFAULT_PLAN_ID,

        billingCycle: user.billingCycle ?? null,

        lastPaymentAt: user.lastPaymentAt ?? null,

        lastPaymentAmount: user.lastPaymentAmount ?? null,

        lastPaymentOrderId: user.lastPaymentOrderId ?? null,

        lastPaymentPlanId: user.lastPaymentPlanId ?? null,

        lastPaymentCycle: user.lastPaymentCycle ?? null,

        nextBillingAt: user.nextBillingAt ?? null,
      };
    });

    return usersData;
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

async function ensureProfile(username: string) {
  const user = await getUserByUsernameWithId(username);

  if (!user) throw new Error("User not found");

  const updates: Partial<DatabaseUser> = {};

  const planId = (user.planId as keyof typeof PLANS) ?? DEFAULT_PLAN_ID;

  if (!user.planId || !PLANS[planId]) {
    updates.planId = DEFAULT_PLAN_ID;
  }

  if (
    user.storageLimitBytes === undefined ||
    user.storageLimitBytes === null ||
    user.storageLimitBytes <= 0
  ) {
    const plan = PLANS[planId] ?? PLANS[DEFAULT_PLAN_ID];

    updates.storageLimitBytes = plan.storageLimitBytes;
  }

  if (
    user.storageUsedBytes === undefined ||
    user.storageUsedBytes === null ||
    user.storageUsedBytes < 0
  ) {
    updates.storageUsedBytes = 0;
  }

  if (!Array.isArray(user.sharedRootFolderIds)) {
    updates.sharedRootFolderIds = [];
  }

  if (!Array.isArray(user.sharedWithUsernames)) {
    updates.sharedWithUsernames = [];
  }

  if (Object.keys(updates).length > 0) {
    await updateUserByUsername(user.username, updates);
  }

  return {
    ...user,

    ...updates,
  };
}

async function ensureRootFolder(username: string) {
  const user = await getUserByUsernameWithId(username);

  if (!user) throw new Error("User not found");

  const parentId = process.env.SHARED_FOLDER_ID_DRIVE as string;

  if (!parentId) {
    throw new Error("Root folder is not configured");
  }

  // If user already has a root folder, check if it's under the correct parent
  if (user.rootFolderId) {
    try {
      // Get the current folder's parents to check if it's under the correct root
      const currentParent = await gdrive.getAllParentsFolder(user.rootFolderId);

      if (currentParent && currentParent.id !== parentId) {
        // The user's folder is under the wrong root, so update it to the new root
        console.log(`Moving user ${username}'s folder from ${currentParent.id} to ${parentId}`);

        // Update the user's root folder ID to the new one
        // Note: This doesn't physically move the folder in Google Drive,
        // but updates the reference in our database
        const folderName = `user-${username}`;
        const newFolderId = await gdrive.createFolder(folderName, [parentId]);

        // Update the user record with the new folder ID
        await updateUserByUsername(username, { rootFolderId: newFolderId });

        return newFolderId;
      }

      // Folder is already under the correct root
      return user.rootFolderId;
    } catch (error) {
      console.error(`Error checking parent folder for user ${username}:`, error);
      // If there's an error checking the parent, return the existing folder ID
      return user.rootFolderId;
    }
  }

  const folderName = `user-${username}`;

  const folderId = await gdrive.createFolder(folderName, [parentId]);

  await updateUserByUsername(username, { rootFolderId: folderId });

  return folderId;
}

async function updatePlan(
  username: string,

  planId: keyof typeof PLANS,

  billingCycle: "monthly" | "annual" | null,

  extraUpdates: Partial<FireStoreUser> = {},
) {
  const plan = PLANS[planId];

  if (!plan) throw new Error("Plan not found");

  await updateUserByUsername(username, {
    planId,

    billingCycle,

    storageLimitBytes: plan.storageLimitBytes,

    ...extraUpdates,
  });

  return plan;
}

const parseBillingDate = (value: unknown) => {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (typeof value === "object") {
    const asAny = value as { toDate?: () => Date; seconds?: number };

    if (typeof asAny.toDate === "function") {
      return asAny.toDate();
    }

    if (typeof asAny.seconds === "number") {
      return new Date(asAny.seconds * 1000);
    }
  }

  return null;
};

async function resolveBillingStatus(username: string) {
  const profile = await ensureProfile(username);

  const planId = (profile.planId as PlanId) ?? DEFAULT_PLAN_ID;

  if (planId === "free") {
    return { profile, blocked: false, expired: false };
  }

  const paidUntil = parseBillingDate(profile.nextBillingAt);

  if (!paidUntil || paidUntil.getTime() >= Date.now()) {
    return { profile, blocked: false, expired: false };
  }

  const usedBytes = profile.storageUsedBytes ?? 0;

  const freeLimit = PLANS.free.storageLimitBytes;

  if (usedBytes <= freeLimit) {
    await updatePlan(username, "free", null, { nextBillingAt: null });

    return {
      profile: {
        ...profile,

        planId: "free",

        billingCycle: null,

        storageLimitBytes: PLANS.free.storageLimitBytes,

        nextBillingAt: null,
      },

      blocked: false,

      expired: true,
    };
  }

  return { profile, blocked: true, expired: true };
}

async function updateStorageUsage(username: string, nextUsedBytes: number) {
  const safeBytes = Math.max(0, nextUsedBytes);

  await updateUserByUsername(username, { storageUsedBytes: safeBytes });

  return safeBytes;
}

async function incrementStorageUsage(username: string, deltaBytes: number) {
  const user = await getUserByUsername(username);

  if (!user) throw new Error("User not found");

  const used = user.storageUsedBytes ?? 0;

  const nextUsed = used + deltaBytes;

  return updateStorageUsage(username, nextUsed);
}

async function addSharedRootFolder(username: string, folderId: string) {
  const user = await getUserByUsername(username);

  if (!user) throw new Error("User not found");

  const shared = user.sharedRootFolderIds ?? [];

  if (!shared.includes(folderId)) {
    shared.push(folderId);

    await updateUserByUsername(username, { sharedRootFolderIds: shared });
  }

  return shared;
}

async function removeSharedRootFolder(username: string, folderId: string) {
  const user = await getUserByUsername(username);

  if (!user) throw new Error("User not found");

  const shared = user.sharedRootFolderIds ?? [];

  const nextShared = shared.filter((id) => id !== folderId);

  await updateUserByUsername(username, { sharedRootFolderIds: nextShared });

  return nextShared;
}

async function addSharedWithUsername(
  ownerUsername: string,

  targetUsername: string,
) {
  const user = await getUserByUsername(ownerUsername);

  if (!user) throw new Error("User not found");

  const shared = user.sharedWithUsernames ?? [];

  if (!shared.includes(targetUsername)) {
    shared.push(targetUsername);

    await updateUserByUsername(ownerUsername, { sharedWithUsernames: shared });
  }

  return shared;
}

async function removeSharedWithUsername(
  ownerUsername: string,

  targetUsername: string,
) {
  const user = await getUserByUsername(ownerUsername);

  if (!user) throw new Error("User not found");

  const shared = user.sharedWithUsernames ?? [];

  const nextShared = shared.filter((name) => name !== targetUsername);

  await updateUserByUsername(ownerUsername, {
    sharedWithUsernames: nextShared,
  });

  return nextShared;
}

async function updateBillingMeta(
  username: string,

  updates: Partial<FireStoreUser>,
) {
  await updateUserByUsername(username, updates);
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
    console.log('Updating user:', registerUser); // Debug log

    // check if the user exist
    const user = await getUserByUsername(registerUser.username);

    if (!user) throw new Error("User not found");

    console.log('Found user to update:', user); // Debug log

    const changedUser = {
      name: registerUser.name ?? user.name,
      username: registerUser.username,
      newUsername: registerUser.newUsername,
      role: registerUser.role,
    };

    console.log('Calling database updateUser with:', changedUser); // Debug log

    const updatedUser = await updateUser(changedUser);

    console.log('User updated successfully:', updatedUser); // Debug log

    return updatedUser;
  } catch (error: any) {
    console.error('Error updating user in service:', error); // Debug log
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

  ensureProfile,

  ensureRootFolder,

  updatePlan,

  resolveBillingStatus,

  updateBillingMeta,

  updateStorageUsage,

  incrementStorageUsage,

  addSharedRootFolder,

  removeSharedRootFolder,

  addSharedWithUsername,

  removeSharedWithUsername,

  add,

  update,

  remove,
};

export default userServices;
