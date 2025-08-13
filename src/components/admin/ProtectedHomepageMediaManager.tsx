// src/components/admin/ProtectedHomepageMediaManager.tsx - ENHANCED WITH REAL-TIME SYNC
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import { googleDriveService } from '../../services/googleDriveService';

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
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink: string;
  thumbnailLink?: string;
  createdTime: string;
}

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: DriveFile[]) => void;
  selectedCategory: string;
}

// PRESERVED: Your Google Drive File Browser Modal
const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onFilesSelected,
  selectedCategory
}) => {
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
      console.log(`🔍 Loading files from folder: ${currentFolder}`);
      
      const isAuth = await googleDriveService.isUserAuthenticated();
      if (!isAuth) {
        console.log('🔐 User not authenticated, starting authentication...');
        const authSuccess = await googleDriveService.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed. Please try again.');
        }
      }

      const driveFiles = await googleDriveService.listFiles(currentFolder);
      console.log(`📂 Loaded ${driveFiles.length} files from Google Drive`);

      const filteredFiles = driveFiles.filter((file: DriveFile) => {
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        const isMedia = file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/');
        return isFolder || isMedia;
      });

      setFiles(filteredFiles);
      console.log(`✅ Showing ${filteredFiles.length} files and folders`);
    } catch (error: any) {
      console.error('⚠️ Failed to load Google Drive files:', error);
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

  const navigateToPathItem = (index: number) => {
    const targetFolder = folderPath[index];
    setCurrentFolder(targetFolder.id);
    setFolderPath(folderPath.slice(0, index + 1));
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

  const selectAllVisible = () => {
    const mediaFiles = files.filter(file => 
      file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')
    );
    const allSelected = mediaFiles.every(file => selectedFiles.has(file.id));
    
    if (allSelected) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(mediaFiles.map(file => file.id)));
    }
  };

  const handleAddSelected = () => {
    const selectedFileObjects = files.filter(file => selectedFiles.has(file.id));
    console.log(`📎 Adding ${selectedFileObjects.length} selected files to ${selectedCategory}`);
    
    if (selectedFileObjects.length === 0) {
      alert('Please select at least one file to add.');
      return;
    }

    onFilesSelected(selectedFileObjects);
    setSelectedFiles(new Set());
    onClose();
  };

  const formatFileSize = (sizeString?: string) => {
    if (!sizeString) return 'Unknown size';
    const size = parseInt(sizeString);
    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    } else {
      return `${Math.round(size / (1024 * 1024))} MB`;
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') return '📁';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    return '📄';
  };

  if (!isOpen) return null;

  const mediaFiles = files.filter(file => 
    file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                🔍 Google Drive Files
                {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>}
              </h3>
              <p className="text-gray-400 mt-1 text-sm md:text-base">
                Select files to add to <strong className="text-yellow-400">{selectedCategory.replace('_', ' ')}</strong> category
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl self-end sm:self-auto transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mt-4 flex items-center gap-2 text-sm overflow-x-auto">
            {folderPath.map((item, index) => (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => navigateToPathItem(index)}
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
          <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex gap-2">
              <button
                onClick={selectAllVisible}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                disabled={mediaFiles.length === 0}
              >
                {mediaFiles.length > 0 && mediaFiles.every(file => selectedFiles.has(file.id))
                  ? '⚪ Deselect All'
                  : '✅ Select All'
                }
              </button>
              <button
                onClick={loadFiles}
                disabled={loading}
                className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>

            {selectedFiles.size > 0 && (
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2 flex items-center gap-3">
                <span className="text-yellow-400 font-medium text-sm">
                  📎 {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleAddSelected}
                  className="bg-yellow-400 text-black px-4 py-1.5 rounded-lg font-medium hover:bg-yellow-500 transition-colors text-sm"
                >
                  ➕ Add Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <span className="text-gray-400 text-lg">Loading files...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
              <button
                onClick={loadFiles}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Try Again
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
                          src={file.thumbnailLink || file.webViewLink}
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

                      {isFolder && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-medium">Open Folder</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <p className="text-gray-400 text-xs mt-1">
                            {isFolder ? 'Folder' : (
                              <>
                                {file.mimeType.startsWith('image/') ? 'Image' : 'Video'}
                                {file.size && ` • ${formatFileSize(file.size)}`}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedFiles.size > 0 && (
          <div className="border-t border-white/10 p-4 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">
                {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleAddSelected}
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
              >
                ➕ Add to {selectedCategory.replace('_', ' ')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ENHANCED: Main Component with Real-time Homepage Sync
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

  // Real-time sync
  useEffect(() => {
    if (!supabase) return;

    console.log('🔄 Setting up real-time subscription for media changes...');
    
    const subscription = supabase
      .channel('homepage_media_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'homepage_media' 
        }, 
        (payload) => {
          console.log('🔄 Real-time update received:', payload);
          loadMediaFiles();
          
          if (payload.eventType !== 'SELECT') {
            setSuccessMessage('✅ Media updated in real-time!');
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      console.log('🔄 Real-time subscription cleaned up');
    };
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
        console.log('👤 Profile loaded:', profileData?.full_name || profileData?.email);
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
        console.log('☁️ Google Drive connection status:', isAuth ? 'Connected' : 'Disconnected');
      }
    } catch (error) {
      console.error('Error checking Google Drive connection:', error);
      setDriveConnected(false);
    }
  };

  // CRITICAL FIX: Enhanced load media files with homepage sync
  const loadMediaFiles = async () => {
    try {
      console.log('📡 Loading media files from database...');

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
            uploaded_by
          )
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedFiles: MediaFile[] = (data || []).map(item => {
        const mediaFile = Array.isArray(item.media_file) ? item.media_file[0] : item.media_file;
        
        if (!mediaFile) {
          console.warn('⚠️ Homepage media item has no associated media file:', item.id);
          return null;
        }

        // Enhanced URL construction for Google Drive files
        let displayUrl = mediaFile.download_url;
        if (!displayUrl && mediaFile.google_drive_file_id) {
          displayUrl = mediaFile.mime_type?.startsWith('image/') 
            ? `https://drive.google.com/uc?export=view&id=${mediaFile.google_drive_file_id}`
            : `https://drive.google.com/uc?export=download&id=${mediaFile.google_drive_file_id}`;
        }

        return {
          id: item.id,
          name: mediaFile.name || 'Unknown File',
          url: displayUrl || mediaFile.web_view_link || '',
          thumbnailUrl: mediaFile.thumbnail_url,
          type: mediaFile.file_type === 'video' ? 'video' : 'image',
          size: mediaFile.file_size || 0,
          isActive: item.is_active,
          mediaType: item.media_type,
          displayOrder: item.display_order,
          uploadedBy: mediaFile.uploaded_by,
          createdAt: item.created_at,
          google_drive_file_id: mediaFile.google_drive_file_id
        };
      }).filter(Boolean) as MediaFile[];

      setMediaFiles(formattedFiles);
      console.log(`✅ Loaded ${formattedFiles.length} media files from database`);
      
      // CRITICAL: Update localStorage AND trigger homepage update
      const allMediaForHomepage = formattedFiles.map(file => ({
        id: file.id,
        name: file.name,
        url: file.url,
        directUrl: file.url, // Add directUrl for homepage compatibility
        type: file.type,
        mediaType: file.mediaType,
        isActive: file.isActive,
        size: file.size,
        title: file.name,
        description: `Uploaded ${new Date(file.createdAt).toLocaleDateString()}`,
        uploadedBy: file.uploadedBy,
        uploadedAt: file.createdAt
      }));
      
      localStorage.setItem('boujee_all_media', JSON.stringify(allMediaForHomepage));
      console.log('💾 Updated localStorage for homepage compatibility');

      // CRITICAL FIX: Trigger custom event to notify homepage
      window.dispatchEvent(new CustomEvent('mediaUpdated', { 
        detail: { 
          count: allMediaForHomepage.length,
          timestamp: new Date().toISOString()
        } 
      }));
      console.log('📢 Dispatched mediaUpdated event for homepage');

    } catch (error: any) {
      console.error('⚠️ Error loading media files:', error);
      setUploadError(error.message);
    }
  };

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

  const handleFileUpload = async (files: File[]) => {
    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);
    setUploadProgress({});

    try {
      console.log(`📤 Starting upload of ${files.length} files to ${selectedCategory}...`);

      if (!driveConnected) {
        console.log('🔗 Connecting to Google Drive...');
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
          console.log(`⬆️ Uploading file ${i + 1}/${files.length}: ${file.name}`);

          setUploadProgress(prev => ({
            ...prev,
            [fileId]: 0
          }));

          const driveFile = await googleDriveService.uploadFile(file, 'root', (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: progress.percentage
            }));
          });

          const mediaFileId = await createMediaFileRecord(driveFile, file);
          await createHomepageMediaEntry(mediaFileId, selectedCategory);

          successCount++;
          console.log(`✅ Successfully uploaded: ${file.name}`);

          setUploadProgress(prev => ({
            ...prev,
            [fileId]: 100
          }));

        } catch (error: any) {
          console.error(`⚠️ Failed to upload ${file.name}:`, error);
          failedFiles.push(file.name);
          
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: -1
          }));
        }
      }

      if (successCount > 0) {
        setSuccessMessage(`✅ Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''} to ${selectedCategory.replace('_', ' ')}!`);
        await loadMediaFiles(); // This will trigger homepage update
      }

      if (failedFiles.length > 0) {
        setUploadError(`⚠️ Failed to upload: ${failedFiles.join(', ')}`);
      }

    } catch (error: any) {
      console.error('⚠️ Upload process failed:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 3000);
    }
  };

  const handleGoogleDriveFiles = async (driveFiles: DriveFile[]) => {
    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    try {
      console.log(`📎 Processing ${driveFiles.length} files from Google Drive...`);

      let successCount = 0;
      let failedFiles: string[] = [];

      for (const driveFile of driveFiles) {
        try {
          const mediaFileId = await createMediaFileRecord(driveFile);
          await createHomepageMediaEntry(mediaFileId, selectedCategory);

          successCount++;
          console.log(`✅ Successfully added: ${driveFile.name}`);

        } catch (error: any) {
          console.error(`⚠️ Failed to add ${driveFile.name}:`, error);
          failedFiles.push(driveFile.name);
        }
      }

      if (successCount > 0) {
        setSuccessMessage(`✅ Successfully added ${successCount} file${successCount > 1 ? 's' : ''} from Google Drive to ${selectedCategory.replace('_', ' ')}!`);
        await loadMediaFiles(); // This will trigger homepage update
      }

      if (failedFiles.length > 0) {
        setUploadError(`⚠️ Failed to add: ${failedFiles.join(', ')}`);
      }

    } catch (error: any) {
      console.error('⚠️ Google Drive import failed:', error);
      setUploadError(error.message || 'Google Drive import failed');
    } finally {
      setUploading(false);
    }
  };

  // Enhanced media file record creation
  const createMediaFileRecord = async (driveFile: any, originalFile?: File): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileType = driveFile.mimeType?.startsWith('video/') ? 'video' : 
                      driveFile.mimeType?.startsWith('image/') ? 'image' : 'other';

      // CRITICAL: Enhanced URL construction for homepage display
      const downloadUrl = driveFile.mimeType?.startsWith('image/') 
        ? `https://drive.google.com/uc?export=view&id=${driveFile.id}`
        : `https://drive.google.com/uc?export=download&id=${driveFile.id}`;

      const { data, error } = await supabase
        .from('media_files')
        .insert([{
          name: driveFile.name,
          original_name: driveFile.name,
          mime_type: driveFile.mimeType,
          file_size: originalFile?.size || parseInt(driveFile.size || '0'),
          google_drive_file_id: driveFile.id,
          download_url: downloadUrl,
          thumbnail_url: driveFile.thumbnailLink || null,
          web_view_link: driveFile.webViewLink || '',
          file_type: fileType,
          uploaded_by: user.id,
          is_public: true,
          is_archived: false
        }])
        .select()
        .single();

      if (error) throw error;
      console.log(`💾 Created media file record: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('⚠️ Failed to create media file record:', error);
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
      console.log(`🏠 Created homepage media entry for ${mediaType}`);
    } catch (error) {
      console.error('⚠️ Failed to create homepage media entry:', error);
      throw error;
    }
  };

  // Enhanced toggle with homepage sync
  const toggleMediaActive = async (mediaId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('homepage_media')
        .update({ is_active: !currentStatus })
        .eq('id', mediaId);

      if (error) throw error;
      
      console.log(`🔄 Toggled media ${mediaId} to ${!currentStatus ? 'active' : 'inactive'}`);
      await loadMediaFiles(); // This will trigger homepage update
      setSuccessMessage(`✅ Media ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      console.error('⚠️ Error toggling media status:', error);
      setUploadError(error.message);
    }
  };

  // Enhanced delete with homepage sync
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
      
      console.log(`🗑️ Deleted media: ${fileName}`);
      await loadMediaFiles(); // This will trigger homepage update
      setSuccessMessage(`✅ "${fileName}" deleted successfully!`);
    } catch (error: any) {
      console.error('⚠️ Error deleting media:', error);
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
      
      console.log('🔗 Initializing Google Drive connection...');
      const initialized = await googleDriveService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google Drive service');
      }

      console.log('🔐 Starting authentication...');
      const authSuccess = await googleDriveService.authenticate();
      if (authSuccess) {
        setDriveConnected(true);
        setSuccessMessage('✅ Google Drive connected successfully! You can now import files.');
        console.log('✅ Google Drive authentication successful');
      } else {
        throw new Error('Authentication was cancelled or failed');
      }
    } catch (error: any) {
      console.error('⚠️ Google Drive connection failed:', error);
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
            🎬 Homepage Media Manager
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Upload and manage media for your homepage sections • Database integrated with real-time sync
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
                  <span className="text-sm text-gray-300 min-w-[60px]">
                    {progress === -1 ? 'Failed' : progress === 100 ? 'Complete' : `${progress}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
              Click to browse or drag & drop • Max 100MB per file •
              {currentTab?.maxFiles === 999 ? ' Unlimited files' : ` Max ${currentTab?.maxFiles} files`}
            </p>
            
            {currentTab && currentMedia.length >= currentTab.maxFiles && currentTab.maxFiles !== 999 && (
              <div className="mt-3 p-2 bg-orange-500/20 border border-orange-500/30 rounded text-orange-400 text-xs">
                ⚠️ Maximum files reached for this category ({currentTab.maxFiles})
              </div>
            )}
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
                    📂 Browse Files
                  </button>
                  <button
                    onClick={checkDriveConnection}
                    className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs lg:text-sm"
                  >
                    🔄 Refresh
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnectDrive}
                  disabled={uploading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm lg:text-base"
                >
                  🔗 Connect Google Drive
                </button>
              )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              {driveConnected ? (
                <span className="text-green-400">✅ Connected to Google Drive</span>
              ) : (
                <span className="text-gray-400">⚪ Not connected</span>
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
                  🔄 Refresh
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentMedia.map(file => (
              <div
                key={file.id}
                className={`
                  relative bg-white/10 rounded-xl overflow-hidden border-2 transition-all group
                  ${file.isActive ? 'border-yellow-400 shadow-lg' : 'border-white/20 hover:border-white/40'}
                `}
              >
                {/* Media Preview */}
                <div className="aspect-video bg-black/20 relative overflow-hidden">
                  {file.type === 'image' ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (file.google_drive_file_id && !target.src.includes('uc?export=view')) {
                          target.src = `https://drive.google.com/uc?export=view&id=${file.google_drive_file_id}`;
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
                    {file.isActive ? '✅ Active' : '💤 Inactive'}
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
                          setSuccessMessage('📋 URL copied to clipboard!');
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
                      Order: {file.displayOrder}
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
                  📁 Upload Files
                </button>
                {driveConnected && (
                  <button
                    onClick={() => setDriveModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    ☁️ Import from Drive
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

        {/* Enhanced Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 bg-black/90 text-white p-3 rounded-lg text-xs max-w-xs z-50">
            <div className="font-bold mb-2">🛠️ Debug Info</div>
            <div>Total Files: {mediaFiles.length}</div>
            <div>Current Category: {selectedCategory}</div>
            <div>Filtered: {currentMedia.length}</div>
            <div>Drive Connected: {driveConnected ? '✅' : '⚠️'}</div>
            <div>Database: {supabase ? '✅' : '⚠️'}</div>
            <div>LocalStorage: {localStorage.getItem('boujee_all_media') ? '✅' : '⚠️'}</div>
            <button
              onClick={() => {
                console.log('🏠 Current media files:', mediaFiles);
                console.log('💾 LocalStorage data:', localStorage.getItem('boujee_all_media'));
                // Manually trigger homepage update
                window.dispatchEvent(new CustomEvent('mediaUpdated'));
              }}
              className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs w-full"
            >
              📢 Trigger Homepage Update
            </button>
            <button
              onClick={loadMediaFiles}
              className="mt-1 px-2 py-1 bg-green-600 rounded text-xs w-full"
            >
              🔄 Refresh Media
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectedHomepageMediaManager;
