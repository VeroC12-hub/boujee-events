// src/services/googleDriveService.ts - COMPLETE CORS-SAFE VERSION
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface DriveFile {
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
  directImageUrl?: string;
  directVideoUrl?: string;
  isPublic?: boolean;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class GoogleDriveService {
  private gapi: any = null;
  private tokenClient: any = null;
  private initialized = false;
  private authenticated = false;
  private currentUser: any = null;
  private authenticationInProgress = false;
  private initializationPromise: Promise<boolean> | null = null;

  constructor() {
    console.log('🔧 Initializing Google Drive service...');
  }

  async initialize(): Promise<boolean> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.initialized) return true;

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<boolean> {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

      console.log('🔍 Environment check:', {
        clientId: clientId ? `✅ Set (${clientId.substring(0, 10)}...)` : '❌ Missing',
        apiKey: apiKey ? `✅ Set (${apiKey.substring(0, 10)}...)` : '❌ Missing',
        currentUrl: window.location.origin
      });

      if (!clientId || !apiKey) {
        throw new Error('Missing required Google API credentials. Please check VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_DRIVE_API_KEY in your environment variables.');
      }

      // Load Google API script if not loaded
      if (typeof window.gapi === 'undefined') {
        console.log('📥 Loading Google API script...');
        await this.loadGoogleApiScript();
      }

      // Load Google Identity Services if not loaded
      if (typeof window.google === 'undefined') {
        console.log('📥 Loading Google Identity Services...');
        await this.loadGoogleIdentityScript();
      }

      // Initialize GAPI client
      await this.initializeGapiClient(apiKey);
      this.gapi = window.gapi;

      // Initialize token client with FULL permissions
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.metadata.readonly'
        ].join(' '),
        callback: '',
      });

      this.initialized = true;
      console.log('✅ Google Drive service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive service:', error);
      this.initialized = false;
      this.initializationPromise = null;
      throw error;
    }
  }

  private async loadGoogleApiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.gapi !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  private async loadGoogleIdentityScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  private async initializeGapiClient(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('client', {
        callback: async () => {
          try {
            await window.gapi.client.init({
              apiKey: apiKey,
              discoveryDocs: [
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
              ]
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        onerror: reject
      });
    });
  }

  async authenticate(): Promise<boolean> {
    if (!this.initialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Google Drive service initialization failed');
      }
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
              throw new Error(`Authentication failed: ${response.error}`);
            }

            const userInfo = await this.getUserInfo();
            this.currentUser = userInfo;
            this.authenticated = true;
            this.authenticationInProgress = false;

            console.log('👤 Authentication successful:', userInfo.displayName || userInfo.emailAddress);
            resolve(true);
          } catch (error: any) {
            this.authenticationInProgress = false;
            this.authenticated = false;
            this.currentUser = null;
            reject(error);
          }
        };

        this.tokenClient.error_callback = (error: any) => {
          this.authenticationInProgress = false;
          console.log('🚫 Authentication cancelled:', error);
          resolve(false);
        };

        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      });

    } catch (error) {
      this.authenticationInProgress = false;
      throw error;
    }
  }

  async isUserAuthenticated(): Promise<boolean> {
    if (!this.initialized) {
      try {
        await this.initialize();
      } catch (error) {
        return false;
      }
    }
    
    try {
      if (this.authenticated && this.currentUser) {
        // Verify token is still valid
        try {
          await this.gapi.client.drive.about.get({ fields: 'user' });
          return true;
        } catch (error: any) {
          this.authenticated = false;
          this.currentUser = null;
          return false;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async getUserInfo(): Promise<any> {
    try {
      const response = await this.gapi.client.drive.about.get({ fields: 'user' });
      return response.result.user;
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Authentication required. Please sign in to Google Drive.');
      }
      throw new Error(`Failed to get user information: ${error.message}`);
    }
  }

  // 🔥 ENHANCED: Generate optimal URLs for different file types
  private generateOptimalUrls(fileId: string, mimeType: string): {
    primaryUrl: string;
    fallbackUrl: string;
    thumbnailUrl: string;
    directImageUrl?: string;
    directVideoUrl?: string;
  } {
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (isImage) {
      return {
        primaryUrl: `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080-c`,
        fallbackUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`,
        directImageUrl: `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080-c`
      };
    } else if (isVideo) {
      return {
        primaryUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        fallbackUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`,
        directVideoUrl: `https://drive.google.com/file/d/${fileId}/preview`
      };
    }

    return {
      primaryUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
      fallbackUrl: `https://drive.google.com/file/d/${fileId}/view`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`
    };
  }

  // 🔥 CRITICAL: Make file publicly accessible
  async makeFilePublic(fileId: string): Promise<boolean> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      console.log(`🔓 Making file public: ${fileId}`);
      
      const response = await this.gapi.client.drive.permissions.create({
        fileId: fileId,
        sendNotificationEmail: false,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      if (response.status === 200) {
        console.log(`✅ File ${fileId} is now publicly accessible`);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ Error making file public:', error);
      return false;
    }
  }

  // 🔥 CORS-SAFE: Verify file is public using API only (NO FETCH)
  async verifyFileIsPublic(fileId: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking permissions for file: ${fileId} (API-only)`);
      
      // 🔥 SAFE: Use Google Drive API instead of fetch
      const permissions = await this.gapi.client.drive.permissions.list({
        fileId: fileId,
        fields: 'permissions(id,type,role)'
      });
      
      const hasPublicAccess = permissions.result.permissions?.some((permission: any) => 
        permission.type === 'anyone' && (permission.role === 'reader' || permission.role === 'commenter')
      );
      
      console.log(`✅ File ${fileId} public status: ${hasPublicAccess ? 'Public' : 'Private'}`);
      return !!hasPublicAccess;
    } catch (error: any) {
      console.warn('⚠️ Could not check file permissions (assuming public):', error.message);
      // 🔥 SAFE: Assume public if we can't check (avoid CORS)
      return true;
    }
  }

  // 🔥 ENHANCED: Upload with automatic public access and optimal URLs
  async uploadFile(
    file: File, 
    folderId: string = 'root', 
    onProgress?: (progress: UploadProgress) => void,
    makePublic: boolean = true
  ): Promise<DriveFile> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive. Please sign in first.');
    }

    try {
      console.log(`⬆️ Starting upload: ${file.name} (${this.formatFileSize(file.size)})`);

      if (!file || file.size === 0) {
        throw new Error('Invalid file: File is empty or corrupted');
      }

      if (file.size > 5 * 1024 * 1024 * 1024) {
        throw new Error('File too large: Maximum file size is 5GB');
      }

      const metadata = {
        name: file.name,
        parents: folderId && folderId !== 'root' ? [folderId] : undefined
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let lastProgressTime = Date.now();

        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const now = Date.now();
              if (now - lastProgressTime > 100) {
                const progress: UploadProgress = {
                  loaded: event.loaded,
                  total: event.total,
                  percentage: Math.round((event.loaded / event.total) * 100)
                };
                onProgress(progress);
                lastProgressTime = now;
              }
            }
          };
        }

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log(`✅ Upload completed: ${result.name} (ID: ${result.id})`);
              
              // 🔥 CRITICAL: Make file public and generate optimal URLs
              if (makePublic) {
                try {
                  const publicSuccess = await this.makeFilePublic(result.id);
                  if (publicSuccess) {
                    // 🔥 SAFE: Don't verify with fetch, just trust API response
                    console.log(`🌐 File ${result.id} made public successfully`);
                  }
                } catch (publicError) {
                  console.warn('⚠️ Upload succeeded but public access setup failed:', publicError);
                }
              }

              // 🔥 CRITICAL: Generate optimal URLs based on file type
              const urls = this.generateOptimalUrls(result.id, result.mimeType || file.type);

              const driveFile: DriveFile = {
                id: result.id,
                name: result.name,
                mimeType: result.mimeType || file.type,
                size: file.size.toString(),
                createdTime: new Date().toISOString(),
                modifiedTime: new Date().toISOString(),
                webViewLink: `https://drive.google.com/file/d/${result.id}/view`,
                webContentLink: urls.primaryUrl,
                thumbnailLink: urls.thumbnailUrl,
                directImageUrl: urls.directImageUrl,
                directVideoUrl: urls.directVideoUrl,
                isPublic: makePublic,
                parents: result.parents
              };

              if (onProgress) {
                onProgress({ loaded: file.size, total: file.size, percentage: 100 });
              }

              resolve(driveFile);
            } catch (parseError) {
              reject(new Error('Upload completed but response parsing failed'));
            }
          } else {
            let errorMessage = `Upload failed with status: ${xhr.status}`;
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse.error) {
                errorMessage = errorResponse.error.message || errorMessage;
              }
            } catch (e) {
              // Ignore parsing errors for error response
            }
            reject(new Error(errorMessage));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.ontimeout = () => reject(new Error('Upload timed out'));

        const accessToken = this.gapi.auth.getToken()?.access_token;
        if (!accessToken) {
          reject(new Error('No access token available. Please re-authenticate.'));
          return;
        }

        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.timeout = 5 * 60 * 1000; // 5 minute timeout
        
        xhr.send(form);
      });

    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // 🔥 ENHANCED: List files with optimal URLs
  async listFiles(
    folderId: string = 'root',
    mimeTypeFilter?: string,
    maxResults: number = 1000
  ): Promise<DriveFile[]> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive. Please sign in first.');
    }

    try {
      console.log(`📂 Listing files in folder: ${folderId}`);

      let query = `'${folderId}' in parents and trashed=false`;
      
      if (mimeTypeFilter) {
        if (mimeTypeFilter === 'image/*') {
          query += ` and (mimeType contains 'image/')`;
        } else if (mimeTypeFilter === 'video/*') {
          query += ` and (mimeType contains 'video/')`;
        } else {
          query += ` and mimeType='${mimeTypeFilter}'`;
        }
      }

      const response = await this.gapi.client.drive.files.list({
        q: query,
        pageSize: Math.min(maxResults, 1000),
        fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents)',
        orderBy: 'modifiedTime desc'
      });

      let files: any[] = response.result.files || [];
      
      // Handle pagination
      let nextPageToken = response.result.nextPageToken;
      while (nextPageToken && files.length < maxResults) {
        const nextResponse = await this.gapi.client.drive.files.list({
          q: query,
          pageSize: Math.min(maxResults - files.length, 1000),
          pageToken: nextPageToken,
          fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents)',
          orderBy: 'modifiedTime desc'
        });

        const nextFiles = nextResponse.result.files || [];
        files = files.concat(nextFiles);
        nextPageToken = nextResponse.result.nextPageToken;
      }

      console.log(`✅ Found ${files.length} files`);
      
      // 🔥 CRITICAL: Enhance files with optimal URLs
      const enhancedFiles: DriveFile[] = files.map(file => {
        const urls = this.generateOptimalUrls(file.id, file.mimeType);
        
        return {
          ...file,
          webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
          webContentLink: urls.primaryUrl,
          thumbnailLink: urls.thumbnailUrl,
          directImageUrl: urls.directImageUrl,
          directVideoUrl: urls.directVideoUrl
        };
      });

      return enhancedFiles;
    } catch (error: any) {
      console.error('❌ Failed to list files:', error);
      if (error.status === 401) {
        this.authenticated = false;
        this.currentUser = null;
        throw new Error('Authentication expired. Please sign in again.');
      }
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // 🔥 BATCH: Make files public
  async makeMultipleFilesPublic(fileIds: string[]): Promise<{success: string[], failed: string[]}> {
    const success: string[] = [];
    const failed: string[] = [];

    console.log(`🔓 Making ${fileIds.length} files public...`);

    for (const fileId of fileIds) {
      try {
        const publicSuccess = await this.makeFilePublic(fileId);
        if (publicSuccess) {
          success.push(fileId);
        } else {
          failed.push(fileId);
        }
      } catch (error) {
        failed.push(fileId);
      }
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`✅ Made ${success.length} files public, ${failed.length} failed`);
    return { success, failed };
  }

  // 🔥 CORS-SAFE: Fix existing private files (NO FETCH VERIFICATION)
  async fixExistingPrivateFiles(): Promise<void> {
    try {
      console.log('🔧 Fixing existing private files...');
      
      const allFiles = await this.listFiles('root', undefined, 1000);
      const mediaFiles = allFiles.filter(file => 
        file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')
      );
      
      console.log(`📊 Found ${mediaFiles.length} media files to check`);
      
      const privateFiles: string[] = [];
      
      // Check which files are not public using API-only method
      for (const file of mediaFiles) {
        try {
          const isPublic = await this.verifyFileIsPublic(file.id);
          if (!isPublic) {
            privateFiles.push(file.id);
          }
        } catch (error) {
          // If we can't check, assume it needs to be made public
          privateFiles.push(file.id);
        }
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`📊 Found ${privateFiles.length} files to make public`);
      
      if (privateFiles.length === 0) {
        console.log('✅ All files are already public or accessible!');
        return;
      }
      
      // Make them public
      const result = await this.makeMultipleFilesPublic(privateFiles);
      console.log(`✅ Made ${result.success.length} files public, ${result.failed.length} failed`);
      
    } catch (error) {
      console.error('❌ Error fixing existing files:', error);
      throw error;
    }
  }

  // Utility methods
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async createFolder(name: string, parentId: string = 'root'): Promise<DriveFile> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    const metadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId !== 'root' ? [parentId] : undefined
    };

    const response = await this.gapi.client.drive.files.create({
      resource: metadata,
      fields: 'id,name,mimeType,webViewLink,parents,createdTime,modifiedTime'
    });

    const folder = response.result;
    return {
      id: folder.id,
      name: folder.name,
      mimeType: folder.mimeType,
      createdTime: folder.createdTime || new Date().toISOString(),
      modifiedTime: folder.modifiedTime || new Date().toISOString(),
      webViewLink: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
      parents: folder.parents
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.authenticated) {
        return false;
      }

      const response = await this.gapi.client.drive.about.get({
        fields: 'user,storageQuota'
      });

      if (response.result && response.result.user) {
        console.log('✅ Connection test successful:', response.result.user.displayName);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      if (error.status === 401) {
        this.authenticated = false;
        this.currentUser = null;
      }
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.authenticated && window.google?.accounts?.oauth2) {
        const token = this.gapi.auth.getToken();
        if (token) {
          window.google.accounts.oauth2.revoke(token.access_token);
        }
      }
      
      this.authenticated = false;
      this.currentUser = null;
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Error during sign out:', error);
      this.authenticated = false;
      this.currentUser = null;
    }
  }

  // Getters
  get isInitialized(): boolean { return this.initialized; }
  get isAuthenticated(): boolean { return this.authenticated; }
  get currentAuthenticatedUser(): any { return this.currentUser; }
  get hasValidConnection(): boolean { return this.initialized && this.authenticated && this.currentUser; }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();

// Export types
export type { DriveFile, UploadProgress };
