import React, { useState, useCallback, useRef } from 'react';

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  size: number;
  name: string;
  uploaded?: boolean;
  error?: string;
}

interface MediaUploaderProps {
  onFilesChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  existingFiles?: MediaFile[];
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 50, // 50MB default
  acceptedTypes = ['image/*', 'video/*'],
  existingFiles = []
}) => {
  const [files, setFiles] = useState<MediaFile[]>(existingFiles);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFileType = (file: File): boolean => {
    return acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  };

  const isValidFileSize = (file: File): boolean => {
    return file.size <= maxFileSize * 1024 * 1024;
  };

  const getFileType = (file: File): 'image' | 'video' => {
    return file.type.startsWith('image/') ? 'image' : 'video';
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (fileList: FileList) => {
    const newFiles: MediaFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Validation
      if (!isValidFileType(file)) {
        alert(`Invalid file type: ${file.name}`);
        continue;
      }
      
      if (!isValidFileSize(file)) {
        alert(`File too large: ${file.name} (max ${maxFileSize}MB)`);
        continue;
      }
      
      if (files.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        break;
      }
      
      const preview = await createPreview(file);
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        type: getFileType(file),
        size: file.size,
        name: file.name,
        uploaded: false
      };
      
      newFiles.push(mediaFile);
    }
    
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [files, maxFiles, maxFileSize]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateUpload = async (fileId: string) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Mark as uploaded
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, uploaded: true } : f
    ));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : files.length >= maxFiles
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={files.length >= maxFiles}
        />
        
        <div className="space-y-4">
          <div className="text-4xl">
            {dragActive ? '📤' : '📁'}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {dragActive
                ? 'Drop files here'
                : files.length >= maxFiles
                ? `Maximum ${maxFiles} files reached`
                : 'Drag & drop files here, or click to select'
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports images and videos up to {maxFileSize}MB each
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {files.length}/{maxFiles} files uploaded
            </p>
          </div>
          
          {!dragActive && files.length < maxFiles && (
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose Files
            </button>
          )}
        </div>
      </div>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Media Preview */}
              <div className="aspect-square relative">
                {file.type === 'image' ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <video
                      src={file.preview}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <span className="text-white text-2xl">▶️</span>
                    </div>
                  </div>
                )}
                
                {/* Upload Progress */}
                {uploadProgress[file.id] !== undefined && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-sm font-medium">{uploadProgress[file.id]}%</div>
                      <div className="w-16 h-1 bg-gray-300 rounded-full mt-1">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${uploadProgress[file.id]}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Upload Status */}
                {file.uploaded && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Uploaded
                    </span>
                  </div>
                )}
                
                {/* File Type Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    file.type === 'image'
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}>
                    {file.type === 'image' ? '🖼️' : '🎥'}
                  </span>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-8 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* File Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
                
                {/* Upload Button */}
                {!file.uploaded && uploadProgress[file.id] === undefined && (
                  <button
                    onClick={() => simulateUpload(file.id)}
                    className="w-full mt-2 bg-green-600 text-white text-xs py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    Upload
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{files.length}</span> files selected
              <span className="mx-2">•</span>
              <span className="font-medium">
                {files.filter(f => f.uploaded).length}
              </span> uploaded
            </div>
            <div className="text-sm text-gray-500">
              Total size: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
            </div>
          </div>
          
          {/* Batch Actions */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => {
                files.filter(f => !f.uploaded).forEach(f => simulateUpload(f.id));
              }}
              disabled={files.every(f => f.uploaded)}
              className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload All
            </button>
            <button
              onClick={() => {
                setFiles([]);
                onFilesChange([]);
              }}
              className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
