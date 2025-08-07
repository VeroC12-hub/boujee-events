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

class MediaService {
  /**
   * Create a new media file record
   */
  async createMediaFile(data: Omit<MediaFile, 'id' | 'created_at' | 'updated_at'>): Promise<MediaFile | null> {
    if (!supabase) {
      console.error('Supabase not configured');
      return null;
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
   * Create event media association
   */
  async createEventMedia(data: Omit<EventMedia, 'id' | 'created_at' | 'updated_at' | 'media_file'>): Promise<EventMedia | null> {
    if (!supabase) return null;

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
   * Get media for an event
   */
  async getEventMedia(eventId: string): Promise<EventMedia[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('event_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('event_id', eventId)
        .order('display_order')
        .order('created_at');

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
   * Get event photos
   */
  async getEventPhotos(eventId: string): Promise<EventMedia[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('event_media')
        .select(`
          *,
          media_file:media_files!inner(*)
        `)
        .eq('event_id', eventId)
        .eq('media_file.file_type', 'image')
        .order('display_order')
        .order('created_at');

      if (error) {
        console.error('Error getting event photos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get event photos:', error);
      return [];
    }
  }

  /**
   * Get event videos
   */
  async getEventVideos(eventId: string): Promise<EventMedia[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('event_media')
        .select(`
          *,
          media_file:media_files!inner(*)
        `)
        .eq('event_id', eventId)
        .eq('media_file.file_type', 'video')
        .order('display_order')
        .order('created_at');

      if (error) {
        console.error('Error getting event videos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get event videos:', error);
      return [];
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
   * Get homepage media by type
   */
  async getHomepageMedia(type?: HomepageMedia['media_type']): Promise<HomepageMedia[]> {
    if (!supabase) return [];

    try {
      let query = supabase
        .from('homepage_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('is_active', true)
        .order('display_order')
        .order('created_at');

      if (type) {
        query = query.eq('media_type', type);
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
   * Get Google Drive folders for an event
   */
  async getEventFolders(eventId: string): Promise<GoogleDriveFolder[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('google_drive_folders')
        .select()
        .eq('event_id', eventId)
        .order('folder_type')
        .order('created_at');

      if (error) {
        console.error('Error getting event folders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get event folders:', error);
      return [];
    }
  }

  /**
   * Update media file
   */
  async updateMediaFile(id: string, updates: Partial<MediaFile>): Promise<MediaFile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('media_files')
        .update(updates)
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
   * Delete media file
   */
  async deleteMediaFile(id: string): Promise<boolean> {
    if (!supabase) return false;

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
   * Archive media file (soft delete)
   */
  async archiveMediaFile(id: string): Promise<boolean> {
    return this.updateMediaFile(id, { is_archived: true }) !== null;
  }

  /**
   * Update event media display order
   */
  async updateEventMediaOrder(eventMediaId: string, displayOrder: number): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('event_media')
        .update({ display_order: displayOrder })
        .eq('id', eventMediaId);

      if (error) {
        console.error('Error updating event media order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update event media order:', error);
      return false;
    }
  }

  /**
   * Update homepage media order
   */
  async updateHomepageMediaOrder(homepageMediaId: string, displayOrder: number): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('homepage_media')
        .update({ display_order: displayOrder })
        .eq('id', homepageMediaId);

      if (error) {
        console.error('Error updating homepage media order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update homepage media order:', error);
      return false;
    }
  }

  /**
   * Toggle homepage media active status
   */
  async toggleHomepageMediaActive(homepageMediaId: string, isActive: boolean): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('homepage_media')
        .update({ is_active: isActive })
        .eq('id', homepageMediaId);

      if (error) {
        console.error('Error toggling homepage media active status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to toggle homepage media active status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mediaService = new MediaService();
export default mediaService;