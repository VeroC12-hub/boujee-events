
import React from "react";
import Hero from "../components/Hero";
import EventsSection from "../components/EventsSection";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";

export default function IndexPage() {
  return (
    <>
      <Hero />
      <EventsSection />
      <AboutSection />
      <Footer />
    </>
  );
}
