import { createClient } from '../client';
import { ChangedUser, RegisterUser } from '@/types/userTypes';
import { DEFAULT_PLAN_ID, PLANS } from '@/lib/billing/plans';

export interface DatabaseUser {
  id?: string;
  username: string;
  email?: string;
  password: string;
  name: string;
  role: string;
  planId?: string;
  billing_cycle?: string | null;
  storage_limit_bytes?: number;
  storage_used_bytes?: number;
  last_payment_at?: Date | null;
  last_payment_amount?: number | null;
  last_payment_order_id?: string | null;
  last_payment_plan_id?: string | null;
  last_payment_cycle?: string | null;
  next_billing_at?: Date | null;
  root_folder_id?: string;
  shared_root_folder_ids?: string[];
  shared_with_usernames?: string[];
  created_at?: Date;
  updated_at?: Date;
}

interface UpdateUser {
  username: string;
  name: string;
  role: string;
  updated_at: Date;
}

// Get a list of all users from the database
export async function getUsers() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      email,
      password,
      name,
      role,
      plan_id,
      billing_cycle,
      storage_limit_bytes,
      storage_used_bytes,
      last_payment_at,
      last_payment_amount,
      last_payment_order_id,
      last_payment_plan_id,
      last_payment_cycle,
      next_billing_at,
      root_folder_id,
      shared_root_folder_ids,
      shared_with_usernames,
      created_at,
      updated_at
    `);

  if (error) {
    console.error('Error getting users:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  return data.map(row => ({
    ...row,
    planId: row.plan_id,
    billingCycle: row.billing_cycle,
    storageLimitBytes: row.storage_limit_bytes,
    storageUsedBytes: row.storage_used_bytes,
    lastPaymentAt: row.last_payment_at,
    lastPaymentAmount: row.last_payment_amount,
    lastPaymentOrderId: row.last_payment_order_id,
    lastPaymentPlanId: row.last_payment_plan_id,
    lastPaymentCycle: row.last_payment_cycle,
    nextBillingAt: row.next_billing_at,
    rootFolderId: row.root_folder_id,
    sharedRootFolderIds: row.shared_root_folder_ids,
    sharedWithUsernames: row.shared_with_usernames,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })) as DatabaseUser[];
}

// Get a list of all users with ID from the database
export async function getUsersWithId() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error getting users with ID:', error);
    throw error;
  }

  return data as DatabaseUser[];
}

// Find a user by their username
export async function getUserByUsername(username: string): Promise<DatabaseUser | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      email,
      password,
      name,
      role,
      plan_id,
      billing_cycle,
      storage_limit_bytes,
      storage_used_bytes,
      last_payment_at,
      last_payment_amount,
      last_payment_order_id,
      last_payment_plan_id,
      last_payment_cycle,
      next_billing_at,
      root_folder_id,
      shared_root_folder_ids,
      shared_with_usernames,
      created_at,
      updated_at
    `)
    .eq('username', username)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error('Error getting user by username:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    ...data,
    planId: data.plan_id,
    billingCycle: data.billing_cycle,
    storageLimitBytes: data.storage_limit_bytes,
    storageUsedBytes: data.storage_used_bytes,
    lastPaymentAt: data.last_payment_at,
    lastPaymentAmount: data.last_payment_amount,
    lastPaymentOrderId: data.last_payment_order_id,
    lastPaymentPlanId: data.last_payment_plan_id,
    lastPaymentCycle: data.last_payment_cycle,
    nextBillingAt: data.next_billing_at,
    rootFolderId: data.root_folder_id,
    sharedRootFolderIds: data.shared_root_folder_ids,
    sharedWithUsernames: data.shared_with_usernames,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as DatabaseUser;
}

