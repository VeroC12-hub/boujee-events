/**
 * Google Drive Integration Service - Production Implementation
 * Provides complete functionality for uploading event media to Google Drive
 */

// Types and Interfaces
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

export interface EventFolder {
  eventFolderId: string;
  photosFolderId: string;
  videosFolderId: string;
  eventName: string;
  eventId: string;
  webViewLink: string;
}

export interface UploadProgress {
  percentage: number;
  bytesUploaded: number;
  totalBytes: number;
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private gapi: any = null;
  private isInitialized = false;
  private accessToken: string | null = null;
  private mainFolderId: string | null = null;

  private constructor() {}

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Load Google API
      await this.loadGoogleAPI();
      
      // Initialize with environment variables
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
      
      if (!clientId || !apiKey) {
        console.warn('⚠️ Google Drive API credentials not configured - using mock mode');
        return false;
      }

      await new Promise<void>((resolve, reject) => {
        this.gapi.load('auth2:client', async () => {
          try {
            await this.gapi.client.init({
              apiKey: apiKey,
              clientId: clientId,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
              scope: 'https://www.googleapis.com/auth/drive.file'
            });

            this.isInitialized = true;
            console.log('✅ Google Drive API initialized');
            
            // Set up folder structure
            await this.setupMainFolders();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive API:', error);
      return false;
    }
  }

  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.gapi = window.gapi;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = window.gapi;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async authenticate(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      
      if (authInstance.isSignedIn.get()) {
        this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
        return true;
      }

      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        this.accessToken = user.getAuthResponse().access_token;
        console.log('✅ Google Drive authentication successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Google Drive authentication failed:', error);
      return false;
    }
  }

  private async setupMainFolders(): Promise<void> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) return;
    }

    try {
      // Check if main folder exists
      const existingFolder = await this.findFolderByName('Boujee Events Hub');
      
      if (existingFolder) {
        this.mainFolderId = existingFolder.id;
        console.log('📁 Found existing main folder:', existingFolder.id);
      } else {
        // Create main folder structure
        const mainFolder = await this.createFolder('Boujee Events Hub');
        this.mainFolderId = mainFolder.id;
        console.log('📁 Created main folder:', mainFolder.id);

        // Create subfolders
        await this.createFolder('Events', this.mainFolderId);
        await this.createFolder('Archives', this.mainFolderId);
        console.log('📁 Created Events and Archives folders');
      }
    } catch (error) {
      console.error('❌ Failed to setup main folders:', error);
    }
  }

  private async getOrCreateMainFolder(): Promise<string> {
    if (this.mainFolderId) return this.mainFolderId;
    
    await this.setupMainFolders();
    return this.mainFolderId || '';
  }

  private async findFolderByName(name: string, parentId?: string): Promise<DriveFile | null> {
    try {
      const query = parentId 
        ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
        : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      const response = await this.gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name, webViewLink)'
      });

      const folders = response.result.files || [];
      return folders.length > 0 ? folders[0] : null;
    } catch (error) {
      console.error('❌ Error finding folder:', error);
      return null;
    }
  }

  private async createFolder(name: string, parentId?: string): Promise<DriveFile> {
    const fileMetadata: any = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder'
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const response = await this.gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id, name, webViewLink'
    });

    return response.result;
  }

  async createEventFolder(eventName: string, eventId: string): Promise<EventFolder> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) throw new Error('Authentication required');
    }

    try {
      // Get or create main "Boujee Events" folder
      if (!this.mainFolderId) {
        this.mainFolderId = await this.getOrCreateMainFolder();
      }

      // Get Events folder
      const eventsFolder = await this.findFolderByName('Events', this.mainFolderId);
      if (!eventsFolder) {
        throw new Error('Events folder not found');
      }

      // Create event folder
      const eventFolderName = `${eventName} (${eventId.slice(0, 8)})`;
      const eventFolder = await this.createFolder(eventFolderName, eventsFolder.id);
      
      // Create Photos and Videos subfolders
      const photosFolder = await this.createFolder('Photos', eventFolder.id);
      const videosFolder = await this.createFolder('Videos', eventFolder.id);

      console.log('📁 Created event folder structure:', {
        event: eventFolder.id,
        photos: photosFolder.id,
        videos: videosFolder.id
      });

      return {
        eventFolderId: eventFolder.id,
        photosFolderId: photosFolder.id,
        videosFolderId: videosFolder.id,
        eventName,
        eventId,
        webViewLink: eventFolder.webViewLink
      };
    } catch (error) {
      console.error('❌ Failed to create event folder:', error);
      throw error;
    }
  }

  async uploadFile(
    file: File, 
    folderId: string, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DriveFile> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) throw new Error('Authentication required');
    }

    try {
      const metadata = {
        name: file.name,
        parents: [folderId]
      };

      // Use resumable upload for large files with progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        
        formData.append('metadata', new Blob([JSON.stringify(metadata)], {
          type: 'application/json'
        }));
        formData.append('file', file);

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              percentage: Math.round((event.loaded / event.total) * 100),
              bytesUploaded: event.loaded,
              totalBytes: event.total
            };
            onProgress(progress);
          }
        });

        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            console.log('✅ File uploaded successfully:', response.id);
            resolve(response);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink,webContentLink,thumbnailLink');
        xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  async getEventMedia(eventFolderId: string): Promise<{ photos: DriveFile[], videos: DriveFile[] }> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) throw new Error('Authentication required');
    }

    try {
      // Get Photos and Videos folders
      const photosFolder = await this.findFolderByName('Photos', eventFolderId);
      const videosFolder = await this.findFolderByName('Videos', eventFolderId);

      const photos: DriveFile[] = [];
      const videos: DriveFile[] = [];

      // Get photos
      if (photosFolder) {
        const photosResponse = await this.gapi.client.drive.files.list({
          q: `'${photosFolder.id}' in parents and trashed=false`,
          fields: 'files(id, name, mimeType, size, createdTime, webViewLink, webContentLink, thumbnailLink)',
          orderBy: 'createdTime desc'
        });
        photos.push(...(photosResponse.result.files || []));
      }

      // Get videos
      if (videosFolder) {
        const videosResponse = await this.gapi.client.drive.files.list({
          q: `'${videosFolder.id}' in parents and trashed=false`,
          fields: 'files(id, name, mimeType, size, createdTime, webViewLink, webContentLink, thumbnailLink)',
          orderBy: 'createdTime desc'
        });
        videos.push(...(videosResponse.result.files || []));
      }

      return { photos, videos };
    } catch (error) {
      console.error('❌ Failed to get event media:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) throw new Error('Authentication required');
    }

    try {
      await this.gapi.client.drive.files.delete({
        fileId: fileId
      });
      
      console.log('✅ File deleted successfully:', fileId);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      return false;
    }
  }

  async getStorageQuota(): Promise<{ used: number, total: number }> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) throw new Error('Authentication required');
    }

    try {
      const response = await this.gapi.client.drive.about.get({
        fields: 'storageQuota'
      });

      const quota = response.result.storageQuota;
      return {
        used: parseInt(quota.usage || '0'),
        total: parseInt(quota.limit || '0')
      };
    } catch (error) {
      console.error('❌ Failed to get storage quota:', error);
      return { used: 0, total: 0 };
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async signOut(): Promise<void> {
    if (this.gapi?.auth2) {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.accessToken = null;
      console.log('✅ Signed out from Google Drive');
    }
  }
}

// Export singleton instance
export const googleDriveService = GoogleDriveService.getInstance();
export default googleDriveService;
