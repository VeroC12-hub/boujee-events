import React, { useState, useCallback } from 'react';
import { googleDriveService } from '../services/googleDriveService';
import { mediaService } from '../services/mediaService';

interface FileUploadOptions {
  parentFolderId?: string;
  isPublic?: boolean;
  onProgress?: (progress: ProgressEvent) => void;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface DriveUploaderProps {
  onFilesUploaded?: (files: any[]) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  parentFolderId?: string;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  className?: string;
}

const DriveUploader: React.FC<DriveUploaderProps> = ({
  onFilesUploaded,
  onUploadProgress,
  parentFolderId = 'root',
  acceptedTypes = ['image/*', 'video/*'],
  maxFiles = 10,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProgress = useCallback((fileIndex: number, progress: ProgressEvent) => {
    const progressData: UploadProgress = {
      loaded: progress.loaded,
      total: progress.total,
      percentage: Math.round((progress.loaded / progress.total) * 100)
    };

    setUploadProgress(prev => {
      const newProgress = [...prev];
      newProgress[fileIndex] = progressData;
      return newProgress;
    });

    if (onUploadProgress) {
      onUploadProgress(progressData);
    }
  }, [onUploadProgress]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File ${file.name} is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File ${file.name} type is not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFiles = async (files: FileList | File[]) => {
    setError(null);
    setUploading(true);
    
    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setUploading(false);
        return;
      }
    }

    if (fileArray.length > maxFiles) {
      setError(`Too many files selected. Maximum is ${maxFiles} files.`);
      setUploading(false);
      return;
    }

    // Initialize progress tracking
    setUploadProgress(fileArray.map(() => ({ loaded: 0, total: 0, percentage: 0 })));

    try {
      const uploadedFiles = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Create proper file options with progress callback
        const fileOptions: FileUploadOptions = {
          parentFolderId,
          isPublic: true,
          onProgress: (progress: ProgressEvent) => handleProgress(i, progress)
        };

        // Upload to Google Drive
        const driveFile = await googleDriveService.uploadFile(
          file,
          parentFolderId,
          fileOptions.onProgress
        );

        if (driveFile) {
          // Save to database
          const mediaFile = await mediaService.createMediaFile({
            name: driveFile.name,
            original_name: file.name,
            mime_type: file.type,
            file_size: file.size,
            google_drive_file_id: driveFile.id,
            file_type: file.type.startsWith('image/') ? 'image' : 
                      file.type.startsWith('video/') ? 'video' : 'other',
            is_public: true,
            is_archived: false, // Add the required property
            uploaded_by: 'current_user' // Replace with actual user ID
          });

          if (mediaFile) {
            uploadedFiles.push({
              driveFile,
              mediaFile,
              originalFile: file
            });
          }
        }
      }

      if (onFilesUploaded) {
        onFilesUploaded(uploadedFiles);
      }

      // Reset progress after successful upload
      setTimeout(() => {
        setUploadProgress([]);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const totalProgress = uploadProgress.length > 0 
    ? Math.round(uploadProgress.reduce((sum, p) => sum + p.percentage, 0) / uploadProgress.length)
    : 0;

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${dragActive 
            ? 'border-yellow-400 bg-yellow-400/10 scale-105' 
            : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-400/5'
          }
          ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-4">
          <div className="text-6xl">
            {uploading ? '⏳' : dragActive ? '📂' : '☁️'}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {uploading ? 'Uploading files...' : 'Upload Files to Google Drive'}
            </h3>
            <p className="text-gray-400">
              {uploading 
                ? `Progress: ${totalProgress}%`
                : 'Drag and drop files here, or click to browse'
              }
            </p>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>Accepted formats: {acceptedTypes.join(', ')}</p>
            <p>Maximum file size: {Math.round(maxFileSize / 1024 / 1024)}MB</p>
            <p>Maximum files: {maxFiles}</p>
          </div>

          {uploading && (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          )}

          {uploadProgress.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploadProgress.map((progress, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">File {index + 1}</span>
                  <span className="text-yellow-400">{progress.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">❌</span>
            <span className="text-red-300">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {!googleDriveService && (
        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">⚠️</span>
            <span className="text-yellow-300">
              Google Drive service not configured. Files will be uploaded locally.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveUploader;
