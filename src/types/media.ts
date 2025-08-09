// Media Types
export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  google_drive_file_id: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  is_public: boolean;
  is_archived: boolean;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  description?: string;
  thumbnail_url?: string;
  preview_url?: string;
  download_url?: string;
  web_view_link: string;
}

export interface MediaUploadOptions {
  description?: string;
  tags?: string[];
  is_public?: boolean;
  event_id?: string;
}

export interface MediaUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface MediaFilter {
  file_type?: 'image' | 'video' | 'document' | 'other';
  is_public?: boolean;
  is_archived?: boolean;
  event_id?: string;
  uploaded_from?: string;
  uploaded_to?: string;
  search?: string;
  tags?: string[];
}

export interface MediaStats {
  total_files: number;
  total_size: number;
  by_type: {
    image: number;
    video: number;
    document: number;
    other: number;
  };
  by_event: {
    [event_id: string]: number;
  };
  recent_uploads: number;
}

export interface MediaGalleryItem extends MediaFile {
  url: string;
  thumbnail: string;
  alt: string;
  caption?: string;
}

export interface CreateMediaFileRequest {
  name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  google_drive_file_id: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  is_public?: boolean;
  uploaded_by: string;
  tags?: string[];
  description?: string;
  thumbnail_url?: string;
  preview_url?: string;
  download_url?: string;
}

export interface UpdateMediaFileRequest {
  name?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  is_archived?: boolean;
}