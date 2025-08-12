// src/services/mediaService.ts - COMPLETE VERSION
import { supabase } from '../lib/supabase';

// Types
interface MediaFileData {
  name: string;
  original_name: string;
  mime_type: string;
  file_size?: number;
  google_drive_file_id: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  uploaded_by?: string;
  is_public?: boolean;
  is_archived?: boolean;
  web_view_link?: string;
  thumbnail_url?: string;
  download_url?: string;
}

interface HomepageMediaData {
  media_file_id: string;
  media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  display_order?: number;
  is_active?: boolean;
  title?: string;
  description?: string;
  link_url?: string;
}

interface EventMediaData {
  event_id: string;
  media_file_id: string;
  display_order?: number;
  is_featured?: boolean;
  caption?: string;
}

class MediaService {
  // ENHANCED: Create media file with better error handling
  async createMediaFile(data: MediaFileData): Promise<any> {
    try {
      if (!supabase) {
        // Mock creation for development
        const mockMediaFile = {
          id: `media_file_${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('📝 Mock: Created media file:', mockMediaFile.name);
        return mockMediaFile;
      }

      const { data: mediaFile, error } = await supabase
        .from('media_files')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating media file:', error);
        throw error;
      }

      console.log('✅ Created media file:', mediaFile.name);
      return mediaFile;
    } catch (error) {
      console.error('❌ Error in createMediaFile:', error);
      throw error;
    }
  }

  // CRITICAL FIX: Enhanced homepage media creation
  async createHomepageMedia(data: HomepageMediaData): Promise<any> {
    try {
      if (!supabase) {
        // Mock creation for development
        const mockHomepageMedia = {
          id: `homepage_media_${Date.now()}`,
          ...data,
          display_order: data.display_order || 1,
          is_active: data.is_active !== undefined ? data.is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('📝 Mock: Created homepage media:', mockHomepageMedia.media_type);
        return mockHomepageMedia;
      }

      // STEP 1: Handle background video exclusivity
      if (data.media_type === 'background_video' && data.is_active !== false) {
        await supabase
          .from('homepage_media')
          .update({ is_active: false })
          .eq('media_type', 'background_video');
        
        console.log('🗑️ Cleared other active background videos');
      }

      // Get next display order
      const { data: maxOrderData } = await supabase
        .from('homepage_media')
        .select('display_order')
        .eq('media_type', data.media_type)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 1;

      // Create homepage media entry
      const { data: homepageMedia, error } = await supabase
        .from('homepage_media')
        .insert([{
          ...data,
          display_order: data.display_order || nextOrder,
          is_active: data.is_active !== undefined ? data.is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating homepage media:', error);
        throw error;
      }

      console.log('✅ Created homepage media entry:', homepageMedia.media_type);
      return homepageMedia;
    } catch (error) {
      console.error('❌ Failed to create homepage media:', error);
      throw error;
    }
  }

  // ENHANCED: Get homepage media with relationships
  async getHomepageMedia(): Promise<any[]> {
    try {
      if (!supabase) {
        // Mock data for development
        console.log('📝 Mock: Returning empty homepage media');
        return [];
      }

      const { data: homepageMedia, error } = await supabase
        .from('homepage_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .order('display_order');

      if (error) {
        console.error('❌ Error fetching homepage media:', error);
        throw error;
      }

      console.log('✅ Fetched', homepageMedia?.length || 0, 'homepage media entries');
      return homepageMedia || [];
    } catch (error) {
      console.error('❌ Error in getHomepageMedia:', error);
      return [];
    }
  }

  // ENHANCED: Update homepage media status
  async updateHomepageMediaStatus(mediaFileId: string, isActive: boolean, mediaType?: string): Promise<void> {
    try {
      if (!supabase) {
        console.log('📝 Mock: Updating media status for', mediaFileId, 'to', isActive);
        return;
      }

      // If activating a background video, deactivate others first
      if (isActive && mediaType === 'background_video') {
        await supabase
          .from('homepage_media')
          .update({ is_active: false })
          .eq('media_type', 'background_video');
        
        console.log('🗑️ Cleared other active background videos');
      }

      // Update the specific media item
      const { error } = await supabase
        .from('homepage_media')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('media_file_id', mediaFileId);

      if (error) {
        console.error('❌ Error updating homepage media status:', error);
        throw error;
      }

      console.log(`✅ Updated media status: ${mediaFileId} -> ${isActive}`);
    } catch (error) {
      console.error('❌ Error in updateHomepageMediaStatus:', error);
      throw error;
    }
  }

  // ENHANCED: Delete media file and related records
  async deleteMediaFile(mediaFileId: string): Promise<void> {
    try {
      if (!supabase) {
        console.log('📝 Mock: Deleting media file', mediaFileId);
        return;
      }

      // Delete homepage media entries first (due to foreign key constraint)
      await supabase
        .from('homepage_media')
        .delete()
        .eq('media_file_id', mediaFileId);

      // Delete event media entries
      await supabase
        .from('event_media')
        .delete()
        .eq('media_file_id', mediaFileId);

      // Finally delete the media file
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', mediaFileId);

      if (error) {
        console.error('❌ Error deleting media file:', error);
        throw error;
      }

      console.log('✅ Deleted media file and related records:', mediaFileId);
    } catch (error) {
      console.error('❌ Error in deleteMediaFile:', error);
      throw error;
    }
  }

  // ENHANCED: Create event media with proper ordering
  async createEventMedia(data: EventMediaData): Promise<any> {
    try {
      if (!supabase) {
        // Mock creation for development
        const mockEventMedia = {
          id: `event_media_${Date.now()}`,
          ...data,
          display_order: data.display_order || 1,
          is_featured: data.is_featured || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('📝 Mock: Created event media:', mockEventMedia.event_id);
        return mockEventMedia;
      }

      // Get next display order for this event
      const { data: maxOrderData } = await supabase
        .from('event_media')
        .select('display_order')
        .eq('event_id', data.event_id)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 1;

      // Create event media entry
      const { data: eventMedia, error } = await supabase
        .from('event_media')
        .insert([{
          ...data,
          display_order: data.display_order || nextOrder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating event media:', error);
        throw error;
      }

      console.log('✅ Created event media entry');
      return eventMedia;
    } catch (error) {
      console.error('❌ Error in createEventMedia:', error);
      throw error;
    }
  }

  // ENHANCED: Get event media with relationships
  async getEventMedia(eventId: string): Promise<any[]> {
    try {
      if (!supabase) {
        console.log('📝 Mock: Returning empty event media for', eventId);
        return [];
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
        console.error('❌ Error fetching event media:', error);
        throw error;
      }

      console.log('✅ Fetched', eventMedia?.length || 0, 'event media entries');
      return eventMedia || [];
    } catch (error) {
      console.error('❌ Error in getEventMedia:', error);
      return [];
    }
  }

  // ENHANCED: Update media file metadata
  async updateMediaFile(mediaFileId: string, updates: Partial<MediaFileData>): Promise<any> {
    try {
      if (!supabase) {
        console.log('📝 Mock: Updating media file', mediaFileId, 'with', updates);
        return { id: mediaFileId, ...updates };
      }

      const { data: mediaFile, error } = await supabase
        .from('media_files')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', mediaFileId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating media file:', error);
        throw error;
      }

      console.log('✅ Updated media file:', mediaFile.name);
      return mediaFile;
    } catch (error) {
      console.error('❌ Error in updateMediaFile:', error);
      throw error;
    }
  }

  // ENHANCED: Get media files with filtering
  async getMediaFiles(filters?: {
    fileType?: string;
    isPublic?: boolean;
    isArchived?: boolean;
    uploadedBy?: string;
  }): Promise<any[]> {
    try {
      if (!supabase) {
        console.log('📝 Mock: Returning empty media files');
        return [];
      }

      let query = supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.fileType) {
          query = query.eq('file_type', filters.fileType);
        }
        if (filters.isPublic !== undefined) {
          query = query.eq('is_public', filters.isPublic);
        }
        if (filters.isArchived !== undefined) {
          query = query.eq('is_archived', filters.isArchived);
        }
        if (filters.uploadedBy) {
          query = query.eq('uploaded_by', filters.uploadedBy);
        }
      }

      const { data: mediaFiles, error } = await query;

      if (error) {
        console.error('❌ Error fetching media files:', error);
        throw error;
      }

      console.log('✅ Fetched', mediaFiles?.length || 0, 'media files');
      return mediaFiles || [];
    } catch (error) {
      console.error('❌ Error in getMediaFiles:', error);
      return [];
    }
  }

  // ENHANCED: Get media statistics
  async getMediaStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    fileTypes: { [key: string]: number };
    publicFiles: number;
    archivedFiles: number;
  }> {
    try {
      if (!supabase) {
        console.log('📝 Mock: Returning mock media stats');
        return {
          totalFiles: 0,
          totalSize: 0,
          fileTypes: {},
          publicFiles: 0,
          archivedFiles: 0
        };
      }

      const { data: mediaFiles, error } = await supabase
        .from('media_files')
        .select('file_type, file_size, is_public, is_archived');

      if (error) {
        console.error('❌ Error fetching media stats:', error);
        throw error;
      }

      const stats = {
        totalFiles: mediaFiles?.length || 0,
        totalSize: mediaFiles?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0,
        fileTypes: {} as { [key: string]: number },
        publicFiles: mediaFiles?.filter(file => file.is_public).length || 0,
        archivedFiles: mediaFiles?.filter(file => file.is_archived).length || 0
      };

      // Count file types
      mediaFiles?.forEach(file => {
        const type = file.file_type || 'unknown';
        stats.fileTypes[type] = (stats.fileTypes[type] || 0) + 1;
      });

      console.log('✅ Generated media stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error in getMediaStats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        fileTypes: {},
        publicFiles: 0,
        archivedFiles: 0
      };
    }
  }
}

export const mediaService = new MediaService();
