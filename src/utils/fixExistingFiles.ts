// src/utils/fixExistingFiles.ts - CSP-SAFE UTILITY
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
 * Fix all existing media files by making them public (CSP-Safe version)
 */
export async function fixAllExistingFiles(): Promise<FixResults> {
  console.log('🔧 Starting CSP-safe fix for all existing media files...');

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

    // Get all files from main directory
    const allFiles = await googleDriveService.listFiles('root', undefined, 500);
    const mediaFiles = allFiles.filter(file => 
      file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')
    );

    results.totalFiles = mediaFiles.length;
    console.log(`📊 Found ${mediaFiles.length} media files to process`);

    if (mediaFiles.length === 0) {
      console.log('ℹ️ No media files found to fix');
      return results;
    }

    // Process files in batches to avoid rate limits
    const batchSize = 5; // Smaller batches for stability
    for (let i = 0; i < mediaFiles.length; i += batchSize) {
      const batch = mediaFiles.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(mediaFiles.length/batchSize)}...`);
      
      // Process batch sequentially to avoid rate limits
      for (const file of batch) {
        try {
          // First check if file is already public using CSP-safe method
          const isPublic = await googleDriveService.verifyFileIsPublic(file.id);
          
          if (isPublic) {
            console.log(`ℹ️ Already public: ${file.name}`);
            results.successCount++;
            results.successFiles.push(file.id);
          } else {
            // Make file public
            const success = await googleDriveService.makeFilePublic(file.id);
            if (success) {
              results.successCount++;
              results.successFiles.push(file.id);
              console.log(`✅ Made public: ${file.name}`);
            } else {
              results.failedCount++;
              results.failedFiles.push({
                id: file.id,
                name: file.name,
                error: 'Failed to set public permissions'
              });
              console.error(`❌ Failed to make public: ${file.name}`);
            }
          }
          
          // Small delay between files to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error: any) {
          results.failedCount++;
          results.failedFiles.push({
            id: file.id,
            name: file.name,
            error: error.message
          });
          console.error(`❌ Error processing: ${file.name} - ${error.message}`);
        }
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < mediaFiles.length) {
        console.log('⏱️ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`🎉 Fix completed! ${results.successCount}/${results.totalFiles} files processed`);
    
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
 * Test a single file using CSP-safe method
 */
export async function testFileAccess(fileId: string): Promise<boolean> {
  try {
    console.log(`🧪 Testing file access: ${fileId}`);
    return await googleDriveService.verifyFileIsPublic(fileId);
  } catch (error) {
    console.error('❌ Error testing file access:', error);
    return false;
  }
}

/**
 * Verify and fix a specific file (CSP-safe)
 */
export async function verifyAndFixFile(fileId: string): Promise<boolean> {
  try {
    console.log(`🔧 Checking file: ${fileId}`);
    
    // First test if file is already public using CSP-safe method
    const isPublic = await googleDriveService.verifyFileIsPublic(fileId);
    if (isPublic) {
      console.log(`✅ File ${fileId} is already public`);
      return true;
    }

    // If not public, make it public
    console.log(`🔧 Making file ${fileId} public...`);
    const success = await googleDriveService.makeFilePublic(fileId);
    
    if (success) {
      // Verify it worked using CSP-safe method
      const isNowPublic = await googleDriveService.verifyFileIsPublic(fileId);
      if (isNowPublic) {
        console.log(`✅ File ${fileId} is now public`);
        return true;
      } else {
        console.error(`❌ File ${fileId} still not public after fix attempt`);
        return false;
      }
    } else {
      console.error(`❌ Failed to make file ${fileId} public`);
      return false;
    }
  } catch (error: any) {
    console.error(`❌ Error fixing file ${fileId}:`, error);
    return false;
  }
}

/**
 * Quick fix for files in browser console (CSP-safe)
 */
export function createConsoleFixFunction() {
  return `
// 🔧 CSP-SAFE CONSOLE FIX FUNCTION
// Paste this in your browser console on the admin page
(async function quickFixFiles() {
  console.log('🔧 Starting CSP-safe file fix...');
  
  try {
    // Access the Google Drive service from window
    const service = window.googleDriveService || (window as any).googleDriveService;
    
    if (!service) {
      console.error('❌ Google Drive service not found');
      return;
    }
    
    // Check authentication
    const isAuth = await service.isUserAuthenticated();
    if (!isAuth) {
      console.log('🔐 Please authenticate first');
      return;
    }
    
    // Get files and make them public
    const files = await service.listFiles('root');
    const mediaFiles = files.filter(f => 
      f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')
    );
    
    console.log(\`📊 Found \${mediaFiles.length} media files\`);
    
    let fixed = 0;
    for (const file of mediaFiles) {
      try {
        const isPublic = await service.verifyFileIsPublic(file.id);
        if (!isPublic) {
          const success = await service.makeFilePublic(file.id);
          if (success) {
            fixed++;
            console.log(\`✅ Fixed: \${file.name}\`);
          }
        }
        await new Promise(r => setTimeout(r, 200)); // Rate limit delay
      } catch (error) {
        console.error(\`❌ Failed: \${file.name}\`, error);
      }
    }
    
    console.log(\`🎉 Fixed \${fixed} files!\`);
    console.log('🔄 Now refresh your homepage to see the changes');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
  `;
}

// Browser-safe exports
if (typeof window !== 'undefined') {
  (window as any).fixAllExistingFiles = fixAllExistingFiles;
  (window as any).testFileAccess = testFileAccess;
  (window as any).verifyAndFixFile = verifyAndFixFile;
  
  console.log('🛠️ CSP-safe file fix utilities loaded:');
  console.log('   - fixAllExistingFiles() - Fix all media files');
  console.log('   - testFileAccess(fileId) - Test single file');
  console.log('   - verifyAndFixFile(fileId) - Fix single file');
}
