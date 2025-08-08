import { GoogleAuth } from 'google-auth-library';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

interface EventFolder {
  eventFolderId: string;
  photosFolderId: string;
  videosFolderId: string;
  eventFolderUrl: string;
  photosUrl: string;
  videosUrl: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
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
        console.warn('Google Drive API credentials not configured');
        return false;
      }

      await this.gapi.load('auth2:client:picker', async () => {
        await this.gapi.client.init({
          apiKey: apiKey,
          clientId: clientId,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          scope: 'https://www.googleapis.com/auth/drive.file'
        });

        this.isInitialized = true;
        console.log('✅ Google Drive API initialized');
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

      // Create event folder
      const eventFolderName = `${eventName} (${eventId})`;
      const eventFolder = await this.createFolder(eventFolderName, this.mainFolderId);
      
      // Create Photos and Videos subfolders
      const photosFolder = await this.createFolder('Photos', eventFolder.id);
      const videosFolder = await this.createFolder('Videos', eventFolder.id);

      return {
        eventFolderId: eventFolder.id,
        photosFolderId: photosFolder.id,
        videosFolderId: videosFolder.id,
        eventFolderUrl: eventFolder.webViewLink,
        photosUrl: photosFolder.webViewLink,
        videosUrl: videosFolder.webViewLink
      };
    } catch (error) {
      console.error('❌ Failed to create event folder:', error);
      throw error;
    }
  }

  private async getOrCreateMainFolder(): Promise<string> {
    const folderName = 'Boujee Events Hub';
    
    // Search for existing folder
    const response = await this.gapi.client.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)'
    });

    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    // Create new folder
    const folder = await this.createFolder(folderName, null);
    return folder.id;
  }

  private async createFolder(name: string, parentId: string | null): Promise<DriveFile> {
    const metadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] })
    };

    const response = await this.gapi.client.drive.files.create({
      resource: metadata,
      fields: 'id, name, webViewLink'
    });

    return response.result;
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

    return new Promise((resolve, reject) => {
      const metadata = {
        name: file.name,
        parents: [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: (e.loaded / e.total) * 100
          });
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
      xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      xhr.send(form);
    });
  }

  async getEventMedia(eventFolderId: string): Promise<{ photos: DriveFile[], videos: DriveFile[] }> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) throw new Error('Authentication required');
    }

    try {
      // Get all files in event folder
      const response = await this.gapi.client.drive.files.list({
        q: `'${eventFolderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, size, createdTime, webViewLink, webContentLink, thumbnailLink)',
        orderBy: 'createdTime desc'
      });

      const files = response.result.files || [];
      const photos = files.filter((file: DriveFile) => file.mimeType.startsWith('image/'));
      const videos = files.filter((file: DriveFile) => file.mimeType.startsWith('video/'));

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
      
      console.log('✅ File deleted successfully');
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
        total: parseInt(quota.limit || '15000000000') // 15GB default
      };
    } catch (error) {
      console.error('❌ Failed to get storage quota:', error);
      return { used: 0, total: 15000000000 };
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async signOut(): Promise<void> {
    if (this.gapi && this.gapi.auth2) {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.accessToken = null;
      console.log('✅ Google Drive signed out');
    }
  }
}

export const googleDriveService = GoogleDriveService.getInstance();
export type { DriveFile, EventFolder, UploadProgress };
