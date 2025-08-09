/**
 * Google Drive Integration Service - Build Safe Version
 * No import.meta usage to avoid esbuild parsing issues
 */

import { getGoogleDriveConfig, getEnvironmentInfo, logEnvironmentInfo } from '../utils/environment';

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

export interface ConnectionStatus {
  initialized: boolean;
  authenticated: boolean;
  error?: string;
  userInfo?: any;
}

// Google API type declarations
declare global {
  interface Window {
    gapi: any;
  }
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private gapi: any = null;
  private isInitialized = false;
  private isAuthenticated = false;
  private accessToken: string | null = null;
  private mainFolderId: string | null = null;
  private initializationPromise: Promise<boolean> | null = null;

  private constructor() {
    // Log environment information when service is created
    try {
      logEnvironmentInfo();
    } catch (error) {
      console.warn('Could not log environment info:', error);
    }
  }

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  /**
   * Get current domain for OAuth configuration
   */
  private getCurrentDomain(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:8080';
  }

  /**
   * Initialize Google Drive API with enhanced error handling
   */
  async initialize(): Promise<boolean> {
    // Return existing initialization promise if already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.isInitialized) return true;

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<boolean> {
    try {
      // Get configuration using safe environment detection
      const config = getGoogleDriveConfig();
      const envInfo = getEnvironmentInfo();
      const currentDomain = this.getCurrentDomain();
      
      console.log('🌐 Initializing Google Drive API');
      console.log('├── Domain:', currentDomain);
      console.log('├── Environment:', envInfo.mode);
      console.log('├── Is Production:', envInfo.isProduction);
      console.log('└── Is Vercel:', envInfo.isVercel);
      
      if (!config.clientId || !config.apiKey) {
        console.error('❌ Missing Google Drive credentials');
        console.log('📋 Configuration Status:');
        console.log('├── Client ID:', config.clientId ? '✅ Set' : '❌ Missing');
        console.log('├── API Key:', config.apiKey ? '✅ Set' : '❌ Missing');
        console.log('└── Folder ID:', config.folderId ? '✅ Set' : 'ℹ️ Optional');
        
        if (envInfo.isVercel && !config.isConfigured) {
          console.log('💡 Vercel Environment Variables Help:');
          console.log('1. Go to Vercel Dashboard → Your Project → Settings');
          console.log('2. Navigate to Environment Variables');
          console.log('3. Add VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_DRIVE_API_KEY');
          console.log('4. Make sure to set them for "Production" environment');
          console.log('5. Redeploy your application');
        }
        
        return false;
      }

      console.log('✅ Google Drive credentials found');

      // Load Google API with enhanced error handling
      await this.loadGoogleAPI();
      
      // Initialize Google API client
      await new Promise<void>((resolve, reject) => {
        this.gapi.load('auth2:client', {
          callback: async () => {
            try {
              console.log('🔧 Initializing Google API client...');
              
              const initConfig = {
                apiKey: config.apiKey,
                clientId: config.clientId,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive'
              };

              await this.gapi.client.init(initConfig);

              this.isInitialized = true;
              console.log('✅ Google Drive API initialized successfully');
              console.log('🌐 Configured for domain:', currentDomain);
              
              // Setup main folder structure
              await this.setupMainFolders();
              resolve();
            } catch (error: any) {
              console.error('❌ Failed to initialize Google API client:', error);
              console.log('🔍 Troubleshooting Guide:');
              console.log('1. Check Google Cloud Console OAuth settings');
              console.log('2. Verify authorized origins include:', currentDomain);
              console.log('3. Check API key restrictions');
              console.log('4. Ensure Google Drive API is enabled');
              
              if (error.details && error.details.includes('origin_mismatch')) {
                console.log('🚨 OAuth Origin Mismatch Detected:');
                console.log(`Add "${currentDomain}" to your Google Cloud Console OAuth settings`);
              }
              
              reject(error);
            }
          },
          onerror: (error: any) => {
            console.error('❌ Failed to load Google API modules:', error);
            reject(error);
          }
        });
      });

      return true;
    } catch (error: any) {
      console.error('❌ Failed to initialize Google Drive API:', error);
      
      // Provide specific error guidance
      if (error.error === 'idpiframe_initialization_failed') {
        console.log('🚨 OAuth Configuration Issue:');
        console.log('📝 Required Actions:');
        console.log('1. Go to Google Cloud Console');
        console.log('2. APIs & Services → Credentials');
        console.log('3. Edit your OAuth 2.0 Client ID');
        console.log('4. Add to Authorized JavaScript origins:');
        console.log(`   - ${this.getCurrentDomain()}`);
        console.log('5. Add to Authorized redirect URIs:');
        console.log(`   - ${this.getCurrentDomain()}`);
        console.log('6. Save and wait 5-10 minutes');
      }
      
      this.isInitialized = false;
      return false;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Load Google API script with enhanced error handling
   */
  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.gapi) {
        this.gapi = window.gapi;
        console.log('✅ Google API already loaded');
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="apis.google.com"]');
      if (existingScript) {
        console.log('⏳ Google API script already loading...');
        existingScript.addEventListener('load', () => {
          this.gapi = window.gapi;
          resolve();
        });
        existingScript.addEventListener('error', reject);
        return;
      }

      // Create and load new script
      console.log('📦 Loading Google API script...');
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.gapi = window.gapi;
        console.log('✅ Google API script loaded successfully');
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Google API script:', error);
        console.log('💡 Possible causes:');
        console.log('- Network connectivity issues');
        console.log('- Content Security Policy blocking');
        console.log('- Ad blockers interfering');
        console.log('- Firewall restrictions');
        reject(new Error('Failed to load Google API script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Authenticate with Google with enhanced error handling
   */
  async authenticate(): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('🔧 Initializing API before authentication...');
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      
      if (!authInstance) {
        throw new Error('Auth instance not available. API initialization may have failed.');
      }

      // Check if already signed in
      if (authInstance.isSignedIn.get()) {
        const user = authInstance.currentUser.get();
        this.accessToken = user.getAuthResponse().access_token;
        this.isAuthenticated = true;
        console.log('✅ Already authenticated with Google Drive');
        console.log('👤 User:', user.getBasicProfile().getName());
        return true;
      }

      // Sign in with better error handling
      console.log('🔐 Starting Google authentication...');
      const user = await authInstance.signIn({
        prompt: 'consent'
      });
      
      if (user && user.isSignedIn()) {
        this.accessToken = user.getAuthResponse().access_token;
        this.isAuthenticated = true;
        console.log('✅ Successfully authenticated with Google Drive');
        console.log('👤 User:', user.getBasicProfile().getName());
        console.log('📧 Email:', user.getBasicProfile().getEmail());
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      
      // Handle specific authentication errors
      if (error.error === 'popup_closed_by_user') {
        console.log('ℹ️ Authentication popup was closed by user');
      } else if (error.error === 'access_denied') {
        console.log('ℹ️ User denied access to Google Drive');
      } else if (error.error === 'popup_blocked_by_browser') {
        console.log('🚫 Popup blocked by browser. Please allow popups.');
      } else {
        console.error('Unexpected authentication error:', error);
      }
      
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Test connection to Google Drive
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isAuthenticated) {
        const authenticated = await this.authenticate();
        if (!authenticated) return false;
      }

      const response = await this.gapi.client.drive.about.get({
        fields: 'user,storageQuota'
      });

      console.log('✅ Google Drive connection test successful');
      console.log('👤 User:', response.result.user.displayName);
      if (response.result.storageQuota) {
        console.log('💾 Storage used:', this.formatBytes(response.result.storageQuota.usage));
      }
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  /**
   * Setup main folder structure
   */
  private async setupMainFolders(): Promise<void> {
    try {
      const config = getGoogleDriveConfig();
      
      if (config.folderId) {
        this.mainFolderId = config.folderId;
        console.log('✅ Using configured main folder ID:', config.folderId);
      } else {
        console.log('ℹ️ No main folder ID configured. Will create folders in Drive root.');
      }
    } catch (error) {
      console.error('❌ Failed to setup main folders:', error);
    }
  }

  /**
   * Create event folder structure
   */
  async createEventFolder(eventName: string, eventId: string): Promise<EventFolder> {
    if (!this.isAuthenticated) {
      const authenticated = await this.authenticate();
      if (!authenticated) throw new Error('Authentication required');
    }

    try {
      const sanitizedName = eventName.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50);
      const folderName = `${sanitizedName} (${eventId})`;

      // Create main event folder
      const eventFolder = await this.createFolder(folderName, this.mainFolderId);
      
      // Create subfolders
      const photosFolder = await this.createFolder('Photos', eventFolder.id);
      const videosFolder = await this.createFolder('Videos', eventFolder.id);

      console.log('✅ Event folder structure created:', folderName);

      return {
        eventFolderId: eventFolder.id,
        photosFolderId: photosFolder.id,
        videosFolderId: videosFolder.id,
        eventName: sanitizedName,
        eventId,
        webViewLink: eventFolder.webViewLink
      };
    } catch (error) {
      console.error('❌ Failed to create event folder:', error);
      throw error;
    }
  }

  /**
   * Create a folder in Google Drive
   */
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
      fields: 'id,name,webViewLink,createdTime'
    });

    return {
      id: response.result.id,
      name: response.result.name,
      mimeType: 'application/vnd.google-apps.folder',
      size: '0',
      createdTime: response.result.createdTime,
      webViewLink: response.result.webViewLink
    };
  }

  /**
   * Upload file to Google Drive with progress tracking
   */
  async uploadFile(
    file: File,
    folderId: string,
    progressCallback?: (progress: UploadProgress) => void
  ): Promise<DriveFile> {
    if (!this.isAuthenticated) {
      const authenticated = await this.authenticate();
      if (!authenticated) throw new Error('Authentication required');
    }

    try {
      const metadata = {
        name: file.name,
        parents: [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && progressCallback) {
            const progress: UploadProgress = {
              percentage: Math.round((e.loaded / e.total) * 100),
              bytesUploaded: e.loaded,
              totalBytes: e.total
            };
            progressCallback(progress);
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
              webViewLink: `https://drive.google.com/file/d/${response.id}/view`
            });
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
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
      console.error('❌ Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return {
      initialized: this.isInitialized,
      authenticated: this.isAuthenticated
    };
  }

  /**
   * Sign out from Google Drive
   */
  async signOut(): Promise<void> {
    if (this.gapi?.auth2) {
      const authInstance = this.gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
        this.isAuthenticated = false;
        this.accessToken = null;
        console.log('✅ Signed out from Google Drive');
      }
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: string | number): string {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get user info
   */
  async getUserInfo(): Promise<any> {
    if (!this.isAuthenticated) return null;
    
    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      const profile = user.getBasicProfile();
      
      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
      };
    } catch (error) {
      console.error('❌ Failed to get user info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const googleDriveService = GoogleDriveService.getInstance();
export default googleDriveService;
