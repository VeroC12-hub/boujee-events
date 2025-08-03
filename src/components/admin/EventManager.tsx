import React, { useState, useEffect } from 'react';
import { Logo, brandColors, brandShadows } from '../../utils/brandSystem';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  ticketPrice: number;
  maxAttendees: number;
  images: string[];
  videos: string[];
  status: 'draft' | 'published' | 'archived';
  publicVisibility: boolean;
  googleDriveFolder?: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  uploadedAt: string;
  googleDriveId?: string;
}

const EventManager: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);

  // Load events from localStorage (in real app, this would be API calls)
  useEffect(() => {
    const savedEvents = localStorage.getItem('eventhub-admin-events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      initializeDefaultEvents();
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('eventhub-admin-events', JSON.stringify(events));
    // In real app: sync to public website API
    syncToPublicSite(events);
  }, [events]);

  const initializeDefaultEvents = () => {
    const defaultEvents: Event[] = [
      {
        id: '1',
        title: 'Golden Gala Night',
        description: 'An elegant evening of luxury and entertainment featuring live music, fine dining, and exclusive networking opportunities.',
        date: '2025-08-15',
        time: '19:00',
        location: 'Grand Ballroom, Metropolitan Hotel',
        category: 'Gala',
        ticketPrice: 150,
        maxAttendees: 300,
        images: ['/api/placeholder/800/400', '/api/placeholder/600/400'],
        videos: [],
        status: 'published',
        publicVisibility: true,
        googleDriveFolder: 'Golden-Gala-Night-2025',
        createdAt: '2025-08-03T13:13:44Z',
        updatedAt: '2025-08-03T13:13:44Z'
      },
      {
        id: '2', 
        title: 'BE Conference 2025',
        description: 'Premier business and entrepreneurship conference featuring industry leaders, innovative workshops, and networking sessions.',
        date: '2025-09-20',
        time: '09:00',
        location: 'Convention Center, Downtown',
        category: 'Conference',
        ticketPrice: 299,
        maxAttendees: 500,
        images: ['/api/placeholder/800/400'],
        videos: ['/api/placeholder/video/conference-preview'],
        status: 'published',
        publicVisibility: true,
        googleDriveFolder: 'BE-Conference-2025',
        createdAt: '2025-08-03T13:13:44Z',
        updatedAt: '2025-08-03T13:13:44Z'
      }
    ];
    setEvents(defaultEvents);
  };

  // Sync events to public website (simulated - in real app this would be API call)
  const syncToPublicSite = (events: Event[]) => {
    const publicEvents = events.filter(event => 
      event.publicVisibility && 
      (event.status === 'published' || 
       (event.status === 'archived' && new Date(event.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))) // Show archived events from last 30 days
    );
    
    localStorage.setItem('eventhub-public-events', JSON.stringify(publicEvents));
    console.log('✅ Events synced to public website:', publicEvents.length);
  };

  // Auto-archive past events
  const autoArchivePastEvents = () => {
    const now = new Date();
    setEvents(prev => prev.map(event => {
      const eventDate = new Date(event.date);
      if (eventDate < now && event.status === 'published') {
        return { ...event, status: 'archived', publicVisibility: false };
      }
      return event;
    }));
  };

  // Run auto-archive check
  useEffect(() => {
    autoArchivePastEvents();
    const interval = setInterval(autoArchivePastEvents, 24 * 60 * 60 * 1000); // Check daily
    return () => clearInterval(interval);
  }, []);

  const toggleEventVisibility = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, publicVisibility: !event.publicVisibility, updatedAt: new Date().toISOString() }
        : event
    ));
    
    if ((window as any).toast) {
      (window as any).toast.success('Event visibility updated!');
    }
  };

  const createGoogleDriveFolder = async (eventTitle: string) => {
    // Simulated Google Drive API integration
    const folderName = eventTitle.replace(/[^a-zA-Z0-9]/g, '-');
    
    try {
      // In real app: Google Drive API call
      console.log('📁 Creating Google Drive folder:', folderName);
      
      // Simulate API response
      const folderId = `folder_${Date.now()}`;
      
      if ((window as any).toast) {
        (window as any).toast.success(`📁 Google Drive folder "${folderName}" created!`);
      }
      
      return folderId;
    } catch (error) {
      console.error('Error creating Google Drive folder:', error);
      if ((window as any).toast) {
        (window as any).toast.error('Failed to create Google Drive folder');
      }
      return null;
    }
  };

  const uploadToGoogleDrive = async (file: File, eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      // In real app: Google Drive upload API
      console.log('☁️ Uploading to Google Drive:', file.name);
      
      // Simulate upload
      const fileId = `file_${Date.now()}`;
      const fileUrl = URL.createObjectURL(file);
      
      const mediaFile: MediaFile = {
        id: fileId,
        name: file.name,
        url: fileUrl,
        type: file.type.startsWith('image') ? 'image' : 'video',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        googleDriveId: fileId
      };
      
      // Update event with new media
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? {
              ...e,
              [mediaFile.type === 'image' ? 'images' : 'videos']: [
                ...e[mediaFile.type === 'image' ? 'images' : 'videos'],
                mediaFile.url
              ],
              updatedAt: new Date().toISOString()
            }
          : e
      ));
      
      if ((window as any).toast) {
        (window as any).toast.success(`✅ ${file.name} uploaded to Google Drive!`);
      }
      
      return fileId;
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      if ((window as any).toast) {
        (window as any).toast.error('Failed to upload to Google Drive');
      }
      return null;
    }
  };

  const deleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      if ((window as any).toast) {
        (window as any).toast.success('Event deleted successfully!');
      }
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'published': return '✅';
      case 'draft': return '✏️';
      case 'archived': return '📦';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with your branding */}
      <div 
        className="bg-white shadow-lg border-b-4"
        style={{ borderBottomColor: brandColors.gold.primary }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Logo size="large" variant="full" />
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back!</p>
                <p className="font-bold" style={{ color: brandColors.gold.primary }}>
                  VeroC12-hub
                </p>
              </div>
              
              <button
                onClick={() => setShowEventForm(true)}
                className="px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 hover:shadow-lg"
                style={{ 
                  background: brandColors.gold.gradient,
                  boxShadow: brandShadows.gold
                }}
              >
                ➕ Create Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Google Drive Connection Status */}
        <div className="mb-8">
          <div className={`rounded-lg p-4 border ${
            isGoogleDriveConnected 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {isGoogleDriveConnected ? '✅' : '⚠️'}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Google Drive Integration
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isGoogleDriveConnected 
                      ? 'Connected - Media files will be automatically organized by event'
                      : 'Connect Google Drive to automatically organize event media files'
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsGoogleDriveConnected(!isGoogleDriveConnected)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isGoogleDriveConnected
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isGoogleDriveConnected ? 'Disconnect' : 'Connect Google Drive'}
              </button>
            </div>
          </div>
        </div>

        {/* Events Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Events', value: events.length, icon: '📅', color: 'blue' },
            { label: 'Published', value: events.filter(e => e.status === 'published').length, icon: '✅', color: 'green' },
            { label: 'Drafts', value: events.filter(e => e.status === 'draft').length, icon: '✏️', color: 'yellow' },
            { label: 'Archived', value: events.filter(e => e.status === 'archived').length, icon: '📦', color: 'gray' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow"
              style={{ borderLeftColor: brandColors.gold.primary }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div 
            className="px-6 py-4 border-b"
            style={{ backgroundColor: brandColors.gold.light }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                📅 Event Management Dashboard
              </h2>
              <div className="text-sm text-gray-600">
                Last updated: 2025-08-03 13:13:44 UTC
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Public Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {event.images.length > 0 ? (
                            <img 
                              src={event.images[0]} 
                              alt={event.title}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div 
                              className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                              style={{ background: brandColors.gold.gradient }}
                            >
                              {event.title.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.time}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                        <span className="mr-1">{getStatusIcon(event.status)}</span>
                        {event.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleEventVisibility(event.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          event.publicVisibility 
                            ? 'bg-green-600' 
                            : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            event.publicVisibility ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          📸 {event.images.length}
                        </span>
                        <span className="flex items-center">
                          🎥 {event.videos.length}
                        </span>
                        {event.googleDriveFolder && (
                          <span className="text-green-600" title="Google Drive folder">
                            📁
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {/* Preview on public site */}}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          👁️ Preview
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-600 mb-6">Create your first event to get started!</p>
            <button
              onClick={() => setShowEventForm(true)}
              className="px-6 py-3 rounded-lg font-bold text-white transition-all duration-200"
              style={{ 
                background: brandColors.gold.gradient,
                boxShadow: brandShadows.gold
              }}
            >
              ➕ Create Your First Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManager;
