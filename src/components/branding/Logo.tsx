import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'primary';
  showTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'primary',
  showTagline = false 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  const textColors = {
    light: 'text-white',
    dark: 'text-gray-900',
    primary: 'text-amber-500'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`font-bold ${sizeClasses[size]} ${textColors[variant]}`}>
        be
      </div>
      {showTagline && (
        <div className="flex flex-col">
          <span className={`font-semibold ${textColors[variant]} ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'}`}>
            Boujee Events
          </span>
          {size !== 'sm' && (
            <span className={`text-xs ${variant === 'light' ? 'text-gray-300' : variant === 'dark' ? 'text-gray-600' : 'text-amber-400'}`}>
              Creating magical moments
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
