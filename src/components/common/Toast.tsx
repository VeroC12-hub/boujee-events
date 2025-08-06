// =====================================================
// Toast Components - CREATE NEW FILE
// Create this file: src/components/common/Toast.tsx
// =====================================================

import React from 'react';
import { Toast } from '../../hooks/useToast';

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-400';
      case 'error':
        return 'bg-red-500 border-red-400';
      case 'warning':
        return 'bg-yellow-500 border-yellow-400';
      case 'info':
        return 'bg-blue-500 border-blue-400';
      default:
        return 'bg-gray-500 border-gray-400';
    }
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={`${getToastStyles(toast.type)} text-white p-4 rounded-lg shadow-lg border-l-4 mb-2 flex items-center justify-between animate-slide-in`}>
      <div className="flex items-center">
        <span className="mr-3 text-lg">{getIcon(toast.type)}</span>
        <span>{toast.message}</span>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white hover:text-gray-200 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default ToastItem;
