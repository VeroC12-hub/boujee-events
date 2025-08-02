import React, { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#" },
    { name: "Events", href: "#events" },
    { name: "About", href: "#about" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <a href="#" className="text-xl font-bold tracking-tight text-black">
          Boujee Events
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="hover:text-black transition-colors"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white shadow-md">
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="block text-sm text-gray-700 hover:text-black"
            >
              {item.name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
