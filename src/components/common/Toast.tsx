import React, { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getToastStyles = () => {
    const base = 'transform transition-all duration-300 ease-in-out';
    const visible = isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';
    
    const typeStyles = {
      success: 'bg-green-500 border-green-600',
      error: 'bg-red-500 border-red-600',
      warning: 'bg-yellow-500 border-yellow-600',
      info: 'bg-blue-500 border-blue-600'
    };

    return `${base} ${visible} ${typeStyles[toast.type]} border-l-4 text-white p-4 rounded-lg shadow-lg max-w-sm w-full`;
  };

  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[toast.type];
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        <span className="text-lg mr-3 mt-0.5">{getIcon()}</span>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-xs opacity-90 mt-1">{toast.message}</p>
          )}
          <p className="text-xs opacity-75 mt-2">
            2025-08-03 03:42:59 UTC
          </p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="ml-3 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default Toast;
