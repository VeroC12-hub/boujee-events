// =====================================================
// GOOGLE DRIVE API SERVICE - COMPLETE
// Save as: src/services/googleDriveService.ts
// =====================================================

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
}

interface EventFolder {
  eventFolderId: string;
  photosFolderId: string;
  videosFolderId: string;
  eventFolderUrl: string;
  photosUrl: string;
  videosUrl: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class GoogleDriveService {
  private apiKey: string;
  private mainFolderId: string; // "Boujee Events Hub" folder
  private eventsFolderId: string | null = null;
  private archiveFolderId: string | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
    this.mainFolderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;
    
    if (!this.apiKey || !this.mainFolderId) {
      throw new Error('Google Drive API credentials not configured');
    }
  }

  // =====================================================
  // INITIALIZATION & SETUP
  // =====================================================

  async initialize(): Promise<void> {
    try {
      // Check if main folder structure exists
      await this.ensureMainFolderStructure();
    } catch (error) {
      console.error('Failed to initialize Google Drive service:', error);
      throw new Error('Google Drive initialization failed');
    }
  }

  private async ensureMainFolderStructure(): Promise<void> {
    // Check if Events and Archives folders exist
    const subfolders = await this.listFolderContents(this.mainFolderId);
    
    const eventsFolder = subfolders.find(f => f.name === 'Events' && f.mimeType === 'application/vnd.google-apps.folder');
    const archiveFolder = subfolders.find(f => f.name === 'Archives' && f.mimeType === 'application/vnd.google-apps.folder');

    if (!eventsFolder) {
      const created = await this.createFolder('Events', this.mainFolderId);
      this.eventsFolderId = created.id;
    } else {
      this.eventsFolderId = eventsFolder.id;
    }

    if (!archiveFolder) {
      const created = await this.createFolder('Archives', this.mainFolderId);
      this.archiveFolderId = created.id;
    } else {
      this.archiveFolderId = archiveFolder.id;
    }
  }

  // =====================================================
  // EVENT FOLDER MANAGEMENT
  // =====================================================

  async createEventFolder(eventName: string, eventId: string): Promise<EventFolder> {
    try {
      if (!this.eventsFolderId) {
        await this.ensureMainFolderStructure();
      }

      // Sanitize event name for folder
      const sanitizedName = this.sanitizeFolderName(eventName);
      const folderName = `${sanitizedName} (${eventId.slice(0, 8)})`;

      // Create main event folder
      const eventFolder = await this.createFolder(folderName, this.eventsFolderId!);
      
      // Create Photos and Videos subfolders
      const photosFolder = await this.createFolder('Photos', eventFolder.id);
      const videosFolder = await this.createFolder('Videos', eventFolder.id);

      // Make folders publicly viewable (important for sharing)
      await this.makeFolderPublic(eventFolder.id);
      await this.makeFolderPublic(photosFolder.id);
      await this.makeFolderPublic(videosFolder.id);

      return {
        eventFolderId: eventFolder.id,
        photosFolderId: photosFolder.id,
        videosFolderId: videosFolder.id,
        eventFolderUrl: `https://drive.google.com/drive/folders/${eventFolder.id}`,
        photosUrl: `https://drive.google.com/drive/folders/${photosFolder.id}`,
        videosUrl: `https://drive.google.com/drive/folders/${videosFolder.id}`
      };
    } catch (error) {
      console.error('Failed to create event folder:', error);
      throw new Error(`Failed to create folder for event: ${eventName}`);
    }
  }

