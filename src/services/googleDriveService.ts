// src/services/googleDriveService.ts - FIXED VERSION WITH PUBLIC URLS & FILE BROWSER
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
  publicUrl?: string; // NEW: Public viewing URL
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
    google: any;
  }
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private isInitialized = false;
  private isAuthenticated = false;
  private userInfo: UserInfo | null = null;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private constructor() {}

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🔄 Initializing Google Drive service with Google Identity Services...');
      
      // Check environment variables
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

      console.log('🔍 Environment check:', {
        clientId: clientId ? '✅ Set' : '❌ Missing',
        apiKey: apiKey ? '✅ Set' : '❌ Missing'
      });

      if (!clientId || !apiKey) {
        console.error('❌ Missing Google Drive credentials in environment variables');
        return false;
      }

      // Load Google Identity Services and GAPI
      await Promise.all([
        this.loadGoogleIdentityServices(),
        this.loadGoogleAPI()
      ]);

      // Initialize Google API client for Drive API
      await this.initializeGoogleAPI();
      
      this.isInitialized = true;
      console.log('✅ Google Drive service initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive service:', error);
      return false;
    }
  }

  private loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        console.log('✅ Google Identity Services loaded');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        console.log('✅ Google API script loaded');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  private initializeGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('client', {
        callback: async () => {
          try {
            console.log('🔧 Initializing Google API client...');
            await window.gapi.client.init({
              apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
            console.log('✅ Google API client initialized');
            resolve();
          } catch (error) {
            console.error('❌ Failed to initialize Google API client:', error);
            reject(error);
          }
        },
        onerror: (error: any) => {
          console.error('❌ Failed to load Google API client:', error);
          reject(error);
        }
      });
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Starting Google Drive authentication...');
      
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize Google Drive service');
        }
      }

      // Check if we already have a valid token
      if (this.accessToken && Date.now() < this.tokenExpiresAt) {
        console.log('✅ Already authenticated with valid token');
        return true;
      }

      return new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: async (response: any) => {
            if (response.error) {
              console.error('❌ Authentication error:', response.error);
              reject(new Error(`Authentication failed: ${response.error}`));
              return;
            }

            console.log('✅ Google Identity Services authentication successful');
            this.accessToken = response.access_token;
            this.tokenExpiresAt = Date.now() + (response.expires_in * 1000);
            
            try {
              await this.fetchUserInfo();
              this.isAuthenticated = true;
              console.log('👤 Authenticated user:', this.userInfo?.name);
              resolve(true);
            } catch (error) {
              console.error('❌ Failed to fetch user info:', error);
              resolve(true); // Still consider authentication successful
            }
          },
          error_callback: (error: any) => {
            console.error('❌ OAuth error:', error);
            reject(new Error(`OAuth error: ${error.message || 'Unknown error'}`));
          }
        });

        console.log('📝 Requesting access token...');
        client.requestAccessToken({ prompt: 'consent' });
      });
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  private async fetchUserInfo(): Promise<void> {
    if (!this.accessToken) throw new Error('No access token available');

    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    if (!response.ok) throw new Error(`Failed to fetch user info: ${response.statusText}`);

    const userData = await response.json();
    this.userInfo = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      picture: userData.picture
    };
  }

  async isUserAuthenticated(): Promise<boolean> {
    if (!this.isInitialized || !this.accessToken) return false;
    if (Date.now() >= this.tokenExpiresAt) {
      console.log('🔄 Access token expired');
      this.isAuthenticated = false;
      this.accessToken = null;
      return false;
    }
    return this.isAuthenticated;
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

  // NEW: Validate file type for specific media categories
  private validateFileType(file: File, mediaType: string): { valid: boolean; message?: string } {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    switch (mediaType) {
      case 'background_video':
        if (!fileType.startsWith('video/')) {
          return { 
            valid: false, 
            message: `Background Videos only accept video files. You selected: ${file.name} (${fileType}).\nFor images, use the "Hero Images" tab.` 
          };
        }
        break;
        
      case 'hero_image':
        if (!fileType.startsWith('image/')) {
          return { 
            valid: false, 
            message: `Hero Images only accept image files. You selected: ${file.name} (${fileType}).\nFor videos, use the "Background Videos" tab.` 
          };
        }
        break;
        
      case 'gallery_image':
        if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
          return { 
            valid: false, 
            message: `Gallery accepts images and videos. You selected: ${file.name} (${fileType}).` 
          };
        }
        break;
        
      case 'banner':
        if (!fileType.startsWith('image/')) {
          return { 
            valid: false, 
            message: `Banners only accept image files. You selected: ${file.name} (${fileType}).` 
          };
        }
        break;
    }
    
    return { valid: true };
  }

  async uploadHomepageMedia(
    files: FileList,
    mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DriveFile[]> {
    try {
      console.log('📤 Starting upload of', files.length, 'files to Google Drive');
      
      // Validate file types first
      for (let i = 0; i < files.length; i++) {
        const validation = this.validateFileType(files[i], mediaType);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
      }
      
      // Ensure authenticated
      const authenticated = await this.isUserAuthenticated();
      if (!authenticated) {
        console.log('🔐 Not authenticated, requesting authentication...');
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed - user must sign in to Google Drive');
        }
      }

      const folderId = await this.getOrCreateHomepageFolder(mediaType);
      console.log('📁 Target folder ID:', folderId);
      
      const uploadedFiles: DriveFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📎 Uploading file ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        try {
          const uploadedFile = await this.uploadFile(file, folderId, onProgress);
          if (uploadedFile) {
            // NEW: Make file public and get public URL
            await this.makeFilePublic(uploadedFile.id);
            uploadedFile.publicUrl = this.getPublicViewUrl(uploadedFile.id);
            
            uploadedFiles.push(uploadedFile);
            console.log(`✅ Successfully uploaded: ${uploadedFile.name}`);
          }
        } catch (error) {
          console.error(`❌ Failed to upload ${file.name}:`, error);
          throw error; // Stop on first error to give user feedback
        }
      }
      
      console.log('🎉 Upload completed:', uploadedFiles.length, 'files uploaded successfully');
      return uploadedFiles;
      
    } catch (error) {
      console.error('❌ Failed to upload homepage media:', error);
      throw error;
    }
  }

  // NEW: Make a file publicly viewable
  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      await window.gapi.client.drive.permissions.create({
        fileId: fileId,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });
      console.log(`🌐 Made file public: ${fileId}`);
    } catch (error) {
      console.warn(`⚠️ Could not make file public: ${fileId}`, error);
      // Don't throw error - file upload was successful, just not public
    }
  }

  // NEW: Get public viewing URL for a file
  private getPublicViewUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }

  // NEW: Browse files in Google Drive folder
  async browseFiles(folderId?: string): Promise<DriveFile[]> {
    try {
      if (!await this.isUserAuthenticated()) {
        throw new Error('Authentication required to browse files');
      }

      // If no folder specified, browse homepage media folders
      if (!folderId) {
        folderId = await this.getOrCreateMainFolder();
      }

      console.log('📂 Browsing Google Drive folder:', folderId);

      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,parents)',
        orderBy: 'modifiedTime desc'
      });

      const files = response.result.files || [];
      
      // Add public URLs for each file
      const filesWithPublicUrls = files.map((file: any) => ({
        ...file,
        publicUrl: this.getPublicViewUrl(file.id),
        size: file.size || '0'
      }));

      console.log('📂 Found', filesWithPublicUrls.length, 'files in folder');
      return filesWithPublicUrls;
      
    } catch (error) {
      console.error('❌ Error browsing files:', error);
      return [];
    }
  }

  // NEW: Get homepage media folders for browsing
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

  private async getOrCreateHomepageFolder(mediaType: string): Promise<string> {
    const folders = await this.getHomepageMediaFolders();
    return folders[mediaType] || folders['gallery_image']; // fallback
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
      if (!this.accessToken) throw new Error('Not authenticated');

      console.log(`📁 Creating folder: ${name}`);
      
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
      if (!this.accessToken) throw new Error('Not authenticated');

      const metadata = {
        name: file.name,
        parents: [parentFolderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
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

        xhr.onerror = () => reject(new Error(`Upload failed: ${xhr.statusText}`));

        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
        xhr.send(form);
      });
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.accessToken) {
        window.google.accounts.oauth2.revoke(this.accessToken, () => {
          console.log('✅ Access token revoked');
        });
      }

      this.isAuthenticated = false;
      this.userInfo = null;
      this.accessToken = null;
      this.tokenExpiresAt = 0;
      
      console.log('✅ Signed out from Google Drive');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }

  // Additional methods (createEventFolder, listFiles) remain the same...
  async createEventFolder(eventName: string, eventId: string): Promise<EventFolder | null> {
    try {
      if (!await this.isUserAuthenticated()) {
        const authenticated = await this.authenticate();
        if (!authenticated) throw new Error('Authentication required');
      }

      const mainFolderId = await this.getOrCreateMainFolder();
      
      let eventsFolder = await this.findFolderByName('Events', mainFolderId);
      if (!eventsFolder) {
        eventsFolder = await this.createFolder('Events', mainFolderId);
      }

      const eventFolderName = `${eventName} (${eventId})`;
      const eventFolder = await this.createFolder(eventFolderName, eventsFolder.id);

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
      if (!await this.isUserAuthenticated()) return [];

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
