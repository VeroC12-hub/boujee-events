// src/services/googleDriveService.ts - COMPLETE WORKING VERSION
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

declare global {
  interface Window {
    gapi: any;
  }
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private isInitialized = false;
  private isAuthenticated = false;
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
      console.log('🔄 Initializing Google Drive service...');
      
      // Check environment variables
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

      console.log('🔍 Environment check:', {
        clientId: clientId ? '✅ Set' : '❌ Missing',
        apiKey: apiKey ? '✅ Set' : '❌ Missing'
      });

      if (!clientId || !apiKey) {
        console.error('❌ Missing Google Drive credentials in environment variables');
        console.error('Please add to .env.local:');
        console.error('VITE_GOOGLE_CLIENT_ID=your_client_id');
        console.error('VITE_GOOGLE_DRIVE_API_KEY=your_api_key');
        return false;
      }

      // Load Google API if not already loaded
      if (!window.gapi) {
        console.log('📡 Loading Google API...');
        await this.loadGoogleAPI();
      }

      // Initialize Google API client
      await this.initializeGoogleAPI();
      
      this.isInitialized = true;
      console.log('✅ Google Drive service initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive service:', error);
      return false;
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        console.log('✅ Google API script loaded');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google API script');
        reject(new Error('Failed to load Google API'));
      };
      document.head.appendChild(script);
    });
  }

  private initializeGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('client:auth2', {
        callback: async () => {
          try {
            console.log('🔧 Initializing Google API client...');
            await window.gapi.client.init({
              apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
              clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
              scope: 'https://www.googleapis.com/auth/drive.file'
            });
            console.log('✅ Google API client initialized');
            resolve();
          } catch (error) {
            console.error('❌ Failed to initialize Google API client:', error);
            reject(error);
          }
        },
        onerror: (error: any) => {
          console.error('❌ Failed to load Google API modules:', error);
          reject(error);
        }
      });
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Starting Google Drive authentication...');
      
      if (!this.isInitialized) {
        console.log('⚠️ Service not initialized, initializing now...');
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize Google Drive service');
        }
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        console.log('📝 User not signed in, prompting for authentication...');
        
        try {
          const user = await authInstance.signIn();
          console.log('✅ User signed in successfully');
        } catch (error) {
          console.error('❌ User declined authentication or error occurred:', error);
          return false;
        }
      } else {
        console.log('✅ User already signed in');
      }

      // Get user information
      const user = authInstance.currentUser.get();
      const profile = user.getBasicProfile();
      
      this.userInfo = {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        picture: profile.getImageUrl()
      };

      this.isAuthenticated = true;
      console.log('👤 Authenticated user:', this.userInfo.name, '(' + this.userInfo.email + ')');
      
      return true;
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  async isUserAuthenticated(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      
      if (isSignedIn) {
        const user = authInstance.currentUser.get();
        const authResponse = user.getAuthResponse();
        
        // Check if token is still valid
        const now = Date.now();
        const expiresAt = authResponse.expires_at;
        
        if (now < expiresAt) {
          this.isAuthenticated = true;
          return true;
        } else {
          console.log('🔄 Token expired, need to re-authenticate');
          this.isAuthenticated = false;
          return false;
        }
      }
      
      this.isAuthenticated = false;
      return false;
      
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  async getUserInfo(): Promise<UserInfo | null> {
    return this.userInfo;
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      initialized: this.isInitialized,
      authenticated: this.isAuthenticated,
      error: undefined
    };
  }

  async uploadHomepageMedia(
    files: FileList,
    mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DriveFile[]> {
    try {
      console.log('📤 Starting upload of', files.length, 'files to Google Drive');
      
      // Ensure authenticated
      const authenticated = await this.isUserAuthenticated();
      if (!authenticated) {
        console.log('🔐 Not authenticated, requesting authentication...');
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed - user must sign in to Google Drive');
        }
      }

      // Get target folder
      const folderId = await this.getOrCreateHomepageFolder(mediaType);
      console.log('📁 Target folder ID:', folderId);
      
      const uploadedFiles: DriveFile[] = [];
      
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📎 Uploading file ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        try {
          const uploadedFile = await this.uploadFile(file, folderId, onProgress);
          if (uploadedFile) {
            uploadedFiles.push(uploadedFile);
            console.log(`✅ Successfully uploaded: ${uploadedFile.name}`);
          }
        } catch (error) {
          console.error(`❌ Failed to upload ${file.name}:`, error);
        }
      }
      
      console.log('🎉 Upload completed:', uploadedFiles.length, 'files uploaded successfully');
      return uploadedFiles;
      
    } catch (error) {
      console.error('❌ Failed to upload homepage media:', error);
      throw error;
    }
  }

  private async getOrCreateHomepageFolder(mediaType: string): Promise<string> {
    try {
      // Get main folder
      const mainFolderId = await this.getOrCreateMainFolder();
      
      // Get homepage media folder
      let homepageFolder = await this.findFolderByName('Homepage Media', mainFolderId);
      if (!homepageFolder) {
        homepageFolder = await this.createFolder('Homepage Media', mainFolderId);
      }
      
      // Get specific media type folder
      const folderNames = {
        'background_video': 'Background Videos',
        'hero_image': 'Hero Images',
        'gallery_image': 'Gallery Images',
        'banner': 'Banners'
      };
      
      const targetFolderName = folderNames[mediaType as keyof typeof folderNames];
      let targetFolder = await this.findFolderByName(targetFolderName, homepageFolder.id);
      
      if (!targetFolder) {
        targetFolder = await this.createFolder(targetFolderName, homepageFolder.id);
      }
      
      return targetFolder.id;
      
    } catch (error) {
      console.error('❌ Failed to get/create homepage folder:', error);
      throw error;
    }
  }

  private async getOrCreateMainFolder(): Promise<string> {
    try {
      // Check if main folder exists
      let mainFolder = await this.findFolderByName('Boujee Events Hub');
      
      if (!mainFolder) {
        console.log('📁 Creating main Boujee Events Hub folder...');
        mainFolder = await this.createFolder('Boujee Events Hub');
        
        // Create subfolders
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
      const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
      
      const response = await window.gapi.client.drive.files.list({
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
      console.log(`📁 Creating folder: ${name} in ${parentId}`);
      
      const metadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      };

      const response = await window.gapi.client.drive.files.create({
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

  async uploadFile(
    file: File,
    parentFolderId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DriveFile> {
    try {
      const metadata = {
        name: file.name,
        parents: [parentFolderId]
      };

      // Create multipart form data
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      // Get auth token
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      const authResponse = user.getAuthResponse();

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            const uploadedFile: DriveFile = {
              id: result.id,
              name: result.name,
              mimeType: file.type,
              size: file.size.toString(),
              createdTime: new Date().toISOString(),
              modifiedTime: new Date().toISOString(),
              webViewLink: `https://drive.google.com/file/d/${result.id}/view`,
              webContentLink: `https://drive.google.com/uc?id=${result.id}&export=download`,
              parents: [parentFolderId]
            };
            resolve(uploadedFile);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        };

        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', `Bearer ${authResponse.access_token}`);
        xhr.send(form);
      });
      
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      if (window.gapi && window.gapi.auth2) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }

      this.isAuthenticated = false;
      this.userInfo = null;
      
      console.log('✅ Signed out from Google Drive');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }

  async createEventFolder(eventName: string, eventId: string): Promise<EventFolder | null> {
    try {
      if (!await this.isUserAuthenticated()) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Authentication required');
        }
      }

      const mainFolderId = await this.getOrCreateMainFolder();
      
      // Get Events folder
      let eventsFolder = await this.findFolderByName('Events', mainFolderId);
      if (!eventsFolder) {
        eventsFolder = await this.createFolder('Events', mainFolderId);
      }

      // Create event folder
      const eventFolderName = `${eventName} (${eventId})`;
      const eventFolder = await this.createFolder(eventFolderName, eventsFolder.id);

      // Create subfolders
      const photosFolder = await this.createFolder('Photos', eventFolder.id);
      const videosFolder = await this.createFolder('Videos', eventFolder.id);

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
      console.error('❌ Error creating event folder:', error);
      return null;
    }
  }

  async listFiles(folderId: string = 'root'): Promise<DriveFile[]> {
    try {
      if (!await this.isUserAuthenticated()) {
        return [];
      }

      const query = `'${folderId}' in parents and trashed=false`;
      const response = await window.gapi.client.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents)'
      });

      return response.result.files || [];
      
    } catch (error) {
      console.error('❌ Error listing files:', error);
      return [];
    }
  }
}

export const googleDriveService = GoogleDriveService.getInstance();
