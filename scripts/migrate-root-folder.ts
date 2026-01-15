import { getUsers } from '@/lib/supabase/db/users';
import { updateUserByUsername } from '@/lib/supabase/db/users';
import { gdrive } from '@/lib/gdrive';

async function migrateUserFolders() {
  try {
    console.log('Starting user folder migration...');

    // Get all users
    const users = await getUsers();
    console.log(`Found ${users.length} users to migrate`);

    const newRootFolderId = process.env.SHARED_FOLDER_ID_DRIVE;

    if (!newRootFolderId) {
      throw new Error('SHARED_FOLDER_ID_DRIVE environment variable is not set');
    }

    for (const user of users) {
      if (user.username) {
        try {
          console.log(`Processing user: ${user.username}`);

          // Create a new folder under the new root for this user
          const folderName = `user-${user.username}`;
          const newFolderId = await gdrive.createFolder(folderName, [newRootFolderId]);

          // Update the user's root folder ID in the database
          await updateUserByUsername(user.username, {
            rootFolderId: newFolderId
          });

          console.log(`Updated user ${user.username} to new folder: ${newFolderId}`);
        } catch (error) {
          console.error(`Error updating user ${user.username}:`, error);
        }
      }
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateUserFolders();