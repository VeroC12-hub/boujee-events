
import React from "react";

export default function Hero() {
  return (
    <section className="relative bg-black text-white h-screen flex flex-col justify-center items-center text-center px-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563298723-dcfebaa392e3')] bg-cover bg-center opacity-40"></div>
      <div className="relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Experience Premium. Celebrate Boujee.</h1>
        <p className="text-lg md:text-xl mb-6">Curated events for the bold, the boujee, and the unforgettable.</p>
        <a href="#events" className="px-6 py-3 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition">
          Explore Events
        </a>
      </div>
    </section>
  );
}
