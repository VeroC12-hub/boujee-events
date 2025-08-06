// src/components/common/LoadingSpinner.tsx - Create this file if it doesn't exist
import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white' | 'gray';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  message = "Loading...",
  size = 'medium',
  color = 'primary'
}) => {
  const containerClass = fullScreen 
    ? "min-h-screen bg-gray-900 flex items-center justify-center" 
    : "flex items-center justify-center p-8";

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-yellow-400 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div 
          className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin mx-auto mb-4`}
        />
        {message && (
          <p className={`${color === 'white' ? 'text-white' : 'text-gray-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
