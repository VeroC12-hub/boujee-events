// src/styles/brandColors.ts - LUXURY BOUJEE EVENTS THEME
export const brandColors = {
  // 🎨 Primary Brand Colors
  primary: {
    purple: '#8B5CF6',      // Purple-500 - Main brand purple
    purpleDark: '#7C3AED',  // Purple-600 - Hover states
    purpleLight: '#A78BFA', // Purple-400 - Light accents
    pink: '#EC4899',        // Pink-500 - Main brand pink
    pinkDark: '#DB2777',    // Pink-600 - Hover states
    pinkLight: '#F472B6'    // Pink-400 - Light accents
  },

  // ✨ Luxury Accent Colors
  luxury: {
    gold: '#F59E0B',        // Amber-500 - Premium gold
    goldDark: '#D97706',    // Amber-600 - Darker gold
    goldLight: '#FCD34D',   // Amber-300 - Light gold
    silver: '#9CA3AF',      // Gray-400 - Premium silver
    platinum: '#E5E7EB',    // Gray-200 - Platinum accents
    bronze: '#92400E'       // Amber-800 - Bronze details
  },

  // 🌈 Gradient Combinations
  gradients: {
    primary: 'from-purple-600 to-pink-600',
    primaryHover: 'from-purple-700 to-pink-700',
    luxury: 'from-amber-400 via-amber-500 to-amber-600',
    luxuryHover: 'from-amber-500 via-amber-600 to-amber-700',
    sunset: 'from-purple-500 via-pink-500 to-orange-500',
    royal: 'from-indigo-600 via-purple-600 to-pink-600',
    elegant: 'from-gray-800 via-gray-900 to-black'
  },

  // 🎯 Status Colors
  status: {
    success: '#10B981',     // Emerald-500
    warning: '#F59E0B',     // Amber-500  
    error: '#EF4444',       // Red-500
    info: '#3B82F6',        // Blue-500
    draft: '#6B7280',       // Gray-500
    published: '#10B981',   // Emerald-500
    cancelled: '#EF4444',   // Red-500
    completed: '#3B82F6'    // Blue-500
  },

  // 🌙 Dark Mode Support
  dark: {
    background: '#111827',  // Gray-900
    surface: '#1F2937',     // Gray-800
    surfaceLight: '#374151', // Gray-700
    text: '#F9FAFB',        // Gray-50
    textSecondary: '#D1D5DB', // Gray-300
    textMuted: '#9CA3AF',   // Gray-400
    border: '#374151'       // Gray-700
  },

  // ☀️ Light Mode Support
  light: {
    background: '#FFFFFF',  // White
    surface: '#F9FAFB',     // Gray-50
    surfaceLight: '#F3F4F6', // Gray-100
    text: '#111827',        // Gray-900
    textSecondary: '#374151', // Gray-700
    textMuted: '#6B7280',   // Gray-500
    border: '#E5E7EB'       // Gray-200
  },

  // 🎪 Event Category Colors
  categories: {
    'Wine & Dining': '#DC2626',      // Red-600
    'Cultural & Arts': '#7C3AED',    // Purple-600
    'Exclusive Sports': '#059669',   // Emerald-600
    'Private Parties': '#EC4899',    // Pink-500
    'Luxury Travel': '#0EA5E9',      // Sky-500
    'Business & Networking': '#1F2937', // Gray-800
    'Fashion & Lifestyle': '#F59E0B', // Amber-500
    'Wellness & Spa': '#10B981',     // Emerald-500
    'Charity & Gala': '#8B5CF6',     // Purple-500
    'VIP Experience': '#F59E0B'      // Amber-500
  },

  // 🏷️ Tag Colors
  tags: {
    exclusive: '#7C3AED',   // Purple-600
    vip: '#F59E0B',         // Amber-500
    limited: '#DC2626',     // Red-600
    premium: '#059669',     // Emerald-600
    luxury: '#EC4899',      // Pink-500
    networking: '#0EA5E9',  // Sky-500
    social: '#8B5CF6',      // Purple-500
    corporate: '#1F2937',   // Gray-800
    private: '#DB2777',     // Pink-600
    international: '#3B82F6' // Blue-500
  }
};

// 🎨 CSS Custom Properties for easy theming
export const cssVariables = `
  :root {
    /* Primary Colors */
    --color-primary-purple: ${brandColors.primary.purple};
    --color-primary-pink: ${brandColors.primary.pink};
    --color-luxury-gold: ${brandColors.luxury.gold};
    
    /* Gradients */
    --gradient-primary: linear-gradient(to right, ${brandColors.primary.purple}, ${brandColors.primary.pink});
    --gradient-luxury: linear-gradient(to right, ${brandColors.luxury.gold}, ${brandColors.luxury.goldDark});
    
    /* Status Colors */
    --color-success: ${brandColors.status.success};
    --color-warning: ${brandColors.status.warning};
    --color-error: ${brandColors.status.error};
    --color-info: ${brandColors.status.info};
  }
`;

// 🎯 Utility Functions
export const getBrandGradient = (type: keyof typeof brandColors.gradients = 'primary') => {
  return `bg-gradient-to-r ${brandColors.gradients[type]}`;
};

export const getCategoryColor = (category: string) => {
  return brandColors.categories[category as keyof typeof brandColors.categories] || brandColors.primary.purple;
};

export const getTagColor = (tag: string) => {
  const normalizedTag = tag.toLowerCase();
  const tagKey = Object.keys(brandColors.tags).find(key => 
    normalizedTag.includes(key.toLowerCase())
  );
  return tagKey ? brandColors.tags[tagKey as keyof typeof brandColors.tags] : brandColors.primary.purple;
};

export const getStatusColor = (status: string) => {
  return brandColors.status[status as keyof typeof brandColors.status] || brandColors.status.info;
};

// 🎪 Component-specific color schemes
export const componentColors = {
  // Event Cards
  eventCard: {
    background: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    hover: 'hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700',
    gradient: getBrandGradient('primary')
  },

  // Buttons
  button: {
    primary: `${getBrandGradient('primary')} text-white hover:shadow-lg`,
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600',
    luxury: `${getBrandGradient('luxury')} text-black hover:shadow-lg`,
    outline: 'border border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950'
  },

  // Status Badges
  badge: {
    draft: 'bg-gray-500 text-white',
    published: 'bg-green-500 text-white',
    cancelled: 'bg-red-500 text-white',
    completed: 'bg-blue-500 text-white',
    featured: 'bg-amber-500 text-white',
    vip: 'bg-purple-600 text-white'
  },

  // Navigation
  navigation: {
    background: 'bg-gray-900/95 backdrop-blur-sm',
    border: 'border-gray-700',
    text: 'text-gray-300',
    textHover: 'hover:text-yellow-400',
    active: 'bg-yellow-400 text-black',
    logo: 'text-yellow-400'
  }
};

export default brandColors;
