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

        billingCycle: user.billing_cycle ?? null,

        lastPaymentAt: user.last_payment_at ?? null,

        lastPaymentAmount: user.last_payment_amount ?? null,

        lastPaymentOrderId: user.last_payment_order_id ?? null,

        lastPaymentPlanId: user.last_payment_plan_id ?? null,

        lastPaymentCycle: user.last_payment_cycle ?? null,

        nextBillingAt: user.next_billing_at ?? null,
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
    user.storage_limit_bytes === undefined ||
    user.storage_limit_bytes === null ||
    user.storage_limit_bytes <= 0
  ) {
    const plan = PLANS[planId] ?? PLANS[DEFAULT_PLAN_ID];

    updates.storage_limit_bytes = plan.storageLimitBytes;
  }

  if (
    user.storage_used_bytes === undefined ||
    user.storage_used_bytes === null ||
    user.storage_used_bytes < 0
  ) {
    updates.storage_used_bytes = 0;
  }

  if (!Array.isArray(user.shared_root_folder_ids)) {
    updates.shared_root_folder_ids = [];
  }

  if (!Array.isArray(user.shared_with_usernames)) {
    updates.shared_with_usernames = [];
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
  if (user.root_folder_id) {
    try {
      // Get the current folder's parents to check if it's under the correct root
      const currentParent = await gdrive.getAllParentsFolder(user.root_folder_id);

      if (currentParent && currentParent.id !== parentId) {
        // The user's folder is under the wrong root, so update it to the new root
        console.log(`Moving user ${username}'s folder from ${currentParent.id} to ${parentId}`);

        // Update the user's root folder ID to the new one
        // Note: This doesn't physically move the folder in Google Drive,
        // but updates the reference in our database
        const folderName = `user-${username}`;
        const newFolderId = await gdrive.createFolder(folderName, [parentId]);

        // Update the user record with the new folder ID
        await updateUserByUsername(username, { root_folder_id: newFolderId });

        return newFolderId;
      }

      // Folder is already under the correct root
      return user.root_folder_id;
    } catch (error) {
      console.error(`Error checking parent folder for user ${username}:`, error);
      // If there's an error checking the parent, return the existing folder ID
      return user.root_folder_id;
    }
  }

  const folderName = `user-${username}`;

  const folderId = await gdrive.createFolder(folderName, [parentId]);

  await updateUserByUsername(username, { root_folder_id: folderId });

  return folderId;
}

async function updatePlan(
  username: string,

  planId: keyof typeof PLANS,

  billingCycle: "monthly" | "annual" | null,

  extraUpdates: Partial<DatabaseUser> = {},
) {
  const plan = PLANS[planId];

  if (!plan) throw new Error("Plan not found");

  await updateUserByUsername(username, {
    planId,

    billing_cycle: billingCycle,

    storage_limit_bytes: plan.storageLimitBytes,

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

  const paidUntil = parseBillingDate(profile.next_billing_at);

  if (!paidUntil || paidUntil.getTime() >= Date.now()) {
    return { profile, blocked: false, expired: false };
  }

  const usedBytes = profile.storage_used_bytes ?? 0;

  const freeLimit = PLANS.free.storageLimitBytes;

  if (usedBytes <= freeLimit) {
    await updatePlan(username, "free", null, { next_billing_at: null });

    return {
      profile: {
        ...profile,

        planId: "free",

        billing_cycle: null,

        storage_limit_bytes: PLANS.free.storageLimitBytes,

        next_billing_at: null,
      },

      blocked: false,

      expired: true,
    };
  }

  return { profile, blocked: true, expired: true };
}

async function updateStorageUsage(username: string, nextUsedBytes: number) {
  const safeBytes = Math.max(0, nextUsedBytes);

  await updateUserByUsername(username, { storage_used_bytes: safeBytes });

  return safeBytes;
}

async function incrementStorageUsage(username: string, deltaBytes: number) {
  const user = await getUserByUsername(username);

  if (!user) throw new Error("User not found");

  const used = user.storage_used_bytes ?? 0;

  const nextUsed = used + deltaBytes;

  return updateStorageUsage(username, nextUsed);
}

async function addSharedRootFolder(username: string, folderId: string) {
  const user = await getUserByUsername(username);

  if (!user) throw new Error("User not found");

  const shared = user.shared_root_folder_ids ?? [];

  if (!shared.includes(folderId)) {
    shared.push(folderId);

    await updateUserByUsername(username, { shared_root_folder_ids: shared });
  }

  return shared;
}

async function removeSharedRootFolder(username: string, folderId: string) {
  const user = await getUserByUsername(username);

  if (!user) throw new Error("User not found");

  const shared = user.shared_root_folder_ids ?? [];

  const nextShared = shared.filter((id) => id !== folderId);

  await updateUserByUsername(username, { shared_root_folder_ids: nextShared });

  return nextShared;
}

async function addSharedWithUsername(
  ownerUsername: string,

  targetUsername: string,
) {
  const user = await getUserByUsername(ownerUsername);

  if (!user) throw new Error("User not found");

  const shared = user.shared_with_usernames ?? [];

  if (!shared.includes(targetUsername)) {
    shared.push(targetUsername);

    await updateUserByUsername(ownerUsername, { shared_with_usernames: shared });
  }

  return shared;
}

async function removeSharedWithUsername(
  ownerUsername: string,

  targetUsername: string,
) {
  const user = await getUserByUsername(ownerUsername);

  if (!user) throw new Error("User not found");

  const shared = user.shared_with_usernames ?? [];

  const nextShared = shared.filter((name) => name !== targetUsername);

  await updateUserByUsername(ownerUsername, {
    shared_with_usernames: nextShared,
  });

  return nextShared;
}

async function updateBillingMeta(
  username: string,

  updates: Partial<DatabaseUser>,
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
