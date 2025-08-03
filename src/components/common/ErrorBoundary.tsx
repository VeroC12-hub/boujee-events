import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 p-4 rounded-lg mb-6">
                <summary className="cursor-pointer font-medium text-red-600 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-800 whitespace-pre-wrap">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Go Back
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-6">
              Error ID: {Date.now()} | Time: 2025-08-03 03:42:59 UTC
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
