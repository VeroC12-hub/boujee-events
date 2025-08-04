import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useVIPManagement } from '../../hooks/useVIP';
import { eventService } from '../../services/eventService';
import { googleDriveService } from '../../services/googleDrive';
import LoadingSpinner from '../common/LoadingSpinner';

import { Event } from '../../services/eventService';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: authState, logout } = useAuth();
  const analytics = useAnalytics();
  const vipData = useVIPManagement();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New VIP reservation received', time: '2 minutes ago', type: 'info' },
    { id: 2, message: 'Event published successfully', time: '5 minutes ago', type: 'success' },
    { id: 3, message: 'Payment processed', time: '10 minutes ago', type: 'success' }
  ]);

  // Load events from event service on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await eventService.getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };

    loadEvents();
  }, []);

  // Navigation items with real-time data and VIP section
  const navigationItems = [
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: '📊',
      badge: analytics.metrics.data?.length || 0,
      description: 'Dashboard & Reports'
    },
    {
      name: 'Events',
      path: '/admin/events',
      icon: '📅',
      badge: events.filter(e => e.status === 'active').length,
      description: 'Manage Events'
    },
    {
      name: 'VIP Management',
      path: '/admin/vip',
      icon: '🌟',
      badge: vipData.reservations?.filter(r => r.status === 'pending').length || null,
      description: 'Premium Reservations',
      isNew: true
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: '👥',
      badge: null,
      description: 'User Management'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: '⚙️',
      badge: null,
      description: 'Platform Settings'
    }
  ];

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      analytics.refetchAll();
      vipData.refetchAll();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [analytics.refetchAll, vipData.refetchAll]);

  const handleLogout = async () => {
    try {
      await logout();
      if ((window as any).toast) {
        (window as any).toast.success('Logged out successfully');
      }
    } catch (error) {
      if ((window as any).toast) {
        (window as any).toast.error('Logout failed');
      }
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('analytics')) return 'Analytics Dashboard';
    if (path.includes('events')) return 'Event Management';
    if (path.includes('vip')) return 'VIP Management';
    if (path.includes('users')) return 'User Management';
    if (path.includes('settings')) return 'Platform Settings';
    return 'Admin Dashboard';
  };

  const getPageIcon = () => {
    const path = location.pathname;
    if (path.includes('analytics')) return '📊';
    if (path.includes('events')) return '📅';
    if (path.includes('vip')) return '🌟';
    if (path.includes('users')) return '👥';
    if (path.includes('settings')) return '⚙️';
    return '🏠';
  };

  // Enhanced event management functions with Google Drive integration
  const handleImageUpload = async (file: File, eventId?: number) => {
    setUploadingImage(true);
    try {
      // Initialize Google Drive if not already done
      const isAuth = await googleDriveService.isAuthenticated();
      if (!isAuth) {
        await googleDriveService.authenticate();
      }

      let imageUrl = '';
      if (eventId) {
        // Upload to existing event folder
        imageUrl = await eventService.uploadEventImage(
          eventId, 
          file, 
          (progress) => console.log(`Upload progress: ${progress}%`)
        );
      } else {
        // Upload to Google Drive without specific event (will be assigned later)
        const result = await googleDriveService.uploadImage(
          file,
          0, // Temporary ID
          'New Event',
          (progress) => console.log(`Upload progress: ${progress}%`)
        );
        imageUrl = result.webContentLink;
      }
      
      if ((window as Record<string, unknown>).toast) {
        (window as Record<string, unknown>).toast.success('Image uploaded to Google Drive successfully!');
      }
      
      return imageUrl;
    } catch (error) {
      if ((window as Record<string, unknown>).toast) {
        (window as Record<string, unknown>).toast.error('Image upload failed');
      }
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const saveEvent = async (eventData: Partial<Event>) => {
    try {
      if (editingEvent) {
        // Update existing event
        const updatedEvent = await eventService.updateEvent(editingEvent.id, eventData);
        if (updatedEvent) {
          const updatedEvents = events.map(e => e.id === editingEvent.id ? updatedEvent : e);
          setEvents(updatedEvents);
        }
      } else {
        // Create new event
        const newEventData = {
          ...eventData,
          status: 'active' as const,
          ticketsSold: 0,
          featured: false,
          images: eventData.image ? [eventData.image] : [],
          tags: [],
          basePrice: parseFloat(eventData.price?.replace(/[^\d.]/g, '') || '0'),
          organizerId: 'VeroC12-hub'
        };
        
        const newEvent = await eventService.createEvent(newEventData);
        setEvents(prev => [...prev, newEvent]);
      }
      
      setShowEventModal(false);
      setEditingEvent(null);
      
      if ((window as Record<string, unknown>).toast) {
        (window as Record<string, unknown>).toast.success(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
      }
    } catch (error) {
      if ((window as Record<string, unknown>).toast) {
        (window as Record<string, unknown>).toast.error('Failed to save event');
      }
    }
  };

  if (!authState.user) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <img 
              src="/src/be-logo.png" 
              alt="Boujee Events Logo" 
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'block';
              }}
            />
            <span className="text-2xl" style={{ display: 'none' }}>🎫</span>
            <span className="ml-2 text-xl font-bold text-gray-900">EventHub</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <img
              src={authState.user.avatar}
              alt={authState.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{authState.user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{authState.user.role}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <p>Last login: {authState.user.lastLogin}</p>
            <p>Status: ✅ {authState.user.status}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-background'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{item.icon}</span>
                  <div>
                    <span className="font-medium block">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.description}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.isNew && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs font-bold">
                      NEW
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span className="text-sm text-green-800">All Systems Operational</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              API: Online | DB: Connected | VIP: Active
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <span className="mr-2">🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                ☰
              </button>
              <div className="flex items-center">
                <span className="text-xl mr-2">{getPageIcon()}</span>
                <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time clock */}
              <div className="text-sm text-gray-500">
                2025-08-03 21:52:16 UTC
              </div>

              {/* VIP Notifications */}
              {vipData.reservations?.some(r => r.status === 'pending') && (
                <div className="relative">
                  <button 
                    onClick={() => navigate('/admin/vip')}
                    className="relative p-2 text-purple-600 hover:text-purple-700 bg-purple-50 rounded-lg"
                    title="Pending VIP Reservations"
                  >
                    <span className="text-xl">🌟</span>
                    <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-400 text-xs text-white text-center leading-4">
                      {vipData.reservations?.filter(r => r.status === 'pending').length}
                    </span>
                  </button>
                </div>
              )}

              {/* Quick Actions for Events Page */}
              {location.pathname.includes('events') && (
                <button
                  onClick={() => setShowEventModal(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-accent transition-colors"
                >
                  + New Event
                </button>
              )}

              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <span className="text-xl">🔔</span>
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                  )}
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  analytics.refetchAll();
                  vipData.refetchAll();
                  if ((window as any).toast) {
                    (window as any).toast.success('Data refreshed');
                  }
                }}
                disabled={analytics.loading || vipData.tiersLoading}
                className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <span className={analytics.loading || vipData.tiersLoading ? 'animate-spin' : ''}>
                  🔄
                </span>
              </button>

              {/* User Avatar */}
              <div className="relative">
                <img
                  src={authState.user.avatar}
                  alt={authState.user.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
                <span className="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-background border-b border-gray-200 px-6 py-2">
          <div className="flex items-center text-sm text-gray-600">
            <span>🏠 Admin</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{getPageTitle()}</span>
            {location.pathname.includes('vip') && (
              <>
                <span className="mx-2">›</span>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs">
                  🌟 Premium
                </span>
              </>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Event Management Content */}
          {location.pathname.includes('events') && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Management</h2>
                <p className="text-gray-600">Manage your events and sync with homepage</p>
              </div>

              {/* Events Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ display: 'none' }}>
                        <span className="text-4xl text-gray-400">🎭</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.status === 'active' ? 'bg-green-100 text-green-800' :
                          event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{event.type}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                      <div className="text-xs text-gray-500 mb-3">
                        <div>📅 {event.date}</div>
                        <div>📍 {event.location}</div>
                        <div>🎫 {event.ticketsSold}/{event.maxCapacity} sold</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setShowEventModal(true);
                          }}
                          className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this event?')) {
                              try {
                                const success = await eventService.deleteEvent(event.id);
                                if (success) {
                                  setEvents(prev => prev.filter(e => e.id !== event.id));
                                  if ((window as Record<string, unknown>).toast) {
                                    (window as Record<string, unknown>).toast.success('Event deleted successfully!');
                                  }
                                }
                              } catch (error) {
                                if ((window as Record<string, unknown>).toast) {
                                  (window as Record<string, unknown>).toast.error('Failed to delete event');
                                }
                              }
                            }
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Default Outlet for other pages */}
          {!location.pathname.includes('events') && <Outlet />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              EventHub Admin Dashboard v1.0 | Connected to Mock API + VIP System
            </div>
            <div className="flex items-center space-x-4">
              <span>User: {authState.user.name}</span>
              <span>•</span>
              <span>2025-08-03 21:52:16 UTC</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const eventData = {
                  title: formData.get('title') as string,
                  date: formData.get('date') as string,
                  location: formData.get('location') as string,
                  type: formData.get('type') as string,
                  price: formData.get('price') as string,
                  description: formData.get('description') as string,
                  maxCapacity: parseInt(formData.get('maxCapacity') as string),
                  image: editingEvent?.image || '/api/placeholder/800/400'
                };
                saveEvent(eventData);
              }}>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={editingEvent?.title || ''}
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Type *
                      </label>
                      <select
                        name="type"
                        defaultValue={editingEvent?.type || ''}
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="Gala">Gala</option>
                        <option value="Festival">Festival</option>
                        <option value="Conference">Conference</option>
                        <option value="Concert">Concert</option>
                        <option value="Wedding">Wedding</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Experience">Experience</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={editingEvent?.date || ''}
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Display *
                      </label>
                      <input
                        type="text"
                        name="price"
                        placeholder="e.g., From €150"
                        defaultValue={editingEvent?.price || ''}
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        defaultValue={editingEvent?.location || ''}
                        required
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Capacity *
                      </label>
                      <input
                        type="number"
                        name="maxCapacity"
                        defaultValue={editingEvent?.maxCapacity || 100}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingEvent?.description || ''}
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <div className="text-4xl text-gray-400">📷</div>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const imageUrl = await handleImageUpload(file, editingEvent?.id);
                                    // Update the event with the new image URL
                                    if (editingEvent) {
                                      setEditingEvent({ ...editingEvent, image: imageUrl });
                                    }
                                  } catch (error) {
                                    console.error('Upload failed:', error);
                                  }
                                }
                              }}
                              disabled={uploadingImage}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        {uploadingImage && (
                          <div className="text-primary">
                            <div className="animate-spin inline-block mr-2">⏳</div>
                            Uploading to Google Drive...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                    }}
                    className="px-4 py-2 border border-border rounded-lg text-gray-700 hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
