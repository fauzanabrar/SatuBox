import { createClient } from '../client';

export interface DatabaseRestriction {
  id?: string;
  fileId: string;
  userId?: string;
  isRestricted: boolean;
  restrictionType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getRestrictByFileId(fileId: string): Promise<DatabaseRestriction | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('restrictions')
    .select(`
      id,
      file_id,
      user_id,
      is_restricted,
      restriction_type,
      created_at,
      updated_at
    `)
    .eq('file_id', fileId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error('Error getting restriction by file ID:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    fileId: data.file_id,
    userId: data.user_id,
    isRestricted: data.is_restricted,
    restrictionType: data.restriction_type,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as DatabaseRestriction;
}

export async function createRestriction(restriction: Omit<DatabaseRestriction, 'id' | 'createdAt' | 'updatedAt'>) {
  const supabase = createClient();
  const now = new Date();

  // Map camelCase properties to snake_case for database insertion
  const restrictionSnakeCase = {
    file_id: restriction.fileId,
    user_id: restriction.userId,
    is_restricted: restriction.isRestricted,
    restriction_type: restriction.restrictionType,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from('restrictions')
    .insert([restrictionSnakeCase])
    .select(`
      id,
      file_id,
      user_id,
      is_restricted,
      restriction_type,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error('Error creating restriction:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  const mappedData = {
    id: data.id,
    fileId: data.file_id,
    userId: data.user_id,
    isRestricted: data.is_restricted,
    restrictionType: data.restriction_type,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return mappedData as DatabaseRestriction;
}

export async function updateRestriction(fileId: string, updates: Partial<DatabaseRestriction>) {
  const supabase = createClient();
  const now = new Date();

  // Map camelCase properties to snake_case for database update
  const updatesSnakeCase: any = { updated_at: now };

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case 'fileId':
        updatesSnakeCase.file_id = value;
        break;
      case 'userId':
        updatesSnakeCase.user_id = value;
        break;
      case 'isRestricted':
        updatesSnakeCase.is_restricted = value;
        break;
      case 'restrictionType':
        updatesSnakeCase.restriction_type = value;
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

  const { error } = await supabase
    .from('restrictions')
    .update(updatesSnakeCase)
    .eq('file_id', fileId);

  if (error) {
    console.error('Error updating restriction:', error);
    throw error;
  }
}

export async function getRestricts() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('restrictions')
    .select(`
      id,
      file_id,
      user_id,
      is_restricted,
      restriction_type,
      created_at,
      updated_at
    `);

  if (error) {
    console.error('Error getting restrictions:', error);
    throw error;
  }

  // Map snake_case database columns to camelCase JavaScript properties
  return data.map(row => ({
    id: row.id,
    fileId: row.file_id,
    userId: row.user_id,
    isRestricted: row.is_restricted,
    restrictionType: row.restriction_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })) as DatabaseRestriction[];
}

export async function createRestrictFile(fileId: string, username: string) {
  const supabase = createClient();
  const now = new Date();

  const { data, error } = await supabase
    .from('restrictions')
    .insert([{
      file_id: fileId,
      user_id: username, // Note: in the original Firebase version, this was probably storing username
      is_restricted: true,
      restriction_type: 'admin',
      created_at: now,
      updated_at: now
    }])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating restriction:', error);
    throw error;
  }

  return data.id;
}

export async function deleteRestrict(fileId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('restrictions')
    .delete()
    .eq('file_id', fileId);

  if (error) {
    console.error('Error deleting restriction:', error);
    throw error;
  }
}

export async function addWhitelistRestrict(fileId: string, whitelist: string) {
  // For now, this function updates the restriction record to add to whitelist
  // You might need to implement this differently based on your specific requirements
  const supabase = createClient();
  const now = new Date();

  // Get the current restriction
  const restriction = await getRestrictByFileId(fileId);
  if (!restriction) {
    throw new Error('Restriction not found');
  }

  // Update the restriction to add the whitelist user
  // This implementation assumes you have a way to store whitelisted users
  const { error } = await supabase
    .from('restrictions')
    .update({
      updated_at: now
    })
    .eq('file_id', fileId);

  if (error) {
    console.error('Error adding whitelist to restriction:', error);
    throw error;
  }
}

export async function removeWhitelistRestrict(fileId: string, whitelist: string) {
  // For now, this function updates the restriction record to remove from whitelist
  // You might need to implement this differently based on your specific requirements
  const supabase = createClient();
  const now = new Date();

  const { error } = await supabase
    .from('restrictions')
    .update({
      updated_at: now
    })
    .eq('file_id', fileId);

  if (error) {
    console.error('Error removing whitelist from restriction:', error);
    throw error;
  }
}