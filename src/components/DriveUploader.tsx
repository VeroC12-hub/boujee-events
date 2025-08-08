import React, { useState, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  url?: string;
}

interface DriveUploaderProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  eventId?: string;
}

export function DriveUploader({ 
  onUploadComplete, 
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  eventId 
}: DriveUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />;
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
    
    if (!isAccepted) {
      return `File type ${file.type} is not accepted`;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return 'File size must be less than 50MB';
    }

    return null;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        // Show error for invalid files
        console.error(`Invalid file ${file.name}: ${validationError}`);
        continue;
      }

      if (files.length + newFiles.length >= maxFiles) {
        console.error(`Maximum ${maxFiles} files allowed`);
        break;
      }

      newFiles.push({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'queued'
      });
    }
    
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      // Start uploads immediately
      newFiles.forEach(uploadFile);
    }
  }, [files.length, maxFiles]);

  const uploadFile = async (uploadFile: UploadFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading' }
        : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      if (eventId) formData.append('eventId', eventId);

      const response = await fetch('/api/upload-to-drive', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              url: result.url 
            }
          : f
      ));

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : f
      ));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const completedFiles = files.filter(f => f.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {isDragOver ? 'Drop files here' : 'Upload files to Google Drive'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop files here, or click to select files
        </p>
        <Button onClick={() => fileInputRef.current?.click()}>
          Select Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Max {maxFiles} files, 50MB each. Supported: Images, Videos, PDFs
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Upload Queue ({files.length})
            </h3>
            {completedFiles.length > 0 && (
              <Badge variant="secondary">
                {completedFiles.length} completed
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {getFileIcon(file.file)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <div className="space-y-2">
                    <Progress value={file.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Uploading... {file.progress}%
                    </p>
                  </div>
                )}

                {/* Error State */}
                {file.status === 'error' && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600">{file.error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => retryUpload(file.id)}
                    >
                      Retry Upload
                    </Button>
                  </div>
                )}

                {/* Success State */}
                {file.status === 'completed' && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600">Upload completed</p>
                    {file.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        View File
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
