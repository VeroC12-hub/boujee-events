import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative">
          <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs">⏳</span>
          </div>
        </div>
        {message && (
          <p className="mt-4 text-gray-600 text-sm">{message}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          EventHub | 2025-08-03 03:42:59 UTC
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