// Get a user by their username with ID from the database
export async function getUserByUsernameWithId(username: string): Promise<DatabaseUser | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      email,
      password,
      name,
      role,
      plan_id,
      billing_cycle,
      storage_limit_bytes,
      storage_used_bytes,
      last_payment_at,
      last_payment_amount,
      last_payment_order_id,
      last_payment_plan_id,
      last_payment_cycle,
      next_billing_at,
      root_folder_id,
      shared_root_folder_ids,
      shared_with_usernames,
      created_at,
      updated_at
    `)
    .eq('username', username)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error('Error getting user by username with ID:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    ...data,
    planId: data.plan_id,
    billingCycle: data.billing_cycle,
    storageLimitBytes: data.storage_limit_bytes,
    storageUsedBytes: data.storage_used_bytes,
    lastPaymentAt: data.last_payment_at,
    lastPaymentAmount: data.last_payment_amount,
    lastPaymentOrderId: data.last_payment_order_id,
    lastPaymentPlanId: data.last_payment_plan_id,
    lastPaymentCycle: data.last_payment_cycle,
    nextBillingAt: data.next_billing_at,
    rootFolderId: data.root_folder_id,
    sharedRootFolderIds: data.shared_root_folder_ids,
    sharedWithUsernames: data.shared_with_usernames,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as DatabaseUser;
}

// Create new User
export async function createUser(user: RegisterUser) {
  const supabase = createClient();
  const createdAt = new Date();

  const { hash } = await import('bcryptjs');
  const hashedPassword = await hash(user.password, 10);

  // Map camelCase properties to snake_case for database insertion
  const userRecord = {
    username: user.username,
    email: user.email?.trim().toLowerCase() ?? "",
    password: hashedPassword,
    name: user.name,
    role: "user",
    plan_id: DEFAULT_PLAN_ID,
    billing_cycle: null,
    storage_limit_bytes: PLANS[DEFAULT_PLAN_ID].storageLimitBytes,
    storage_used_bytes: 0,
    last_payment_at: null,
    last_payment_amount: null,
    last_payment_order_id: null,
    last_payment_plan_id: null,
    last_payment_cycle: null,
    next_billing_at: null,
    root_folder_id: "",
    shared_root_folder_ids: [],
    shared_with_usernames: [],
    created_at: createdAt,
    updated_at: createdAt,
  };

  // Check if user already exists
  const existingUser = await getUserByUsername(user.username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const { data, error } = await supabase
    .from('users')
    .insert([userRecord])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  console.log(`User created with ID: ${data.id}`);
  return data.id;
}

// Update User
export async function updateUser(user: ChangedUser) {
  const supabase = createClient();
  const updatedAt = new Date();

  console.log('Database updateUser called with:', user); // Debug log

  // Map camelCase properties to snake_case for database update
  const userRecord: any = {
    username: user.newUsername ?? user.username,
    name: user.name!,
    role: user.role,
    updated_at: updatedAt,
  };

  console.log('Updating with record:', userRecord); // Debug log

  // Get the current user to preserve password
  const userSnapshot = await getUserByUsernameWithId(user.username);
  if (!userSnapshot) {
    console.error('User not found for update:', user.username); // Debug log
    throw new Error("User not found");
  }

  console.log('Found user snapshot:', userSnapshot); // Debug log

  const changedUser = {
    ...userRecord,
    password: userSnapshot.password,
  };

  console.log('Final update object:', changedUser); // Debug log

  const { error } = await supabase
    .from('users')
    .update(changedUser)
    .eq('id', userSnapshot.id);

  if (error) {
    console.error('Error updating user:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw error;
  }

  console.log(`User updated with ID: ${userSnapshot.id}`);
}

// Update user by username
export async function updateUserByUsername(
  username: string,
  updates: Partial<DatabaseUser>
) {
  const supabase = createClient();
  const updatedAt = new Date();

  const userSnapshot = await getUserByUsernameWithId(username);
  if (!userSnapshot) throw new Error("User not found");

  // Map camelCase properties to snake_case for database update
  const updatesSnakeCase: any = { updated_at: updatedAt };

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case 'planId':
        updatesSnakeCase.plan_id = value;
        break;
      case 'billingCycle':
        updatesSnakeCase.billing_cycle = value;
        break;
      case 'storageLimitBytes':
        updatesSnakeCase.storage_limit_bytes = value;
        break;
      case 'storageUsedBytes':
        updatesSnakeCase.storage_used_bytes = value;
        break;
      case 'lastPaymentAt':
        updatesSnakeCase.last_payment_at = value;
        break;
      case 'lastPaymentAmount':
        updatesSnakeCase.last_payment_amount = value;
        break;
      case 'lastPaymentOrderId':
        updatesSnakeCase.last_payment_order_id = value;
        break;
      case 'lastPaymentPlanId':
        updatesSnakeCase.last_payment_plan_id = value;
        break;
      case 'lastPaymentCycle':
        updatesSnakeCase.last_payment_cycle = value;
        break;
      case 'nextBillingAt':
        updatesSnakeCase.next_billing_at = value;
        break;
      case 'rootFolderId':
        updatesSnakeCase.root_folder_id = value;
        break;
      case 'sharedRootFolderIds':
        updatesSnakeCase.shared_root_folder_ids = value;
        break;
      case 'sharedWithUsernames':
        updatesSnakeCase.shared_with_usernames = value;
        break;
      case 'createdAt':
        updatesSnakeCase.created_at = value;
        break;
      case 'updatedAt':
        updatesSnakeCase.updated_at = value;
        break;
      default:
        updatesSnakeCase[key] = value;
        break;
    }
  });

  console.log('Updating user with data:', { userId: userSnapshot.id, updatesSnakeCase }); // Debug log

  const { error } = await supabase
    .from('users')
    .update(updatesSnakeCase)
    .eq('id', userSnapshot.id);

  if (error) {
    console.error('Error updating user by username:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw error;
  }

  console.log('User updated successfully'); // Debug log
}

// Remove User
export async function deleteUser(username: string) {
  const supabase = createClient();

  const userSnapshot = await getUserByUsernameWithId(username);
  if (!userSnapshot) throw new Error("User not found");

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userSnapshot.id);

  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }

  console.log(`User deleted with ID: ${userSnapshot.id}`);
}