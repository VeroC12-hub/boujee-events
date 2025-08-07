// File: src/data/images.ts
// Production-ready media management - no demo content

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  size?: number;
  uploadedAt: string;
  eventId?: string;
  driveFileId?: string;
}

export interface EventMedia {
  eventId: string;
  photos: MediaFile[];
  videos: MediaFile[];
  folders: {
    mainFolderId?: string;
    photosFolderId?: string;
    videosFolderId?: string;
  };
}

// Empty initial state - will be populated from Google Drive
export const eventMediaStore: Record<string, EventMedia> = {};
