import React, { useState, useEffect } from 'react';
import { 
  Folder, Upload, Download, Search, Filter, MoreVertical,
  Eye, Trash2, Share2, Move, Copy, FileImage, FileVideo,
  FileText, Archive, RefreshCw, CheckCircle, AlertCircle,
  Clock, User, Calendar, HardDrive, Settings, Link
} from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'folder';
  size: number;
  modifiedTime: string;
  createdTime: string;
  owner: string;
  eventId?: string;
  eventName?: string;
  url: string;
  thumbnailUrl?: string;
  shared: boolean;
}

interface DriveFolder {
  id: string;
  name: string;
  eventId?: string;
  eventName?: string;
  fileCount: number;
  size: number;
  createdTime: string;
}

const GoogleDriveIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [lastSync, setLastSync] = useState('2025-08-03T17:20:00Z');

  // Mock data - replace with actual Google Drive API calls
  const [folders] = useState<DriveFolder[]>([
    {
      id: 'folder1',
      name: 'Budapest Summer Music Festival 2025',
      eventId: 'event1',
      eventName: 'Budapest Summer Music Festival 2025',
      fileCount: 47,
      size: 234567890,
      createdTime: '2025-07-15T10:00:00Z'
    },
    {
      id: 'folder2',
      name: 'Luxury Wine Tasting 2025',
      eventId: 'event2',
      eventName: 'Luxury Wine Tasting Experience',
      fileCount: 23,
      size: 156789012,
      createdTime: '2025-07-20T14:30:00Z'
    },
    {
      id: 'folder3',
      name: 'Corporate Gala Night 2025',
      eventId: 'event3',
      eventName: 'Danube Corporate Gala Night',
      fileCount: 31,
      size: 198765432,
      createdTime: '2025-07-25T09:15:00Z'
    }
  ]);

  const [files] = useState<DriveFile[]>([
    {
      id: 'file1',
      name: 'festival-main-stage.jpg',
      type: 'image',
      size: 2456789,
      modifiedTime: '2025-08-03T16:45:00Z',
      createdTime: '2025-08-03T16:45:00Z',
      owner: 'VeroC12-hub',
      eventId: 'event1',
      eventName: 'Budapest Summer Music Festival 2025',
      url: '/api/placeholder/400/300',
      thumbnailUrl: '/api/placeholder/150/100',
      shared: true
    },
    {
      id: 'file2',
      name: 'event-highlights.mp4',
      type: 'video',
      size: 45678901,
      modifiedTime: '2025-08-03T15:30:00Z',
      createdTime: '2025-08-03T15:30:00Z',
      owner: 'VeroC12-hub',
      eventId: 'event1',
      eventName: 'Budapest Summer Music Festival 2025',
      url: '/api/placeholder/video.mp4',
      shared: false
    },
    {
      id: 'file3',
      name: 'wine-tasting-menu.pdf',
      type: 'document',
      size: 567890,
      modifiedTime: '2025-08-02T11:20:00Z',
      createdTime: '2025-08-02T11:20:00Z',
      owner: 'VeroC12-hub',
      eventId: 'event2',
      eventName: 'Luxury Wine Tasting Experience',
      url: '/api/placeholder/document.pdf',
      shared: true
    }
  ]);

  const connectToGoogleDrive = async () => {
    setIsLoading(true);
    // Simulate Google OAuth flow
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 2000);
  };

  const syncFiles = async () => {
    setIsLoading(true);
    // Simulate sync operation
    setTimeout(() => {
      setLastSync(new Date().toISOString());
      setIsLoading(false);
    }, 3000);
  };

  const createEventFolder = async (eventName: string, eventId: string) => {
    // Create folder structure: /Events/YYYY/Event Name - Date/
    const year = new Date().getFullYear();
    const folderPath = `/Events/${year}/${eventName}`;
    
    // Simulate API call
    console.log(`Creating folder: ${folderPath} for event ${eventId}`);
  };

  const uploadFile = async (file: File, eventId?: string) => {
    setIsLoading(true);
    
    // Auto-organize by event if eventId provided
    if (eventId) {
      // Upload to specific event folder
      console.log(`Uploading ${file.name} to event ${eventId} folder`);
    }
    
    // Simulate upload
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-5 w-5 text-blue-500" />;
      case 'video': return <FileVideo className="h-5 w-5 text-purple-500" />;
      case 'document': return <FileText className="h-5 w-5 text-red-500" />;
      case 'folder': return <Folder className="h-5 w-5 text-yellow-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HardDrive className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect to Google Drive</h2>
          <p className="text-gray-600 mb-6">
            Automatically organize and backup your event media files to Google Drive
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">What you'll get:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatic folder organization by event and date</li>
              <li>• Real-time backup of uploaded media</li>
              <li>• Direct access to files from admin panel</li>
              <li>• Secure file sharing and collaboration</li>
              <li>• Unlimited storage (with Google Drive plan)</li>
            </ul>
          </div>
          
          <button 
            onClick={connectToGoogleDrive}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center mx-auto"
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Link className="h-5 w-5 mr-2" />
            )}
            {isLoading ? 'Connecting...' : 'Connect Google Drive'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Google Drive Connected</h2>
              <p className="text-sm text-gray-600">
                Last sync: {formatDate(lastSync)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Auto-backup:</span>
              <button
                onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoBackupEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <button 
              onClick={syncFiles}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Now
            </button>
            
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <div className="w-4 h-4 space-y-1">
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
              </div>
            </button>
            
            <label className="bg-amber-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-amber-600 flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
              <input type="file" multiple className="hidden" onChange={(e) => {
                if (e.target.files) {
                  Array.from(e.target.files).forEach(file => uploadFile(file));
                }
              }} />
            </label>
          </div>
        </div>
      </div>

      {/* Event Folders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Event Folders</h3>
          <p className="text-sm text-gray-600">Automatically organized by event and date</p>
        </div>
        
        <div className="p-6">
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {folders.map((folder) => (
              <div 
                key={folder.id}
                className={`border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'flex items-center justify-between' : ''
                }`}
              >
                <div className={`flex items-center ${viewMode === 'list' ? 'flex-1' : 'mb-3'}`}>
                  <Folder className="h-8 w-8 text-amber-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{folder.name}</h4>
                    <p className="text-sm text-gray-600">
                      {folder.fileCount} files • {formatFileSize(folder.size)}
                    </p>
                  </div>
                </div>
                
                {viewMode === 'grid' && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created {formatDate(folder.createdTime)}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {viewMode === 'list' && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{formatDate(folder.createdTime)}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Files */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Recent Files</h3>
          <p className="text-sm text-gray-600">Latest uploaded and modified files</p>
        </div>
        
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    {getFileIcon(file.type)}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFiles(prev => 
                          prev.includes(file.id) 
                            ? prev.filter(id => id !== file.id)
                            : [...prev, file.id]
                        );
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedFiles.includes(file.id) 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedFiles.includes(file.id) && <CheckCircle className="h-3 w-3" />}
                    </button>
                  </div>
                  
                  {file.thumbnailUrl && (
                    <img 
                      src={file.thumbnailUrl} 
                      alt={file.name}
                      className="w-full h-24 object-cover rounded mb-3"
                    />
                  )}
                  
                  <h4 className="font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(file.modifiedTime)}</p>
                  
                  {file.eventName && (
                    <div className="mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded truncate">
                      {file.eventName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFiles(prev => 
                          prev.includes(file.id) 
                            ? prev.filter(id => id !== file.id)
                            : [...prev, file.id]
                        );
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedFiles.includes(file.id) 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedFiles.includes(file.id) && <CheckCircle className="h-3 w-3" />}
                    </button>
                    
                    {getFileIcon(file.type)}
                    
                    <div>
                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(file.size)} • Modified {formatDate(file.modifiedTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {file.eventName && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {file.eventName}
                      </span>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Bulk Actions */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </span>
                
                <div className="flex items-center space-x-2">
                  <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    <Download className="h-4 w-4 inline mr-1" />
                    Download
                  </button>
                  <button className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
                    <Move className="h-4 w-4 inline mr-1" />
                    Move
                  </button>
                  <button className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveIntegration;
