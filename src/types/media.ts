// Media Management Types

export interface MediaFile {
  id?: string;
  name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  google_drive_file_id: string;
  file_type: 'video' | 'image' | 'document' | 'other';
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_archived: boolean;
  tags?: string[];
  description?: string;
  alt_text?: string;
  web_view_link?: string;
  web_content_link?: string;
  thumbnail_link?: string;
  download_url?: string;
}

export interface CreateMediaFileRequest {
  name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  google_drive_file_id: string;
  file_type: 'video' | 'image' | 'document' | 'other';
  uploaded_by?: string;
  is_public: boolean;
  is_archived?: boolean;
  tags?: string[];
  description?: string;
  alt_text?: string;
  web_view_link?: string;
  web_content_link?: string;
  thumbnail_link?: string;
}

export interface UpdateMediaFileRequest {
  name?: string;
  is_public?: boolean;
  is_archived?: boolean;
  tags?: string[];
  description?: string;
  alt_text?: string;
}

export interface EventMedia {
  id: string;
  event_id: string;
  media_file_id: string;
  display_order: number;
  is_featured: boolean;
  caption?: string;
  created_at: string;
  updated_at: string;
  media_file?: MediaFile;
}

export interface CreateEventMediaRequest {
  event_id: string;
  media_file_id: string;
  display_order?: number;
  is_featured?: boolean;
  caption?: string;
}

export interface HomepageMedia {
  id: string;
  media_file_id: string;
  media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  display_order: number;
  is_active: boolean;
  title?: string;
  description?: string;
  link_url?: string;
  created_at: string;
  updated_at: string;
  media_file?: MediaFile;
}

export interface CreateHomepageMediaRequest {
  media_file_id: string;
  media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  display_order?: number;
  is_active?: boolean;
  title?: string;
  description?: string;
  link_url?: string;
}

export interface MediaGallery {
  id: string;
  name: string;
  description?: string;
  event_id?: string;
  user_id?: string;
  is_public: boolean;
  is_featured: boolean;
  cover_media_id?: string;
  media_count: number;
  created_at: string;
  updated_at: string;
  media_files?: MediaFile[];
  cover_media?: MediaFile;
}

export interface CreateMediaGalleryRequest {
  name: string;
  description?: string;
  event_id?: string;
  user_id?: string;
  is_public?: boolean;
  is_featured?: boolean;
  cover_media_id?: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parent_folder_id?: string;
  google_drive_folder_id: string;
  event_id?: string;
  folder_type: 'event' | 'user' | 'system' | 'archive';
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  media_count?: number;
  subfolders?: MediaFolder[];
  media_files?: MediaFile[];
}

export interface CreateMediaFolderRequest {
  name: string;
  parent_folder_id?: string;
  google_drive_folder_id: string;
  event_id?: string;
  folder_type?: 'event' | 'user' | 'system' | 'archive';
  is_public?: boolean;
  created_by?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

export interface MediaUploadOptions {
  folderId?: string;
  eventId?: string;
  isPublic?: boolean;
  tags?: string[];
  description?: string;
  onProgress?: (progress: UploadProgress) => void;
}

export interface BulkUploadResult {
  successful: {
    file: File;
    mediaFile: MediaFile;
  }[];
  failed: {
    file: File;
    error: string;
  }[];
  totalFiles: number;
  successCount: number;
  failureCount: number;
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  filesByType: {
    [type: string]: number;
  };
  sizeByType: {
    [type: string]: number;
  };
  recentUploads: MediaFile[];
  popularFiles: MediaFile[];
  storageUsed: number;
  storageLimit: number;
}

export interface MediaSearchFilters {
  fileType?: 'video' | 'image' | 'document' | 'other';
  isPublic?: boolean;
  isArchived?: boolean;
  eventId?: string;
  uploadedBy?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  sizeMin?: number;
  sizeMax?: number;
}

export interface MediaSearchResult {
  mediaFiles: MediaFile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: MediaSearchFilters;
}

// Media processing types
export interface MediaProcessingJob {
  id: string;
  media_file_id: string;
  job_type: 'thumbnail' | 'compression' | 'format_conversion' | 'metadata_extraction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error_message?: string;
  result_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface MediaMetadata {
  id: string;
  media_file_id: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  codec?: string;
  bitrate?: number;
  frame_rate?: number;
  color_space?: string;
  has_audio?: boolean;
  audio_codec?: string;
  audio_bitrate?: number;
  sample_rate?: number;
  camera_make?: string;
  camera_model?: string;
  date_taken?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  iso?: number;
  aperture?: number;
  shutter_speed?: string;
  focal_length?: number;
  extracted_at: string;
}

// Permission types
export interface MediaPermission {
  id: string;
  media_file_id: string;
  user_id?: string;
  role?: string;
  permission_type: 'view' | 'download' | 'edit' | 'delete' | 'share';
  granted_by: string;
  expires_at?: string;
  created_at: string;
}

export interface CreateMediaPermissionRequest {
  media_file_id: string;
  user_id?: string;
  role?: string;
  permission_type: 'view' | 'download' | 'edit' | 'delete' | 'share';
  expires_at?: string;
}

// CDN and optimization types
export interface MediaVariant {
  id: string;
  media_file_id: string;
  variant_type: 'thumbnail' | 'small' | 'medium' | 'large' | 'compressed';
  width?: number;
  height?: number;
  file_size: number;
  url: string;
  format: string;
  quality?: number;
  created_at: string;
}

export interface CreateMediaVariantRequest {
  media_file_id: string;
  variant_type: 'thumbnail' | 'small' | 'medium' | 'large' | 'compressed';
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}

// Utility types
export type MediaFileType = 'video' | 'image' | 'document' | 'other';
export type MediaFolderType = 'event' | 'user' | 'system' | 'archive';
export type HomepageMediaType = 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
export type ProcessingJobType = 'thumbnail' | 'compression' | 'format_conversion' | 'metadata_extraction';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PermissionType = 'view' | 'download' | 'edit' | 'delete' | 'share';
export type VariantType = 'thumbnail' | 'small' | 'medium' | 'large' | 'compressed';

// Helper functions
export const getFileTypeFromMimeType = (mimeType: string): MediaFileType => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'other';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

export const getMediaIcon = (fileType: MediaFileType): string => {
  switch (fileType) {
    case 'image': return '🖼️';
    case 'video': return '🎬';
    case 'document': return '📄';
    default: return '📁';
  }
};
