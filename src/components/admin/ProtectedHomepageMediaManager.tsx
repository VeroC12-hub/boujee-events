// src/components/admin/ProtectedHomepageMediaManager.tsx - COMPLETE UPDATED VERSION
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import { googleDriveService, DriveFile } from '../../services/googleDriveService';
import { hybridMediaService, SupabaseMediaFile, DownloadProgress } from '../../services/HybridMediaService';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  size: number;
  isActive: boolean;
  mediaType: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
  displayOrder: number;
  uploadedBy?: string;
  createdAt: string;
  google_drive_file_id?: string;
  mimeType?: string;
  supabase_storage_path?: string;
  transfer_status?: string;
}

// Hybrid Transfer Panel Component
const HybridTransferPanel: React.FC<{ 
  mediaFiles: MediaFile[]; 
  onTransferComplete: () => void;
  onSetSuccessMessage: (msg: string) => void;
  onSetError: (msg: string) => void;
}> = ({ mediaFiles, onTransferComplete, onSetSuccessMessage, onSetError }) => {
  const [transferring, setTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState<Record<string, number>>({});
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await hybridMediaService.getStorageAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleBulkTransfer = async () => {
    const filesToTransfer = mediaFiles
      .filter(file => file.google_drive_file_id && !file.supabase_storage_path)
      .map(file => file.google_drive_file_id!);

    if (filesToTransfer.length === 0) {
      onSetError('No files available for transfer. All files are already in Supabase or missing Google Drive IDs.');
      return;
    }

    setTransferring(true);
    try {
      const result = await hybridMediaService.bulkTransferToSupabase(
        filesToTransfer,
        (progress, fileProgress) => {
          setTransferProgress(prev => ({
            ...prev,
            overall: progress,
            current: fileProgress?.percentage || 0
          }));
        }
      );

      if (result.successful.length > 0) {
        onSetSuccessMessage(`Successfully transferred ${result.successful.length} files to Supabase Storage!`);
        onTransferComplete();
        loadAnalytics();
      }

      if (result.failed.length > 0) {
        onSetError(`${result.failed.length} files failed to transfer. Check console for details.`);
        console.error('Failed transfers:', result.failed);
      }
    } catch (error: any) {
      onSetError(error.message);
    } finally {
      setTransferring(false);
      setTransferProgress({});
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Remove inactive files from Supabase Storage to free up space? This cannot be undone.')) {
      return;
    }
    
    try {
      const result = await hybridMediaService.cleanupInactiveFiles();
      onSetSuccessMessage(`Cleaned up ${result.removed.length} files, freed ${(result.spaceFreed / 1024 / 1024).toFixed(2)} MB`);
      loadAnalytics();
      onTransferComplete();
    } catch (error: any) {
      onSetError(error.message);
    }
  };

  const filesToTransfer = mediaFiles.filter(file => file.google_drive_file_id && !file.supabase_storage_path);
  const supabaseFiles = mediaFiles.filter(file => file.supabase_storage_path);

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        Hybrid Storage Management
      </h3>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {analytics.usagePercentage.toFixed(1)}%
            </div>
            <div className="text-gray-400 text-sm">Supabase Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {analytics.activeFiles}
            </div>
            <div className="text-gray-400 text-sm">Active Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {analytics.inactiveFiles}
            </div>
            <div className="text-gray-400 text-sm">Inactive Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {(analytics.supabaseUsage / 1024 / 1024 / 1024).toFixed(2)} GB
            </div>
            <div className="text-gray-400 text-sm">Storage Used</div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {analytics && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Storage Usage</span>
            <span>{analytics.usagePercentage.toFixed(1)}% of 8GB</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                analytics.usagePercentage > 80 ? 'bg-red-500' : 
                analytics.usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(analytics.usagePercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Transfer Progress */}
      {transferring && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
            <span className="text-blue-400 font-medium">Transferring files to Supabase...</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Overall Progress</span>
              <span>{transferProgress.overall?.toFixed(0) || 0}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${transferProgress.overall || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* File Status Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-green-400 font-bold text-lg">{supabaseFiles.length}</div>
          <div className="text-gray-300">Files in Supabase</div>
          <div className="text-gray-500 text-xs">Fast loading</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="text-yellow-400 font-bold text-lg">{filesToTransfer.length}</div>
          <div className="text-gray-300">Google Drive Only</div>
          <div className="text-gray-500 text-xs">May have CORS issues</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-400 font-bold text-lg">{mediaFiles.filter(f => f.isActive).length}</div>
          <div className="text-gray-300">Active Files</div>
          <div className="text-gray-500 text-xs">Showing on homepage</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleBulkTransfer}
          disabled={transferring || filesToTransfer.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Transfer to Supabase ({filesToTransfer.length} files)
        </button>
        
        <button
          onClick={handleCleanup}
          disabled={transferring}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          Cleanup Inactive Files
        </button>
        
        <button
          onClick={loadAnalytics}
          disabled={transferring}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          Refresh Analytics
        </button>
      </div>

      {/* Storage Strategy Legend */}
      <div className="mt-6 text-xs text-gray-400">
        <div className="flex flex-wrap gap-4">
          <span>Green: Fast Supabase URLs</span>
          <span>Blue: Google Drive backup</span>
          <span>Yellow: Transfer needed for reliability</span>
        </div>
      </div>
    </div>
  );
};

// Google Drive File Browser Modal (keeping existing implementation)
const GoogleDriveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: DriveFile[]) => void;
  selectedCategory: string;
}> = ({ isOpen, onClose, onFilesSelected, selectedCategory }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([
    { id: 'root', name: 'My Drive' }
  ]);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
      setSelectedFiles(new Set());
    }
  }, [isOpen, currentFolder]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const isAuth = await googleDriveService.isUserAuthenticated();
      if (!isAuth) {
        const authSuccess = await googleDriveService.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed. Please try again.');
        }
      }

      const driveFiles = await googleDriveService.listFiles(currentFolder);
      const filteredFiles = driveFiles.filter((file: DriveFile) => {
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        const isMedia = file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/');
        return isFolder || isMedia;
      });

      setFiles(filteredFiles);
    } catch (error: any) {
      setError(error.message || 'Failed to load files from Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    if (folderId === 'root') {
      setFolderPath([{ id: 'root', name: 'My Drive' }]);
    } else {
      const existingIndex = folderPath.findIndex(item => item.id === folderId);
      if (existingIndex === -1) {
        setFolderPath([...folderPath, { id: folderId, name: folderName }]);
      } else {
        setFolderPath(folderPath.slice(0, existingIndex + 1));
      }
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    const selectedFileObjects = files.filter(file => selectedFiles.has(file.id));
    if (selectedFileObjects.length === 0) {
      alert('Please select at least one file to add.');
      return;
    }
    onFilesSelected(selectedFileObjects);
    setSelectedFiles(new Set());
    onClose();
  };

  if (!isOpen) return null;

  const mediaFiles = files.filter(file => 
    file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Google Drive Files</h3>
              <p className="text-gray-400 mt-1">
                Select files to add to {selectedCategory.replace('_', ' ')} category
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
              ✕
            </button>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mt-4 flex items-center gap-2 text-sm overflow-x-auto">
            {folderPath.map((item, index) => (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => {
                    setCurrentFolder(item.id);
                    setFolderPath(folderPath.slice(0, index + 1));
                  }}
                  className="text-blue-400 hover:text-blue-300 whitespace-nowrap"
                >
                  {item.name}
                </button>
                {index < folderPath.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Selection Controls */}
          {selectedFiles.size > 0 && (
            <div className="mt-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2 flex items-center justify-between">
              <span className="text-yellow-400 font-medium">
                {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleAddSelected}
                className="bg-yellow-400 text-black px-4 py-1.5 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
              >
                Add Selected
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <span className="text-gray-400 text-lg">Loading files...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg mb-4">{error}</div>
              <button
                onClick={loadFiles}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-4">📂</div>
              <p className="text-lg">No files found in this folder</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file) => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                const isMediaFile = file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/');
                const isSelected = selectedFiles.has(file.id);

                return (
                  <div
                    key={file.id}
                    className={`relative bg-white/5 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-yellow-400 shadow-lg shadow-yellow-400/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => {
                      if (isFolder) {
                        navigateToFolder(file.id, file.name);
                      } else if (isMediaFile) {
                        toggleFileSelection(file.id);
                      }
                    }}
                  >
                    {isMediaFile && (
                      <div className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg'
                          : 'bg-black/50 border-white/50 hover:border-white/80'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </div>
                    )}

                    <div className="aspect-video bg-black/20 relative">
                      {isFolder ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📁</div>
                            <div className="text-xs text-gray-400">Folder</div>
                          </div>
                        </div>
                      ) : file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}&sz=w300-h200`}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/300x200/333/666?text=Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎥</div>
                            <div className="text-xs text-gray-400">Video</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h4 className="text-white font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {isFolder ? 'Folder' : (
                          <>
                            {file.mimeType.startsWith('image/') ? 'Image' : 'Video'}
                            {file.size && ` • ${Math.round(parseInt(file.size) / 1024 / 1024)}MB`}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT: ProtectedHomepageMediaManager
export const ProtectedHomepageMediaManager: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'background_video' | 'hero_image' | 'gallery_image' | 'banner'>('gallery_image');
  const [profile, setProfile] = useState<any>(null);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [showHybridPanel, setShowHybridPanel] = useState(true);

  const tabs = [
    { 
      id: 'background_video', 
      label: 'Background Videos', 
      desc: 'Homepage background',
      icon: '🎬',
      acceptedTypes: ['video/*'],
      maxFiles: 5
    },
    { 
      id: 'hero_image', 
      label: 'Hero Images', 
      desc: 'Main hero section',
      icon: '🖼️',
      acceptedTypes: ['image/*'],
      maxFiles: 10
    },
    { 
      id: 'gallery_image', 
      label: 'Gallery', 
      desc: 'Image & video gallery',
      icon: '📸',
      acceptedTypes: ['image/*', 'video/*'],
      maxFiles: 999
    },
    { 
      id: 'banner', 
      label: 'Banners', 
      desc: 'Promotional banners',
      icon: '🎯',
      acceptedTypes: ['image/*'],
      maxFiles: 8
    }
  ];

  useEffect(() => {
    loadMediaFiles();
    loadUserProfile();
    checkDriveConnection();
  }, []);

  // Real-time sync with homepage
  useEffect(() => {
    if (!supabase) return;

    const subscription = supabase
      .channel('homepage_media_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'homepage_media' 
        }, 
        (payload) => {
          console.log('Real-time update received:', payload.eventType);
          loadMediaFiles();
          
          if (payload.eventType !== 'SELECT') {
            setSuccessMessage('Media updated in real-time!');
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const checkDriveConnection = async () => {
    try {
      const initialized = await googleDriveService.initialize();
      if (initialized) {
        const isAuth = await googleDriveService.isUserAuthenticated();
        setDriveConnected(isAuth);
      }
    } catch (error) {
      console.error('Error checking Google Drive connection:', error);
      setDriveConnected(false);
    }
  };

  // Load media files with hybrid URL processing
  const loadMediaFiles = async () => {
    try {
      console.log('Loading media files from database...');

      const { data, error } = await supabase
        .from('homepage_media')
        .select(`
          id,
          media_type,
          title,
          description,
          is_active,
          display_order,
          created_at,
          media_file:media_files(
            id,
            name,
            original_name,
            mime_type,
            file_size,
            google_drive_file_id,
            download_url,
            web_view_link,
            thumbnail_url,
            file_type,
            uploaded_by,
            supabase_storage_path,
            supabase_storage_bucket,
            transfer_status
          )
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedFiles: MediaFile[] = (data || []).map(item => {
        const mediaFile = Array.isArray(item.media_file) ? item.media_file[0] : item.media_file;
        
        if (!mediaFile) {
          console.warn('Homepage media item has no associated media file:', item.id);
          return null;
        }

        // Enhanced URL construction - prioritize Supabase URLs
        let displayUrl = mediaFile.download_url;
        let thumbnailUrl = mediaFile.thumbnail_url;

        // If we have Supabase storage, use that URL (it should already be in download_url after transfer)
        if (mediaFile.supabase_storage_path) {
          // download_url should already be the Supabase URL after hybrid transfer
          displayUrl = mediaFile.download_url;
        } else if (mediaFile.google_drive_file_id) {
          // Fallback to Google Drive URLs if no Supabase storage
          const isImage = mediaFile.mime_type?.startsWith('image/') || mediaFile.file_type === 'image';
          const isVideo = mediaFile.mime_type?.startsWith('video/') || mediaFile.file_type === 'video';

          if (isImage) {
            displayUrl = `https://lh3.googleusercontent.com/d/${mediaFile.google_drive_file_id}=w1920-h1080-c`;
            thumbnailUrl = `https://drive.google.com/thumbnail?id=${mediaFile.google_drive_file_id}&sz=w400-h300`;
          } else if (isVideo) {
            displayUrl = `https://drive.google.com/file/d/${mediaFile.google_drive_file_id}/preview`;
            thumbnailUrl = `https://drive.google.com/thumbnail?id=${mediaFile.google_drive_file_id}&sz=w400-h300`;
          }
        }

        return {
          id: item.id,
          name: mediaFile.name || 'Unknown File',
          url: displayUrl || '',
          thumbnailUrl,
          type: mediaFile.file_type === 'video' ? 'video' : 'image',
          size: mediaFile.file_size || 0,
          isActive: item.is_active,
          mediaType: item.media_type,
          displayOrder: item.display_order,
          uploadedBy: mediaFile.uploaded_by,
          createdAt: item.created_at,
          google_drive_file_id: mediaFile.google_drive_file_id,
          mimeType: mediaFile.mime_type,
          supabase_storage_path: mediaFile.supabase_storage_path,
          transfer_status: mediaFile.transfer_status
        };
      }).filter(Boolean) as MediaFile[];

      setMediaFiles(formattedFiles);
      console.log(`Loaded ${formattedFiles.length} media files from database`);
      
      // Update localStorage for homepage compatibility
      const allMediaForHomepage = formattedFiles.map(file => ({
        id: file.id,
        name: file.name,
        url: file.url,
        directUrl: file.url,
        thumbnailUrl: file.thumbnailUrl,
        type: file.type,
        mediaType: file.mediaType,
        isActive: file.isActive,
        size: file.size,
        title: file.name,
        description: `Uploaded ${new Date(file.createdAt).toLocaleDateString()}`,
        uploadedBy: file.uploadedBy,
        uploadedAt: file.createdAt,
        googleDriveFileId: file.google_drive_file_id,
        mimeType: file.mimeType
      }));
      
      localStorage.setItem('boujee_all_media', JSON.stringify(allMediaForHomepage));
      
      // Trigger custom event to notify homepage
      window.dispatchEvent(new CustomEvent('mediaUpdated', { 
        detail: { 
          count: allMediaForHomepage.length,
          timestamp: new Date().toISOString(),
          category: 'all'
        } 
      }));

    } catch (error: any) {
      console.error('Error loading media files:', error);
      setUploadError(error.message);
    }
  };

  const handleTransferComplete = useCallback(() => {
    loadMediaFiles(); // Refresh the media list
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      await handleFileUpload(acceptedFiles);
    },
    accept: tabs.find(tab => tab.id === selectedCategory)?.acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>) || {},
    multiple: true,
    maxSize: 100 * 1024 * 1024,
    disabled: uploading
  });

  // File upload with automatic public access
  const handleFileUpload = async (files: File[]) => {
    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);
    setUploadProgress({});

    try {
      console.log(`Starting upload of ${files.length} files to ${selectedCategory}...`);

      // Ensure Google Drive connection
      if (!driveConnected) {
        const initialized = await googleDriveService.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize Google Drive service');
        }

        const isAuth = await googleDriveService.isUserAuthenticated();
        if (!isAuth) {
          const authSuccess = await googleDriveService.authenticate();
          if (!authSuccess) {
            throw new Error('Google Drive authentication failed');
          }
        }
        setDriveConnected(true);
      }

      let successCount = 0;
      let failedFiles: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `upload_${i}_${Date.now()}`;
        
        try {
          console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);

          setUploadProgress(prev => ({
            ...prev,
            [fileId]: 0
          }));

          // Upload with automatic public access
          const driveFile = await googleDriveService.uploadFile(file, 'root', (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: progress.percentage
            }));
          }, true); // makePublic = true

          console.log('Uploaded to Drive:', driveFile);

          // Create database records
          const mediaFileId = await createMediaFileRecord(driveFile, file);
          await createHomepageMediaEntry(mediaFileId, selectedCategory);

          successCount++;
          console.log(`Successfully uploaded: ${file.name}`);

          setUploadProgress(prev => ({
            ...prev,
            [fileId]: 100
          }));

        } catch (error: any) {
          console.error(`Failed to upload ${file.name}:`, error);
          failedFiles.push(file.name);
          
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: -1
          }));
        }
      }

      if (successCount > 0) {
        setSuccessMessage(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''} to ${selectedCategory.replace('_', ' ')}!`);
        await loadMediaFiles();
      }

      if (failedFiles.length > 0) {
        setUploadError(`Failed to upload: ${failedFiles.join(', ')}`);
      }

    } catch (error: any) {
      console.error('Upload process failed:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 3000);
    }
  };

  // Google Drive files import
  const handleGoogleDriveFiles = async (driveFiles: DriveFile[]) => {
    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    try {
      console.log(`Processing ${driveFiles.length} files from Google Drive...`);

      let successCount = 0;
      let failedFiles: string[] = [];

      for (const driveFile of driveFiles) {
        try {
          console.log(`Making file public: ${driveFile.name}`);
          await googleDriveService.makeFilePublic(driveFile.id);

          const mediaFileId = await createMediaFileRecord(driveFile);
          await createHomepageMediaEntry(mediaFileId, selectedCategory);

          successCount++;
          console.log(`Successfully added: ${driveFile.name}`);

        } catch (error: any) {
          console.error(`Failed to add ${driveFile.name}:`, error);
          failedFiles.push(driveFile.name);
        }
      }

      if (successCount > 0) {
        setSuccessMessage(`Successfully added ${successCount} file${successCount > 1 ? 's' : ''} from Google Drive to ${selectedCategory.replace('_', ' ')}!`);
        await loadMediaFiles();
      }

      if (failedFiles.length > 0) {
        setUploadError(`Failed to add: ${failedFiles.join(', ')}`);
      }

    } catch (error: any) {
      console.error('Google Drive import failed:', error);
      setUploadError(error.message || 'Google Drive import failed');
    } finally {
      setUploading(false);
    }
  };

  // Create media file record with optimal URLs
  const createMediaFileRecord = async (driveFile: any, originalFile?: File): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const isImage = driveFile.mimeType?.startsWith('image/') || originalFile?.type.startsWith('image/');
      const isVideo = driveFile.mimeType?.startsWith('video/') || originalFile?.type.startsWith('video/');
      const fileType = isVideo ? 'video' : isImage ? 'image' : 'other';

      // Generate optimal URLs for database storage
      let downloadUrl: string;
      let thumbnailUrl: string;

      if (isImage) {
        downloadUrl = `https://lh3.googleusercontent.com/d/${driveFile.id}=w1920-h1080-c`;
        thumbnailUrl = `https://drive.google.com/thumbnail?id=${driveFile.id}&sz=w400-h300`;
      } else if (isVideo) {
        downloadUrl = `https://drive.google.com/file/d/${driveFile.id}/preview`;
        thumbnailUrl = `https://drive.google.com/thumbnail?id=${driveFile.id}&sz=w400-h300`;
      } else {
        downloadUrl = `https://drive.google.com/uc?export=view&id=${driveFile.id}`;
        thumbnailUrl = `https://drive.google.com/thumbnail?id=${driveFile.id}&sz=w400-h300`;
      }

      const { data, error } = await supabase
        .from('media_files')
        .insert([{
          name: driveFile.name,
          original_name: driveFile.name,
          mime_type: driveFile.mimeType || originalFile?.type,
          file_size: originalFile?.size || parseInt(driveFile.size || '0'),
          google_drive_file_id: driveFile.id,
          download_url: downloadUrl,
          thumbnail_url: thumbnailUrl,
          web_view_link: driveFile.webViewLink || '',
          file_type: fileType,
          uploaded_by: user.id,
          is_public: true,
          is_archived: false,
          storage_strategy: 'drive_only',
          transfer_status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      console.log(`Created media file record: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('Failed to create media file record:', error);
      throw error;
    }
  };

  const createHomepageMediaEntry = async (mediaFileId: string, mediaType: string): Promise<void> => {
    try {
      const { data: maxOrderData } = await supabase
        .from('homepage_media')
        .select('display_order')
        .eq('media_type', mediaType)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 1;

      const { error } = await supabase
        .from('homepage_media')
        .insert([{
          media_file_id: mediaFileId,
          media_type: mediaType,
          display_order: nextOrder,
          is_active: true,
          title: `${mediaType.replace('_', ' ')} media`,
          description: `Added ${new Date().toLocaleDateString()}`
        }]);

      if (error) throw error;
      console.log(`Created homepage media entry for ${mediaType}`);
    } catch (error) {
      console.error('Failed to create homepage media entry:', error);
      throw error;
    }
  };

  // Toggle with perfect homepage sync
  const toggleMediaActive = async (mediaId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('homepage_media')
        .update({ is_active: !currentStatus })
        .eq('id', mediaId);

      if (error) throw error;
      
      console.log(`Toggled media ${mediaId} to ${!currentStatus ? 'active' : 'inactive'}`);
      await loadMediaFiles();
      setSuccessMessage(`Media ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      console.error('Error toggling media status:', error);
      setUploadError(error.message);
    }
  };

  // Delete with perfect homepage sync
  const deleteMedia = async (mediaId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('homepage_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;
      
      console.log(`Deleted media: ${fileName}`);
      await loadMediaFiles();
      setSuccessMessage(`"${fileName}" deleted successfully!`);
    } catch (error: any) {
      console.error('Error deleting media:', error);
      setUploadError(error.message);
    }
  };

  const getFilteredMedia = () => {
    return mediaFiles.filter(file => file.mediaType === selectedCategory);
  };

  const handleConnectDrive = async () => {
    try {
      setUploading(true);
      setUploadError(null);
      
      console.log('Initializing Google Drive connection...');
      const initialized = await googleDriveService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google Drive service');
      }

      console.log('Starting authentication...');
      const authSuccess = await googleDriveService.authenticate();
      if (authSuccess) {
        setDriveConnected(true);
        setSuccessMessage('Google Drive connected successfully! You can now import files.');
        console.log('Google Drive authentication successful');
      } else {
        throw new Error('Authentication was cancelled or failed');
      }
    } catch (error: any) {
      console.error('Google Drive connection failed:', error);
      setUploadError(error.message || 'Failed to connect to Google Drive. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const currentTab = tabs.find(tab => tab.id === selectedCategory);
  const currentMedia = getFilteredMedia();

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            Homepage Media Manager
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Upload and manage media for your homepage sections with Google Drive integration and real-time sync
          </p>
          {profile && (
            <p className="text-gray-500 text-xs mt-1">
              Logged in as: <span className="text-yellow-400">{profile.full_name || profile.email}</span> ({profile.role})
            </p>
          )}
        </div>

        {/* Status Messages */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <div className="text-red-400 text-sm md:text-base">{uploadError}</div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✅</span>
              <div className="text-green-400 text-sm md:text-base">{successMessage}</div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-3">Upload Progress</h3>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        progress === -1 
                          ? 'bg-red-500' 
                          : progress === 100 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress === -1 ? 100 : Math.max(progress, 5)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-300 min-w-[80px]">
                    {progress === -1 ? 'Failed' : progress === 100 ? 'Complete' : `${progress}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hybrid Transfer Panel */}
        {showHybridPanel && (
          <HybridTransferPanel 
            mediaFiles={mediaFiles} 
            onTransferComplete={handleTransferComplete}
            onSetSuccessMessage={setSuccessMessage}
            onSetError={setUploadError}
          />
        )}

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
            {tabs.map((tab) => {
              const tabMedia = mediaFiles.filter(file => file.mediaType === tab.id);
              const isSelected = selectedCategory === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`relative p-3 lg:p-4 rounded-xl text-left transition-all border-2 ${
                    isSelected
                      ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-lg lg:text-xl mb-1">{tab.icon}</div>
                  <div className="text-sm lg:text-base font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-400 mt-1 hidden sm:block">{tab.desc}</div>
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-yellow-400/20 text-yellow-300' : 'bg-white/10 text-gray-400'
                    }`}>
                      {tabMedia.length} files
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Direct Upload */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-6 lg:p-8 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-yellow-400 bg-yellow-400/10 scale-105' 
                : 'border-white/30 hover:border-white/50 hover:bg-white/5'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="text-4xl lg:text-6xl mb-4">
              {uploading ? '⏳' : isDragActive ? '📂' : '📁'}
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">
              {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Upload Media Files'}
            </h3>
            <p className="text-gray-400 mb-4 text-sm lg:text-base">
              {currentTab?.acceptedTypes.includes('video/*') 
                ? 'Upload videos and images' 
                : 'Upload images'} for {currentTab?.label.toLowerCase()}
            </p>
            <p className="text-xs lg:text-sm text-gray-500">
              Click to browse or drag & drop • Max 100MB per file • Auto-syncs to homepage
            </p>
          </div>

          {/* Google Drive Import */}
          <div className="border-2 border-dashed border-blue-400/30 rounded-xl p-6 lg:p-8 text-center">
            <div className="text-4xl lg:text-6xl mb-4">☁️</div>
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">
              Import from Google Drive
            </h3>
            <p className="text-gray-400 mb-4 text-sm lg:text-base">
              Select existing files from your Google Drive
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {driveConnected ? (
                <>
                  <button
                    onClick={() => setDriveModalOpen(true)}
                    disabled={uploading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm lg:text-base"
                  >
                    Browse Files
                  </button>
                  <button
                    onClick={checkDriveConnection}
                    className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs lg:text-sm"
                  >
                    Refresh
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnectDrive}
                  disabled={uploading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm lg:text-base"
                >
                  Connect Google Drive
                </button>
              )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              {driveConnected ? (
                <span className="text-green-400">Connected to Google Drive</span>
              ) : (
                <span className="text-gray-400">Not connected</span>
              )}
            </div>
          </div>
        </div>

        {/* Current Media */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg lg:text-xl font-semibold text-white">
              {currentTab?.icon} {currentTab?.label} 
              <span className="text-gray-400 text-base ml-2">({currentMedia.length} files)</span>
            </h3>
            
            {currentMedia.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  {currentTab?.maxFiles === 999 
                    ? 'Unlimited files allowed' 
                    : `${currentMedia.length}/${currentTab?.maxFiles} files used`
                  }
                </div>
                <button
                  onClick={loadMediaFiles}
                  className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentMedia.map(file => (
              <div
                key={file.id}
                className={`
                  relative bg-white/10 rounded-xl overflow-hidden border-2 transition-all group shadow-lg
                  ${file.isActive ? 'border-yellow-400 shadow-yellow-400/20' : 'border-white/20 hover:border-white/40'}
                `}
              >
                {/* Storage Strategy Badge */}
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  {file.supabase_storage_path && (
                    <div className="px-2 py-1 bg-green-500/80 rounded-full text-white text-xs font-medium">
                      Supabase
                    </div>
                  )}
                  {file.google_drive_file_id && (
                    <div className="px-2 py-1 bg-blue-500/80 rounded-full text-white text-xs font-medium">
                      Drive
                    </div>
                  )}
                </div>

                {/* Media Preview */}
                <div className="aspect-video bg-black/20 relative overflow-hidden">
                  {file.type === 'image' ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (file.google_drive_file_id && !target.src.includes('lh3.googleusercontent.com')) {
                          target.src = `https://lh3.googleusercontent.com/d/${file.google_drive_file_id}=w400-h300-c`;
                        } else {
                          target.src = 'https://via.placeholder.com/300x200/333/666?text=Image+Error';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                      <div className="text-center">
                        <div className="text-4xl lg:text-6xl mb-2">🎥</div>
                        <div className="text-xs text-gray-300">Video File</div>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    file.isActive 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-gray-500/80 text-white'
                  }`}>
                    {file.isActive ? 'Active' : 'Inactive'}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.url, '_blank');
                        }}
                        className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                        title="Preview"
                      >
                        👁️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(file.url);
                          setSuccessMessage('URL copied to clipboard!');
                        }}
                        className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                        title="Copy URL"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-3 lg:p-4">
                  <h4 className="text-white font-medium text-sm lg:text-base truncate mb-1" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-gray-400 text-xs lg:text-sm mb-3">
                    {file.type === 'image' ? '📷' : '🎥'} • {Math.round(file.size / 1024 / 1024)}MB
                    {file.uploadedBy && (
                      <span className="block mt-1 truncate">
                        👤 {file.uploadedBy}
                      </span>
                    )}
                    <span className="block text-gray-500 text-xs">
                      Order: {file.displayOrder} • {file.transfer_status || 'pending'}
                    </span>
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleMediaActive(file.id, file.isActive)}
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                        file.isActive 
                          ? 'bg-gray-600 text-white hover:bg-gray-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      title={file.isActive ? 'Deactivate media' : 'Activate media'}
                    >
                      {file.isActive ? '💤 Deactivate' : '✅ Activate'}
                    </button>
                    <button
                      onClick={() => deleteMedia(file.id, file.name)}
                      className="px-2 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                      title="Delete media"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentMedia.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-white/20 rounded-xl">
              <div className="text-4xl lg:text-6xl mb-4">{currentTab?.icon}</div>
              <p className="text-lg lg:text-xl text-white font-medium mb-2">
                No {currentTab?.label.toLowerCase()} uploaded yet
              </p>
              <p className="text-sm lg:text-base text-gray-400 mb-6">
                Upload your first {currentTab?.label.toLowerCase()} to get started!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                  className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                >
                  Upload Files
                </button>
                {driveConnected && (
                  <button
                    onClick={() => setDriveModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    Import from Drive
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress Indicator */}
        {uploading && (
          <div className="fixed bottom-4 right-4 bg-gray-800 border border-white/20 rounded-lg p-4 shadow-xl z-40">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
              <div className="text-white text-sm">
                <div className="font-medium">Processing files...</div>
                <div className="text-gray-400 text-xs">Homepage will update automatically</div>
              </div>
            </div>
          </div>
        )}

        {/* Google Drive Modal */}
        <GoogleDriveModal
          isOpen={driveModalOpen}
          onClose={() => setDriveModalOpen(false)}
          onFilesSelected={handleGoogleDriveFiles}
          selectedCategory={selectedCategory}
        />
      </div>
    </div>
  );
};

export default ProtectedHomepageMediaManager;
