// ===========================================================================
// GOOGLE DRIVE MEDIA INTEGRATION SERVICE - FIXED VERSION
// File: src/services/googleDriveMediaService.ts
// Upload and manage homepage media through Google Drive
// ===========================================================================

import { supabase } from '../lib/supabase';
import { googleDriveService } from './googleDrive';

// ===========================================================================
// TYPES & INTERFACES
// ===========================================================================

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  directLink: string;
  thumbnailLink?: string;
  mimeType: string;
  size: string;
  createdTime: string;
}

export interface HomepageMediaItem {
  id: string;
  media_file_id: string;
  media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'logo' | 'banner';
  display_order: number;
  is_active: boolean;
  title?: string;
  description?: string;
  link_url?: string;
  button_text?: string;
  created_at: string;
  updated_at: string;
  
  // Joined media file data
  media_file?: {
    id: string;
    name: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    google_drive_file_id: string;
    download_url: string;
    thumbnail_url?: string;
    web_view_link: string;
    file_type: 'image' | 'video' | 'document' | 'other';
  };
}

export interface UploadProgress {
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// ===========================================================================
// HOMEPAGE MEDIA SERVICE
// ===========================================================================

class HomepageMediaService {
  /**
   * Upload media files to Google Drive and save to database
   */
  async uploadHomepageMedia(
    files: FileList, 
    mediaType: HomepageMediaItem['media_type'],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<HomepageMediaItem[]> {
    try {
      console.log('🎨 Starting homepage media upload...', { fileCount: files.length, mediaType });

      // Ensure Google Drive is initialized and authenticated
      const initialized = await googleDriveService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google Drive service');
      }

      const authenticated = await googleDriveService.authenticate();
      if (!authenticated) {
        throw new Error('Google Drive authentication failed');
      }

      // Get or create homepage folder
      const homepageFolderId = await googleDriveService.getOrCreateHomepageFolder();

      const uploadedItems: HomepageMediaItem[] = [];

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          if (onProgress) {
            onProgress({
              fileName: file.name,
              loaded: 0,
              total: file.size,
              percentage: 0,
              status: 'uploading'
            });
          }

          // Upload to Google Drive
          const driveFile = await googleDriveService.uploadFile(
            file, 
            homepageFolderId,
            (progress: ProgressEvent) => {
              if (onProgress) {
                onProgress({
                  fileName: file.name,
                  loaded: progress.loaded,
                  total: progress.total,
                  percentage: Math.round((progress.loaded / progress.total) * 100),
                  status: 'uploading'
                });
              }
            }
          );

          if (onProgress) {
            onProgress({
              fileName: file.name,
              loaded: file.size,
              total: file.size,
              percentage: 100,
              status: 'processing'
            });
          }

          // Save file metadata to database
          const mediaFile = await this.saveMediaFileToDatabase(driveFile, file);

          // Create homepage media entry
          const homepageItem = await this.createHomepageMediaEntry(
            mediaFile.id,
            mediaType,
            file.name
          );

          uploadedItems.push(homepageItem);

          if (onProgress) {
            onProgress({
              fileName: file.name,
              loaded: file.size,
              total: file.size,
              percentage: 100,
              status: 'completed'
            });
          }

        } catch (error) {
          console.error(`❌ Failed to upload ${file.name}:`, error);
          
          if (onProgress) {
            onProgress({
              fileName: file.name,
              loaded: 0,
              total: file.size,
              percentage: 0,
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed'
            });
          }
        }
      }

      console.log('✅ Homepage media upload completed:', uploadedItems.length);
      return uploadedItems;

    } catch (error) {
      console.error('❌ Homepage media upload failed:', error);
      throw error;
    }
  }

  /**
   * Save media file metadata to database
   */
  private async saveMediaFileToDatabase(driveFile: GoogleDriveFile, originalFile: File) {
    const { data, error } = await supabase
      .from('media_files')
      .insert({
        name: driveFile.name,
        original_name: originalFile.name,
        mime_type: originalFile.type,
        file_size: originalFile.size,
        google_drive_file_id: driveFile.id,
        download_url: driveFile.directLink, // Use the direct link for displaying
        thumbnail_url: driveFile.thumbnailLink,
        web_view_link: driveFile.webViewLink,
        file_type: originalFile.type.startsWith('image/') ? 'image' :
                  originalFile.type.startsWith('video/') ? 'video' : 'other',
        is_public: true,
        is_archived: false,
        uploaded_by: 'admin' // Replace with actual user ID
      })
      .select()
      .single();

    if (error) {
      console.error('Database save error:', error);
      throw new Error(`Failed to save media file to database: ${error.message}`);
    }

    return data;
  }

  /**
   * Create homepage media entry
   */
  private async createHomepageMediaEntry(
    mediaFileId: string,
    mediaType: HomepageMediaItem['media_type'],
    title: string
  ): Promise<HomepageMediaItem> {
    // Get the next display order
    const { data: existingMedia } = await supabase
      .from('homepage_media')
      .select('display_order')
      .eq('media_type', mediaType)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingMedia && existingMedia.length > 0 
      ? existingMedia[0].display_order + 1 
      : 1;

    const { data, error } = await supabase
      .from('homepage_media')
      .insert({
        media_file_id: mediaFileId,
        media_type: mediaType,
        display_order: nextOrder,
        is_active: true,
        title: title
      })
      .select(`
        *,
        media_file:media_files(*)
      `)
      .single();

    if (error) {
      console.error('Failed to create homepage media entry:', error);
      throw new Error(`Failed to create homepage media entry: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all homepage media by type
   */
  async getHomepageMedia(mediaType?: HomepageMediaItem['media_type']): Promise<HomepageMediaItem[]> {
    let query = supabase
      .from('homepage_media')
      .select(`
        *,
        media_file:media_files(*)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (mediaType) {
      query = query.eq('media_type', mediaType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get homepage media:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Update media item
   */
  async updateHomepageMedia(id: string, updates: Partial<HomepageMediaItem>): Promise<HomepageMediaItem> {
    const { data, error } = await supabase
      .from('homepage_media')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        media_file:media_files(*)
      `)
      .single();

    if (error) {
      console.error('Failed to update homepage media:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete media item
   */
  async deleteHomepageMedia(id: string): Promise<void> {
    const { error } = await supabase
      .from('homepage_media')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete homepage media:', error);
      throw error;
    }
  }
}

// ===========================================================================
// EXPORT SINGLETON INSTANCE
// ===========================================================================

export const homepageMediaService = new HomepageMediaService();

console.log('🌐 Google Drive Media Service initialized!');
