// ErrorBoundary Component
// Catches JavaScript errors in child component tree and displays fallback UI
// Following React Error Boundary patterns with development mode error details
// Includes recovery options and comprehensive error logging

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  'data-testid'?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private static readonly MAX_RETRY_ATTEMPTS = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with additional error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleTryAgain = () => {
    if (this.retryCount < ErrorBoundary.MAX_RETRY_ATTEMPTS) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    } else {
      // If max retries reached, reload the page
      window.location.reload();
    }
  };

  handleReloadPage = () => {
    window.location.reload();
  };

  isDevelopmentMode = () => {
    return process.env.NODE_ENV === 'development';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          data-testid={this.props['data-testid'] || 'error-boundary'}
          className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
          role="alert"
          aria-live="polite"
        >
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto h-12 w-12 text-red-500 mb-4">
                <svg
                  className="h-full w-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                An unexpected error occurred. We apologize for the inconvenience.
              </p>

              {/* Error Details (Development Only) */}
              {this.isDevelopmentMode() && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Recovery Actions */}
              <div className="space-y-3">
                <button
                  onClick={this.handleTryAgain}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                  aria-label="Try to recover from error"
                >
                  Try Again
                  {this.retryCount > 0 && ` (Attempt ${this.retryCount + 1})`}
                </button>

                <button
                  onClick={this.handleReloadPage}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                  aria-label="Reload the page to reset the application"
                >
                  Reload Page
                </button>
              </div>

              {/* Help Text */}
              <p className="text-sm text-gray-500 mt-6">
                If the problem persists, please try refreshing your browser or contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;