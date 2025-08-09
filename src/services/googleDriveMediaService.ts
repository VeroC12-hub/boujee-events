// ===========================================================================
// GOOGLE DRIVE MEDIA INTEGRATION SERVICE
// File: src/services/googleDriveMediaService.ts
// Upload and manage homepage media through Google Drive
// ===========================================================================

import { supabase } from '../lib/supabase';

// ===========================================================================
// TYPES & INTERFACES
// ===========================================================================

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
  createdTime: string;
  modifiedTime: string;
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
// GOOGLE DRIVE API CLIENT
// ===========================================================================

class GoogleDriveClient {
  private isInitialized = false;
  private accessToken: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      // Check if Google API is loaded
      if (typeof window.gapi === 'undefined') {
        console.log('🔄 Loading Google API...');
        await this.loadGoogleAPI();
      }

      // Initialize Google API client
      await new Promise((resolve, reject) => {
        window.gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject
        });
      });

      // Initialize the client
      await window.gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.file'
      });

      this.isInitialized = true;
      console.log('✅ Google Drive client initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Google Drive client:', error);
      return false;
    }
  }

  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize Google Drive client');
        }
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        console.log('🔐 Signing in to Google Drive...');
        await authInstance.signIn();
      }

      const user = authInstance.currentUser.get();
      const authResponse = user.getAuthResponse();
      this.accessToken = authResponse.access_token;

      console.log('✅ Google Drive authentication successful');
      return true;

    } catch (error) {
      console.error('❌ Google Drive authentication failed:', error);
      return false;
    }
  }

  async uploadFile(file: File, folderId?: string, onProgress?: (progress: UploadProgress) => void): Promise<GoogleDriveFile> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Authentication failed');
        }
      }

      console.log('📤 Uploading file to Google Drive:', file.name);

      // Create file metadata
      const metadata = {
        name: file.name,
        parents: folderId ? [folderId] : undefined,
        description: `Uploaded from Boujee Events - ${new Date().toISOString()}`
      };

      // Create form data for upload
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      // Upload with progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              fileName: file.name,
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
              status: 'uploading'
            };
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            
            if (onProgress) {
              onProgress({
                fileName: file.name,
                loaded: file.size,
                total: file.size,
                percentage: 100,
                status: 'completed'
              });
            }

            // Convert response to our GoogleDriveFile format
            const driveFile: GoogleDriveFile = {
              id: response.id,
              name: response.name,
              mimeType: file.type,
              size: file.size.toString(),
              webViewLink: `https://drive.google.com/file/d/${response.id}/view`,
              webContentLink: `https://drive.google.com/uc?id=${response.id}`,
              thumbnailLink: response.thumbnailLink,
              createdTime: new Date().toISOString(),
              modifiedTime: new Date().toISOString()
            };

            console.log('✅ File uploaded successfully:', driveFile);
            resolve(driveFile);
          } else {
            const error = `Upload failed with status: ${xhr.status}`;
            console.error('❌ Upload error:', error);
            
            if (onProgress) {
              onProgress({
                fileName: file.name,
                loaded: 0,
                total: file.size,
                percentage: 0,
                status: 'error',
                error
              });
            }
            
            reject(new Error(error));
          }
        });

        xhr.addEventListener('error', () => {
          const error = 'Upload failed due to network error';
          console.error('❌ Network error during upload');
          
          if (onProgress) {
            onProgress({
              fileName: file.name,
              loaded: 0,
              total: file.size,
              percentage: 0,
              status: 'error',
              error
            });
          }
          
          reject(new Error(error));
        });

        // Start upload
        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
        xhr.send(formData);
      });

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      
      if (onProgress) {
        onProgress({
          fileName: file.name,
          loaded: 0,
          total: file.size,
          percentage: 0,
          status: 'error',
          error: error.message
        });
      }
      
      throw error;
    }
  }

  async createFolder(name: string, parentId?: string): Promise<string> {
    try {
      const metadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      };

      const response = await window.gapi.client.drive.files.create({
        resource: metadata
      });

      console.log('📁 Folder created:', response.result.id);
      return response.result.id;

    } catch (error) {
      console.error('❌ Failed to create folder:', error);
      throw error;
    }
  }

  async getOrCreateHomepageFolder(): Promise<string> {
    try {
      // Check if "Boujee Events Homepage" folder exists
      const response = await window.gapi.client.drive.files.list({
        q: "name='Boujee Events Homepage' and mimeType='application/vnd.google-apps.folder'",
        spaces: 'drive'
      });

      if (response.result.files && response.result.files.length > 0) {
        const folderId = response.result.files[0].id;
        console.log('📁 Homepage folder found:', folderId);
        return folderId;
      }

      // Create folder if it doesn't exist
      console.log('📁 Creating homepage folder...');
      return await this.createFolder('Boujee Events Homepage');

    } catch (error) {
      console.error('❌ Failed to get/create homepage folder:', error);
      throw error;
    }
  }
}

// ===========================================================================
// HOMEPAGE MEDIA SERVICE
// ===========================================================================

