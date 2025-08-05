// File: src/data/images.ts

export const eventImages = {
  event1: [
    "https://source.unsplash.com/random/800x600?party",
    "https://source.unsplash.com/random/800x601?event",
    "https://source.unsplash.com/random/800x602?celebration",
    "https://source.unsplash.com/random/800x603?music",
    "https://source.unsplash.com/random/800x604?nightlife"
  ]
};

// File: src/pages/EventDetail.tsx

import { eventImages } from "@/data/images";

const EventDetail = () => {
  const images = eventImages.event1;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Event Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img, index) => (
          <div key={index} className="overflow-hidden rounded-2xl shadow-xl">
            <img
              src={img}
              alt={`Event ${index + 1}`}
              className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDetail;
