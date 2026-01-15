import { createClient } from '../client';
import type { DownloadOrder, DownloadToken } from './paid-download';

export interface DatabaseEarning {
  id?: string;
  userId: string;
  amount: number;
  currency?: string;
  transactionId?: string;
  createdAt?: Date;
}

export interface DownloadEarning {
  id?: string;
  username: string;
  fileId: string;
  orderId?: string;  // Added for the key in the table
  amount: number;
  netAmount?: number;
  grossAmount?: number;
  feeAmount?: number;  // Added for the earnings page
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WithdrawRequest {
  id?: string;
  username: string;
  amount: number;
  status: string;
  method: string;
  bankName?: string;
  provider: string;
  accountName: string;
  accountNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getEarningsByUserId(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('earnings')
    .select(`
      id,
      user_id,
      amount,
      currency,
      transaction_id,
      created_at
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting earnings by user ID:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    currency: row.currency,
    transactionId: row.transaction_id,
    createdAt: row.created_at
  })) as DatabaseEarning[];
}

export async function createEarning(earning: Omit<DatabaseEarning, 'id' | 'createdAt'>) {
  const supabase = createClient();
  const now = new Date();

  // Map camelCase properties to snake_case for database insertion
  const earningSnakeCase = {
    user_id: earning.userId,
    amount: earning.amount,
    currency: earning.currency,
    transaction_id: earning.transactionId,
    created_at: now
  };

  const { data, error } = await supabase
    .from('earnings')
    .insert([earningSnakeCase])
    .select(`
      id,
      user_id,
      amount,
      currency,
      transaction_id,
      created_at
    `)
    .single();

  if (error) {
    console.error('Error creating earning:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    userId: data.user_id,
    amount: data.amount,
    currency: data.currency,
    transactionId: data.transaction_id,
    createdAt: data.created_at
  };

  return mappedData as DatabaseEarning;
}

export async function getTotalEarningsByUserId(userId: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('earnings')
    .select('amount')
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting total earnings:', error);
    throw error;
  }

  return data.reduce((sum, earning) => sum + earning.amount, 0);
}

// Functions for download earnings
export async function listDownloadEarningsByUsername(username: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('download_earnings')
    .select(`
      id,
      username,
      file_id,
      amount,
      net_amount,
      gross_amount,
      status,
      created_at,
      updated_at
    `)
    .eq('username', username);

  if (error) {
    console.error('Error getting download earnings:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  return data.map(row => ({
    id: row.id,
    username: row.username,
    fileId: row.file_id,
    amount: row.amount,
    netAmount: row.net_amount,
    grossAmount: row.gross_amount,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })) as DownloadEarning[];
}

// Functions for withdraw requests
export async function listWithdrawRequestsByUsername(username: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('withdraw_requests')
    .select(`
      id,
      username,
      amount,
      status,
      method,
      bank_name,
      provider,
      account_name,
      account_number,
      created_at,
      updated_at
    `)
    .eq('username', username);

  if (error) {
    console.error('Error getting withdraw requests:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  return data.map(row => ({
    id: row.id,
    username: row.username,
    amount: row.amount,
    status: row.status,
    method: row.method,
    bankName: row.bank_name,
    provider: row.provider,
    accountName: row.account_name,
    accountNumber: row.account_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })) as WithdrawRequest[];
}

export async function listWithdrawRequests() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('withdraw_requests')
    .select(`
      id,
      username,
      amount,
      status,
      method,
      bank_name,
      provider,
      account_name,
      account_number,
      created_at,
      updated_at
    `);

  if (error) {
    console.error('Error getting all withdraw requests:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  return data.map(row => ({
    id: row.id,
    username: row.username,
    amount: row.amount,
    status: row.status,
    method: row.method,
    bankName: row.bank_name,
    provider: row.provider,
    accountName: row.account_name,
    accountNumber: row.account_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })) as WithdrawRequest[];
}

export async function createWithdrawRequest(withdrawRequest: Omit<WithdrawRequest, 'id' | 'createdAt' | 'updatedAt'>) {
  const supabase = createClient();
  const now = new Date();

  // Map camelCase properties to snake_case for database insertion
  const withdrawRequestSnakeCase = {
    username: withdrawRequest.username,
    amount: withdrawRequest.amount,
    status: withdrawRequest.status,
    method: withdrawRequest.method,
    bank_name: withdrawRequest.bankName,
    provider: withdrawRequest.provider,
    account_name: withdrawRequest.accountName,
    account_number: withdrawRequest.accountNumber,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from('withdraw_requests')
    .insert([withdrawRequestSnakeCase])
    .select(`
      id,
      username,
      amount,
      status,
      method,
      bank_name,
      provider,
      account_name,
      account_number,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error('Error creating withdraw request:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    username: data.username,
    amount: data.amount,
    status: data.status,
    method: data.method,
    bankName: data.bank_name,
    provider: data.provider,
    accountName: data.account_name,
    accountNumber: data.account_number,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as WithdrawRequest;
}

export async function updateWithdrawRequestStatus(id: string, status: string) {
  const supabase = createClient();
  const now = new Date();

  const { error } = await supabase
    .from('withdraw_requests')
    .update({ status, updated_at: now })
    .eq('id', id);

  if (error) {
    console.error('Error updating withdraw request status:', error);
    throw error;
  }
}




// Functions for download earnings
// Extended type for creating download earnings with additional fields
type CreateDownloadEarningInput = Omit<DownloadEarning, 'id' | 'createdAt' | 'updatedAt'> & {
  ownerUsername?: string;
};

export async function createDownloadEarning(earning: CreateDownloadEarningInput) {
  const supabase = createClient();
  const now = new Date();

  // Map camelCase properties to snake_case for database insertion
  const earningSnakeCase = {
    username: earning.ownerUsername || earning.username, // Use ownerUsername if available, otherwise username
    file_id: earning.fileId,
    amount: earning.amount,
    net_amount: earning.netAmount,
    gross_amount: earning.grossAmount,
    status: earning.status,
    created_at: now,
    updated_at: now
  };

  console.log('Creating download earning with data:', earningSnakeCase); // Debug log

  const { data, error } = await supabase
    .from('download_earnings')
    .insert([earningSnakeCase])
    .select(`
      id,
      username,
      file_id,
      amount,
      net_amount,
      gross_amount,
      status,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error('Error creating download earning:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw error;
  }

  console.log('Download earning created successfully:', data); // Debug log

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    username: data.username,
    fileId: data.file_id,
    orderId: earning.orderId, // Use the orderId from the input
    amount: data.amount,
    netAmount: data.net_amount,
    grossAmount: data.gross_amount,
    feeAmount: earning.feeAmount, // Use the feeAmount from the input
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as DownloadEarning;
}

// Additional function for getting download earnings by username
export async function getDownloadEarningsByUsername(username: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('download_earnings')
    .select(`
      id,
      username,
      file_id,
      amount,
      net_amount,
      gross_amount,
      status,
      created_at,
      updated_at
    `)
    .eq('username', username);

  if (error) {
    console.error('Error getting download earnings by username:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  return data.map(row => ({
    id: row.id,
    username: row.username,
    fileId: row.file_id,
    amount: row.amount,
    netAmount: row.net_amount,
    grossAmount: row.gross_amount,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })) as DownloadEarning[];
}