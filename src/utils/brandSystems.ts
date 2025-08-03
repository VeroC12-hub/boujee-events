import React from 'react';

// Brand system based on your golden logo
export const brandColors = {
  // Primary Gold Colors from your logo
  gold: {
    primary: '#D4AF37',
    light: '#F4E197', 
    dark: '#B8941F',
    metallic: '#FFD700',
    gradient: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8941F 100%)'
  },
  
  // Supporting Colors
  neutral: {
    cream: '#FFF8DC',
    white: '#FFFFFF',
    grayLight: '#F5F5F5',
    grayMedium: '#CCCCCC',
    charcoal: '#2D2D2D',
    black: '#000000'
  },
  
  // Status Colors
  status: {
    success: '#28A745',
    warning: '#FFC107', 
    error: '#DC3545',
    info: '#17A2B8'
  }
};

export const brandShadows = {
  gold: '0 4px 15px rgba(212, 175, 55, 0.3)',
  goldHover: '0 8px 25px rgba(212, 175, 55, 0.4)',
  soft: '0 2px 8px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
  strong: '0 8px 24px rgba(0, 0, 0, 0.2)'
};

// Logo component that appears everywhere
export const Logo = ({ size = 'medium', variant = 'full' }: { 
  size?: 'small' | 'medium' | 'large' | 'xl'; 
  variant?: 'full' | 'icon' | 'text' 
}) => {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  
  return (
    <div className="flex items-center space-x-3">
      {(variant === 'full' || variant === 'icon') && (
        <div className={`${sizes[size]} relative`}>
          {/* Your "be" logo */}
          <div 
            className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold"
            style={{ 
              background: brandColors.gold.gradient,
              boxShadow: brandShadows.gold
            }}
          >
            <span className={`
              ${size === 'small' ? 'text-xs' : 
                size === 'medium' ? 'text-sm' : 
                size === 'large' ? 'text-lg' : 'text-xl'}
              font-bold tracking-tight
            `}>
              be
            </span>
          </div>
        </div>
      )}
      
      {(variant === 'full' || variant === 'text') && (
        <div>
          <h1 className={`
            font-bold tracking-tight
            ${size === 'small' ? 'text-lg' : 
              size === 'medium' ? 'text-xl' : 
              size === 'large' ? 'text-2xl' : 'text-3xl'}
          `} style={{ color: brandColors.gold.primary }}>
            EventHub
          </h1>
          {size !== 'small' && (
            <p className="text-xs text-gray-600 font-medium">Premium Event Management</p>
          )}
        </div>
      )}
    </div>
  );
};
