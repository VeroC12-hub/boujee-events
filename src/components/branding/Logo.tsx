// src/components/branding/Logo.tsx - Create this file if it doesn't exist
import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'primary';
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'lg';
  showTagline?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  showTagline = false,
  className = ''
}) => {
  // Size mappings
  const sizeClasses = {
    small: { 
      container: 'text-sm',
      logo: 'w-6 h-6 text-xs',
      text: 'text-sm',
      tagline: 'text-xs'
    },
    medium: { 
      container: 'text-base',
      logo: 'w-8 h-8 text-sm',
      text: 'text-lg',
      tagline: 'text-xs'
    },
    large: { 
      container: 'text-lg',
      logo: 'w-10 h-10 text-base',
      text: 'text-xl',
      tagline: 'text-sm'
    },
    lg: { 
      container: 'text-lg',
      logo: 'w-10 h-10 text-base',
      text: 'text-xl',
      tagline: 'text-sm'
    },
    xlarge: { 
      container: 'text-xl',
      logo: 'w-12 h-12 text-lg',
      text: 'text-2xl',
      tagline: 'text-base'
    }
  };

  // Color variants
  const variantClasses = {
    light: {
      text: 'text-white',
      tagline: 'text-gray-200'
    },
    dark: {
      text: 'text-gray-900',
      tagline: 'text-gray-600'
    },
    primary: {
      text: 'text-yellow-400',
      tagline: 'text-gray-400'
    }
  };

  const sizes = sizeClasses[size];
  const colors = variantClasses[variant];

  return (
    <div className={`flex items-center space-x-3 ${sizes.container} ${className}`}>
      {/* Logo Icon */}
      <div 
        className={`${sizes.logo} relative bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg`}
      >
        <span className={`font-bold tracking-tight text-black`}>
          be
        </span>
      </div>
      
      {/* Brand Text */}
      <div>
        <h1 className={`font-bold tracking-tight ${colors.text} ${sizes.text}`}>
          Boujee Events
        </h1>
        {showTagline && (
          <p className={`font-medium ${colors.tagline} ${sizes.tagline}`}>
            Creating magical moments
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;
