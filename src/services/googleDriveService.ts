import { supabase } from '../lib/supabase';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export interface EventFolder {
  eventFolderId: string;
  photosFolderId: string;
  videosFolderId: string;
  eventFolderUrl: string;
  photosUrl: string;
  videosUrl: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: ProgressEvent) => void;
  description?: string;
  starred?: boolean;
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: Date | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if running in browser environment
      if (typeof window === 'undefined') {
        console.warn('Google Drive service not available in server environment');
        return false;
      }

      // Check if Google API is loaded
      if (!window.gapi) {
        console.warn('Google API not loaded');
        return false;
      }

      // Load stored tokens
      await this.loadStoredTokens();

      // Check if tokens are valid
      if (this.accessToken && this.expiresAt && new Date() < this.expiresAt) {
        this.isInitialized = true;
        return true;
      }

      // Try to refresh token
      if (this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          this.isInitialized = true;
          return true;
        }
      }

      console.log('Google Drive service requires authentication');
      return false;
    } catch (error) {
      console.error('Error initializing Google Drive service:', error);
      return false;
    }
  }

  private async loadStoredTokens(): Promise<void> {
    try {
      if (supabase) {
        // Load from Supabase
        const { data: tokens, error } = await supabase
          .from('google_drive_tokens')
          .select('*')
          .eq('user_id', 'current_user') // Replace with actual user ID
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && tokens) {
          this.accessToken = tokens.access_token;
          this.refreshToken = tokens.refresh_token || null;
          this.expiresAt = new Date(tokens.expires_at);
        }
      } else {
        // Load from localStorage as fallback
        const storedData = localStorage.getItem('google_drive_tokens');
        if (storedData) {
          const tokens = JSON.parse(storedData);
          this.accessToken = tokens.accessToken;
          this.refreshToken = tokens.refreshToken;
          this.expiresAt = new Date(tokens.expiresAt);
        }
      }
    } catch (error) {
      console.error('Error loading stored tokens:', error);
    }
  }

  private async saveTokens(accessToken: string, refreshToken?: string, expiresIn?: number): Promise<void> {
    try {
      this.accessToken = accessToken;
      if (refreshToken) this.refreshToken = refreshToken;
      
      const expiresAt = new Date();
      if (expiresIn) {
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
      } else {
        expiresAt.setHours(expiresAt.getHours() + 1); // Default 1 hour
      }
      this.expiresAt = expiresAt;

      if (supabase) {
        // Save to Supabase
        await supabase
          .from('google_drive_tokens')
          .upsert({
            user_id: 'current_user', // Replace with actual user ID
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt.toISOString(),
            scope: 'https://www.googleapis.com/auth/drive.file',
            token_type: 'Bearer',
            updated_at: new Date().toISOString()
          });
      } else {
        // Save to localStorage as fallback
        localStorage.setItem('google_drive_tokens', JSON.stringify({
          accessToken,
          refreshToken,
          expiresAt: expiresAt.toISOString()
        }));
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) return false;

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      await this.saveTokens(data.access_token, undefined, data.expires_in);
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.google) {
        console.error('Google Identity Services not available');
        return false;
      }

      return new Promise((resolve) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: async (response: any) => {
            if (response.access_token) {
              await this.saveTokens(
                response.access_token,
                undefined, // Refresh token not provided in this flow
                parseInt(response.expires_in)
              );
              this.isInitialized = true;
              resolve(true);
            } else {
              resolve(false);
            }
          },
        });

        client.requestAccessToken();
      });
    } catch (error) {
      console.error('Error during authentication:', error);
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.isInitialized && !!this.accessToken;
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    // Check if token is expired
    if (this.expiresAt && new Date() >= this.expiresAt) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        throw new Error('Token expired and refresh failed');
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 401) {
      // Try to refresh token and retry
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });
      }
    }

    return response;
  }

  async createFolder(name: string, parentId: string = 'root'): Promise<DriveFile | null> {
    try {
      const metadata = {
        name,
        parents: [parentId],
        mimeType: 'application/vnd.google-apps.folder',
      };

      const response = await this.makeAuthenticatedRequest(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.statusText}`);
      }

      const folder = await response.json();
      return {
        id: folder.id,
        name: folder.name,
        mimeType: folder.mimeType,
        createdTime: folder.createdTime,
        modifiedTime: folder.modifiedTime,
        webViewLink: `https://drive.google.com/drive/folders/${folder.id}`,
        parents: folder.parents
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }

  async createEventFolder(eventName: string, eventId: string): Promise<EventFolder | null> {
    try {
      // Get or create main events folder
      const mainFolderId = await this.getOrCreateMainFolder();
      if (!mainFolderId) {
        throw new Error('Failed to create main events folder');
      }

      // Create event folder
      const eventFolderName = `${eventName} (${eventId})`;
      const eventFolder = await this.createFolder(eventFolderName, mainFolderId);
      if (!eventFolder) {
        throw new Error('Failed to create event folder');
      }

      // Create Photos and Videos subfolders
      const photosFolder = await this.createFolder('Photos', eventFolder.id);
      const videosFolder = await this.createFolder('Videos', eventFolder.id);

      if (!photosFolder || !videosFolder) {
        throw new Error('Failed to create subfolders');
      }

      // Save folder structure to database
      if (supabase) {
        await supabase.from('google_drive_folders').insert([
          {
            folder_id: eventFolder.id,
            folder_name: eventFolderName,
            parent_folder_id: mainFolderId,
            folder_type: 'event',
            event_id: eventId,
            created_by: 'current_user'
          },
          {
            folder_id: photosFolder.id,
            folder_name: 'Photos',
            parent_folder_id: eventFolder.id,
            folder_type: 'photos',
            event_id: eventId,
            created_by: 'current_user'
          },
          {
            folder_id: videosFolder.id,
            folder_name: 'Videos',
            parent_folder_id: eventFolder.id,
            folder_type: 'videos',
            event_id: eventId,
            created_by: 'current_user'
          }
        ]);
      }

      return {
        eventFolderId: eventFolder.id,
        photosFolderId: photosFolder.id,
        videosFolderId: videosFolder.id,
        eventFolderUrl: eventFolder.webViewLink,
        photosUrl: photosFolder.webViewLink,
        videosUrl: videosFolder.webViewLink,
      };
    } catch (error) {
      console.error('Error creating event folder structure:', error);
      return null;
    }
  }

  private async getOrCreateMainFolder(): Promise<string | null> {
    try {
      // Check if main folder exists
      const existingFolder = await this.findFolderByName('Boujee Events Hub');
      if (existingFolder) {
        return existingFolder.id;
      }

      // Create main folder
      const mainFolder = await this.createFolder('Boujee Events Hub');
      if (!mainFolder) {
        throw new Error('Failed to create main folder');
      }

      // Create Events subfolder
      const eventsFolder = await this.createFolder('Events', mainFolder.id);
      const archivesFolder = await this.createFolder('Archives', mainFolder.id);

      return mainFolder.id;
    } catch (error) {
      console.error('Error getting or creating main folder:', error);
      return null;
    }
  }

  async findFolderByName(name: string, parentId: string = 'root'): Promise<DriveFile | null> {
    try {
      const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
      
      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,createdTime,modifiedTime,webViewLink)`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files && data.files.length > 0 ? data.files[0] : null;
    } catch (error) {
      console.error('Error finding folder:', error);
      return null;
    }
  }

  async uploadFile(
    file: File, 
    parentFolderId: string = 'root', 
    onProgress?: (progress: ProgressEvent) => void
  ): Promise<DriveFile | null> {
    try {
      const metadata = {
        name: file.name,
        parents: [parentFolderId],
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (onProgress && e.lengthComputable) {
            onProgress(e);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              id: response.id,
              name: response.name,
              mimeType: file.type,
              size: file.size.toString(),
              createdTime: new Date().toISOString(),
              modifiedTime: new Date().toISOString(),
              webViewLink: `https://drive.google.com/file/d/${response.id}/view`,
              webContentLink: `https://drive.google.com/uc?id=${response.id}`,
            });
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name');
        xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
        xhr.send(form);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  async listFiles(folderId: string = 'root', maxResults: number = 100): Promise<DriveFile[]> {
    try {
      const query = `'${folderId}' in parents and trashed=false`;
      const fields = 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)';
      
      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=${maxResults}&fields=${fields}&orderBy=modifiedTime desc`
      );

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        { method: 'DELETE' }
      );

      return response.ok;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async getFileMetadata(fileId: string): Promise<DriveFile | null> {
    try {
      const fields = 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents';
      
      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=${fields}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get file metadata: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return null;
    }
  }

  async downloadFile(fileId: string): Promise<Blob | null> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
      );

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      return null;
    }
  }

  async shareFile(fileId: string, email?: string, role: 'reader' | 'writer' | 'commenter' = 'reader'): Promise<boolean> {
    try {
      const permission = email ? {
        type: 'user',
        role,
        emailAddress: email
      } : {
        type: 'anyone',
        role: 'reader'
      };

      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(permission),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error sharing file:', error);
      return false;
    }
  }

  // Fix for the string | null issue
  getWebViewLink(fileId: string | undefined): string {
    if (!fileId) return '';
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  getDirectDownloadLink(fileId: string | undefined): string {
    if (!fileId) return '';
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  async signOut(): Promise<void> {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = null;
      this.isInitialized = false;

      // Clear stored tokens
      if (supabase) {
        await supabase
          .from('google_drive_tokens')
          .delete()
          .eq('user_id', 'current_user');
      }

      localStorage.removeItem('google_drive_tokens');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}

// Extend Window interface for Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// Export singleton instance
export const googleDriveService = GoogleDriveService.getInstance();