  private async createFolder(name: string, parentId: string): Promise<DriveFile> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create folder: ${response.statusText}`);
    }

    return await response.json();
  }

  private async makeFolderPublic(folderId: string): Promise<void> {
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      });
    } catch (error) {
      console.warn('Failed to make folder public:', error);
      // Don't throw - this is not critical
    }
  }

  // =====================================================
  // MEDIA UPLOAD & MANAGEMENT
  // =====================================================

  async uploadFile(
    file: File, 
    folderId: string, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DriveFile> {
    try {
      // Determine correct folder based on file type
      const targetFolderId = await this.determineTargetFolder(file, folderId);
      
      // Create multipart upload
      const metadata = {
        name: file.name,
        parents: [targetFolderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (onProgress && e.lengthComputable) {
            const progress: UploadProgress = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100)
            };
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed: Network error'));
        });

        xhr.open('POST', `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${this.apiKey}`);
        xhr.send(form);
      });
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error(`Failed to upload ${file.name}`);
    }
  }

  private async determineTargetFolder(file: File, eventFolderId: string): Promise<string> {
    // Get subfolders of the event folder
    const subfolders = await this.listFolderContents(eventFolderId);
    
    const photosFolder = subfolders.find(f => f.name === 'Photos');
    const videosFolder = subfolders.find(f => f.name === 'Videos');

    if (file.type.startsWith('image/')) {
      return photosFolder?.id || eventFolderId;
    } else if (file.type.startsWith('video/')) {
      return videosFolder?.id || eventFolderId;
    } else {
      return eventFolderId; // Default to main event folder
    }
  }

  async uploadMultipleFiles(
    files: File[], 
    folderId: string,
    onProgress?: (progress: UploadProgress) => void,
    onFileComplete?: (fileName: string, result: DriveFile) => void
  ): Promise<DriveFile[]> {
    const results: DriveFile[] = [];
    let totalUploaded = 0;

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, folderId, (fileProgress) => {
          if (onProgress) {
            const overallProgress: UploadProgress = {
              loaded: totalUploaded + fileProgress.loaded,
              total: files.reduce((sum, f) => sum + f.size, 0),
              percentage: Math.round(((totalUploaded + fileProgress.loaded) / files.reduce((sum, f) => sum + f.size, 0)) * 100)
            };
            onProgress(overallProgress);
          }
        });

        results.push(result);
        totalUploaded += file.size;
        
        if (onFileComplete) {
          onFileComplete(file.name, result);
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error;
      }
    }

    return results;
  }

  // =====================================================
  // FOLDER & FILE BROWSING
  // =====================================================

  async listFolderContents(folderId: string): Promise<DriveFile[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?` +
        `q='${folderId}'+in+parents&` +
        `key=${this.apiKey}&` +
        `fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)&` +
        `orderBy=name`
      );

      if (!response.ok) {
        throw new Error(`Failed to list folder contents: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Failed to list folder contents:', error);
      throw error;
    }
  }

  async getEventMedia(eventFolderId: string): Promise<{photos: DriveFile[], videos: DriveFile[]}> {
    try {
      const contents = await this.listFolderContents(eventFolderId);
      
      const photosFolder = contents.find(f => f.name === 'Photos' && f.mimeType === 'application/vnd.google-apps.folder');
      const videosFolder = contents.find(f => f.name === 'Videos' && f.mimeType === 'application/vnd.google-apps.folder');

      const photos = photosFolder ? await this.listFolderContents(photosFolder.id) : [];
      const videos = videosFolder ? await this.listFolderContents(videosFolder.id) : [];

      return {
        photos: photos.filter(f => f.mimeType.startsWith('image/')),
        videos: videos.filter(f => f.mimeType.startsWith('video/'))
      };
    } catch (error) {
      console.error('Failed to get event media:', error);
      return { photos: [], videos: [] };
    }
  }

  // =====================================================
  // FILE OPERATIONS
  // =====================================================

  async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?key=${this.apiKey}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  async getFileInfo(fileId: string): Promise<DriveFile> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?` +
        `key=${this.apiKey}&` +
        `fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink`
      );

      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw error;
    }
  }

  // =====================================================
  // ARCHIVE & CLEANUP
  // =====================================================

  async archiveEventFolder(eventFolderId: string): Promise<void> {
    try {
      if (!this.archiveFolderId) {
        await this.ensureMainFolderStructure();
      }

      // Move folder to archives
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${eventFolderId}?key=${this.apiKey}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parents: [this.archiveFolderId]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to archive event folder: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to archive event folder:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  private sanitizeFolderName(name: string): string {
    // Remove or replace invalid characters for Google Drive folder names
    return name
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100); // Limit length
  }

  getPublicUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  getThumbnailUrl(fileId: string, size: number = 400): string {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`;
  }

  getDirectDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // =====================================================
  // ERROR HANDLING & VALIDATION
  // =====================================================

  validateApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  validateFolderId(): boolean {
    return Boolean(this.mainFolderId && this.mainFolderId.length > 10);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${this.mainFolderId}?key=${this.apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// =====================================================
// EXPORT & SINGLETON PATTERN
// =====================================================

let instance: GoogleDriveService | null = null;

export const createGoogleDriveService = (): GoogleDriveService => {
  if (!instance) {
    instance = new GoogleDriveService();
  }
  return instance;
};

export const googleDriveService = createGoogleDriveService();

// Type exports
export type { DriveFile, EventFolder, UploadProgress };

// =====================================================
// USAGE EXAMPLE:
// 
// import { googleDriveService } from '../services/googleDriveService';
// 
// // Initialize service
// await googleDriveService.initialize();
// 
// // Create event folder
// const eventFolder = await googleDriveService.createEventFolder('Summer Party 2025', 'event-uuid');
// 
// // Upload files
// const uploadedFile = await googleDriveService.uploadFile(file, eventFolder.eventFolderId);
// 
// // Get event media
// const media = await googleDriveService.getEventMedia(eventFolder.eventFolderId);
// =====================================================
