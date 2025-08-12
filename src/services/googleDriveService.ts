/**
 * Google Drive Integration Service - REAL IMPLEMENTATION
 * Provides functionality for uploading event images to Google Drive
 * and organizing them in event-specific folders
 */

interface GoogleDriveConfig {
  apiKey: string;
  clientId: string;
  appId: string;
  scope: string;
}

interface UploadResult {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
  mimeType: string;
  size: string;
  createdTime: string;
  directLink: string; // This is crucial for displaying images
}

interface EventFolder {
  id: string;
  name: string;
  webViewLink: string;
  eventId: number;
  createdTime: string;
}

class GoogleDriveService {
  private config: GoogleDriveConfig | null = null;
  private isInitialized = false;
  private accessToken: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      // Load Google API
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      await new Promise((resolve) => {
        gapi.load('client:auth2', resolve);
      });

      await gapi.client.init({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.file'
      });

      this.isInitialized = true;
      console.log('✅ Google Drive API initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive API:', error);
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
      const authInstance = gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const user = authInstance.currentUser.get();
      this.accessToken = user.getAuthResponse().access_token;
      
      console.log('✅ Google Drive authenticated');
      return true;
    } catch (error) {
      console.error('❌ Google Drive authentication failed:', error);
      return false;
    }
  }

  async isUserAuthenticated(): Promise<boolean> {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      return authInstance && authInstance.isSignedIn.get();
    } catch {
      return false;
    }
  }

  /**
   * Upload file to Google Drive with public sharing
   */
  async uploadFile(
    file: File,
    parentFolderId: string,
    progressCallback?: (progress: ProgressEvent) => void
  ): Promise<UploadResult> {
    if (!this.isInitialized) {
      throw new Error('Google Drive API not initialized');
    }

    const metadata = {
      name: file.name,
      parents: [parentFolderId]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    try {
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const uploadedFile = await response.json();

      // Make file public
      await this.makeFilePublic(uploadedFile.id);

      // Get file details with public link
      const fileDetails = await this.getFileDetails(uploadedFile.id);

      return {
        id: uploadedFile.id,
        name: uploadedFile.name,
        webViewLink: `https://drive.google.com/file/d/${uploadedFile.id}/view`,
        webContentLink: `https://drive.google.com/uc?id=${uploadedFile.id}`,
        directLink: `https://drive.google.com/uc?export=view&id=${uploadedFile.id}`,
        thumbnailLink: fileDetails.thumbnailLink,
        mimeType: file.type,
        size: file.size.toString(),
        createdTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      await gapi.client.request({
        path: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        method: 'POST',
        body: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (error) {
      console.error('Failed to make file public:', error);
    }
  }

  private async getFileDetails(fileId: string): Promise<any> {
    try {
      const response = await gapi.client.request({
        path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
        method: 'GET',
        params: {
          fields: 'id,name,mimeType,size,thumbnailLink,webViewLink,webContentLink'
        }
      });
      return response.result;
    } catch (error) {
      console.error('Failed to get file details:', error);
      return {};
    }
  }

  async createFolder(name: string, parentId?: string): Promise<string> {
    const metadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    };

    try {
      const response = await gapi.client.request({
        path: 'https://www.googleapis.com/drive/v3/files',
        method: 'POST',
        body: metadata
      });

      return response.result.id;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }

  async getOrCreateHomepageFolder(): Promise<string> {
    try {
      // Search for existing homepage folder
      const response = await gapi.client.request({
        path: 'https://www.googleapis.com/drive/v3/files',
        method: 'GET',
        params: {
          q: "name='Homepage Media' and mimeType='application/vnd.google-apps.folder'",
          fields: 'files(id, name)'
        }
      });

      if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
      }

      // Create new homepage folder
      return await this.createFolder('Homepage Media');
    } catch (error) {
      console.error('Failed to get/create homepage folder:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
export default googleDriveService;
