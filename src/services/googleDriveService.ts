// src/services/googleDriveService.ts - CORRECTED & COMPLETE VERSION
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
  publicUrl?: string;
  directUrl?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

class GoogleDriveService {
  private gapi: any = null;
  private tokenClient: any = null;
  private initialized = false;
  private authenticated = false;
  private currentUser: any = null;
  private authenticationInProgress = false;
  private retryCount = 0;
  private maxRetries = 3;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    console.log('🔄 Initializing Google Drive service with Google Identity Services...');
  }

  // CRITICAL FIX: Enhanced authentication state cleanup
  async clearAuthenticationState(): Promise<void> {
    try {
      console.log('🧹 Clearing authentication state...');
      
      this.authenticated = false;
      this.currentUser = null;
      this.authenticationInProgress = false;
      this.retryCount = 0;
      this.accessToken = null;
      this.tokenExpiresAt = 0;

      // Clear Google API authentication if available
      if (this.gapi && this.gapi.auth2) {
        const authInstance = this.gapi.auth2.getAuthInstance();
        if (authInstance && authInstance.isSignedIn.get()) {
          await authInstance.signOut();
        }
      }

      // Clear Google Identity Services token
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.disableAutoSelect();
        } catch (error) {
          console.warn('⚠️ Could not disable auto-select:', error);
        }
      }

      console.log('✅ Authentication state cleared');
    } catch (error) {
      console.error('❌ Error clearing authentication state:', error);
    }
  }

  // Sign out method
  async signOut(): Promise<void> {
    try {
      if (this.accessToken && window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(this.accessToken, () => {
          console.log('✅ Access token revoked');
        });
      }
      await this.clearAuthenticationState();
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }

  // ENHANCED: Better initialization with error recovery
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

      // Initialize token client with enhanced error handling
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          // This will be overridden in authenticate()
        },
        error_callback: (error: any) => {
          console.error('❌ Token client error callback:', error);
          this.authenticationInProgress = false;
        }
      });

      this.initialized = true;
      console.log('✅ Google Drive service initialized successfully');

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive service:', error);
      this.initialized = false;
      throw error;
    }
  }

  // ENHANCED: Authentication with retry and cleanup logic
  async authenticate(): Promise<boolean> {
    if (!this.initialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google Drive service');
      }
    }

    // Check if already authenticated with valid token
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      console.log('✅ Already authenticated with valid token');
      return true;
    }

    if (this.authenticationInProgress) {
      console.log('🔄 Authentication already in progress, waiting...');
      return new Promise((resolve) => {
        const checkAuth = () => {
          if (!this.authenticationInProgress) {
            resolve(this.authenticated);
          } else {
            setTimeout(checkAuth, 500);
          }
        };
        checkAuth();
      });
    }

    try {
      this.authenticationInProgress = true;
      this.retryCount++;

      if (this.retryCount > this.maxRetries) {
        throw new Error('Maximum authentication attempts exceeded. Please refresh the page and try again.');
      }

      console.log('🔐 Starting Google Drive authentication...');

      return new Promise<boolean>((resolve, reject) => {
        const authTimeout = setTimeout(() => {
          this.authenticationInProgress = false;
          reject(new Error('Authentication timeout. Please try again.'));
        }, 30000); // 30 second timeout

        this.tokenClient.callback = async (response: any) => {
          clearTimeout(authTimeout);
          
          try {
            if (response.error) {
              throw new Error(`Authentication failed: ${response.error}`);
            }

            console.log('✅ Google Identity Services authentication successful');
            this.accessToken = response.access_token;
            this.tokenExpiresAt = Date.now() + (response.expires_in * 1000);

            // Get user info
            const userInfo = await this.fetchUserInfo();
            this.currentUser = userInfo;
            this.authenticated = true;
            this.authenticationInProgress = false;
            this.retryCount = 0; // Reset retry count on success

            console.log('👤 Authenticated user:', userInfo.name);
            resolve(true);
          } catch (error) {
            this.authenticationInProgress = false;
            console.error('❌ Authentication failed:', error);
            reject(error);
          }
        };

        this.tokenClient.error_callback = (error: any) => {
          clearTimeout(authTimeout);
          this.authenticationInProgress = false;
          console.error('❌ Token client error:', error);
          reject(new Error(`Authentication failed: ${error.message || 'Unknown error'}`));
        };

        // Request access token
        console.log('📝 Requesting access token...');
        this.tokenClient.requestAccessToken({
          prompt: this.retryCount > 1 ? 'consent' : ''
        });
      });

    } catch (error) {
      this.authenticationInProgress = false;
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }

  // ENHANCED: Better user authentication check
  async isUserAuthenticated(): Promise<boolean> {
    if (!this.initialized) return false;
    
    try {
      // Check if we have a current user and valid token
      if (this.authenticated && this.currentUser && this.accessToken) {
        // Check if token is still valid
        if (Date.now() >= this.tokenExpiresAt) {
          console.log('🔄 Access token expired');
          await this.clearAuthenticationState();
          return false;
        }

        // Verify token is still valid by making a test API call
        try {
          await this.gapi.client.drive.about.get();
          return true;
        } catch (error) {
          console.warn('⚠️ Token appears to be invalid, clearing authentication');
          await this.clearAuthenticationState();
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      return false;
    }
  }

  // ENHANCED: User info with error handling
  async getUserInfo(): Promise<UserInfo | null> {
    return this.currentUser;
  }

  private async fetchUserInfo(): Promise<UserInfo> {
    if (!this.accessToken) throw new Error('No access token available');

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });

      if (!response.ok) throw new Error(`Failed to fetch user info: ${response.statusText}`);

      const userData = await response.json();
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        picture: userData.picture
      };
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      
      // Fallback: try to get user info from Drive API
      try {
        const response = await this.gapi.client.drive.about.get({
          fields: 'user'
        });
        const user = response.result.user;
        return {
          id: user.permissionId || 'unknown',
          name: user.displayName,
          email: user.emailAddress,
          picture: user.photoLink
        };
      } catch (driveError) {
        console.error('❌ Error getting user info from Drive API:', driveError);
        throw new Error('Failed to get user information');
      }
    }
  }

  // CRITICAL FIX: Browse files with proper URL handling
  async browseFiles(folderId?: string): Promise<DriveFile[]> {
    try {
      if (!await this.isUserAuthenticated()) {
        throw new Error('Authentication required to browse files');
      }

      let query = 'trashed=false';
      
      if (folderId) {
        // Browse specific folder
        query = `'${folderId}' in parents and trashed=false`;
        console.log('📂 Browsing specific Google Drive folder:', folderId);
      } else {
        // Browse ALL media files
        query = "trashed=false and (mimeType contains 'image/' or mimeType contains 'video/')";
        console.log('📂 Browsing ALL Google Drive media files');
      }

      const response = await this.gapi.client.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,parents)',
        orderBy: 'modifiedTime desc',
        pageSize: 100
      });

      const files = response.result.files || [];
      
      // Add proper URLs for each file
      const filesWithUrls = files.map((file: any) => ({
        ...file,
        publicUrl: this.getPublicViewUrl(file.id),
        directUrl: this.getDirectUrl(file.id, file.mimeType),
        size: file.size || '0'
      }));

      console.log('📂 Found', filesWithUrls.length, 'files');
      return filesWithUrls;
      
    } catch (error) {
      console.error('❌ Error browsing files:', error);
      
      // If authentication error, clear state
      if (error.message.includes('auth') || error.message.includes('token')) {
        await this.clearAuthenticationState();
      }
      
      return [];
    }
  }

  // Get homepage media folders for browsing
  async getHomepageMediaFolders(): Promise<{ [key: string]: string }> {
    try {
      const mainFolderId = await this.getOrCreateMainFolder();
      
      let homepageFolder = await this.findFolderByName('Homepage Media', mainFolderId);
      if (!homepageFolder) {
        homepageFolder = await this.createFolder('Homepage Media', mainFolderId);
      }

      const folderNames = {
        'background_video': 'Background Videos',
        'hero_image': 'Hero Images',
        'gallery_image': 'Gallery Images',
        'banner': 'Banners'
      };

      const folders: { [key: string]: string } = {};
      
      for (const [type, name] of Object.entries(folderNames)) {
        let folder = await this.findFolderByName(name, homepageFolder.id);
        if (!folder) {
          folder = await this.createFolder(name, homepageFolder.id);
        }
        folders[type] = folder.id;
      }

      return folders;
    } catch (error) {
      console.error('❌ Error getting homepage folders:', error);
      return {};
    }
  }

  private async getOrCreateMainFolder(): Promise<string> {
    try {
      let mainFolder = await this.findFolderByName('Boujee Events Hub');
      
      if (!mainFolder) {
        console.log('📁 Creating main Boujee Events Hub folder...');
        mainFolder = await this.createFolder('Boujee Events Hub');
        
        await this.createFolder('Events', mainFolder.id);
        await this.createFolder('Archives', mainFolder.id);
        await this.createFolder('Homepage Media', mainFolder.id);
        
        console.log('✅ Created complete folder structure');
      }

      return mainFolder.id;
    } catch (error) {
      console.error('❌ Failed to get/create main folder:', error);
      throw error;
    }
  }

  async findFolderByName(name: string, parentId: string = 'root'): Promise<DriveFile | null> {
    try {
      if (!this.accessToken) throw new Error('Not authenticated');

      const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
      
      const response = await this.gapi.client.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,createdTime,modifiedTime,webViewLink)'
      });

      const files = response.result.files;
      return files && files.length > 0 ? files[0] : null;
    } catch (error) {
      console.error('❌ Error finding folder:', error);
      return null;
    }
  }

  async createFolder(name: string, parentId: string = 'root'): Promise<DriveFile> {
    try {
      if (!this.accessToken) throw new Error('Not authenticated');

      console.log(`📁 Creating folder: ${name}`);
      
      const metadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      };

      const response = await this.gapi.client.drive.files.create({
        resource: metadata,
        fields: 'id,name,mimeType,createdTime,modifiedTime,webViewLink,parents'
      });

      console.log(`✅ Created folder: ${name}`);
      return response.result as DriveFile;
    } catch (error) {
      console.error(`❌ Error creating folder ${name}:`, error);
      throw error;
    }
  }

  // Get public viewing URL for a file
  private getPublicViewUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  // Get direct URL for embedding
  private getDirectUrl(fileId: string, mimeType: string): string {
    // For images, use direct Google Drive URL that works in img tags
    if (mimeType.startsWith('image/')) {
      return `https://drive.google.com/uc?id=${fileId}`;
    }
    
    // For videos, use preview URL for iframe embedding
    if (mimeType.startsWith('video/')) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  // ENHANCED: File upload with progress and error handling
  async uploadFile(file: File, folderId: string, onProgress?: (progress: { percentage: number }) => void): Promise<DriveFile> {
    if (!this.authenticated || !this.accessToken) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const metadata = {
        name: file.name,
        parents: folderId ? [folderId] : undefined
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
              const uploadedFile: DriveFile = {
                id: response.id,
                name: response.name,
                mimeType: file.type,
                size: file.size.toString(),
                createdTime: new Date().toISOString(),
                modifiedTime: new Date().toISOString(),
                webViewLink: this.getPublicViewUrl(response.id),
                webContentLink: `https://drive.google.com/uc?id=${response.id}&export=download`,
                parents: folderId ? [folderId] : undefined,
                publicUrl: this.getPublicViewUrl(response.id),
                directUrl: this.getDirectUrl(response.id, file.type)
              };
              resolve(uploadedFile);
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

        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
        xhr.send(form);
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // If authentication error, clear state
      if (error.message.includes('auth') || error.message.includes('token')) {
        await this.clearAuthenticationState();
      }
      
      throw error;
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

export const googleDriveService = new GoogleDriveService();
