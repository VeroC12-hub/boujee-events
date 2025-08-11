# Media Management API Reference

## Overview
The Media Management API provides endpoints for managing media files, Google Drive integration, and organizing event-specific content.

## Services

### GoogleDriveService

#### `googleDriveService.initialize()`
Initializes the Google Drive API connection.

**Returns:** `Promise<boolean>`

**Example:**
```typescript
import { googleDriveService } from '../services/googleDriveService';

const isInitialized = await googleDriveService.initialize();
if (isInitialized) {
  console.log('Google Drive API ready');
}
```

#### `googleDriveService.createEventFolder(eventName: string, eventId: string)`
Creates an organized folder structure for an event.

**Parameters:**
- `eventName`: Display name of the event
- `eventId`: Unique identifier for the event

**Returns:** `Promise<EventFolder>`

**Example:**
```typescript
const eventFolder = await googleDriveService.createEventFolder(
  'Summer Party 2025',
  'event-uuid-123'
);

console.log({
  eventFolderId: eventFolder.eventFolderId,
  photosFolderId: eventFolder.photosFolderId,
  videosUrl: eventFolder.videosUrl
});
```

#### `googleDriveService.uploadFile(file: File, folderId: string, onProgress?: Function)`
Uploads a file to Google Drive with progress tracking.

**Parameters:**
- `file`: File object to upload
- `folderId`: Google Drive folder ID
- `onProgress`: Optional callback for upload progress

**Returns:** `Promise<DriveFile>`

**Example:**
```typescript
const file = document.getElementById('fileInput').files[0];
const uploadedFile = await googleDriveService.uploadFile(
  file,
  eventFolder.photosFolderId,
  (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  }
);
```

#### `googleDriveService.getEventMedia(eventFolderId: string)`
Retrieves all media files for an event.

**Returns:** `Promise<{photos: DriveFile[], videos: DriveFile[]}>`

**Example:**
```typescript
const media = await googleDriveService.getEventMedia(eventFolderId);
console.log(`Found ${media.photos.length} photos and ${media.videos.length} videos`);
```

### MediaService

#### `mediaService.createMediaFile(data: MediaFileData)`
Creates a media file record in the database.

**Parameters:**
- `data`: Media file metadata

**Returns:** `Promise<MediaFile | null>`

**Example:**
```typescript
import { mediaService } from '../services/mediaService';

const mediaFile = await mediaService.createMediaFile({
  name: 'party-photo-1.jpg',
  original_name: 'IMG_001.jpg',
  mime_type: 'image/jpeg',
  file_size: 2048576,
  google_drive_file_id: 'drive-file-id',
  file_type: 'image',
  uploaded_by: userId,
  is_public: true,
  is_archived: false
});
```

#### `mediaService.getEventMedia(eventId: string)`
Gets all media associated with an event.

**Returns:** `Promise<EventMedia[]>`

**Example:**
```typescript
const eventMedia = await mediaService.getEventMedia('event-123');
eventMedia.forEach(item => {
  console.log(`${item.media_file.name} - ${item.is_featured ? 'Featured' : 'Regular'}`);
});
```

#### `mediaService.createHomepageMedia(data: HomepageMediaData)`
Adds media to homepage sections.

**Parameters:**
- `data`: Homepage media configuration

**Returns:** `Promise<HomepageMedia | null>`

**Example:**
```typescript
const homepageMedia = await mediaService.createHomepageMedia({
  media_file_id: mediaFile.id,
  media_type: 'background_video',
  display_order: 1,
  is_active: true,
  title: 'Welcome Video',
  description: 'Homepage background video'
});
```

## Type Definitions

### DriveFile
```typescript
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
```

### EventFolder
```typescript
interface EventFolder {
  eventFolderId: string;
  photosFolderId: string;
  videosFolderId: string;
  eventFolderUrl: string;
  photosUrl: string;
  videosUrl: string;
}
```

### MediaFile
```typescript
interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  file_size?: number;
  google_drive_file_id: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_archived: boolean;
}
```

### EventMedia
```typescript
interface EventMedia {
  id: string;
  event_id: string;
  media_file_id: string;
  display_order: number;
  is_featured: boolean;
  caption?: string;
  media_file?: MediaFile;
}
```

