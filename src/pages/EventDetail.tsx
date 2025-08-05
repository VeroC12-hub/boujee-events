import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Add TypeScript interface
interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  coverImage: string;
  images: string[];
  videos: string[];
}

const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Boujee Beach Party 2025',
    description: 'A night of unforgettable memories by the sea.',
    date: '2025-12-20',
    location: 'Labadi Beach, Accra',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    images: [
      'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6',
      'https://images.unsplash.com/photo-1579546928685-874f5b7a6f07'
    ],
    videos: [
      'https://www.w3schools.com/html/mov_bbb.mp4'
    ]
  }
];

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = mockEvents.find(e => e.id === id);
    setEvent(found || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className="h-[50vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${event.coverImage})` }}
      >
        <h1 className="text-4xl font-bold text-white shadow-lg bg-black/50 p-4 rounded-xl">
          {event.name}
        </h1>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold mb-4">About This Event</h2>
        <p className="text-gray-700 mb-6">{event.description}</p>
        
        <h3 className="text-lg font-semibold mb-2">Date & Location</h3>
        <p className="mb-6">📅 {event.date} | 📍 {event.location}</p>
        
        <h3 className="text-lg font-semibold mb-2">Event Gallery</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {event.images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Event image ${idx + 1}`}
              className="w-full h-48 object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
            />
          ))}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Event Video</h3>
        <div className="w-full max-w-4xl">
          <video
            controls
            className="rounded-xl w-full shadow-lg"
            src={event.videos[0]}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
