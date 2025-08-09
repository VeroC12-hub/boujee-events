// File: src/services/mediaService.ts
import { supabase } from '../lib/supabase';
import type { 
  MediaFile, 
  MediaFileInsert, 
  MediaFileUpdate,
  EventMedia,
  EventMediaInsert,
  HomepageMedia,
  HomepageMediaInsert 
} from '../types/database';

// Re-export types for components that need them
export type { 
  MediaFile, 
  MediaFileInsert, 
  MediaFileUpdate,
  EventMedia,
  EventMediaInsert,
  HomepageMedia,
  HomepageMediaInsert 
};

export interface MediaUploadResult {
  mediaFile: MediaFile;
  driveFile?: any;
}

export interface EventMediaData extends Omit<EventMediaInsert, 'id' | 'created_at' | 'updated_at'> {}

export interface HomepageMediaData extends Omit<HomepageMediaInsert, 'id' | 'created_at' | 'updated_at'> {}

// Upload progress interface for proper typing
export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

class MediaService {
  private static instance: MediaService;

  private constructor() {}

  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  // Media File Management
  async createMediaFile(data: Omit<MediaFileInsert, 'id' | 'created_at' | 'updated_at'>): Promise<MediaFile | null> {
    try {
      if (!supabase) {
        // Mock creation when Supabase is not available
        const mockMediaFile: MediaFile = {
          id: `media_${Date.now()}`,
          name: data.name,
          original_name: data.original_name,
          mime_type: data.mime_type,
          file_size: data.file_size,
          google_drive_file_id: data.google_drive_file_id,
          file_type: data.file_type,
          is_public: data.is_public || true,
          is_archived: data.is_archived || false,
          uploaded_by: data.uploaded_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: data.tags,
          description: data.description,
          thumbnail_url: data.thumbnail_url,
          preview_url: data.preview_url,
          download_url: data.download_url
        };
        return mockMediaFile;
      }

      const { data: mediaFile, error } = await supabase
        .from('media_files')
        .insert([{
          ...data,
          is_archived: data.is_archived || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating media file:', error);
        throw error;
      }

      return mediaFile;
    } catch (error) {
      console.error('Error in createMediaFile:', error);
      return null;
    }
  }

  async updateMediaFile(id: string, updates: MediaFileUpdate): Promise<MediaFile | null> {
    try {
      if (!supabase) {
        // Mock update
        return {
          id,
          ...updates,
          updated_at: new Date().toISOString()
        } as MediaFile;
      }

      const { data: mediaFile, error } = await supabase
        .from('media_files')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating media file:', error);
        throw error;
      }

      return mediaFile;
    } catch (error) {
      console.error('Error in updateMediaFile:', error);
      return null;
    }
  }

  async deleteMediaFile(id: string): Promise<boolean> {
    try {
      if (!supabase) {
        return true; // Mock success
      }

      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting media file:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMediaFile:', error);
      return false;
    }
  }

  async getMediaFile(id: string): Promise<MediaFile | null> {
    try {
      if (!supabase) {
        return null; // Mock not found
      }

      const { data: mediaFile, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching media file:', error);
        return null;
      }

      return mediaFile;
    } catch (error) {
      console.error('Error in getMediaFile:', error);
      return null;
    }
  }

  async getMediaFiles(filters?: {
    file_type?: string;
    is_public?: boolean;
    is_archived?: boolean;
    uploaded_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<MediaFile[]> {
    try {
      if (!supabase) {
        return []; // Mock empty array
      }

      let query = supabase
        .from('media_files')
        .select('*');

      // Apply filters
      if (filters?.file_type) {
        query = query.eq('file_type', filters.file_type);
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }
      if (filters?.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived);
      }
      if (filters?.uploaded_by) {
        query = query.eq('uploaded_by', filters.uploaded_by);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      query = query.order('created_at', { ascending: false });

      const { data: mediaFiles, error } = await query;

      if (error) {
        console.error('Error fetching media files:', error);
        throw error;
      }

      return mediaFiles || [];
    } catch (error) {
      console.error('Error in getMediaFiles:', error);
      return [];
    }
  }

  // Event Media Management
  async createEventMedia(data: EventMediaData): Promise<EventMedia | null> {
    try {
      if (!supabase) {
        // Mock creation
        const mockEventMedia: EventMedia = {
          id: `event_media_${Date.now()}`,
          event_id: data.event_id,
          media_file_id: data.media_file_id,
          display_order: data.display_order || 0,
          is_featured: data.is_featured || false,
          caption: data.caption,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return mockEventMedia;
      }

      const { data: eventMedia, error } = await supabase
        .from('event_media')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating event media:', error);
        throw error;
      }

      return eventMedia;
    } catch (error) {
      console.error('Error in createEventMedia:', error);
      return null;
    }
  }

  async getEventMedia(eventId: string): Promise<(EventMedia & { media_file?: MediaFile })[]> {
    try {
      if (!supabase) {
        return []; // Mock empty array
      }

      const { data: eventMedia, error } = await supabase
        .from('event_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('event_id', eventId)
        .order('display_order');

      if (error) {
        console.error('Error fetching event media:', error);
        throw error;
      }

      return eventMedia || [];
    } catch (error) {
      console.error('Error in getEventMedia:', error);
      return [];
    }
  }

  async updateEventMedia(id: string, updates: Partial<EventMedia>): Promise<EventMedia | null> {
    try {
      if (!supabase) {
        return {
          id,
          ...updates,
          updated_at: new Date().toISOString()
        } as EventMedia;
      }

      const { data: eventMedia, error } = await supabase
        .from('event_media')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event media:', error);
        throw error;
      }

      return eventMedia;
    } catch (error) {
      console.error('Error in updateEventMedia:', error);
      return null;
    }
  }

  async deleteEventMedia(id: string): Promise<boolean> {
    try {
      if (!supabase) {
        return true; // Mock success
      }

      const { error } = await supabase
        .from('event_media')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting event media:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteEventMedia:', error);
      return false;
    }
  }

  // Homepage Media Management
  async createHomepageMedia(data: HomepageMediaData): Promise<HomepageMedia | null> {
    try {
      if (!supabase) {
        // Mock creation
        const mockHomepageMedia: HomepageMedia = {
          id: `homepage_media_${Date.now()}`,
          media_file_id: data.media_file_id,
          media_type: data.media_type,
          display_order: data.display_order || 0,
          is_active: data.is_active !== undefined ? data.is_active : true,
          title: data.title,
          description: data.description,
          link_url: data.link_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return mockHomepageMedia;
      }

      const { data: homepageMedia, error } = await supabase
        .from('homepage_media')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating homepage media:', error);
        throw error;
      }

      return homepageMedia;
    } catch (error) {
      console.error('Error in createHomepageMedia:', error);
      return null;
    }
  }

  async getHomepageMedia(mediaType?: string): Promise<(HomepageMedia & { media_file?: MediaFile })[]> {
    try {
      if (!supabase) {
        return []; // Mock empty array
      }

      let query = supabase
        .from('homepage_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('is_active', true);

      if (mediaType) {
        query = query.eq('media_type', mediaType);
      }

      query = query.order('display_order');

      const { data: homepageMedia, error } = await query;

      if (error) {
        console.error('Error fetching homepage media:', error);
        throw error;
      }

      return homepageMedia || [];
    } catch (error) {
      console.error('Error in getHomepageMedia:', error);
      return [];
    }
  }

  async updateHomepageMedia(id: string, updates: Partial<HomepageMedia>): Promise<HomepageMedia | null> {
    try {
      if (!supabase) {
        return {
          id,
          ...updates,
          updated_at: new Date().toISOString()
        } as HomepageMedia;
      }

      const { data: homepageMedia, error } = await supabase
        .from('homepage_media')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating homepage media:', error);
        throw error;
      }

      return homepageMedia;
    } catch (error) {
      console.error('Error in updateHomepageMedia:', error);
      return null;
    }
  }

  async deleteHomepageMedia(id: string): Promise<boolean> {
    try {
      if (!supabase) {
        return true; // Mock success
      }

      const { error } = await supabase
        .from('homepage_media')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting homepage media:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteHomepageMedia:', error);
      return false;
    }
  }

  // Upload method with proper progress typing
  async uploadWithProgress(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaUploadResult | null> {
    try {
      // Simulate upload progress for now
      if (onProgress) {
        const simulateProgress = () => {
          let loaded = 0;
          const total = file.size;
          
          const interval = setInterval(() => {
            loaded += total * 0.1; // 10% increments
            const percentage = Math.min((loaded / total) * 100, 100);
            
            onProgress({
              percentage,
              loaded: Math.min(loaded, total),
              total
            });
            
            if (percentage >= 100) {
              clearInterval(interval);
            }
          }, 100);
        };
        
        simulateProgress();
      }

      // Create media file record
      const mediaFile = await this.createMediaFile({
        name: file.name,
        original_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        google_drive_file_id: 'mock-drive-id', // This would be set from actual Google Drive upload
        file_type: file.type.startsWith('image/') ? 'image' : 'document',
        is_public: true,
        uploaded_by: 'current-user-id' // Replace with actual user ID
      });

      if (!mediaFile) {
        throw new Error('Failed to create media file record');
      }

      return {
        mediaFile,
        driveFile: null // Would be populated with actual Google Drive integration
      };
    } catch (error) {
      console.error('Error in uploadWithProgress:', error);
      return null;
    }
  }

  // Utility Methods
  async getMediaStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    fileTypes: Record<string, number>;
    recentUploads: number;
  }> {
    try {
      if (!supabase) {
        // Mock stats
        return {
          totalFiles: 150,
          totalSize: 2048576000, // 2GB
          fileTypes: {
            image: 120,
            video: 25,
            document: 5
          },
          recentUploads: 12
        };
      }

      const { data: files, error } = await supabase
        .from('media_files')
        .select('file_type, file_size, created_at')
        .eq('is_archived', false);

      if (error) {
        console.error('Error fetching media stats:', error);
        throw error;
      }

      const totalFiles = files?.length || 0;
      const totalSize = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
      
      const fileTypes: Record<string, number> = {};
      files?.forEach(file => {
        fileTypes[file.file_type] = (fileTypes[file.file_type] || 0) + 1;
      });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentUploads = files?.filter(file => 
        new Date(file.created_at) > weekAgo
      ).length || 0;

      return {
        totalFiles,
        totalSize,
        fileTypes,
        recentUploads
      };
    } catch (error) {
      console.error('Error in getMediaStats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        fileTypes: {},
        recentUploads: 0
      };
    }
  }

  async searchMedia(query: string, filters?: {
    file_type?: string;
    is_public?: boolean;
    limit?: number;
  }): Promise<MediaFile[]> {
    try {
      if (!supabase) {
        return []; // Mock empty search results
      }

      let dbQuery = supabase
        .from('media_files')
        .select('*')
        .or(`name.ilike.%${query}%, original_name.ilike.%${query}%, description.ilike.%${query}%`)
        .eq('is_archived', false);

      if (filters?.file_type) {
        dbQuery = dbQuery.eq('file_type', filters.file_type);
      }
      if (filters?.is_public !== undefined) {
        dbQuery = dbQuery.eq('is_public', filters.is_public);
      }
      if (filters?.limit) {
        dbQuery = dbQuery.limit(filters.limit);
      }

      dbQuery = dbQuery.order('created_at', { ascending: false });

      const { data: mediaFiles, error } = await dbQuery;

      if (error) {
        console.error('Error searching media:', error);
        throw error;
      }

      return mediaFiles || [];
    } catch (error) {
      console.error('Error in searchMedia:', error);
      return [];
    }
  }

  async archiveMediaFile(id: string): Promise<boolean> {
    try {
      return await this.updateMediaFile(id, { is_archived: true }) !== null;
    } catch (error) {
      console.error('Error archiving media file:', error);
      return false;
    }
  }

  async restoreMediaFile(id: string): Promise<boolean> {
    try {
      return await this.updateMediaFile(id, { is_archived: false }) !== null;
    } catch (error) {
      console.error('Error restoring media file:', error);
      return false;
    }
  }

  async bulkUpdateMediaFiles(ids: string[], updates: MediaFileUpdate): Promise<boolean> {
    try {
      if (!supabase) {
        return true; // Mock success
      }

      const { error } = await supabase
        .from('media_files')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', ids);

      if (error) {
        console.error('Error bulk updating media files:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in bulkUpdateMediaFiles:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mediaService = MediaService.getInstance();