class HomepageMediaService {
  private googleDrive = new GoogleDriveClient();

  async uploadHomepageMedia(
    files: FileList, 
    mediaType: HomepageMediaItem['media_type'],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<HomepageMediaItem[]> {
    try {
      console.log('🎨 Starting homepage media upload...', { fileCount: files.length, mediaType });

      // Authenticate with Google Drive
      const authenticated = await this.googleDrive.authenticate();
      if (!authenticated) {
        throw new Error('Google Drive authentication failed');
      }

      // Get or create homepage folder
      const homepageFolderId = await this.googleDrive.getOrCreateHomepageFolder();

      const uploadedItems: HomepageMediaItem[] = [];

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Upload to Google Drive
          const driveFile = await this.googleDrive.uploadFile(
            file, 
            homepageFolderId, 
            onProgress
          );

          // Save file metadata to database
          const mediaFile = await this.saveMediaFileToDatabase(driveFile, file);

          // Create homepage media entry
          const homepageItem = await this.createHomepageMediaEntry(
            mediaFile.id,
            mediaType,
            file.name
          );

          uploadedItems.push(homepageItem);

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

  private async saveMediaFileToDatabase(driveFile: GoogleDriveFile, originalFile: File) {
    try {
      const fileType = this.getFileType(originalFile.type);
      
      const { data, error } = await supabase
        .from('media_files')
        .insert([{
          name: driveFile.name,
          original_name: originalFile.name,
          mime_type: originalFile.type,
          file_size: parseInt(driveFile.size),
          google_drive_file_id: driveFile.id,
          download_url: driveFile.webContentLink,
          thumbnail_url: driveFile.thumbnailLink,
          web_view_link: driveFile.webViewLink,
          file_type: fileType,
          is_public: true,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Database save error:', error);
        throw error;
      }

      return data;

    } catch (error) {
      console.error('❌ Failed to save media file to database:', error);
      throw error;
    }
  }

  private async createHomepageMediaEntry(
    mediaFileId: string, 
    mediaType: HomepageMediaItem['media_type'],
    title: string
  ): Promise<HomepageMediaItem> {
    try {
      // Get current max display order
      const { data: maxOrderData } = await supabase
        .from('homepage_media')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 1;

      // Create homepage media entry
      const { data, error } = await supabase
        .from('homepage_media')
        .insert([{
          media_file_id: mediaFileId,
          media_type: mediaType,
          display_order: nextOrder,
          is_active: true,
          title: title,
          description: `Uploaded ${new Date().toLocaleDateString()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          media_file:media_files(*)
        `)
        .single();

      if (error) {
        console.error('❌ Homepage media entry creation error:', error);
        throw error;
      }

      return data as HomepageMediaItem;

    } catch (error) {
      console.error('❌ Failed to create homepage media entry:', error);
      throw error;
    }
  }

  async getHomepageMedia(): Promise<HomepageMediaItem[]> {
    try {
      const { data, error } = await supabase
        .from('homepage_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('❌ Failed to fetch homepage media:', error);
        throw error;
      }

      return data as HomepageMediaItem[];

    } catch (error) {
      console.error('❌ Homepage media fetch error:', error);
      throw error;
    }
  }

  async updateHomepageMediaStatus(id: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('homepage_media')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Failed to update homepage media status:', error);
        throw error;
      }

      console.log('✅ Homepage media status updated');

    } catch (error) {
      console.error('❌ Homepage media status update error:', error);
      throw error;
    }
  }

  async deleteHomepageMedia(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('homepage_media')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Failed to delete homepage media:', error);
        throw error;
      }

      console.log('✅ Homepage media deleted');

    } catch (error) {
      console.error('❌ Homepage media deletion error:', error);
      throw error;
    }
  }

  async setBackgroundVideo(mediaId: string): Promise<void> {
    try {
      // First, deactivate all background videos
      await supabase
        .from('homepage_media')
        .update({ is_active: false })
        .eq('media_type', 'background_video');

      // Then activate the selected one
      const { error } = await supabase
        .from('homepage_media')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', mediaId);

      if (error) {
        console.error('❌ Failed to set background video:', error);
        throw error;
      }

      console.log('✅ Background video updated');

    } catch (error) {
      console.error('❌ Background video update error:', error);
      throw error;
    }
  }

  private getFileType(mimeType: string): 'image' | 'video' | 'document' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    return 'other';
  }
}

// ===========================================================================
// EXPORT SINGLETON INSTANCE
// ===========================================================================

export const homepageMediaService = new HomepageMediaService();

// Export types
export type { GoogleDriveFile, HomepageMediaItem, UploadProgress };

console.log('🌐 Google Drive Media Service initialized!');
console.log('Available features:', {
  'uploadHomepageMedia': 'Upload images/videos to Google Drive and database',
  'getHomepageMedia': 'Fetch all homepage media items',
  'updateHomepageMediaStatus': 'Toggle media active/inactive',
  'deleteHomepageMedia': 'Remove media from homepage',
  'setBackgroundVideo': 'Set active background video'
});