### HomepageMedia
```typescript
interface HomepageMedia {
  id: string;
  media_file_id: string;
  media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  display_order: number;
  is_active: boolean;
  title?: string;
  description?: string;
  link_url?: string;
  media_file?: MediaFile;
}
```

## React Components

### MediaUpload
Drag and drop file upload component with progress tracking.

**Props:**
```typescript
interface MediaUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  className?: string;
}
```

**Usage:**
```tsx
import MediaUpload from '../components/media/MediaUpload';

<MediaUpload
  onFilesSelected={(files) => handleUpload(files)}
  acceptedTypes={['image/*', 'video/*']}
  maxFiles={10}
  maxFileSize={100}
/>
```

### MediaGallery
Grid-based media gallery with preview and management features.

**Props:**
```typescript
interface MediaGalleryProps {
  mediaFiles: MediaFile[];
  onDelete?: (fileId: string) => void;
  onPreview?: (file: MediaFile) => void;
  showActions?: boolean;
  gridCols?: 2 | 3 | 4 | 6;
}
```

**Usage:**
```tsx
import MediaGallery from '../components/media/MediaGallery';

<MediaGallery
  mediaFiles={eventMedia}
  onDelete={handleDelete}
  onPreview={handlePreview}
  gridCols={3}
/>
```

## Usage Examples

### Complete Event Media Upload Flow
```typescript
import { googleDriveService, mediaService } from '../services';

async function uploadEventMedia(eventId: string, eventName: string, files: File[]) {
  try {
    // 1. Initialize Google Drive
    await googleDriveService.initialize();
    
    // 2. Create/get event folder
    const eventFolder = await googleDriveService.createEventFolder(eventName, eventId);
    
    // 3. Upload files
    for (const file of files) {
      // Upload to Google Drive
      const driveFile = await googleDriveService.uploadFile(
        file,
        eventFolder.eventFolderId
      );
      
      // Save metadata to database
      const mediaFile = await mediaService.createMediaFile({
        name: driveFile.name,
        original_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        google_drive_file_id: driveFile.id,
        file_type: file.type.startsWith('image/') ? 'image' : 'video',
        uploaded_by: getCurrentUserId(),
        is_public: true,
        is_archived: false
      });
      
      // Link to event
      await mediaService.createEventMedia({
        event_id: eventId,
        media_file_id: mediaFile.id,
        display_order: 0,
        is_featured: false
      });
    }
    
    console.log('Event media uploaded successfully');
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

### Homepage Media Management
```typescript
async function setHomepageBackgroundVideo(file: File) {
  try {
    // Upload to Google Drive
    const driveFile = await googleDriveService.uploadFile(file, mainFolderId);
    
    // Create media record
    const mediaFile = await mediaService.createMediaFile({
      name: driveFile.name,
      original_name: file.name,
      mime_type: file.type,
      google_drive_file_id: driveFile.id,
      file_type: 'video',
      is_public: true
    });
    
    // Set as homepage background
    await mediaService.createHomepageMedia({
      media_file_id: mediaFile.id,
      media_type: 'background_video',
      display_order: 1,
      is_active: true,
      title: 'Homepage Background'
    });
    
    console.log('Homepage background video updated');
  } catch (error) {
    console.error('Failed to update homepage video:', error);
  }
}
```

## Error Handling

All API functions include comprehensive error handling:

```typescript
try {
  const result = await googleDriveService.uploadFile(file, folderId);
} catch (error) {
  if (error.message.includes('quota')) {
    // Handle quota exceeded
  } else if (error.message.includes('permission')) {
    // Handle permission denied
  } else {
    // Handle other errors
  }
}
```

## Best Practices

1. **Always initialize Google Drive service** before making API calls
2. **Check file sizes** before uploading (respect limits)
3. **Use progress callbacks** for large file uploads
4. **Handle network errors** gracefully
5. **Validate file types** before processing
6. **Use database transactions** for multi-step operations
7. **Clean up temporary files** and object URLs
8. **Implement retry logic** for failed uploads
9. **Cache media metadata** to reduce API calls
10. **Use optimistic updates** for better UX
