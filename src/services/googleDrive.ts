// Enhanced Google Drive Integration Service
import { env } from '../config/environment';
import { db } from './database';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
  createdTime: Date;
  modifiedTime: Date;
}

export interface FileUploadRequest {
  file: File;
  parentFolderId?: string;
  description?: string;
}

export interface FileUploadResult {
  success: boolean;
  message: string;
  file?: GoogleDriveFile;
}

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId: string;
  enabled: boolean;
}

class GoogleDriveService {
  private config: GoogleDriveConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      clientId: env.GOOGLE_DRIVE_CLIENT_ID,
      clientSecret: env.GOOGLE_DRIVE_CLIENT_SECRET,
      refreshToken: env.GOOGLE_DRIVE_REFRESH_TOKEN,
      folderId: env.GOOGLE_DRIVE_FOLDER_ID,
      enabled: false
    };
    
    this.loadConfigFromDatabase();
  }

  // Load configuration from database
  private async loadConfigFromDatabase(): Promise<void> {
    try {
      const settings = await db.getSettingsByCategory('google_drive');
      
      for (const setting of settings) {
        switch (setting.key) {
          case 'google_drive_client_id':
            this.config.clientId = setting.value;
            break;
          case 'google_drive_client_secret':
            this.config.clientSecret = setting.value;
            break;
          case 'google_drive_refresh_token':
            this.config.refreshToken = setting.value;
            break;
          case 'google_drive_folder_id':
            this.config.folderId = setting.value;
            break;
          case 'google_drive_enabled':
            this.config.enabled = setting.value === 'true';
            break;
        }
      }
    } catch (error) {
      console.error('Failed to load Google Drive config from database:', error);
    }
  }

  // Save configuration to database
  async saveConfig(config: Partial<GoogleDriveConfig>, updatedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      const settingsToUpdate = [
        { key: 'google_drive_client_id', value: config.clientId },
        { key: 'google_drive_client_secret', value: config.clientSecret },
        { key: 'google_drive_refresh_token', value: config.refreshToken },
        { key: 'google_drive_folder_id', value: config.folderId },
        { key: 'google_drive_enabled', value: config.enabled?.toString() }
      ];

      for (const setting of settingsToUpdate) {
        if (setting.value !== undefined) {
          await db.setSetting(setting.key, setting.value, updatedBy, {
            category: 'google_drive',
            description: `Google Drive ${setting.key.replace('google_drive_', '').replace('_', ' ')}`
          });
        }
      }

      // Update local config
      this.config = { ...this.config, ...config };
      
      return { success: true, message: 'Google Drive configuration saved successfully' };
    } catch (error) {
      console.error('Failed to save Google Drive config:', error);
      return { success: false, message: 'Failed to save configuration' };
    }
  }

  // Get current configuration (without sensitive data)
  getConfig(): Omit<GoogleDriveConfig, 'clientSecret' | 'refreshToken'> {
    return {
      clientId: this.config.clientId,
      folderId: this.config.folderId,
      enabled: this.config.enabled
    };
  }

  // Check if Google Drive is properly configured
  isConfigured(): boolean {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.refreshToken &&
      this.config.folderId &&
      this.config.enabled
    );
  }

  // Get access token using refresh token
  private async getAccessToken(): Promise<string | null> {
    try {
      // Check if current token is still valid
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      // Refresh the token
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  // Upload file to Google Drive
  async uploadFile(request: FileUploadRequest): Promise<FileUploadResult> {
    try {
      if (!this.isConfigured()) {
        return { success: false, message: 'Google Drive is not configured' };
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, message: 'Failed to authenticate with Google Drive' };
      }

      // Validate file
      const maxSize = env.MAX_FILE_SIZE;
      if (request.file.size > maxSize) {
        return { 
          success: false, 
          message: `File size exceeds maximum limit of ${Math.round(maxSize / 1024 / 1024)}MB` 
        };
      }

      const allowedTypes = env.ALLOWED_FILE_TYPES;
      if (!allowedTypes.includes(request.file.type)) {
        return { 
          success: false, 
          message: 'File type not allowed' 
        };
      }

      // Prepare metadata
      const metadata = {
        name: request.file.name,
        parents: [request.parentFolderId || this.config.folderId],
        description: request.description || 'Uploaded via Boujee Events'
      };

      // Create multipart form data
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', request.file);

      // Upload to Google Drive
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const fileData = await response.json();

      // Get additional file information
      const fileInfo = await this.getFileInfo(fileData.id);
      if (!fileInfo) {
        throw new Error('Failed to get uploaded file information');
      }

      return {
        success: true,
        message: 'File uploaded successfully',
        file: fileInfo
      };
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, message: 'File upload failed' };
    }
  }

  // Get file information
  async getFileInfo(fileId: string): Promise<GoogleDriveFile | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return null;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,createdTime,modifiedTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        name: data.name,
        mimeType: data.mimeType,
        size: parseInt(data.size || '0'),
        webViewLink: data.webViewLink,
        webContentLink: data.webContentLink,
        thumbnailLink: data.thumbnailLink,
        createdTime: new Date(data.createdTime),
        modifiedTime: new Date(data.modifiedTime)
      };
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  }

  // List files in a folder
  async listFiles(folderId?: string, pageSize: number = 20): Promise<{
    success: boolean;
    files: GoogleDriveFile[];
    nextPageToken?: string;
    message?: string;
  }> {
    try {
      if (!this.isConfigured()) {
        return { success: false, files: [], message: 'Google Drive is not configured' };
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, files: [], message: 'Failed to authenticate with Google Drive' };
      }

      const targetFolderId = folderId || this.config.folderId;
      const query = `parents in '${targetFolderId}' and trashed=false`;
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=${pageSize}&fields=files(id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,createdTime,modifiedTime),nextPageToken`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const data = await response.json();

      const files: GoogleDriveFile[] = data.files.map((file: unknown) => ({
        id: (file as GoogleDriveFile).id,
        name: (file as GoogleDriveFile).name,
        mimeType: (file as GoogleDriveFile).mimeType,
        size: parseInt(((file as { size?: string }).size || '0')),
        webViewLink: (file as GoogleDriveFile).webViewLink,
        webContentLink: (file as GoogleDriveFile).webContentLink,
        thumbnailLink: (file as GoogleDriveFile).thumbnailLink,
        createdTime: new Date((file as { createdTime: string }).createdTime),
        modifiedTime: new Date((file as { modifiedTime: string }).modifiedTime)
      }));

      return {
        success: true,
        files,
        nextPageToken: data.nextPageToken
      };
    } catch (error) {
      console.error('Failed to list files:', error);
      return { success: false, files: [], message: 'Failed to list files' };
    }
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isConfigured()) {
        return { success: false, message: 'Google Drive is not configured' };
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, message: 'Failed to authenticate with Google Drive' };
      }

      // Try to get folder info
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${this.config.folderId}?fields=id,name`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: `Successfully connected to Google Drive. Target folder: ${data.name}`
      };
    } catch (error) {
      console.error('Google Drive connection test failed:', error);
      return { success: false, message: 'Connection test failed' };
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();

// Export types
export type { GoogleDriveFile, FileUploadRequest, FileUploadResult, GoogleDriveConfig };