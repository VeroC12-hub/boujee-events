import React, { useState, useCallback } from 'react';
import { Upload, X, FileImage, FileVideo, AlertCircle, CheckCircle, FolderOpen } from 'lucide-react';
import { googleDriveService, type UploadProgress } from '../../services/googleDriveService';
import { mediaService } from '../../services/mediaService';

interface MediaUploadProps {
  eventId?: string;
  eventName?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  driveFileId: string;
  mediaFileId?: string;
  type: 'image' | 'video';
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export default function MediaUpload({
  eventId,
  eventName = 'Untitled Event',
  onUploadComplete,
  maxFiles = 10,
  maxFileSize = 100,
  acceptedTypes = ['image/*', 'video/*'],
  className = ''
}: MediaUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [eventFolder, setEventFolder] = useState<any>(null);

  const initializeGoogleDrive = useCallback(async () => {
    if (isInitialized) return true;
    
    try {
      const initialized = await googleDriveService.initialize();
      if (initialized) {
        setIsInitialized(true);
        console.log('✅ Google Drive initialized for media upload');
      }
      return initialized;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error);
      return false;
    }
  }, [isInitialized]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, []);

  const handleFiles = useCallback(async (fileList: File[]) => {
    if (files.length + fileList.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = fileList.filter(file => {
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type;
      });
      
      const isValidSize = file.size <= maxFileSize * 1024 * 1024;
      
      if (!isValidType) {
        alert(`File ${file.name} is not a supported type`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`File ${file.name} exceeds ${maxFileSize}MB limit`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Initialize Google Drive
      const initialized = await initializeGoogleDrive();
      if (!initialized) {
        alert('Google Drive not available. Please check your configuration.');
        setIsUploading(false);
        return;
      }

      // Authenticate if needed
      const authenticated = await googleDriveService.authenticate();
      if (!authenticated) {
        alert('Google Drive authentication failed. Please try again.');
        setIsUploading(false);
        return;
      }

      // Create event folder if needed
      let folder = eventFolder;
      if (!folder && eventId) {
        try {
          folder = await googleDriveService.createEventFolder(eventName, eventId);
          setEventFolder(folder);
          console.log('📁 Created event folder:', folder);
        } catch (error) {
          console.error('❌ Failed to create event folder:', error);
          alert('Failed to create event folder in Google Drive.');
          setIsUploading(false);
          return;
        }
      }

      // Create initial file entries
      const newFiles: UploadedFile[] = validFiles.map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        driveFileId: '',
        type: file.type.startsWith('image/') ? 'image' : 'video',
        size: file.size,
        status: 'uploading',
        progress: 0
      }));

      setFiles(prev => [...prev, ...newFiles]);

      // Upload files
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileEntry = newFiles[i];

        try {
          // Determine target folder
          let targetFolderId: string;
          
          if (folder) {
            targetFolderId = fileEntry.type === 'image' 
              ? folder.photosFolderId 
              : folder.videosFolderId;
          } else {
            throw new Error('Event folder required for uploads');
          }

          // Upload to Google Drive
          const driveFile = await googleDriveService.uploadFile(
            file,
            targetFolderId,
            (progress: UploadProgress) => {
              setFiles(prev => prev.map(f => 
                f.id === fileEntry.id 
                  ? { ...f, progress: progress.percentage }
                  : f
              ));
            }
          );

          // Update status to processing
          setFiles(prev => prev.map(f => 
            f.id === fileEntry.id 
              ? { 
                  ...f, 
                  status: 'processing', 
                  driveFileId: driveFile.id,
                  webViewLink: driveFile.webViewLink,
                  thumbnailLink: driveFile.thumbnailLink
                }
              : f
          ));

          // Save to database if mediaService is available
          try {
            const mediaFile = await mediaService.createMediaFile({
              name: driveFile.name,
              original_name: file.name,
              mime_type: file.type,
              file_size: file.size,
              google_drive_file_id: driveFile.id,
              file_type: fileEntry.type,
              is_public: true,
              uploaded_by: 'current-user-id' // Replace with actual user ID
            });

            // Link to event if provided
            if (eventId && mediaFile) {
              await mediaService.createEventMedia({
                event_id: eventId,
                media_file_id: mediaFile.id,
                is_featured: false,
                display_order: files.length + i
              });
            }

            // Update with media file ID
            setFiles(prev => prev.map(f => 
              f.id === fileEntry.id 
                ? { 
                    ...f, 
                    status: 'completed', 
                    progress: 100,
                    mediaFileId: mediaFile?.id 
                  }
                : f
            ));
          } catch (dbError) {
            console.warn('⚠️ Database save failed, but file uploaded to Drive:', dbError);
            // Still mark as completed since Drive upload succeeded
            setFiles(prev => prev.map(f => 
              f.id === fileEntry.id 
                ? { ...f, status: 'completed', progress: 100 }
                : f
            ));
          }

        } catch (error) {
          console.error('❌ Upload failed:', error);
          setFiles(prev => prev.map(f => 
            f.id === fileEntry.id 
              ? { 
                  ...f, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : f
          ));
        }
      }

      // Call completion callback
      if (onUploadComplete) {
        const completedFiles = newFiles.filter(f => f.status === 'completed');
        onUploadComplete(completedFiles);
      }

    } catch (error) {
      console.error('❌ Upload process failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [files, maxFiles, maxFileSize, acceptedTypes, eventId, eventName, eventFolder, onUploadComplete, initializeGoogleDrive]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const retryUpload = useCallback((fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'uploading', progress: 0, error: undefined }
        : f
    ));
    // Would need to implement retry logic here
  }, []);

  const getFileIcon = (type: string) => {
    return type === 'image' ? FileImage : FileVideo;
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`media-upload ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Media Files
        </h3>
        <p className="text-sm text-gray-600">
          {eventFolder ? (
            <span className="flex items-center">
              <FolderOpen className="h-4 w-4 mr-1" />
              Uploading to: {eventName}
            </span>
          ) : (
            'Drag and drop files or click to select'
          )}
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          {isDragOver ? 'Drop files here' : 'Upload Media Files'}
        </h4>
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to select
        </p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Supports: {acceptedTypes.join(', ')}</p>
          <p>Max file size: {maxFileSize}MB each</p>
          <p>Max files: {maxFiles} total</p>
        </div>
        
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        
        <button
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading}
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById('file-upload')?.click();
          }}
        >
          {isUploading ? 'Uploading...' : 'Select Files'}
        </button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Upload Progress ({files.filter(f => f.status === 'completed').length}/{files.length} completed)
            </h4>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-gray-500 hover:text-gray-700"
              disabled={isUploading}
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-4">
            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              const statusColor = getStatusColor(file.status);
              
              return (
                <div key={file.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <Icon className={`h-10 w-10 ${statusColor} mr-4 flex-shrink-0`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="capitalize">{file.type}</span>
                      <span className={statusColor}>
                        {file.status === 'uploading' && 'Uploading...'}
                        {file.status === 'processing' && 'Processing...'}
                        {file.status === 'completed' && 'Completed'}
                        {file.status === 'error' && 'Failed'}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="mb-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              file.status === 'uploading' ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {file.progress}% complete
                        </p>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {file.status === 'error' && file.error && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-red-600">
                          {file.error}
                        </p>
                        <button
                          onClick={() => retryUpload(file.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 ml-2"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Success Links */}
                    {file.status === 'completed' && file.webViewLink && (
                      <div className="flex items-center space-x-2 mt-1">
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          View in Drive
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Icon */}
                  <div className="ml-4 flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={file.status === 'uploading' || file.status === 'processing'}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
