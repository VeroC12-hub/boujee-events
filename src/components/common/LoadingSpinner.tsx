import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'small' | 'md' | 'medium' | 'lg' | 'large';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'primary', 
  className = '',
  text
}) => {
  // Normalize size prop
  const normalizedSize = size === 'sm' || size === 'small' ? 'small' :
                        size === 'md' || size === 'medium' ? 'medium' :
                        size === 'lg' || size === 'large' ? 'large' : 'medium';

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-500 border-t-transparent',
    secondary: 'border-secondary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[normalizedSize]}
          ${colorClasses[color]}
          border-2 rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <span className={`mt-2 text-gray-600 ${textSizeClasses[normalizedSize]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
