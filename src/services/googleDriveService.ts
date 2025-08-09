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
  eventName: string;
  eventFolderId: string;
  photosFolderId: string;
  videosFolderId: string;
  eventFolderUrl: string;
  photosUrl: string;
  videosUrl: string;
  webViewLink: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  description?: string;
  starred?: boolean;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface ConnectionStatus {
  initialized: boolean;
  authenticated: boolean;
  error?: string;
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: Date | null = null;
  private isInitialized = false;
  private userInfo: UserInfo | null = null;

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
      this.isInitialized = true; // Allow initialization without auth
      return true;
    } catch (error) {
      console.error('Error initializing Google Drive service:', error);
      return false;
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.gapi) {
        console.warn('Google API not available');
        return false;
      }

      // Mock authentication for development
      if (import.meta.env.MODE === 'development') {
        this.accessToken = 'mock_access_token';
        this.expiresAt = new Date(Date.now() + 3600 * 1000);
        this.userInfo = {
          id: 'mock_user_id',
          name: 'Mock User',
          email: 'mock@example.com'
        };
        return true;
      }

      // Real OAuth flow would go here
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return this.accessToken !== null && 
           this.expiresAt !== null && 
           new Date() < this.expiresAt;
  }

  async getUserInfo(): Promise<UserInfo | null> {
    return this.userInfo;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!await this.isAuthenticated()) {
        return false;
      }

      // In development, return true
      if (import.meta.env.MODE === 'development') {
        return true;
      }

      // Test actual API connection
      const response = await this.makeAuthenticatedRequest(
        'https://www.googleapis.com/drive/v3/about?fields=user'
      );

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      initialized: this.isInitialized,
      authenticated: this.accessToken !== null,
      error: undefined
    };
  }

  async createEventFolder(eventName: string, eventId: string): Promise<EventFolder | null> {
    try {
      if (!await this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      // Get or create main folder
      const mainFolderId = await this.getOrCreateMainFolder();
      if (!mainFolderId) {
        throw new Error('Failed to get main folder');
      }

      // Create event folder
      const eventFolder = await this.createFolder(`${eventName} (${eventId})`, mainFolderId);
      if (!eventFolder) {
        throw new Error('Failed to create event folder');
      }

      // Create subfolders
      const photosFolder = await this.createFolder('Photos', eventFolder.id);
      const videosFolder = await this.createFolder('Videos', eventFolder.id);

      if (!photosFolder || !videosFolder) {
        throw new Error('Failed to create subfolders');
      }

      // Save to database
      if (supabase) {
        await supabase.from('event_folders').insert([
          {
            event_id: eventId,
            event_name: eventName,
            folder_id: eventFolder.id,
            photos_folder_id: photosFolder.id,
            videos_folder_id: videosFolder.id,
            created_by: 'current_user'
          }
        ]);
      }

      return {
        eventName: eventName,
        eventFolderId: eventFolder.id,
        photosFolderId: photosFolder.id,
        videosFolderId: videosFolder.id,
        eventFolderUrl: eventFolder.webViewLink,
        photosUrl: photosFolder.webViewLink,
        videosUrl: videosFolder.webViewLink,
        webViewLink: eventFolder.webViewLink
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
      await this.createFolder('Events', mainFolder.id);
      await this.createFolder('Archives', mainFolder.id);

      return mainFolder.id;
    } catch (error) {
      console.error('Error getting or creating main folder:', error);
      return null;
    }
  }

  async findFolderByName(name: string, parentId: string = 'root'): Promise<DriveFile | null> {
    try {
      if (import.meta.env.MODE === 'development') {
        // Mock folder for development
        return {
          id: `mock_folder_${name.replace(/\s+/g, '_')}`,
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          webViewLink: `https://drive.google.com/drive/folders/mock_${name}`
        };
      }

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

  async createFolder(name: string, parentId: string = 'root'): Promise<DriveFile | null> {
    try {
      if (import.meta.env.MODE === 'development') {
        // Mock folder creation for development
        return {
          id: `mock_folder_${Date.now()}`,
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          webViewLink: `https://drive.google.com/drive/folders/mock_${name}`,
          parents: [parentId]
        };
      }

      const metadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      };

      const response = await this.makeAuthenticatedRequest(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }

  async uploadFile(
    file: File, 
    parentFolderId: string = 'root', 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DriveFile | null> {
    try {
      if (!await this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      if (import.meta.env.MODE === 'development') {
        // Mock upload for development
        const mockFile: DriveFile = {
          id: `mock_file_${Date.now()}`,
          name: file.name,
          mimeType: file.type,
          size: file.size.toString(),
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          webViewLink: `https://drive.google.com/file/d/mock_${file.name}`,
          parents: [parentFolderId]
        };

        // Simulate progress
        if (onProgress) {
          for (let i = 0; i <= 100; i += 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            onProgress({
              loaded: (file.size * i) / 100,
              total: file.size,
              percentage: i
            });
          }
        }

        return mockFile;
      }

      // Real upload implementation would go here
      return null;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  async listFiles(folderId: string = 'root', maxResults: number = 100): Promise<DriveFile[]> {
    try {
      if (!await this.isAuthenticated()) {
        return [];
      }

      if (import.meta.env.MODE === 'development') {
        // Mock file list for development
        return Array.from({ length: 5 }, (_, i) => ({
          id: `mock_file_${i}`,
          name: `Sample File ${i + 1}.jpg`,
          mimeType: 'image/jpeg',
          size: '1024000',
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          webViewLink: `https://drive.google.com/file/d/mock_file_${i}`,
          thumbnailLink: `https://drive.google.com/thumbnail?id=mock_file_${i}`,
          parents: [folderId]
        }));
      }

      const query = `'${folderId}' in parents and trashed=false`;
      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=${maxResults}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents)`
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

  async signOut(): Promise<void> {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = null;
      this.userInfo = null;

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

  private async loadStoredTokens(): Promise<void> {
    try {
      if (supabase) {
        // Load from Supabase
        const { data: tokens, error } = await supabase
          .from('google_drive_tokens')
          .select('*')
          .eq('user_id', 'current_user')
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
      this.expiresAt = new Date(Date.now() + (expiresIn || 3600) * 1000);

      const tokenData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: this.expiresAt.toISOString(),
        user_id: 'current_user'
      };

      if (supabase) {
        await supabase.from('google_drive_tokens').upsert(tokenData);
      } else {
        localStorage.setItem('google_drive_tokens', JSON.stringify({
          accessToken,
          refreshToken,
          expiresAt: this.expiresAt.toISOString()
        }));
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) return false;

      // Implementation for token refresh would go here
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json'
      }
    });
  }
}

export const googleDriveService = GoogleDriveService.getInstance();
