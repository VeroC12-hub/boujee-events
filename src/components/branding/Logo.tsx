// src/components/branding/Logo.tsx
import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'primary';
  size?: 'small' | 'medium' | 'large' | 'lg' | 'xlarge';
  showTagline?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  showTagline = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
    lg: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl', 
    lg: 'text-3xl',
    xlarge: 'text-4xl'
  };

  const logoSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    lg: 'text-lg',
    xlarge: 'text-xl'
  };

  const getColors = () => {
    switch (variant) {
      case 'light':
        return {
          logo: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600',
          logoText: 'text-black',
          brandText: 'text-white',
          tagline: 'text-gray-300'
        };
      case 'dark':
        return {
          logo: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600',
          logoText: 'text-black',
          brandText: 'text-gray-900',
          tagline: 'text-gray-600'
        };
      default: // primary
        return {
          logo: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600',
          logoText: 'text-black',
          brandText: 'text-amber-600',
          tagline: 'text-gray-600'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} ${colors.logo} rounded-lg flex items-center justify-center shadow-lg`}>
        <span className={`${logoSizes[size]} ${colors.logoText} font-bold tracking-tight`}>
          be
        </span>
      </div>
      
      {/* Brand Text */}
      <div>
        <h1 className={`${textSizes[size]} font-bold tracking-tight ${colors.brandText}`}>
          Boujee Events
        </h1>
        {showTagline && (
          <p className={`text-xs ${colors.tagline} font-medium`}>
            Creating magical moments
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;
