// src/services/googleDriveService.ts - COMPLETE IMPLEMENTATION WITH PUBLIC FILE FIX
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
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface EventFolder {
  eventFolderId: string;
  photosFolderId: string;
  videosFolderId: string;
  eventFolderUrl: string;
  photosUrl: string;
  videosUrl: string;
  eventName: string;
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
    console.log('🔄 Initializing Google Drive service...');
  }

  // ENHANCED: Better initialization with promise caching
  async initialize(): Promise<boolean> {
    // Return cached initialization promise if exists
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.initialized) return true;

    // Cache the initialization promise
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
        console.log('✅ Google API script loaded');
      }

      // Load Google Identity Services if not loaded
      if (typeof window.google === 'undefined') {
        console.log('📥 Loading Google Identity Services...');
        await this.loadGoogleIdentityScript();
        console.log('✅ Google Identity Services loaded');
      }

      // Initialize GAPI client
      console.log('🔧 Initializing Google API client...');
      await this.initializeGapiClient(apiKey);

      this.gapi = window.gapi;

      // Initialize token client
      console.log('🔑 Initializing OAuth token client...');
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.metadata.readonly'
        ].join(' '),
        callback: '', // Will be set in authenticate method
      });

      this.initialized = true;
      console.log('✅ Google Drive service initialized successfully');

      // Test basic API access
      try {
        await this.testBasicAccess();
        console.log('✅ Basic API access test passed');
      } catch (error) {
        console.warn('⚠️ Basic API access test failed, but service is initialized:', error);
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive service:', error);
      this.initialized = false;
      this.initializationPromise = null; // Clear cache on failure
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
      script.onload = () => {
        console.log('📦 Google API script loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google API script');
        reject(new Error('Failed to load Google API script'));
      };
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
      script.onload = () => {
        console.log('🔐 Google Identity Services loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Identity Services');
        reject(new Error('Failed to load Google Identity Services'));
      };
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
            console.log('🔧 GAPI client initialized successfully');
            resolve();
          } catch (error) {
            console.error('❌ Failed to initialize GAPI client:', error);
            reject(error);
          }
        },
        onerror: (error: any) => {
          console.error('❌ Failed to load GAPI client:', error);
          reject(new Error('Failed to load GAPI client'));
        }
      });
    });
  }

  private async testBasicAccess(): Promise<void> {
    try {
      // Test basic API access without authentication
      const response = await window.gapi.client.request({
        path: 'https://www.googleapis.com/drive/v3/about',
        params: { fields: 'user' }
      });
      console.log('🧪 Basic API test response received');
    } catch (error) {
      // This is expected to fail without authentication
      console.log('🧪 Basic API test completed (authentication required)');
    }
  }

  // FIXED: Enhanced authentication with better error handling
  async authenticate(): Promise<boolean> {
    if (!this.initialized) {
      console.log('🔄 Service not initialized, initializing first...');
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Google Drive service initialization failed');
      }
    }

    if (this.authenticationInProgress) {
      console.log('🔄 Authentication already in progress, please wait...');
      return false;
    }

    try {
      this.authenticationInProgress = true;
      console.log('🔐 Starting Google Drive authentication...');

      return new Promise<boolean>((resolve, reject) => {
        // Set up the callback
        this.tokenClient.callback = async (response: any) => {
          try {
            if (response.error) {
              console.error('❌ OAuth error:', response.error);
              throw new Error(`Authentication failed: ${response.error}`);
            }

            console.log('🔐 Access token received, verifying authentication...');
            
            // Verify authentication by getting user info
            const userInfo = await this.getUserInfo();
            this.currentUser = userInfo;
            this.authenticated = true;
            this.authenticationInProgress = false;

            console.log('👤 Authentication successful for user:', userInfo.displayName || userInfo.name || userInfo.emailAddress);
            resolve(true);
          } catch (error: any) {
            this.authenticationInProgress = false;
            this.authenticated = false;
            this.currentUser = null;
            console.error('❌ Authentication verification failed:', error);
            reject(error);
          }
        };

        // Handle user cancellation
        this.tokenClient.error_callback = (error: any) => {
          this.authenticationInProgress = false;
          console.log('🚫 Authentication cancelled by user:', error);
          resolve(false);
        };

        // Request access token
        console.log('🔑 Requesting access token...');
        this.tokenClient.requestAccessToken({
          prompt: 'consent'
        });
      });

    } catch (error) {
      this.authenticationInProgress = false;
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }

  // FIXED: Better user authentication check with retry logic
  async isUserAuthenticated(): Promise<boolean> {
    if (!this.initialized) {
      console.log('🔄 Service not initialized, checking...');
      try {
        await this.initialize();
      } catch (error) {
        console.error('❌ Initialization failed during auth check:', error);
        return false;
      }
    }
    
    try {
      if (this.authenticated && this.currentUser) {
        // Verify token is still valid by making a test API call
        try {
          await this.gapi.client.drive.about.get({ fields: 'user' });
          console.log('✅ Authentication verified - token is valid');
          return true;
        } catch (error: any) {
          console.warn('⚠️ Token appears to be invalid, clearing authentication:', error.message);
          this.authenticated = false;
          this.currentUser = null;
          return false;
        }
      }
      
      console.log('❌ User not authenticated');
      return false;
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      return false;
    }
  }

  // FIXED: User info with comprehensive error handling
  async getUserInfo(): Promise<any> {
    try {
      if (!this.initialized || !this.gapi) {
        throw new Error('Google Drive service not initialized');
      }

      console.log('👤 Fetching user information...');
      const response = await this.gapi.client.drive.about.get({
        fields: 'user'
      });

      const user = response.result.user;
      console.log('✅ User info retrieved:', user.displayName || user.emailAddress);
      return user;
    } catch (error: any) {
      console.error('❌ Error getting user info:', error);
      if (error.status === 401) {
        throw new Error('Authentication required. Please sign in to Google Drive.');
      }
      throw new Error(`Failed to get user information: ${error.message}`);
    }
  }

  // 🔥 NEW: Make a file publicly accessible - THIS FIXES YOUR MEDIA LOADING ISSUE
  async makeFilePublic(fileId: string): Promise<boolean> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      console.log(`🔓 Making file public: ${fileId}`);
      
      // Create public permission for the file
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
      } else {
        console.error(`❌ Failed to make file public: ${response.status}`);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error making file public:', error);
      throw new Error(`Failed to make file public: ${error.message}`);
    }
  }

  // 🔥 CRITICAL FIX: Enhanced upload with automatic public access
  async uploadFile(
    file: File, 
    folderId: string = 'root', 
    onProgress?: (progress: UploadProgress) => void,
    makePublic: boolean = true // NEW: Auto-make files public
  ): Promise<DriveFile> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive. Please sign in first.');
    }

    try {
      console.log(`⬆️ Starting upload: ${file.name} (${this.formatFileSize(file.size)}) to folder: ${folderId}`);

      // Validate file
      if (!file || file.size === 0) {
        throw new Error('Invalid file: File is empty or corrupted');
      }

      if (file.size > 5 * 1024 * 1024 * 1024) { // 5GB limit
        throw new Error('File too large: Maximum file size is 5GB');
      }

      const metadata = {
        name: file.name,
        parents: folderId && folderId !== 'root' ? [folderId] : undefined
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let lastProgressTime = Date.now();

        // Track upload progress
        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const now = Date.now();
              // Throttle progress updates to every 100ms
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
              
              // 🔥 CRITICAL FIX: Make the file public automatically
              if (makePublic) {
                try {
                  await this.makeFilePublic(result.id);
                  console.log(`🌐 File ${result.id} is now publicly accessible`);
                } catch (publicError) {
                  console.warn(`⚠️ Upload succeeded but failed to make file public:`, publicError);
                  // Don't reject the upload, just warn
                }
              }

              // Create standardized DriveFile object with correct public URLs
              const driveFile: DriveFile = {
                id: result.id,
                name: result.name,
                mimeType: result.mimeType || file.type,
                size: file.size.toString(),
                createdTime: new Date().toISOString(),
                modifiedTime: new Date().toISOString(),
                webViewLink: `https://drive.google.com/file/d/${result.id}/view`,
                // 🔥 CRITICAL: Use the correct public URL format for direct image display
                webContentLink: `https://drive.google.com/uc?export=view&id=${result.id}`,
                thumbnailLink: result.thumbnailLink || (result.mimeType?.startsWith('image/') ? 
                  `https://drive.google.com/thumbnail?id=${result.id}&sz=w400-h300` : undefined),
                parents: result.parents
              };

              // Final progress update
              if (onProgress) {
                onProgress({
                  loaded: file.size,
                  total: file.size,
                  percentage: 100
                });
              }

              resolve(driveFile);
            } catch (parseError) {
              console.error('❌ Failed to parse upload response:', parseError);
              reject(new Error('Upload completed but response parsing failed'));
            }
          } else {
            console.error(`❌ Upload failed with status: ${xhr.status}`);
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

        xhr.onerror = () => {
          console.error('❌ Upload request failed');
          reject(new Error('Network error during upload. Please check your connection and try again.'));
        };

        xhr.ontimeout = () => {
          console.error('❌ Upload timed out');
          reject(new Error('Upload timed out. Please try again with a smaller file or better connection.'));
        };

        // Get current access token
        const accessToken = this.gapi.auth.getToken()?.access_token;
        if (!accessToken) {
          reject(new Error('No access token available. Please re-authenticate.'));
          return;
        }

        // Configure request
        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.timeout = 5 * 60 * 1000; // 5 minute timeout
        
        console.log('🚀 Starting file upload...');
        xhr.send(form);
      });

    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // 🔥 NEW: Batch make files public (for existing files)
  async makeMultipleFilesPublic(fileIds: string[]): Promise<{success: string[], failed: string[]}> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    const success: string[] = [];
    const failed: string[] = [];

    console.log(`🔓 Making ${fileIds.length} files public...`);

    for (const fileId of fileIds) {
      try {
        await this.makeFilePublic(fileId);
        success.push(fileId);
      } catch (error) {
        console.error(`❌ Failed to make file ${fileId} public:`, error);
        failed.push(fileId);
      }
    }

    console.log(`✅ Made ${success.length} files public, ${failed.length} failed`);
    return { success, failed };
  }

  // ENHANCED: List files with comprehensive filtering and error handling
  async listFiles(
    folderId: string = 'root',
    mimeTypeFilter?: string,
    maxResults: number = 1000
  ): Promise<DriveFile[]> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive. Please sign in first.');
    }

    try {
      console.log(`📁 Listing files in folder: ${folderId}${mimeTypeFilter ? ` (filter: ${mimeTypeFilter})` : ''}`);

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
        pageSize: Math.min(maxResults, 1000), // API limit is 1000
        fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents)',
        orderBy: 'modifiedTime desc'
      });

      let files: DriveFile[] = response.result.files || [];
      
      // Handle pagination if needed
      let nextPageToken = response.result.nextPageToken;
      while (nextPageToken && files.length < maxResults) {
        console.log('🔄 Fetching next page of results...');
        
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

      console.log(`✅ Found ${files.length} files in folder ${folderId}`);
      
      // Enhance files with proper public URLs
      const enhancedFiles: DriveFile[] = files.map(file => ({
        ...file,
        webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        // 🔥 CRITICAL: Use correct public URL format for all files
        webContentLink: `https://drive.google.com/uc?export=view&id=${file.id}`,
        thumbnailLink: file.thumbnailLink || (file.mimeType?.startsWith('image/') ? 
          `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h300` : undefined)
      }));

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

  // NEW: Get file details by ID
  async getFileDetails(fileId: string): Promise<DriveFile> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      console.log(`📄 Getting details for file: ${fileId}`);
      
      const response = await this.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents'
      });

      const file = response.result;
      console.log(`✅ File details retrieved: ${file.name}`);

      // Enhance with proper public URLs
      return {
        ...file,
        webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        webContentLink: `https://drive.google.com/uc?export=view&id=${file.id}`,
        thumbnailLink: file.thumbnailLink || (file.mimeType?.startsWith('image/') ? 
          `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h300` : undefined)
      };
    } catch (error: any) {
      console.error('❌ Failed to get file details:', error);
      throw new Error(`Failed to get file details: ${error.message}`);
    }
  }

  // NEW: Create folder with error handling
  async createFolder(name: string, parentId: string = 'root'): Promise<DriveFile> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      console.log(`📂 Creating folder: ${name} in parent: ${parentId}`);

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
      console.log(`✅ Folder created: ${folder.name} (ID: ${folder.id})`);

      return {
        id: folder.id,
        name: folder.name,
        mimeType: folder.mimeType,
        createdTime: folder.createdTime || new Date().toISOString(),
        modifiedTime: folder.modifiedTime || new Date().toISOString(),
        webViewLink: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
        parents: folder.parents
      };
    } catch (error: any) {
      console.error('❌ Failed to create folder:', error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  // NEW: Test connection with comprehensive checks
  async testConnection(): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.log('🧪 Service not initialized, initializing...');
        await this.initialize();
      }

      if (!this.authenticated) {
        console.log('🧪 User not authenticated');
        return false;
      }

      console.log('🧪 Testing Google Drive connection...');
      
      // Test basic API access
      const response = await this.gapi.client.drive.about.get({
        fields: 'user,storageQuota'
      });

      if (response.result && response.result.user) {
        console.log('✅ Connection test successful:', response.result.user.displayName);
        return true;
      }

      console.log('⚠️ Connection test returned unexpected response');
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

  // NEW: Create event folder structure with error handling
  async createEventFolder(eventName: string, eventId: string): Promise<EventFolder> {
    try {
      console.log(`📂 Creating event folder structure for: ${eventName} (${eventId})`);

      // Clean event name for folder creation
      const cleanEventName = eventName.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
      const folderName = `${cleanEventName} (${eventId})`;

      // Create main event folder
      const eventFolder = await this.createFolder(folderName);
      console.log(`✅ Created event folder: ${eventFolder.name}`);
      
      // Create Photos subfolder
      const photosFolder = await this.createFolder('Photos', eventFolder.id);
      console.log(`✅ Created photos folder: ${photosFolder.name}`);
      
      // Create Videos subfolder
      const videosFolder = await this.createFolder('Videos', eventFolder.id);
      console.log(`✅ Created videos folder: ${videosFolder.name}`);

      const result: EventFolder = {
        eventFolderId: eventFolder.id,
        photosFolderId: photosFolder.id,
        videosFolderId: videosFolder.id,
        eventFolderUrl: eventFolder.webViewLink || '',
        photosUrl: photosFolder.webViewLink || '',
        videosUrl: videosFolder.webViewLink || '',
        eventName: cleanEventName
      };

      console.log('✅ Event folder structure created successfully:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Failed to create event folder structure:', error);
      throw new Error(`Failed to create event folder structure: ${error.message}`);
    }
  }

  // NEW: Get event media with categorization
  async getEventMedia(eventFolderId: string): Promise<{photos: DriveFile[], videos: DriveFile[], all: DriveFile[]}> {
    try {
      console.log(`📊 Getting event media for folder: ${eventFolderId}`);
      
      // Get all files in the event folder and subfolders
      const allFiles = await this.listFiles(eventFolderId);
      
      const photos: DriveFile[] = [];
      const videos: DriveFile[] = [];
      const folders: DriveFile[] = [];
      const other: DriveFile[] = [];

      // Categorize files
      for (const file of allFiles) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          folders.push(file);
        } else if (file.mimeType.startsWith('image/')) {
          photos.push(file);
        } else if (file.mimeType.startsWith('video/')) {
          videos.push(file);
        } else {
          other.push(file);
        }
      }

      // Also get files from Photos and Videos subfolders
      for (const folder of folders) {
        if (folder.name.toLowerCase().includes('photo')) {
          const folderPhotos = await this.listFiles(folder.id, 'image/*');
          photos.push(...folderPhotos);
        } else if (folder.name.toLowerCase().includes('video')) {
          const folderVideos = await this.listFiles(folder.id, 'video/*');
          videos.push(...folderVideos);
        }
      }

      console.log(`✅ Found ${photos.length} photos, ${videos.length} videos, ${other.length} other files`);
      
      return { 
        photos: photos.sort((a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()),
        videos: videos.sort((a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()),
        all: [...photos, ...videos, ...other].sort((a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime())
      };
    } catch (error: any) {
      console.error('❌ Failed to get event media:', error);
      throw new Error(`Failed to get event media: ${error.message}`);
    }
  }

  // NEW: Search files across Drive
  async searchFiles(query: string, maxResults: number = 100): Promise<DriveFile[]> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      console.log(`🔍 Searching for files: ${query}`);
      
      const searchQuery = `name contains '${query}' and trashed=false`;
      
      const response = await this.gapi.client.drive.files.list({
        q: searchQuery,
        pageSize: Math.min(maxResults, 1000),
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents)',
        orderBy: 'relevance desc'
      });

      const files: DriveFile[] = response.result.files || [];
      console.log(`✅ Search found ${files.length} files`);

      return files.map(file => ({
        ...file,
        webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        webContentLink: `https://drive.google.com/uc?export=view&id=${file.id}`,
        thumbnailLink: file.thumbnailLink || (file.mimeType?.startsWith('image/') ? 
          `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h300` : undefined)
      }));
    } catch (error: any) {
      console.error('❌ Search failed:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  // UTILITY: Format file size
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // UTILITY: Validate file type
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  }

  // UTILITY: Get file type category
  getFileCategory(mimeType: string): 'image' | 'video' | 'document' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) return 'document';
    return 'other';
  }

  // Getters for service status
  get isInitialized(): boolean {
    return this.initialized;
  }

  get isAuthenticated(): boolean {
    return this.authenticated;
  }

  get currentAuthenticatedUser(): any {
    return this.currentUser;
  }

  get hasValidConnection(): boolean {
    return this.initialized && this.authenticated && this.currentUser;
  }

  // NEW: Sign out method
  async signOut(): Promise<void> {
    try {
      if (this.authenticated && window.google?.accounts?.oauth2) {
        console.log('🚪 Signing out from Google Drive...');
        // Revoke the token
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
      // Clear state anyway
      this.authenticated = false;
      this.currentUser = null;
    }
  }

  // NEW: Get service status
  getServiceStatus(): {
    initialized: boolean;
    authenticated: boolean;
    user: any;
    hasConnection: boolean;
  } {
    return {
      initialized: this.initialized,
      authenticated: this.authenticated,
      user: this.currentUser,
      hasConnection: this.hasValidConnection
    };
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();

// Export types for use in other files
export type { DriveFile, UploadProgress, EventFolder };
