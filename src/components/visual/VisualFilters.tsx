import React from 'react';
import { Music, Utensils, Palette, Star, Trophy, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VisualFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  eventCounts?: Record<string, number>;
}

const categoryIcons = {
  'All': '🎪',
  'Festival': '🎵',
  'Luxury Experience': '⭐',
  'Party': '🎉',
  'Corporate': '🏢',
  'VIP Experience': '👑',
  'Music': '🎼',
  'Food & Drink': '🍷',
  'Art & Culture': '🎭',
  'Sports': '🏆',
  'Wellness': '🧘'
};

const categoryColors = {
  'All': 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  'Festival': 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  'Luxury Experience': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  'Party': 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  'Corporate': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'VIP Experience': 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  'Music': 'bg-green-100 text-green-700 hover:bg-green-200',
  'Food & Drink': 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  'Art & Culture': 'bg-red-100 text-red-700 hover:bg-red-200',
  'Sports': 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  'Wellness': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
};

const VisualFilters: React.FC<VisualFiltersProps> = ({ 
  selectedCategory, 
  onCategoryChange, 
  eventCounts = {} 
}) => {
  const categories = Object.keys(categoryIcons);

  return (
    <div className="w-full">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore Events by Category</h2>
        <p className="text-gray-600">Discover amazing experiences tailored to your interests</p>
      </div>

      {/* Visual Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11 gap-4 mb-8">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const count = eventCounts[category] || 0;
          
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                ${isSelected 
                  ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Icon */}
              <div className="text-4xl mb-3 flex justify-center">
                {categoryIcons[category as keyof typeof categoryIcons]}
              </div>
              
              {/* Category Name */}
              <div className="text-sm font-semibold text-gray-800 mb-1 text-center">
                {category}
              </div>
              
              {/* Event Count */}
              {count > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs"
                >
                  {count}
                </Badge>
              )}
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Results Summary */}
      <div className="text-center">
        <p className="text-gray-600">
          {selectedCategory === 'All' 
            ? `Showing all ${Object.values(eventCounts).reduce((a, b) => a + b, 0)} events`
            : `Showing ${eventCounts[selectedCategory] || 0} ${selectedCategory.toLowerCase()} events`
          }
        </p>
      </div>
    </div>
  );
};

export default VisualFilters;