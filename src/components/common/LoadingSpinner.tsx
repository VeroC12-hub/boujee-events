// =====================================================
// LoadingSpinner Component - CREATE NEW FILE
// Create this file: src/components/common/LoadingSpinner.tsx
// =====================================================

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'border-yellow-400',
  message = 'Loading...',
  fullScreen = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4 border-2';
      case 'large':
        return 'w-12 h-12 border-4';
      default:
        return 'w-8 h-8 border-2';
    }
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div className={`${getSizeClasses()} ${color} border-t-transparent rounded-full animate-spin`}></div>
      {message && <p className="text-white ml-4">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
