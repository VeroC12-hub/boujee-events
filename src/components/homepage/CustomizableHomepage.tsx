import React, { useState, useEffect } from 'react';
import MediaDisplay from './MediaDisplay';

export default function CustomizableHomepage() {
  const [backgroundVideo, setBackgroundVideo] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [logo, setLogo] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  return (
    <div className="relative min-h-screen">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <MediaDisplay
          mediaType="background_video"
          className="w-full h-full"
          onMediaLoad={setBackgroundVideo}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header with Logo */}
        <header className="p-6">
          <div className="flex justify-between items-center">
            <div className="h-16 w-32">
              <MediaDisplay
                mediaType="logo"
                className="h-full w-full"
                onMediaLoad={setLogo}
              />
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-white hover:text-gray-300 transition-colors">
                Home
              </a>
              <a href="#gallery" className="text-white hover:text-gray-300 transition-colors">
                Gallery
              </a>
              <a href="#events" className="text-white hover:text-gray-300 transition-colors">
                Events
              </a>
              <a href="#contact" className="text-white hover:text-gray-300 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-4xl">
            {/* If no hero image is set, show text content */}
            {heroImage.length === 0 ? (
              <>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                  Boujee Events
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-8">
                  Creating unforgettable experiences with luxury and style
                </p>
                <button className="bg-primary text-white px-8 py-3 rounded-lg text-lg hover:bg-accent transition-colors">
                  Explore Events
                </button>
              </>
            ) : (
              <div className="w-full max-w-4xl h-96">
                <MediaDisplay
                  mediaType="hero_image"
                  className="w-full h-full rounded-lg shadow-2xl"
                  onMediaLoad={setHeroImage}
                />
              </div>
            )}
          </div>
        </section>

        {/* Banners Section */}
        {banners.length > 0 && (
          <section className="py-16 px-6 bg-black bg-opacity-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-white text-center mb-12">
                Featured Events
              </h2>
              <MediaDisplay
                mediaType="banner"
                className="max-w-4xl mx-auto"
                onMediaLoad={setBanners}
              />
            </div>
          </section>
        )}

        {/* Gallery Section */}
        <section id="gallery" className="py-16 px-6 bg-black bg-opacity-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Event Gallery
            </h2>
            {galleryImages.length > 0 ? (
              <MediaDisplay
                mediaType="gallery_image"
                className="max-w-5xl mx-auto"
                onMediaLoad={setGalleryImages}
              />
            ) : (
              <div className="text-center text-gray-300">
                <p className="text-xl">No gallery images uploaded yet.</p>
                <p className="text-sm mt-2">Visit the admin dashboard to upload images.</p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 px-6 bg-black bg-opacity-70">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8">
              Let's Create Something Amazing
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Ready to plan your next boujee event? Get in touch with us today.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-accent transition-colors">
                Book Consultation
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-black transition-colors">
                View Portfolio
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
