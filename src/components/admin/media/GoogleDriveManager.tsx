import React, { useState, useEffect } from 'react';
import { 
  Upload, FolderOpen, Image, Video, Download, Trash2, 
  Eye, Search, Filter, Grid, List, RefreshCw, Cloud
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';

interface DriveFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'folder';
  size: string;
  modifiedTime: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  parentFolder?: string;
}

interface GoogleDriveManagerProps {
  eventId?: string;
  onFileSelect?: (file: DriveFile) => void;
  allowMultiSelect?: boolean;
}

const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  eventId,
  onFileSelect,
  allowMultiSelect = false
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Mock Google Drive files data
  const mockDriveFiles: DriveFile[] = [
    {
      id: '1',
      name: 'Events',
      type: 'folder',
      size: '--',
      modifiedTime: '2024-01-15',
    },
    {
      id: '2',
      name: 'Luxury-NYE-Gala-2024',
      type: 'folder',
      size: '--',
      modifiedTime: '2024-01-10',
      parentFolder: '1'
    },
    {
      id: '3',
      name: 'event-hero-image.jpg',
      type: 'image',
      size: '2.5 MB',
      modifiedTime: '2024-01-10',
      thumbnailUrl: '/placeholder.svg',
      downloadUrl: '#',
      parentFolder: '2'
    },
    {
      id: '4',
      name: 'venue-interior-1.jpg',
      type: 'image',
      size: '1.8 MB',
      modifiedTime: '2024-01-10',
      thumbnailUrl: '/placeholder.svg',
      downloadUrl: '#',
      parentFolder: '2'
    },
    {
      id: '5',
      name: 'venue-interior-2.jpg',
      type: 'image',
      size: '2.1 MB',
      modifiedTime: '2024-01-10',
      thumbnailUrl: '/placeholder.svg',
      downloadUrl: '#',
      parentFolder: '2'
    },
    {
      id: '6',
      name: 'event-promo-video.mp4',
      type: 'video',
      size: '45.2 MB',
      modifiedTime: '2024-01-09',
      thumbnailUrl: '/placeholder.svg',
      downloadUrl: '#',
      parentFolder: '2'
    }
  ];

  useEffect(() => {
    // Simulate loading files
    setLoading(true);
    setTimeout(() => {
      setFiles(mockDriveFiles);
      setLoading(false);
    }, 1000);
  }, [currentFolder]);

  const connectToGoogleDrive = async () => {
    setLoading(true);
    // Simulate OAuth2 connection
    setTimeout(() => {
      setIsConnected(true);
      setLoading(false);
    }, 2000);
  };

  const uploadFiles = () => {
    // Simulate file upload
    console.log('Opening file upload dialog...');
  };

  const createEventFolder = () => {
    if (!eventId) return;
    
    const folderName = `Event-${eventId}-${new Date().toISOString().split('T')[0]}`;
    console.log(`Creating folder: ${folderName}`);
    
    // Add new folder to files
    const newFolder: DriveFile = {
      id: Date.now().toString(),
      name: folderName,
      type: 'folder',
      size: '--',
      modifiedTime: new Date().toISOString().split('T')[0],
      parentFolder: currentFolder
    };
    
    setFiles(prev => [newFolder, ...prev]);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = fileType === 'all' || file.type === fileType;
    const matchesFolder = file.parentFolder === currentFolder;
    
    return matchesSearch && matchesType && matchesFolder;
  });

  const handleFileSelect = (file: DriveFile) => {
    if (file.type === 'folder') {
      setCurrentFolder(file.id);
      return;
    }

    if (allowMultiSelect) {
      setSelectedFiles(prev => 
        prev.includes(file.id) 
          ? prev.filter(id => id !== file.id)
          : [...prev, file.id]
      );
    } else {
      onFileSelect?.(file);
    }
  };

  const getBreadcrumb = () => {
    const path = ['Root'];
    if (currentFolder !== 'root') {
      const folder = files.find(f => f.id === currentFolder);
      if (folder) path.push(folder.name);
    }
    return path;
  };

  if (!isConnected) {
    return (
      <div className="card-luxury p-8 text-center">
        <div className="mb-6">
          <Cloud className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Connect to Google Drive</h3>
          <p className="text-muted-foreground mb-6">
            Manage your event media files directly from Google Drive with automatic organization and backup
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <FolderOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Auto Organization</h4>
            <p className="text-sm text-muted-foreground">
              Automatic folder creation: Events/[EventName-Date]/[Images|Videos]
            </p>
          </div>
          <div className="text-center">
            <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Easy Upload</h4>
            <p className="text-sm text-muted-foreground">
              Drag and drop media files directly to Google Drive from the admin panel
            </p>
          </div>
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Real-time Sync</h4>
            <p className="text-sm text-muted-foreground">
              Automatic backup and sync of all uploaded media files
            </p>
          </div>
        </div>

        <Button 
          onClick={connectToGoogleDrive} 
          disabled={loading}
          className="btn-luxury"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4 mr-2" />
              Connect Google Drive
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Secure OAuth2 authentication • No data stored locally
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Google Drive Media Manager</h3>
          <p className="text-muted-foreground">
            Manage event media files • Connected: <Badge variant="outline" className="text-green-600">✓ Active</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={uploadFiles} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          {eventId && (
            <Button onClick={createEventFolder} variant="outline">
              <FolderOpen className="h-4 w-4 mr-2" />
              Create Event Folder
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {getBreadcrumb().map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span>›</span>}
            <button
              onClick={() => index === 0 ? setCurrentFolder('root') : undefined}
              className="hover:text-foreground transition-colors"
            >
              {crumb}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="folder">Folders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoading(true)}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* File Grid/List */}
      <div className="card-luxury p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading files...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">No files found</h4>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'This folder is empty'}
            </p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
              : 'space-y-2'
            }
          `}>
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileSelect(file)}
                className={`
                  ${viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center gap-4'}
                  border border-border rounded-lg cursor-pointer transition-all
                  hover:border-primary hover:shadow-md
                  ${selectedFiles.includes(file.id) ? 'border-primary bg-primary/10' : ''}
                `}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {file.type === 'folder' ? (
                        <FolderOpen className="h-8 w-8 text-primary" />
                      ) : file.type === 'image' ? (
                        <img 
                          src={file.thumbnailUrl} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm truncate">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                      <p className="text-xs text-muted-foreground">{file.modifiedTime}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      {file.type === 'folder' ? (
                        <FolderOpen className="h-5 w-5 text-primary" />
                      ) : file.type === 'image' ? (
                        <Image className="h-5 w-5 text-primary" />
                      ) : (
                        <Video className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">{file.size} • {file.modifiedTime}</p>
                    </div>
                    <div className="flex gap-2">
                      {file.type !== 'folder' && (
                        <>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Files Summary */}
      {selectedFiles.length > 0 && (
        <div className="card-luxury p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {selectedFiles.length} file(s) selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Selected
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedFiles([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveManager;