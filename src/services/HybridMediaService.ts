// src/services/HybridMediaService.ts - COMPLETE CORRECTED VERSION
import { supabase } from '../lib/supabase';
import { googleDriveService, DriveFile } from './googleDriveService';

interface SupabaseMediaFile {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  mimeType: string;
  bucket: string;
}

interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  stage: 'downloading' | 'uploading' | 'processing' | 'completed';
}

interface StorageAnalytics {
  supabaseUsage: number;
  supabaseLimit: number;
  usagePercentage: number;
  activeFiles: number;
  inactiveFiles: number;
  totalFiles: number;
  spaceByCategory: Record<string, number>;
}

class HybridMediaService {
  private readonly STORAGE_BUCKET = 'homepage-media';
  private readonly MAX_SUPABASE_STORAGE = 8 * 1024 * 1024 * 1024; // 8GB in bytes
  
  constructor() {
    // Skip auto-initialization since bucket is created via Supabase Dashboard
    // this.initializeStorage(); 
    console.log('HybridMediaService initialized - bucket managed via dashboard');
  }

  /**
   * Initialize Supabase Storage bucket (now disabled - using dashboard instead)
   */
  private async initializeStorage(): Promise<void> {
    try {
      // Verify bucket exists (but don't create it)
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.STORAGE_BUCKET);
      
      if (bucketExists) {
        console.log(`Storage bucket '${this.STORAGE_BUCKET}' verified`);
      } else {
        console.warn(`Storage bucket '${this.STORAGE_BUCKET}' not found. Please create it via Supabase Dashboard.`);
      }
    } catch (error) {
      console.error('Storage verification failed:', error);
    }
  }

  /**
   * Verify storage bucket exists and is properly configured
   */
  async verifyStorageSetup(): Promise<boolean> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Failed to list buckets:', error);
        return false;
      }

      const bucket = buckets?.find(b => b.name === this.STORAGE_BUCKET);
      if (!bucket) {
        console.error(`Bucket '${this.STORAGE_BUCKET}' not found`);
        return false;
      }

      console.log(`Storage bucket verified: ${bucket.name} (public: ${bucket.public})`);
      return true;
    } catch (error) {
      console.error('Storage verification failed:', error);
      return false;
    }
  }

  /**
   * Transfer Google Drive file to Supabase Storage
   */
  async transferToSupabase(
    driveFileId: string,
    mediaType: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<SupabaseMediaFile | null> {
    try {
      console.log(`Starting transfer for ${driveFileId}`);
      
      // Verify storage setup first
      const storageReady = await this.verifyStorageSetup();
      if (!storageReady) {
        throw new Error('Storage bucket not properly configured');
      }

      onProgress?.({
        loaded: 0,
        total: 100,
        percentage: 0,
        stage: 'downloading'
      });

      // Step 1: Download from Google Drive
      const downloadResult = await this.downloadFromGoogleDrive(driveFileId);
      if (!downloadResult) {
        throw new Error('Failed to download from Google Drive');
      }

      onProgress?.({
        loaded: 40,
        total: 100,
        percentage: 40,
        stage: 'uploading'
      });

      // Step 2: Upload to Supabase Storage
      const supabaseFile = await this.uploadToSupabaseStorage(
        downloadResult.blob, 
        mediaType, 
        downloadResult.metadata.name
      );
      
      onProgress?.({
        loaded: 80,
        total: 100,
        percentage: 80,
        stage: 'processing'
      });

      // Step 3: Update database record
      await this.updateDatabaseUrls(driveFileId, supabaseFile);

      onProgress?.({
        loaded: 100,
        total: 100,
        percentage: 100,
        stage: 'completed'
      });

      console.log(`Transfer completed: ${driveFileId} → ${supabaseFile.path}`);
      return supabaseFile;

    } catch (error: any) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  /**
   * Download file from Google Drive using proper API access
   */
  private async downloadFromGoogleDrive(fileId: string): Promise<{ blob: Blob; metadata: any } | null> {
    try {
      // Ensure authentication
      const isAuth = await googleDriveService.isUserAuthenticated();
      if (!isAuth) {
        const authSuccess = await googleDriveService.authenticate();
        if (!authSuccess) {
          throw new Error('Google Drive authentication failed');
        }
      }

      // Access gapi through the service's property
      const gapi = (googleDriveService as any).gapi;
      if (!gapi) {
        throw new Error('Google API not initialized');
      }

      // Get file metadata
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'name,mimeType,size,createdTime,modifiedTime'
      });

      if (!response.result) {
        throw new Error('File not found in Google Drive');
      }

      // Get access token for download
      const token = gapi.auth.getToken();
      if (!token?.access_token) {
        throw new Error('No valid access token available');
      }

      // Download file content using Google Drive API
      const downloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`
          }
        }
      );

      if (!downloadResponse.ok) {
        throw new Error(`Download failed: ${downloadResponse.status} ${downloadResponse.statusText}`);
      }

      const blob = await downloadResponse.blob();
      console.log(`Downloaded ${response.result.name} (${blob.size} bytes)`);
      
      return {
        blob,
        metadata: response.result
      };
    } catch (error: any) {
      console.error('Google Drive download failed:', error);
      return null;
    }
  }

  /**
   * Upload blob to Supabase Storage
   */
  private async uploadToSupabaseStorage(
    blob: Blob,
    mediaType: string,
    originalFileName?: string
  ): Promise<SupabaseMediaFile> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const extension = this.getFileExtension(blob.type);
      const fileName = originalFileName 
        ? `${timestamp}-${originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_')}` 
        : `${mediaType}-${timestamp}${extension}`;
      
      const filePath = `${mediaType}/${fileName}`;

      // Check storage quota before upload
      await this.ensureStorageSpace(blob.size);

      console.log(`Uploading to Supabase: ${filePath} (${this.formatBytes(blob.size)})`);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const supabaseFile: SupabaseMediaFile = {
        id: data.id || timestamp.toString(),
        name: fileName,
        url: urlData.publicUrl,
        path: filePath,
        size: blob.size,
        mimeType: blob.type,
        bucket: this.STORAGE_BUCKET
      };

      console.log(`Upload successful: ${urlData.publicUrl}`);
      return supabaseFile;

    } catch (error: any) {
      console.error('Supabase upload failed:', error);
      throw error;
    }
  }

  /**
   * Update database with Supabase URLs
   */
  private async updateDatabaseUrls(
    googleDriveFileId: string,
    supabaseFile: SupabaseMediaFile
  ): Promise<void> {
    try {
      // Update media_files table
      const { error: mediaError } = await supabase
        .from('media_files')
        .update({
          download_url: supabaseFile.url,
          supabase_storage_path: supabaseFile.path,
          supabase_storage_bucket: supabaseFile.bucket,
          storage_strategy: 'hybrid',
          transfer_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('google_drive_file_id', googleDriveFileId);

      if (mediaError) {
        console.error('Failed to update media_files:', mediaError);
        throw mediaError;
      }

      console.log(`Database updated for Google Drive file: ${googleDriveFileId}`);
    } catch (error) {
      console.error('Database update failed:', error);
      throw error;
    }
  }

  /**
   * Remove inactive files from Supabase Storage
   */
  async cleanupInactiveFiles(): Promise<{
    removed: string[];
    spaceFreed: number;
    errors: string[];
  }> {
    try {
      console.log('Starting cleanup of inactive files...');
      
      // Get inactive media files with Supabase storage paths
      const { data: inactiveFiles, error } = await supabase
        .from('homepage_media')
        .select(`
          id,
          media_file:media_files(
            id,
            name,
            supabase_storage_path,
            supabase_storage_bucket,
            file_size
          )
        `)
        .eq('is_active', false)
        .not('media_file.supabase_storage_path', 'is', null);

      if (error) {
        throw error;
      }

      const removed: string[] = [];
      const errors: string[] = [];
      let spaceFreed = 0;

      for (const item of inactiveFiles || []) {
        const mediaFile = Array.isArray(item.media_file) ? item.media_file[0] : item.media_file;
        
        if (!mediaFile?.supabase_storage_path) continue;

        try {
          // Remove from Supabase Storage
          const { error: deleteError } = await supabase.storage
            .from(mediaFile.supabase_storage_bucket || this.STORAGE_BUCKET)
            .remove([mediaFile.supabase_storage_path]);

          if (deleteError) {
            errors.push(`${mediaFile.name}: ${deleteError.message}`);
            continue;
          }

          // Update database to remove Supabase references
          await supabase
            .from('media_files')
            .update({
              supabase_storage_path: null,
              supabase_storage_bucket: null,
              transfer_status: 'pending',
              storage_strategy: 'drive_only',
              updated_at: new Date().toISOString()
            })
            .eq('id', mediaFile.id);

          removed.push(mediaFile.name);
          spaceFreed += mediaFile.file_size || 0;

          console.log(`Removed inactive file: ${mediaFile.name}`);
        } catch (error: any) {
          errors.push(`${mediaFile.name}: ${error.message}`);
        }
      }

      console.log(`Cleanup completed: ${removed.length} files removed, ${this.formatBytes(spaceFreed)} freed`);
      
      return { removed, spaceFreed, errors };
    } catch (error: any) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageAnalytics(): Promise<StorageAnalytics> {
    try {
      // Get all files with Supabase storage
      const { data: files } = await supabase
        .from('homepage_media')
        .select(`
          id,
          media_type,
          is_active,
          media_file:media_files(
            file_size,
            supabase_storage_path
          )
        `);

      let supabaseUsage = 0;
      let activeFiles = 0;
      let inactiveFiles = 0;
      const spaceByCategory: Record<string, number> = {};

      for (const item of files || []) {
        const mediaFile = Array.isArray(item.media_file) ? item.media_file[0] : item.media_file;
        
        if (mediaFile?.supabase_storage_path) {
          const fileSize = mediaFile.file_size || 0;
          supabaseUsage += fileSize;
          
          spaceByCategory[item.media_type] = (spaceByCategory[item.media_type] || 0) + fileSize;
        }

        if (item.is_active) {
          activeFiles++;
        } else {
          inactiveFiles++;
        }
      }

      return {
        supabaseUsage,
        supabaseLimit: this.MAX_SUPABASE_STORAGE,
        usagePercentage: (supabaseUsage / this.MAX_SUPABASE_STORAGE) * 100,
        activeFiles,
        inactiveFiles,
        totalFiles: activeFiles + inactiveFiles,
        spaceByCategory
      };
    } catch (error: any) {
      console.error('Analytics failed:', error);
      throw error;
    }
  }

  /**
   * Transfer multiple files from Google Drive
   */
  async bulkTransferToSupabase(
    driveFileIds: string[],
    onProgress?: (overallProgress: number, fileProgress?: DownloadProgress) => void
  ): Promise<{
    successful: SupabaseMediaFile[];
    failed: { fileId: string; error: string }[];
  }> {
    const successful: SupabaseMediaFile[] = [];
    const failed: { fileId: string; error: string }[] = [];

    for (let i = 0; i < driveFileIds.length; i++) {
      const fileId = driveFileIds[i];
      const overallProgress = (i / driveFileIds.length) * 100;
      
      try {
        onProgress?.(overallProgress);
        
        const result = await this.transferToSupabase(fileId, 'gallery_image', onProgress);
        
        if (result) {
          successful.push(result);
        } else {
          failed.push({ fileId, error: 'Transfer returned null' });
        }
      } catch (error: any) {
        failed.push({ fileId, error: error.message });
      }

      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    onProgress?.(100);
    console.log(`Bulk transfer completed: ${successful.length} successful, ${failed.length} failed`);
    
    return { successful, failed };
  }

  /**
   * Get files that can be transferred (Google Drive only, not yet in Supabase)
   */
  async getTransferableFiles(): Promise<{
    fileId: string;
    name: string;
    mediaType: string;
    size: number;
  }[]> {
    try {
      const { data: files, error } = await supabase
        .from('homepage_media')
        .select(`
          media_type,
          media_file:media_files(
            google_drive_file_id,
            name,
            file_size,
            supabase_storage_path
          )
        `)
        .eq('is_active', true)
        .is('media_file.supabase_storage_path', null)
        .not('media_file.google_drive_file_id', 'is', null);

      if (error) {
        throw error;
      }

      return (files || []).map(item => {
        const mediaFile = Array.isArray(item.media_file) ? item.media_file[0] : item.media_file;
        return {
          fileId: mediaFile.google_drive_file_id,
          name: mediaFile.name,
          mediaType: item.media_type,
          size: mediaFile.file_size || 0
        };
      }).filter(file => file.fileId);

    } catch (error: any) {
      console.error('Failed to get transferable files:', error);
      return [];
    }
  }

  /**
   * Ensure we have enough Supabase storage space
   */
  private async ensureStorageSpace(requiredBytes: number): Promise<void> {
    const analytics = await this.getStorageAnalytics();
    
    if (analytics.supabaseUsage + requiredBytes > this.MAX_SUPABASE_STORAGE) {
      console.log('Storage limit approaching, cleaning up inactive files...');
      await this.cleanupInactiveFiles();
      
      // Re-check after cleanup
      const updatedAnalytics = await this.getStorageAnalytics();
      if (updatedAnalytics.supabaseUsage + requiredBytes > this.MAX_SUPABASE_STORAGE) {
        throw new Error('Insufficient Supabase storage space. Please upgrade or remove more files.');
      }
    }
  }

  /**
   * Get file extension from MIME type
   */
  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mov'
    };
    
    return extensions[mimeType] || '';
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Manual initialization for testing
   */
  async initialize(): Promise<boolean> {
    try {
      const verified = await this.verifyStorageSetup();
      if (verified) {
        console.log('HybridMediaService ready for use');
      }
      return verified;
    } catch (error) {
      console.error('HybridMediaService initialization failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const hybridMediaService = new HybridMediaService();

// Export types
export type { SupabaseMediaFile, DownloadProgress, StorageAnalytics };
