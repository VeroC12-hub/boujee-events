
import React from "react";

const events = [
  {
    title: "Boujee Beach Bash",
    date: "Sept 14, 2025",
    image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf",
  },
  {
    title: "Champagne Nights",
    date: "Oct 7, 2025",
    image: "https://images.unsplash.com/photo-1587922541699-180fd144f4f1",
  },
  {
    title: "Midnight Lounge",
    date: "Nov 20, 2025",
    image: "https://images.unsplash.com/photo-1561489422-db1d9e8bfa0d",
  },
];

export default function EventsSection() {
  return (
    <section id="events" className="py-16 px-4 bg-white text-black">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Upcoming Events</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {events.map((event, i) => (
          <div key={i} className="rounded-2xl overflow-hidden shadow-lg">
            <img src={event.image} alt={event.title} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.date}</p>
              <button className="mt-3 inline-block bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
