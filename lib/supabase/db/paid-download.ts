import { createClient } from '../client';

export interface DatabasePaidDownload {
  id?: string;
  fileId: string;
  userId?: string;
  purchaserUserId?: string;
  amountPaid: number;
  currency?: string;
  transactionId?: string;
  downloadCount?: number;
  enabled?: boolean;
  price?: number;
  ownerUsername?: string;
  previewEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DownloadToken {
  id?: string;
  token: string;
  fileId: string;
  userId?: string;
  isValid: boolean;
  expiresAt?: Date;
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

export async function getPaidDownload(fileId: string): Promise<DatabasePaidDownload | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('paid_downloads')
    .select(`
      id,
      file_id,
      user_id,
      purchaser_user_id,
      amount_paid,
      currency,
      transaction_id,
      download_count,
      enabled,
      price,
      owner_username,
      preview_enabled,
      created_at,
      updated_at
    `)
    .eq('file_id', fileId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error('Error getting paid download:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    fileId: data.file_id,
    userId: data.user_id,
    purchaserUserId: data.purchaser_user_id,
    amountPaid: data.amount_paid,
    currency: data.currency,
    transactionId: data.transaction_id,
    downloadCount: data.download_count,
    enabled: data.enabled,
    price: data.price,
    ownerUsername: data.owner_username,
    previewEnabled: data.preview_enabled,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as DatabasePaidDownload;
}

export async function getDownloadToken(token: string): Promise<DownloadToken | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('download_tokens')
    .select(`
      id,
      token,
      file_id,
      user_id,
      is_valid,
      expires_at,
      created_at
    `)
    .eq('token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error('Error getting download token:', error);
    throw error;
  }

  // Check if token is expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    // Token is expired, invalidate it
    await invalidateDownloadToken(token);
    return null;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    token: data.token,
    fileId: data.file_id,
    userId: data.user_id,
    isValid: data.is_valid,
    expiresAt: data.expires_at,
    createdAt: data.created_at
  };

  return mappedData as DownloadToken;
}

export async function setPaidDownload(fileId: string, data: { ownerUsername: string; price: number; currency: string; enabled: boolean; previewEnabled?: boolean }) {
  const supabase = createClient();
  const now = new Date();

  console.log('Setting paid download for file:', fileId, 'with data:', data); // Debug log

  // Check if record exists
  const existing = await getPaidDownload(fileId);
  console.log('Existing record:', existing); // Debug log

  if (existing) {
    // Update existing record
    console.log('Updating existing record'); // Debug log
    const { error, data: updateResult } = await supabase
      .from('paid_downloads')
      .update({
        owner_username: data.ownerUsername,
        price: data.price,
        currency: data.currency,
        enabled: data.enabled,
        preview_enabled: data.previewEnabled ?? true, // Default to true if not specified
        updated_at: now
      })
      .eq('file_id', fileId)
      .select(); // Add select to return the updated record

    if (error) {
      console.error('Error updating paid download:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      throw error;
    }
    console.log('Update result:', updateResult); // Debug log
  } else {
    // Insert new record
    console.log('Creating new record'); // Debug log
    const { error, data: insertResult } = await supabase
      .from('paid_downloads')
      .insert([{
        file_id: fileId,
        owner_username: data.ownerUsername,
        price: data.price,
        currency: data.currency,
        enabled: data.enabled,
        preview_enabled: data.previewEnabled ?? true, // Default to true if not specified
        created_at: now,
        updated_at: now
      }])
      .select(); // Add select to return the inserted record

    if (error) {
      console.error('Error creating paid download:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      throw error;
    }
    console.log('Insert result:', insertResult); // Debug log
  }
}

export async function createPaidDownload(paidDownload: Omit<DatabasePaidDownload, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount'>) {
  const supabase = createClient();
  const now = new Date();

  // Map camelCase properties to snake_case for database insertion
  const paidDownloadSnakeCase = {
    file_id: paidDownload.fileId,
    user_id: paidDownload.userId,
    purchaser_user_id: paidDownload.purchaserUserId,
    amount_paid: paidDownload.amountPaid,
    currency: paidDownload.currency,
    transaction_id: paidDownload.transactionId,
    download_count: 0,
    enabled: paidDownload.enabled,
    price: paidDownload.price,
    owner_username: paidDownload.ownerUsername,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from('paid_downloads')
    .insert([paidDownloadSnakeCase])
    .select(`
      id,
      file_id,
      user_id,
      purchaser_user_id,
      amount_paid,
      currency,
      transaction_id,
      download_count,
      enabled,
      price,
      owner_username,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error('Error creating paid download:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    fileId: data.file_id,
    userId: data.user_id,
    purchaserUserId: data.purchaser_user_id,
    amountPaid: data.amount_paid,
    currency: data.currency,
    transactionId: data.transaction_id,
    downloadCount: data.download_count,
    enabled: data.enabled,
    price: data.price,
    ownerUsername: data.owner_username,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as DatabasePaidDownload;
}

export async function deletePaidDownload(fileId: string) {
  const supabase = createClient();

  console.log('Deleting paid download for file:', fileId); // Debug log

  const { error } = await supabase
    .from('paid_downloads')
    .delete()
    .eq('file_id', fileId);

  if (error) {
    console.error('Error deleting paid download:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw error;
  }

  console.log('Paid download deleted successfully for file:', fileId); // Debug log
}

export async function incrementDownloadCount(fileId: string) {
  const supabase = createClient();
  const now = new Date();

  console.log('Incrementing download count for file:', fileId); // Debug log

  // Note: This function assumes you have the increment_download_count RPC function in your Supabase database
  // If not, you'll need to implement the increment logic differently
  const { error } = await supabase.rpc('increment_download_count', {
    row_file_id: fileId,
    new_updated_at: now.toISOString()
  });

  if (error) {
    console.error('Error incrementing download count:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw error;
  }

  console.log('Download count incremented successfully for file:', fileId); // Debug log
}

// Functions for download orders (needed for payments)
export interface DownloadOrder {
  id?: string;
  orderId: string;
  fileId: string;
  ownerUsername: string;
  amount: number;
  currency: string;
  status: string;
  token?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function createDownloadOrder(order: Omit<DownloadOrder, 'id' | 'createdAt' | 'updatedAt'>) {
  const supabase = createClient();
  const now = new Date();

  // Map camelCase properties to snake_case for database insertion
  const orderSnakeCase = {
    order_id: order.orderId,
    file_id: order.fileId,
    owner_username: order.ownerUsername,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    token: order.token || null, // Ensure token is null if undefined
    created_at: now,
    updated_at: now
  };

  console.log('Creating download order with data:', orderSnakeCase); // Debug log

  const { data, error } = await supabase
    .from('download_orders')
    .insert([orderSnakeCase])
    .select(`
      id,
      order_id,
      file_id,
      owner_username,
      amount,
      currency,
      status,
      token,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error('Error creating download order:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw error;
  }

  console.log('Download order created successfully:', data); // Debug log

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    orderId: data.order_id,
    fileId: data.file_id,
    ownerUsername: data.owner_username,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    token: data.token,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as DownloadOrder;
}

export async function getDownloadOrder(orderId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('download_orders')
    .select(`
      id,
      order_id,
      file_id,
      owner_username,
      amount,
      currency,
      status,
      token,
      created_at,
      updated_at
    `)
    .eq('order_id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error('Error getting download order:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    orderId: data.order_id,
    fileId: data.file_id,
    ownerUsername: data.owner_username,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    token: data.token,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as DownloadOrder;
}

export async function updateDownloadOrder(orderId: string, updates: Partial<DownloadOrder>) {
  const supabase = createClient();
  const now = new Date();

  // Map camelCase properties to snake_case for database update
  const updatesSnakeCase: any = { updated_at: now };

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case 'orderId':
        updatesSnakeCase.order_id = value;
        break;
      case 'fileId':
        updatesSnakeCase.file_id = value;
        break;
      case 'ownerUsername':
        updatesSnakeCase.owner_username = value;
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

  console.log('Updating download order with data:', { orderId, updatesSnakeCase }); // Debug log

  const { error } = await supabase
    .from('download_orders')
    .update(updatesSnakeCase)
    .eq('order_id', orderId);

  if (error) {
    console.error('Error updating download order:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw error;
  }

  console.log('Download order updated successfully'); // Debug log
}

export async function createDownloadToken(tokenData: Omit<DownloadToken, 'id'>) {
  const supabase = createClient();

  console.log('Creating download token with data:', tokenData); // Debug log

  // Map camelCase properties to snake_case for database insertion
  const tokenDataSnakeCase = {
    token: tokenData.token,
    file_id: tokenData.fileId,
    user_id: tokenData.userId,
    is_valid: tokenData.isValid,
    expires_at: tokenData.expiresAt,
    created_at: tokenData.createdAt
  };

  const { data, error } = await supabase
    .from('download_tokens')
    .insert([tokenDataSnakeCase])
    .select(`
      id,
      token,
      file_id,
      user_id,
      is_valid,
      expires_at,
      created_at
    `)
    .single();

  if (error) {
    console.error('Error creating download token:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    token: data.token,
    fileId: data.file_id,
    userId: data.user_id,
    isValid: data.is_valid,
    expiresAt: data.expires_at,
    createdAt: data.created_at
  };

  return mappedData as DownloadToken;
}

export async function invalidateDownloadToken(token: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('download_tokens')
    .update({ is_valid: false })
    .eq('token', token);

  if (error) {
    console.error('Error invalidating download token:', error);
    throw error;
  }
}

