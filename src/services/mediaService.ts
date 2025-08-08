// src/services/mediaService.ts
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  file_size?: number;
  google_drive_file_id: string;
  google_drive_folder_id?: string;
  thumbnail_url?: string;
  download_url?: string;
  web_view_link?: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_archived: boolean;
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

export interface GoogleDriveFolder {
  id: string;
  event_id?: string;
  folder_name: string;
  google_drive_folder_id: string;
  parent_folder_id?: string;
  folder_type: 'main' | 'event' | 'photos' | 'videos' | 'archive';
  web_view_link?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadStats {
  totalFiles: number;
  totalSize: number;
  recentUploads: MediaFile[];
  storageUsed: number;
  filesByType: {
    images: number;
    videos: number;
    documents: number;
    other: number;
  };
}

class MediaService {
  /**
   * Create a new media file record
   */
  async createMediaFile(data: Omit<MediaFile, 'id' | 'created_at' | 'updated_at'>): Promise<MediaFile | null> {
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, using mock data');
      return {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data
      };
    }

    try {
      const { data: result, error } = await supabase
        .from('media_files')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating media file:', error);
        return null;
      }

      return result;
    } catch (error) {
      console.error('Failed to create media file:', error);
      return null;
    }
  }

  /**
   * Get media file by ID
   */
  async getMediaFile(id: string): Promise<MediaFile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('media_files')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error getting media file:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get media file:', error);
      return null;
    }
  }

  /**
   * Get media file by Google Drive file ID
   */
  async getMediaFileByDriveId(driveFileId: string): Promise<MediaFile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('media_files')
        .select()
        .eq('google_drive_file_id', driveFileId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error getting media file:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get media file:', error);
      return null;
    }
  }

  /**
   * Get all media files for a user
   */
  async getUserMediaFiles(userId?: string): Promise<MediaFile[]> {
    if (!supabase) return [];

    try {
      let query = supabase
        .from('media_files')
        .select()
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('uploaded_by', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting user media files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user media files:', error);
      return [];
    }
  }

  /**
   * Create event media relationship
   */
  async createEventMedia(data: Omit<EventMedia, 'id' | 'created_at' | 'updated_at' | 'media_file'>): Promise<EventMedia | null> {
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, using mock data');
      return {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data
      };
    }

    try {
      const { data: result, error } = await supabase
        .from('event_media')
        .insert(data)
        .select(`
          *,
          media_file:media_files(*)
        `)
        .single();

      if (error) {
        console.error('Error creating event media:', error);
        return null;
      }

      return result;
    } catch (error) {
      console.error('Failed to create event media:', error);
      return null;
    }
  }

  /**
   * Get event media files
   */
  async getEventMedia(eventId: string): Promise<EventMedia[]> {
    if (!supabase) {
      // Return mock data for development
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('event_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error getting event media:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get event media:', error);
      return [];
    }
  }

  /**
   * Update event media
   */
  async updateEventMedia(id: string, updates: Partial<EventMedia>): Promise<EventMedia | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('event_media')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          media_file:media_files(*)
        `)
        .single();

      if (error) {
        console.error('Error updating event media:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to update event media:', error);
      return null;
    }
  }

  /**
   * Create homepage media
   */
  async createHomepageMedia(data: Omit<HomepageMedia, 'id' | 'created_at' | 'updated_at' | 'media_file'>): Promise<HomepageMedia | null> {
    if (!supabase) return null;

    try {
      const { data: result, error } = await supabase
        .from('homepage_media')
        .insert(data)
        .select(`
          *,
          media_file:media_files(*)
        `)
        .single();

      if (error) {
        console.error('Error creating homepage media:', error);
        return null;
      }

      return result;
    } catch (error) {
      console.error('Failed to create homepage media:', error);
      return null;
    }
  }

  /**
   * Get homepage media
   */
  async getHomepageMedia(mediaType?: HomepageMedia['media_type']): Promise<HomepageMedia[]> {
    if (!supabase) return [];

    try {
      let query = supabase
        .from('homepage_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (mediaType) {
        query = query.eq('media_type', mediaType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting homepage media:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get homepage media:', error);
      return [];
    }
  }

  /**
   * Update homepage media
   */
  async updateHomepageMedia(id: string, updates: Partial<HomepageMedia>): Promise<HomepageMedia | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('homepage_media')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          media_file:media_files(*)
        `)
        .single();

      if (error) {
        console.error('Error updating homepage media:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to update homepage media:', error);
      return null;
    }
  }

  /**
   * Delete media file
   */
  async deleteMediaFile(id: string): Promise<boolean> {
    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting media file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete media file:', error);
      return false;
    }
  }

  /**
   * Archive media file instead of deleting
   */
  async archiveMediaFile(id: string): Promise<boolean> {
    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from('media_files')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error archiving media file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to archive media file:', error);
      return false;
    }
  }

  /**
   * Create Google Drive folder record
   */
  async createGoogleDriveFolder(data: Omit<GoogleDriveFolder, 'id' | 'created_at' | 'updated_at'>): Promise<GoogleDriveFolder | null> {
    if (!supabase) return null;

    try {
      const { data: result, error } = await supabase
        .from('google_drive_folders')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating Google Drive folder:', error);
        return null;
      }

      return result;
    } catch (error) {
      console.error('Failed to create Google Drive folder:', error);
      return null;
    }
  }

  /**
   * Get Google Drive folders for event
   */
  async getEventDriveFolders(eventId: string): Promise<GoogleDriveFolder[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('google_drive_folders')
        .select()
        .eq('event_id', eventId);

      if (error) {
        console.error('Error getting event drive folders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get event drive folders:', error);
      return [];
    }
  }

  /**
   * Get upload statistics
   */
  async getUploadStats(userId?: string): Promise<UploadStats> {
    if (!supabase) {
      // Return mock data for development
      return {
        totalFiles: 42,
        totalSize: 1024 * 1024 * 150, // 150MB
        recentUploads: [],
        storageUsed: 1024 * 1024 * 75, // 75MB
        filesByType: {
          images: 35,
          videos: 5,
          documents: 2,
          other: 0
        }
      };
    }

    try {
      let query = supabase
        .from('media_files')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('uploaded_by', userId);
      }

      const { data: files, error } = await query;

      if (error) {
        console.error('Error getting upload stats:', error);
        return { 
          totalFiles: 0, 
          totalSize: 0, 
          recentUploads: [], 
          storageUsed: 0,
          filesByType: { images: 0, videos: 0, documents: 0, other: 0 }
        };
      }

      const totalFiles = files?.length || 0;
      const totalSize = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
      const recentUploads = files?.slice(0, 5) || [];

      // Count files by type
      const filesByType = files?.reduce((acc, file) => {
        if (file.file_type === 'image') acc.images++;
        else if (file.file_type === 'video') acc.videos++;
        else if (file.file_type === 'document') acc.documents++;
        else acc.other++;
        return acc;
      }, { images: 0, videos: 0, documents: 0, other: 0 }) || { images: 0, videos: 0, documents: 0, other: 0 };

      return {
        totalFiles,
        totalSize,
        recentUploads,
        storageUsed: totalSize,
        filesByType
      };
    } catch (error) {
      console.error('Failed to get upload stats:', error);
      return { 
        totalFiles: 0, 
        totalSize: 0, 
        recentUploads: [], 
        storageUsed: 0,
        filesByType: { images: 0, videos: 0, documents: 0, other: 0 }
      };
    }
  }

  /**
   * Search media files
   */
  async searchMediaFiles(query: string, filters?: {
    fileType?: 'image' | 'video' | 'document' | 'other';
    eventId?: string;
    isPublic?: boolean;
    userId?: string;
  }): Promise<MediaFile[]> {
    if (!supabase) return [];

    try {
      let dbQuery = supabase
        .from('media_files')
        .select('*')
        .or(`name.ilike.%${query}%,original_name.ilike.%${query}%`)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (filters?.fileType) {
        dbQuery = dbQuery.eq('file_type', filters.fileType);
      }

      if (filters?.isPublic !== undefined) {
        dbQuery = dbQuery.eq('is_public', filters.isPublic);
      }

      if (filters?.userId) {
        dbQuery = dbQuery.eq('uploaded_by', filters.userId);
      }

      const { data, error } = await dbQuery;

      if (error) {
        console.error('Error searching media files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to search media files:', error);
      return [];
    }
  }

  /**
   * Update media file metadata
   */
  async updateMediaFile(id: string, updates: Partial<MediaFile>): Promise<MediaFile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('media_files')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating media file:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to update media file:', error);
      return null;
    }
  }

  /**
   * Get media files by type
   */
  async getMediaFilesByType(fileType: MediaFile['file_type'], limit?: number): Promise<MediaFile[]> {
    if (!supabase) return [];

    try {
      let query = supabase
        .from('media_files')
        .select('*')
        .eq('file_type', fileType)
        .eq('is_archived', false)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting media files by type:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get media files by type:', error);
      return [];
    }
  }

  /**
   * Get featured media for events
   */
  async getFeaturedEventMedia(eventId: string): Promise<EventMedia[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('event_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('event_id', eventId)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error getting featured event media:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get featured event media:', error);
      return [];
    }
  }

  /**
   * Batch update display order for event media
   */
  async updateEventMediaOrder(updates: { id: string; display_order: number }[]): Promise<boolean> {
    if (!supabase) return true;

    try {
      const promises = updates.map(update =>
        supabase
          .from('event_media')
          .update({ display_order: update.display_order, updated_at: new Date().toISOString() })
          .eq('id', update.id)
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Failed to update event media order:', error);
      return false;
    }
  }

  /**
   * Batch update display order for homepage media
   */
  async updateHomepageMediaOrder(updates: { id: string; display_order: number }[]): Promise<boolean> {
    if (!supabase) return true;

    try {
      const promises = updates.map(update =>
        supabase
          .from('homepage_media')
          .update({ display_order: update.display_order, updated_at: new Date().toISOString() })
          .eq('id', update.id)
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Failed to update homepage media order:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mediaService = new MediaService();
export default mediaService;
