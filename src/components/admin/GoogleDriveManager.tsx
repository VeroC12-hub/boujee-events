import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  Upload, 
  Image, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Trash2,
  MoveUp,
  MoveDown,
  TestTube,
  Folder
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clientApi } from '@/lib/clientApi';

interface GoogleDriveConfig {
  accountEmail: string;
  isConnected: boolean;
  folderId?: string;
}

interface HomepageImage {
  id: string;
  title: string;
  originalUrl: string;
  watermarkedUrl: string;
  uploadedBy: string;
  createdAt: string;
  orderIndex: number;
}

export const GoogleDriveManager: React.FC = () => {
  const [config, setConfig] = useState<GoogleDriveConfig | null>(null);
  const [homepageImages, setHomepageImages] = useState<HomepageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [showSecrets, setShowSecrets] = useState(false);
  const { toast } = useToast();

  // Google Drive credentials form
  const [credentials, setCredentials] = useState({
    accountEmail: '',
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    accessToken: ''
  });

  useEffect(() => {
    loadGoogleDriveConfig();
    loadHomepageImages();
  }, []);

  const loadGoogleDriveConfig = async () => {
    try {
      // This would check existing configuration
      setConfig({
        accountEmail: 'example@gmail.com',
        isConnected: false
      });
    } catch (error) {
      console.error('Failed to load Google Drive config:', error);
    }
  };

  const loadHomepageImages = async () => {
    try {
      const response = await clientApi.getHomepageImages();
      if (response.success && response.data) {
        setHomepageImages(response.data);
      }
    } catch (error) {
      console.error('Failed to load homepage images:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleDriveConnection = async () => {
    if (!credentials.clientId || !credentials.clientSecret) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required Google Drive credentials'
      });
      return;
    }

    setTesting(true);
    try {
      const response = await clientApi.testGoogleDriveConnection();
      
      if (response.success && response.data?.connected) {
        toast({
          title: 'Success',
          description: 'Google Drive connection test successful'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: response.error || 'Unable to connect to Google Drive'
        });
      }
    } catch (error) {
      console.error('Google Drive test failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to test Google Drive connection'
      });
    } finally {
      setTesting(false);
    }
  };

  const saveGoogleDriveConfig = async () => {
    if (!credentials.accountEmail || !credentials.clientId || !credentials.clientSecret) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields'
      });
      return;
    }

    setSaving(true);
    try {
      const driveCredentials = {
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: credentials.refreshToken,
        access_token: credentials.accessToken
      };

      const response = await clientApi.saveGoogleDriveConfig(
        credentials.accountEmail,
        driveCredentials
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Google Drive configuration saved successfully'
        });
        
        setConfig({
          accountEmail: credentials.accountEmail,
          isConnected: true
        });
        
        // Clear form
        setCredentials({
          accountEmail: '',
          clientId: '',
          clientSecret: '',
          refreshToken: '',
          accessToken: ''
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error || 'Failed to save Google Drive configuration'
        });
      }
    } catch (error) {
      console.error('Error saving Google Drive config:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save Google Drive configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        variant: 'destructive',
        title: 'File Size Error',
        description: 'Some files are larger than 10MB. Please choose smaller files.'
      });
      return;
    }

    setUploading(true);
    try {
      const response = await clientApi.uploadImages(files);
      
      if (response.success && response.data?.uploadedImages) {
        toast({
          title: 'Success',
          description: `Successfully uploaded ${response.data.uploadedImages.length} image(s)`
        });
        loadHomepageImages();
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: response.error || 'Failed to upload images'
        });
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload images'
      });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const updateImageOrder = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = homepageImages.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= homepageImages.length) return;

    try {
      const response = await clientApi.updateImageOrder(imageId, newIndex);
      if (response.success) {
        loadHomepageImages();
        toast({
          title: 'Success',
          description: 'Image order updated'
        });
      }
    } catch (error) {
      console.error('Failed to update image order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update image order'
      });
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await clientApi.deleteImage(imageId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Image deleted successfully'
        });
        loadHomepageImages();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error || 'Failed to delete image'
        });
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete image'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Drive configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <Cloud className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google Drive Integration</h1>
          <p className="text-gray-600">Manage Google Drive connection and photo uploads</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup & Configuration</TabsTrigger>
          <TabsTrigger value="upload">Photo Management</TabsTrigger>
          <TabsTrigger value="homepage">Homepage Images</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          {/* Current Configuration Status */}
          {config && (
            <Card>
              <CardHeader>
                <CardTitle>Current Configuration</CardTitle>
                <CardDescription>Google Drive connection status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">{config.accountEmail}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={config.isConnected ? 'default' : 'secondary'}>
                          {config.isConnected ? 'Connected' : 'Not Connected'}
                        </Badge>
                        {config.folderId && (
                          <Badge variant="outline">
                            <Folder className="h-3 w-3 mr-1" />
                            Folder Created
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {config.isConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>Follow these steps to configure Google Drive integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  <strong>Step 1:</strong> Go to the Google Cloud Console and create a new project or select an existing one.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  <strong>Step 2:</strong> Enable the Google Drive API for your project.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  <strong>Step 3:</strong> Create credentials (OAuth 2.0 Client ID) and download the credentials file.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  <strong>Step 4:</strong> Use the Google OAuth Playground to generate refresh and access tokens.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Google Drive Configuration</CardTitle>
              <CardDescription>Enter your Google Drive API credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-email">Google Account Email *</Label>
                  <Input
                    id="account-email"
                    type="email"
                    value={credentials.accountEmail}
                    onChange={(e) => setCredentials({ ...credentials, accountEmail: e.target.value })}
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID *</Label>
                  <Input
                    id="client-id"
                    value={credentials.clientId}
                    onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                    placeholder="123456789-abc...googleusercontent.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-secret">Client Secret *</Label>
                  <div className="relative">
                    <Input
                      id="client-secret"
                      type={showSecrets ? 'text' : 'password'}
                      value={credentials.clientSecret}
                      onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                      placeholder="GOCSPX-..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refresh-token">Refresh Token</Label>
                  <Input
                    id="refresh-token"
                    type={showSecrets ? 'text' : 'password'}
                    value={credentials.refreshToken}
                    onChange={(e) => setCredentials({ ...credentials, refreshToken: e.target.value })}
                    placeholder="1//..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="access-token">Access Token (Optional)</Label>
                  <Input
                    id="access-token"
                    type={showSecrets ? 'text' : 'password'}
                    value={credentials.accessToken}
                    onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
                    placeholder="ya29..."
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={testGoogleDriveConnection}
                  disabled={testing}
                  variant="outline"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>

                <Button
                  onClick={saveGoogleDriveConfig}
                  disabled={saving}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Images</CardTitle>
              <CardDescription>
                Upload images to Google Drive with automatic watermarking for homepage use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Images</h3>
                <p className="text-gray-600 mb-4">
                  Choose images to upload. They will be automatically watermarked and organized.
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={uploading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {uploading ? 'Uploading...' : 'Choose Images'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum file size: 10MB per image. Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Images</CardTitle>
              <CardDescription>
                Manage images displayed on the homepage carousel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {homepageImages.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Images</h3>
                  <p className="text-gray-600">Upload some images to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {homepageImages.map((image, index) => (
                    <div key={image.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100 relative">
                        <img
                          src={image.watermarkedUrl}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary">#{index + 1}</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">{image.title}</h3>
                        <p className="text-sm text-gray-600">
                          Uploaded {new Date(image.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateImageOrder(image.id, 'up')}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateImageOrder(image.id, 'down')}
                              disabled={index === homepageImages.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoogleDriveManager;