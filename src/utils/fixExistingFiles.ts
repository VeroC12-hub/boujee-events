// src/utils/fixExistingFiles.ts - Utility to fix existing private files
import { googleDriveService } from '../services/googleDriveService';

interface FixResults {
  totalFiles: number;
  successCount: number;
  failedCount: number;
  successFiles: string[];
  failedFiles: Array<{
    id: string;
    name: string;
    error: string;
  }>;
}

/**
 * Fix all existing media files by making them public
 */
export async function fixAllExistingFiles(): Promise<FixResults> {
  console.log('🔧 Starting fix for all existing media files...');

  const results: FixResults = {
    totalFiles: 0,
    successCount: 0,
    failedCount: 0,
    successFiles: [],
    failedFiles: []
  };

  try {
    // Ensure we're authenticated
    const isAuth = await googleDriveService.isUserAuthenticated();
    if (!isAuth) {
      console.log('🔐 Not authenticated, starting authentication...');
      const authSuccess = await googleDriveService.authenticate();
      if (!authSuccess) {
        throw new Error('Authentication failed');
      }
    }

    console.log('✅ Authenticated, searching for media files...');

    // Search for all image and video files
    const imageFiles = await googleDriveService.searchFiles('', 500); // Get more files
    const mediaFiles = imageFiles.filter(file => 
      file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')
    );

    results.totalFiles = mediaFiles.length;
    console.log(`📊 Found ${mediaFiles.length} media files to process`);

    if (mediaFiles.length === 0) {
      console.log('ℹ️ No media files found to fix');
      return results;
    }

    // Process files in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < mediaFiles.length; i += batchSize) {
      const batch = mediaFiles.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(mediaFiles.length/batchSize)}...`);
      
      // Process batch with delay to respect rate limits
      await Promise.all(batch.map(async (file) => {
        try {
          await googleDriveService.makeFilePublic(file.id);
          results.successCount++;
          results.successFiles.push(file.id);
          console.log(`✅ Made public: ${file.name}`);
        } catch (error: any) {
          results.failedCount++;
          results.failedFiles.push({
            id: file.id,
            name: file.name,
            error: error.message
          });
          console.error(`❌ Failed to make public: ${file.name} - ${error.message}`);
        }
      }));

      // Add delay between batches to respect rate limits
      if (i + batchSize < mediaFiles.length) {
        console.log('⏱️ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`🎉 Fix completed! ${results.successCount}/${results.totalFiles} files made public`);
    
    if (results.failedCount > 0) {
      console.warn(`⚠️ ${results.failedCount} files failed to be made public`);
      results.failedFiles.forEach(file => {
        console.warn(`   - ${file.name}: ${file.error}`);
      });
    }

    return results;

  } catch (error: any) {
    console.error('❌ Error during fix process:', error);
    throw error;
  }
}

/**
 * Test a single file to see if it's publicly accessible
 */
export async function testFileAccess(fileId: string): Promise<boolean> {
  try {
    const testUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    const response = await fetch(testUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error testing file access:', error);
    return false;
  }
}

/**
 * Verify and fix a specific file
 */
export async function verifyAndFixFile(fileId: string): Promise<boolean> {
  try {
    // First test if file is already public
    const isPublic = await testFileAccess(fileId);
    if (isPublic) {
      console.log(`✅ File ${fileId} is already public`);
      return true;
    }

    // If not public, make it public
    console.log(`🔧 Making file ${fileId} public...`);
    await googleDriveService.makeFilePublic(fileId);

    // Verify it worked
    const isNowPublic = await testFileAccess(fileId);
    if (isNowPublic) {
      console.log(`✅ File ${fileId} is now public`);
      return true;
    } else {
      console.error(`❌ File ${fileId} still not public after fix attempt`);
      return false;
    }
  } catch (error: any) {
    console.error(`❌ Error fixing file ${fileId}:`, error);
    return false;
  }
}
