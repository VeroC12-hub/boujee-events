import React, { useState, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress'; // Uses your existing Radix UI progress
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function DriveUploader({ eventId }: { eventId?: string }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Validate file
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        console.error(`File ${file.name} is too large`);
        continue;
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
      newFiles.forEach(uploadToSupabase);
    }
  }, []);

  const uploadToSupabase = async (uploadFile: UploadFile) => {
    if (!supabase || !user) {
      console.error('Supabase not configured or user not authenticated');
      return;
    }

    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
    ));

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${uploadFile.file.name}`;
      const { data, error } = await supabase.storage
        .from('event-media')
        .upload(fileName, uploadFile.file, {
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id ? { ...f, progress: percentage } : f
            ));
          }
        });

      if (error) throw error;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('media_files')
        .insert({
          name: fileName,
          original_name: uploadFile.file.name,
          mime_type: uploadFile.file.type,
          file_size: uploadFile.file.size,
          google_drive_file_id: data.path, // Use Supabase path for now
          file_type: uploadFile.file.type.startsWith('image/') ? 'image' : 'video',
          uploaded_by: user.id,
          is_public: true
        });

      if (dbError) throw dbError;

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ));

    } catch (error) {
      console.error('Upload failed:', error);
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: 'Upload failed' }
          : f
      ));
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

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
      >
        <div className="text-4xl mb-4">📁</div>
        <h3 className="text-lg font-semibold mb-2">
          {isDragOver ? 'Drop files here' : 'Upload to Drive'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop files here, or click to select
        </p>
        <Button onClick={() => fileInputRef.current?.click()}>
          Select Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Upload Queue ({files.length})</h3>
          {files.map((file) => (
            <div key={file.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium truncate">{file.file.name}</span>
                <span className="text-sm text-muted-foreground">
                  {(file.file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              
              {file.status === 'uploading' && (
                <div className="space-y-2">
                  <Progress value={file.progress} />
                  <p className="text-xs text-muted-foreground">
                    Uploading... {Math.round(file.progress)}%
                  </p>
                </div>
              )}
              
              {file.status === 'completed' && (
                <p className="text-sm text-green-600">✅ Upload completed</p>
              )}
              
              {file.status === 'error' && (
                <p className="text-sm text-red-600">❌ {file.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
