// src/components/branding/Logo.tsx
// COPY AND PASTE THIS ENTIRE FILE

import React from 'react';

interface LogoProps {
  variant?: 'primary' | 'light' | 'dark' | 'minimal';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  className = '',
  showWordmark = true,
  showTagline = false
}) => {
  const sizeClasses = {
    small: {
      icon: 'text-lg',
      wordmark: 'text-sm',
      tagline: 'text-xs',
      spacing: 'space-x-2'
    },
    medium: {
      icon: 'text-2xl',
      wordmark: 'text-lg',
      tagline: 'text-xs',
      spacing: 'space-x-3'
    },
    large: {
      icon: 'text-3xl',
      wordmark: 'text-xl',
      tagline: 'text-sm',
      spacing: 'space-x-4'
    },
    xlarge: {
      icon: 'text-4xl',
      wordmark: 'text-2xl',
      tagline: 'text-base',
      spacing: 'space-x-4'
    }
  };

  const variantClasses = {
    primary: {
      icon: 'text-amber-500 hover:text-amber-600',
      wordmark: 'text-gray-900',
      tagline: 'text-amber-600'
    },
    light: {
      icon: 'text-amber-400 hover:text-amber-300',
      wordmark: 'text-white',
      tagline: 'text-amber-200'
    },
    dark: {
      icon: 'text-amber-600 hover:text-amber-700',
      wordmark: 'text-gray-800',
      tagline: 'text-amber-700'
    },
    minimal: {
      icon: 'text-amber-500',
      wordmark: 'text-gray-700',
      tagline: 'text-gray-500'
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <div className={`flex items-center ${currentSize.spacing} ${className}`}>
      {/* Logo Icon - "be" */}
      <div className={`font-bold ${currentSize.icon} ${currentVariant.icon} transition-colors cursor-pointer`}>
        be
      </div>
      
      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className={`font-bold ${currentSize.wordmark} ${currentVariant.wordmark} leading-tight`}>
            Boujee Events
          </div>
          {showTagline && (
            <div className={`${currentSize.tagline} ${currentVariant.tagline} font-medium leading-tight`}>
              Creating magical moments
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
