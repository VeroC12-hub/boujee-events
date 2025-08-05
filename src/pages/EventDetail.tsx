// src/pages/EventDetail.tsx

import { eventImages } from "@/data/images";

const EventDetail = () => {
  const images = eventImages.event1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Event photo ${i + 1}`}
          className="rounded-xl shadow-lg"
        />
      ))}
    </div>
  );
};

export default EventDetail;
