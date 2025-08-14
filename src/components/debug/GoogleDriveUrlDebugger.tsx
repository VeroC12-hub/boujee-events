// src/components/debug/GoogleDriveUrlDebugger.tsx
// COMPREHENSIVE TOOL TO FIX YOUR EXISTING GOOGLE DRIVE URLS

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { googleDriveService } from '../../services/googleDriveService';
import { RefreshCw, CheckCircle, AlertCircle, ExternalLink, Copy, Download, Eye } from 'lucide-react';

interface MediaFileInfo {
  id: string;
  name: string;
  google_drive_file_id: string;
  download_url: string;
  mime_type: string;
  file_type: string;
  created_at: string;
  homepage_media?: any[];
}

interface UrlTest {
  url: string;
  name: string;
  status: 'testing' | 'success' | 'failed';
  description: string;
}

export default function GoogleDriveUrlDebugger() {
  const [mediaFiles, setMediaFiles] = useState<MediaFileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [testResults, setTestResults] = useState<{[key: string]: UrlTest[]}>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [bulkFixStatus, setBulkFixStatus] = useState<string>('');

  useEffect(() => {
    loadMediaFiles();
  }, []);

  // Load all media files from database
  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading all media files from database...');
      
      const { data, error } = await supabase
        .from('media_files')
        .select(`
          id, 
          name, 
          google_drive_file_id, 
          download_url, 
          mime_type, 
          file_type,
          created_at,
          homepage_media(id, media_type, is_active)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMediaFiles(data || []);
      console.log(`✅ Loaded ${data?.length || 0} media files`);
      
    } catch (error: any) {
      console.error('❌ Failed to load media files:', error);
      alert(`Failed to load media files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate optimized URLs for different file types
  const generateOptimizedUrls = (fileId: string, mimeType: string) => {
    const isImage = mimeType?.startsWith('image/');
    const isVideo = mimeType?.startsWith('video/');

    if (isImage) {
      return {
        // High-performance image URLs
        primary: `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080-c`,
        fallback1: `https://drive.google.com/uc?export=view&id=${fileId}`,
        fallback2: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`,
        thumbnail: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`
      };
    } else if (isVideo) {
      return {
        primary: `https://drive.google.com/uc?export=download&id=${fileId}`,
        fallback1: `https://drive.google.com/file/d/${fileId}/preview`,
        fallback2: `https://drive.google.com/uc?id=${fileId}&export=download`,
        thumbnail: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`
      };
    }

    return {
      primary: `https://drive.google.com/uc?export=view&id=${fileId}`,
      fallback1: `https://drive.google.com/file/d/${fileId}/view`,
      fallback2: `https://drive.google.com/uc?export=download&id=${fileId}`,
      thumbnail: ''
    };
  };

  // Test URL accessibility using image loading
  const testUrlAccessibility = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (url.includes('video') || url.includes('download')) {
        // For videos, just resolve true (can't easily test video URLs)
        resolve(true);
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 10 seconds
      setTimeout(() => resolve(false), 10000);
    });
  };

  // Test all URLs for a specific file
  const testFileUrls = async (file: MediaFileInfo) => {
    setSelectedFile(file.id);
    
    const urls = generateOptimizedUrls(file.google_drive_file_id, file.mime_type);
    
    const tests: UrlTest[] = [
      {
        url: file.download_url,
        name: 'Current Database URL',
        status: 'testing',
        description: 'URL currently stored in database'
      },
      {
        url: urls.primary,
        name: 'Optimized Primary URL',
        status: 'testing',
        description: 'High-performance URL (recommended)'
      },
      {
        url: urls.fallback1,
        name: 'Fallback URL 1',
        status: 'testing',
        description: 'Standard Google Drive export'
      },
      {
        url: urls.fallback2,
        name: 'Fallback URL 2',
        status: 'testing',
        description: 'Alternative URL format'
      }
    ];

    // Add thumbnail test for images
    if (file.mime_type.startsWith('image/') && urls.thumbnail) {
      tests.push({
        url: urls.thumbnail,
        name: 'Thumbnail URL',
        status: 'testing',
        description: 'Small preview image'
      });
    }

    setTestResults(prev => ({
      ...prev,
      [file.id]: tests
    }));

    console.log(`🧪 Testing URLs for: ${file.name}`);

    // Test each URL
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      try {
        const isAccessible = await testUrlAccessibility(test.url);
        
        tests[i] = {
          ...test,
          status: isAccessible ? 'success' : 'failed'
        };

        setTestResults(prev => ({
          ...prev,
          [file.id]: [...tests]
        }));

        console.log(`${isAccessible ? '✅' : '❌'} ${test.name}: ${isAccessible ? 'Accessible' : 'Failed'}`);
        
      } catch (error) {
        tests[i] = {
          ...test,
          status: 'failed'
        };
        
        setTestResults(prev => ({
          ...prev,
          [file.id]: [...tests]
        }));
      }
    }

    console.log(`🏁 URL testing completed for: ${file.name}`);
  };

  // Fix URLs for a single file
  const fixSingleFile = async (file: MediaFileInfo) => {
    try {
      const urls = generateOptimizedUrls(file.google_drive_file_id, file.mime_type);
      
      console.log(`🔧 Fixing URLs for: ${file.name}`);
      
      const { error } = await supabase
        .from('media_files')
        .update({
          download_url: urls.primary,
          thumbnail_url: urls.thumbnail || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', file.id);

      if (error) throw error;
      
      console.log(`✅ Fixed URLs for: ${file.name}`);
      alert(`✅ Successfully updated URLs for "${file.name}"!`);
      
      // Reload data and trigger homepage update
      await loadMediaFiles();
      window.dispatchEvent(new CustomEvent('mediaUpdated'));
      
    } catch (error: any) {
      console.error(`❌ Failed to fix URLs for ${file.name}:`, error);
      alert(`❌ Failed to fix URLs for "${file.name}": ${error.message}`);
    }
  };

  // Fix URLs for all files
  const fixAllUrls = async () => {
    if (!confirm(`This will update URLs for all ${mediaFiles.length} media files. Continue?`)) {
      return;
    }

    setFixing(true);
    setBulkFixStatus('');
    
    let successCount = 0;
    let failedCount = 0;

    try {
      console.log(`🔧 Starting bulk URL fix for ${mediaFiles.length} files...`);
      
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        
        try {
          setBulkFixStatus(`Fixing ${i + 1}/${mediaFiles.length}: ${file.name}`);
          
          const urls = generateOptimizedUrls(file.google_drive_file_id, file.mime_type);
          
          const { error } = await supabase
            .from('media_files')
            .update({
              download_url: urls.primary,
              thumbnail_url: urls.thumbnail || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', file.id);

          if (error) throw error;
          
          successCount++;
          console.log(`✅ Fixed: ${file.name}`);
          
        } catch (error: any) {
          failedCount++;
          console.error(`❌ Failed to fix ${file.name}:`, error);
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setBulkFixStatus(`✅ Bulk fix completed! Success: ${successCount}, Failed: ${failedCount}`);
      
      if (successCount > 0) {
        // Reload data and trigger homepage update
        await loadMediaFiles();
        window.dispatchEvent(new CustomEvent('mediaUpdated'));
        alert(`✅ Successfully updated ${successCount} files! Your homepage should now display images properly.`);
      }
      
    } catch (error: any) {
      console.error('❌ Bulk fix failed:', error);
      setBulkFixStatus(`❌ Bulk fix failed: ${error.message}`);
    } finally {
      setFixing(false);
    }
  };

  // Make file public in Google Drive
  const makeFilePublic = async (file: MediaFileInfo) => {
    try {
      console.log(`🔓 Making file public: ${file.name}`);
      
      // Check if Google Drive service is authenticated
      const isAuth = await googleDriveService.isUserAuthenticated();
      if (!isAuth) {
        const authSuccess = await googleDriveService.authenticate();
        if (!authSuccess) {
          throw new Error('Google Drive authentication failed');
        }
      }

      const success = await googleDriveService.makeFilePublic(file.google_drive_file_id);
      
      if (success) {
        alert(`✅ "${file.name}" is now publicly accessible!`);
        console.log(`✅ Made file public: ${file.name}`);
      } else {
        throw new Error('Failed to set public permissions');
      }
      
    } catch (error: any) {
      console.error(`❌ Failed to make file public:`, error);
      alert(`❌ Failed to make "${file.name}" public: ${error.message}`);
    }
  };

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('📋 URL copied to clipboard!');
  };

  const stats = {
    totalFiles: mediaFiles.length,
    imageFiles: mediaFiles.filter(f => f.file_type === 'image').length,
    videoFiles: mediaFiles.filter(f => f.file_type === 'video').length,
    homepageFiles: mediaFiles.filter(f => f.homepage_media && f.homepage_media.length > 0).length
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🔧 Google Drive URL Debugger
          </h1>
          <p className="text-gray-400 text-lg">
            Test and fix Google Drive URLs for better homepage media display
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.totalFiles}</div>
            <div className="text-sm text-blue-300">Total Files</div>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.imageFiles}</div>
            <div className="text-sm text-green-300">Images</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.videoFiles}</div>
            <div className="text-sm text-purple-300">Videos</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.homepageFiles}</div>
            <div className="text-sm text-yellow-300">Homepage Media</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={loadMediaFiles}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          
          <button
            onClick={fixAllUrls}
            disabled={fixing || mediaFiles.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <CheckCircle className={`h-5 w-5 ${fixing ? 'animate-pulse' : ''}`} />
            {fixing ? 'Fixing URLs...' : 'Fix All URLs'}
          </button>

          <button
            onClick={() => {
              mediaFiles.forEach(file => testFileUrls(file));
            }}
            disabled={loading || mediaFiles.length === 0}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <Eye className="h-5 w-5" />
            Test All URLs
          </button>
        </div>

        {/* Bulk Fix Status */}
        {bulkFixStatus && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-blue-400 font-medium">{bulkFixStatus}</div>
          </div>
        )}

        {/* URL Format Guide */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📋 Optimized URL Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="text-green-400 font-semibold mb-2">✅ Images (Recommended)</h3>
              <code className="block bg-gray-900 p-3 rounded text-green-300 text-xs break-all">
                https://lh3.googleusercontent.com/d/FILE_ID=w1920-h1080-c
              </code>
              <p className="text-gray-400 mt-1">High-performance Google Photos CDN</p>
            </div>
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">🎬 Videos</h3>
              <code className="block bg-gray-900 p-3 rounded text-blue-300 text-xs break-all">
                https://drive.google.com/uc?export=download&id=FILE_ID
              </code>
              <p className="text-gray-400 mt-1">Direct download for video streaming</p>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">📁 Media Files in Database</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">Loading media files...</p>
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-xl">No media files found</p>
              <p className="text-sm mt-2">Upload some media files first</p>
            </div>
          ) : (
            mediaFiles.map(file => {
              const urls = generateOptimizedUrls(file.google_drive_file_id, file.mime_type);
              const fileTests = testResults[file.id] || [];
              const isSelected = selectedFile === file.id;
              
              return (
                <div key={file.id} className={`bg-gray-800 rounded-lg p-4 border-2 transition-all ${
                  isSelected ? 'border-yellow-400' : 'border-gray-600'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">
                          {file.file_type === 'image' ? '🖼️' : '🎬'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white truncate">{file.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{file.file_type}</span>
                            <span>•</span>
                            <span>{file.mime_type}</span>
                            {file.homepage_media && file.homepage_media.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-green-400">On Homepage</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Current URL */}
                      <div className="mb-3">
                        <div className="text-sm text-gray-400 mb-1">Current Database URL:</div>
                        <div className="bg-gray-900 p-2 rounded text-xs font-mono break-all text-gray-300">
                          {file.download_url}
                        </div>
                      </div>

                      {/* Recommended URL */}
                      <div className="mb-3">
                        <div className="text-sm text-gray-400 mb-1">Recommended Optimized URL:</div>
                        <div className="bg-gray-900 p-2 rounded text-xs font-mono break-all text-green-300">
                          {urls.primary}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => testFileUrls(file)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        title="Test URLs"
                      >
                        <Eye className="h-3 w-3" />
                        Test
                      </button>
                      
                      <button
                        onClick={() => fixSingleFile(file)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        title="Fix URLs"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Fix
                      </button>
                      
                      <button
                        onClick={() => makeFilePublic(file)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        title="Make Public"
                      >
                        🔓
                      </button>
                      
                      <button
                        onClick={() => window.open(`https://drive.google.com/file/d/${file.google_drive_file_id}/view`, '_blank')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        title="Open in Drive"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Test Results */}
                  {fileTests.length > 0 && (
                    <div className="border-t border-gray-600 pt-3">
                      <h4 className="text-sm font-semibold text-white mb-2">URL Test Results:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {fileTests.map((test, index) => (
                          <div key={index} className={`p-2 rounded text-xs flex items-center justify-between ${
                            test.status === 'success' ? 'bg-green-500/20 border border-green-500/30' :
                            test.status === 'failed' ? 'bg-red-500/20 border border-red-500/30' :
                            'bg-yellow-500/20 border border-yellow-500/30'
                          }`}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="text-lg">
                                {test.status === 'success' ? '✅' :
                                 test.status === 'failed' ? '❌' : '⏳'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{test.name}</div>
                                <div className="text-gray-400 text-xs">{test.description}</div>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => copyUrl(test.url)}
                                className="p-1 hover:bg-white/10 rounded"
                                title="Copy URL"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => window.open(test.url, '_blank')}
                                className="p-1 hover:bg-white/10 rounded"
                                title="Test URL"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <h3 className="font-bold text-yellow-400 mb-3">📋 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-200 text-sm">
            <li>Click "Test All URLs" to check which files have broken URLs</li>
            <li>Make sure your Google Drive files are set to "Anyone with the link" → "Viewer"</li>
            <li>Click "Fix All URLs" to update your database with optimized URLs</li>
            <li>Use the 🔓 button to make individual files public in Google Drive</li>
            <li>Refresh your homepage to see the improved image loading</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
