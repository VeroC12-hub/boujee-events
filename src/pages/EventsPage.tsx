import { Link } from "react-router-dom";

// Add TypeScript interface
interface Event {
  id: string; // Changed to string to match useParams
  name: string;
  date: string;
  description: string;
  coverImage: string;
}

const events: Event[] = [
  {
    id: "1", // Changed to string
    name: "Boujee All White Party",
    date: "August 10, 2025",
    description: "A night of elegance and white fashion.",
    coverImage: "https://images.unsplash.com/photo-1618838896531-5b4199a86d1a",
  },
  {
    id: "2", // Changed to string
    name: "Boujee Beach Jam",
    date: "September 5, 2025",
    description: "Sun, sand, and non-stop music on the coast.",
    coverImage: "https://images.unsplash.com/photo-1606851091805-0f3f998476f5",
  },
  {
    id: "3", // Changed to string
    name: "Boujee Glow Night",
    date: "October 12, 2025",
    description: "Neon lights, glowing vibes, and electrifying energy.",
    coverImage: "https://images.unsplash.com/photo-1552581234-26160f608093",
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl shadow-lg overflow-hidden bg-neutral-900 hover:transform hover:scale-105 transition-all duration-300"
          >
            <div
              className="h-60 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.coverImage})` }}
            />
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">{event.name}</h2>
              <p className="text-sm text-gray-400 mb-2">📅 {event.date}</p>
              <p className="text-gray-300 mb-4">{event.description}</p>
              <Link
                to={`/event/${event.id}`}
                className="inline-block px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
