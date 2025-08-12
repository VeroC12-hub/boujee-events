class GoogleDriveService {
  private gapi: any = null;
  private tokenClient: any = null;
  private initialized = false;
  private authenticated = false;
  private currentUser: any = null;
  private authenticationInProgress = false;

  constructor() {
    console.log('🔄 Initializing Google Drive service with Google Identity Services...');
  }

  // **ENHANCED: Better initialization**
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

      console.log('🔍 Environment check:', {
        clientId: clientId ? '✅ Set' : '❌ Missing',
        apiKey: apiKey ? '✅ Set' : '❌ Missing'
      });

      if (!clientId || !apiKey) {
        throw new Error('Missing required Google API credentials in environment variables');
      }

      // Load Google API script
      await this.loadGoogleApiScript();
      console.log('✅ Google API script loaded');

      // Load Google Identity Services
      await this.loadGoogleIdentityScript();
      console.log('✅ Google Identity Services loaded');

      // Initialize GAPI client
      console.log('🔧 Initializing Google API client...');
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', {
          callback: async () => {
            try {
              await window.gapi.client.init({
                apiKey: apiKey,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          onerror: reject
        });
      });

      this.gapi = window.gapi;

      // Initialize token client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.error) {
            console.error('❌ Token client error:', response.error);
            this.authenticationInProgress = false;
            throw new Error(`Authentication failed: ${response.error}`);
          }
          console.log('✅ Google Identity Services authentication successful');
        }
      });

      this.initialized = true;
      console.log('✅ Google API client initialized');

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive service:', error);
      this.initialized = false;
      throw error;
    }
  }

  // **FIXED: Enhanced authentication**
  async authenticate(): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('Google Drive service not initialized');
    }

    if (this.authenticationInProgress) {
      console.log('🔄 Authentication already in progress...');
      return false;
    }

    try {
      this.authenticationInProgress = true;
      console.log('🔐 Starting Google Drive authentication...');

      return new Promise<boolean>((resolve, reject) => {
        this.tokenClient.callback = async (response: any) => {
          try {
            if (response.error) {
              throw new Error(response.error);
            }

            console.log('📝 Requesting access token...');
            
            // Get user info
            const userInfo = await this.getUserInfo();
            this.currentUser = userInfo;
            this.authenticated = true;
            this.authenticationInProgress = false;

            console.log('👤 Authenticated user:', userInfo.displayName || userInfo.name);
            resolve(true);
          } catch (error) {
            this.authenticationInProgress = false;
            console.error('❌ Authentication failed:', error);
            reject(error);
          }
        };

        // Request access token
        this.tokenClient.requestAccessToken();
      });

    } catch (error) {
      this.authenticationInProgress = false;
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }

  // **FIXED: Better user authentication check**
  async isUserAuthenticated(): Promise<boolean> {
    if (!this.initialized) return false;
    
    try {
      if (this.authenticated && this.currentUser) {
        // Verify token is still valid by making a test API call
        try {
          await this.gapi.client.drive.about.get();
          return true;
        } catch (error) {
          console.warn('⚠️ Token appears to be invalid, clearing authentication');
          this.authenticated = false;
          this.currentUser = null;
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      return false;
    }
  }

  // **FIXED: User info with error handling**
  async getUserInfo(): Promise<any> {
    try {
      if (!this.initialized || !this.gapi) {
        throw new Error('Google Drive service not initialized');
      }

      const response = await this.gapi.client.drive.about.get({
        fields: 'user'
      });

      return response.result.user;
    } catch (error) {
      console.error('❌ Error getting user info:', error);
      throw new Error('Failed to get user information');
    }
  }

  // **CRITICAL FIX: File upload with proper error handling**
  async uploadFile(file: File, folderId?: string, onProgress?: (progress: { percentage: number }) => void): Promise<any> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const metadata = {
        name: file.name,
        parents: folderId && folderId !== 'root' ? [folderId] : undefined
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Progress tracking
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentage = Math.round((event.loaded / event.total) * 100);
              onProgress({ percentage });
            }
          });
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('✅ File uploaded successfully:', response.name);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid response from Google Drive'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };

        xhr.ontimeout = () => {
          reject(new Error('Upload timeout'));
        };

        xhr.timeout = 5 * 60 * 1000; // 5 minute timeout

        // Get access token
        const token = this.gapi.auth.getToken();
        if (!token || !token.access_token) {
          reject(new Error('No valid access token available'));
          return;
        }

        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', `Bearer ${token.access_token}`);
        xhr.send(form);
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }

  // **CRITICAL FIX: Get all media files**
  async getAllMediaFiles(): Promise<any[]> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const response = await this.gapi.client.drive.files.list({
        q: "mimeType contains 'image/' or mimeType contains 'video/'",
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)',
        pageSize: 100
      });

      console.log('📂 Retrieved', response.result.files?.length || 0, 'media files');
      return response.result.files || [];
    } catch (error) {
      console.error('❌ Error getting media files:', error);
      throw new Error('Failed to load media files from Google Drive');
    }
  }

  // **CRITICAL FIX: Get files from specific folder**
  async getFilesFromFolder(folderId: string): Promise<any[]> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const query = folderId && folderId !== 'root'
        ? `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/')`
        : "mimeType contains 'image/' or mimeType contains 'video/'";

      const response = await this.gapi.client.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)',
        pageSize: 100
      });

      console.log('📁 Retrieved', response.result.files?.length || 0, 'files from folder');
      return response.result.files || [];
    } catch (error) {
      console.error('❌ Error getting files from folder:', error);
      throw new Error('Failed to load files from folder');
    }
  }

  // Helper methods for script loading
  private loadGoogleApiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  private loadGoogleIdentityScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
      document.head.appendChild(script);
    });
  }
}

// Declare global types
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const googleDriveService = new GoogleDriveService();
