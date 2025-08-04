import React, { useState, useEffect } from 'react';
import { 
  Upload, Folder, Image, Video, File, Download, 
  Link, Trash2, RefreshCw, Search, Filter,
  Cloud, CheckCircle, AlertCircle, Play
} from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'folder';
  size: string;
  modifiedTime: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  webViewLink?: string;
}

interface GoogleDriveManagerProps {
  onFileSelect?: (file: DriveFile) => void;
  onClose?: () => void;
  allowMultiple?: boolean;
  fileTypes?: string[];
}

const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  onFileSelect,
  onClose,
  allowMultiple = false,
  fileTypes = ['image', 'video', 'document']
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [connected, setConnected] = useState(false);

  // Mock Google Drive files for demonstration
  const mockFiles: DriveFile[] = [
    {
      id: '1',
      name: 'Event Photos',
      type: 'folder',
      size: '15 items',
      modifiedTime: '2025-01-15',
    },
    {
      id: '2',
      name: 'VIP Gala 2024.jpg',
      type: 'image',
      size: '2.4 MB',
      modifiedTime: '2025-01-14',
      thumbnailUrl: '/api/placeholder/150/100',
      downloadUrl: '/api/placeholder/800/600'
    },
    {
      id: '3',
      name: 'Event Promo Video.mp4',
      type: 'video',
      size: '45.2 MB',
      modifiedTime: '2025-01-13',
      thumbnailUrl: '/api/placeholder/150/100'
    },
    {
      id: '4',
      name: 'Event Guidelines.pdf',
      type: 'document',
      size: '1.1 MB',
      modifiedTime: '2025-01-12'
    },
    {
      id: '5',
      name: 'Concert Performance.jpg',
      type: 'image',
      size: '3.1 MB',
      modifiedTime: '2025-01-11',
      thumbnailUrl: '/api/placeholder/150/100'
    }
  ];

  useEffect(() => {
    loadFiles();
  }, [currentFolder, searchQuery, filterType]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      // Simulate API call to Google Drive
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredFiles = mockFiles;
      
      if (searchQuery) {
        filteredFiles = filteredFiles.filter(file =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (filterType !== 'all') {
        filteredFiles = filteredFiles.filter(file => file.type === filterType);
      }
      
      setFiles(filteredFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToGoogleDrive = async () => {
    setLoading(true);
    try {
      // Simulate Google Drive OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnected(true);
      loadFiles();
    } catch (error) {
      console.error('Error connecting to Google Drive:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: DriveFile) => {
    if (allowMultiple) {
      const isSelected = selectedFiles.find(f => f.id === file.id);
      if (isSelected) {
        setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
      } else {
        setSelectedFiles([...selectedFiles, file]);
      }
    } else {
      onFileSelect?.(file);
      onClose?.();
    }
  };

  const handleConfirmSelection = () => {
    if (allowMultiple && selectedFiles.length > 0) {
      // For multiple selection, you might want to handle this differently
      selectedFiles.forEach(file => onFileSelect?.(file));
      onClose?.();
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return Folder;
      case 'image': return Image;
      case 'video': return Video;
      default: return File;
    }
  };

  if (!connected) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-8 text-center">
          <Cloud className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect to Google Drive</h2>
          <p className="text-gray-400 mb-6">
            Connect your Google Drive account to access and manage your event media files.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={connectToGoogleDrive}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Cloud className="w-5 h-5" />
                  Connect Google Drive
                </>
              )}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cloud className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Google Drive Media Manager</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-12 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Files</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
              <option value="folder">Folders</option>
            </select>
            
            <button
              onClick={loadFiles}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white p-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
                Loading files...
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const IconComponent = getFileIcon(file.type);
                const isSelected = selectedFiles.find(f => f.id === file.id);
                
                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-400 ${
                      isSelected ? 'border-blue-400 bg-blue-500/10' : 'border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {file.thumbnailUrl ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                          <img
                            src={file.thumbnailUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          {file.type === 'video' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{file.name}</h3>
                        <p className="text-gray-400 text-sm">{file.size}</p>
                        <p className="text-gray-500 text-xs">{file.modifiedTime}</p>
                      </div>
                      
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {allowMultiple && (
          <div className="bg-gray-800 p-6 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={selectedFiles.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select Files
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDriveManager;