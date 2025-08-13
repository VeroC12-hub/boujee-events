// src/utils/fixExistingFiles.ts
// Utility to make existing Google Drive files public

import { googleDriveService } from '../services/googleDriveService';

interface FixResults {
  totalFiles: number;
  successCount: number;
  failedCount: number;
  successFiles: string[];
  failedFiles: {id: string, name: string, error: string}[];
}

/**
 * Fix existing files in your Google Drive by making them public
 * This should be run once to fix all your existing uploaded media
 */
export async function fixExistingMediaFiles(): Promise<FixResults> {
  console.log('🔧 Starting fix for existing media files...');

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
          console.log(`🔄 Processing file: ${file.name} (${file.id})`);
          const success = await googleDriveService.makeFilePublic(file.id);
          
          if (success) {
            results.successCount++;
            results.successFiles.push(file.id);
            console.log(`✅ Made public and verified: ${file.name}`);
          } else {
            results.failedCount++;
            results.failedFiles.push({
              id: file.id,
              name: file.name,
              error: 'Failed to make public or verify accessibility'
            });
            console.error(`❌ Failed to make public or verify: ${file.name}`);
          }
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
 * Fix files in a specific folder
 */
export async function fixFilesInFolder(folderId: string, folderName?: string): Promise<FixResults> {
  console.log(`🔧 Fixing files in folder: ${folderName || folderId}`);

  const results: FixResults = {
    totalFiles: 0,
    successCount: 0,
    failedCount: 0,
    successFiles: [],
    failedFiles: []
  };

  try {
    const isAuth = await googleDriveService.isUserAuthenticated();
    if (!isAuth) {
      const authSuccess = await googleDriveService.authenticate();
      if (!authSuccess) {
        throw new Error('Authentication failed');
      }
    }

    const files = await googleDriveService.listFiles(folderId);
    const mediaFiles = files.filter(file => 
      file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')
    );

    results.totalFiles = mediaFiles.length;
    console.log(`📊 Found ${mediaFiles.length} media files in folder`);

    for (const file of mediaFiles) {
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
        console.error(`❌ Failed: ${file.name} - ${error.message}`);
      }
      
      // Small delay between files
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;

  } catch (error: any) {
    console.error('❌ Error fixing folder files:', error);
    throw error;
  }
}

/**
 * Test a specific file URL to see if it's working
 */
export async function testFileUrl(fileId: string): Promise<boolean> {
  const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  
  try {
    console.log(`🧪 Testing URL: ${publicUrl}`);
    
    // Use the same verification method as the main service
    const isWorking = await testImageLoadability(publicUrl);
    
    console.log(isWorking ? '✅ URL is working' : '❌ URL is not accessible');
    return isWorking;
  } catch (error) {
    console.error('❌ Error testing URL:', error);
    return false;
  }
}

/**
 * Test if an image URL is loadable
 */
function testImageLoadability(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 10000); // 10 second timeout for testing

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    img.src = url;
  });
}

/**
 * Test multiple file IDs and report results
 */
export async function testMultipleFiles(fileIds: string[]): Promise<{working: string[], broken: string[]}> {
  console.log(`🧪 Testing ${fileIds.length} files...`);
  
  const working: string[] = [];
  const broken: string[] = [];
  
  for (const fileId of fileIds) {
    const isWorking = await testFileUrl(fileId);
    if (isWorking) {
      working.push(fileId);
    } else {
      broken.push(fileId);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`✅ ${working.length} files working, ❌ ${broken.length} files broken`);
  return { working, broken };
}

// Export for use in browser console or admin tools
if (typeof window !== 'undefined') {
  (window as any).fixExistingMediaFiles = fixExistingMediaFiles;
  (window as any).fixFilesInFolder = fixFilesInFolder;
  (window as any).testFileUrl = testFileUrl;
  (window as any).testMultipleFiles = testMultipleFiles;
  console.log('🛠️ File fix utilities loaded. Available functions:');
  console.log('   - fixExistingMediaFiles()');
  console.log('   - fixFilesInFolder(folderId, folderName)');
  console.log('   - testFileUrl(fileId)');
  console.log('   - testMultipleFiles([fileId1, fileId2, ...])');
}
