// Notification Component
// Provides standardized user feedback messages with different types and dismiss functionality
// Following component standards: React functional component with TypeScript
// Supports auto-dismiss, manual dismiss, and accessibility features

import React, { useEffect, useRef } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  dismissible?: boolean;
  autoDismiss?: number | boolean;
  onDismiss?: () => void;
  className?: string;
  'data-testid'?: string;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  dismissible = true,
  autoDismiss,
  onDismiss,
  className = '',
  'data-testid': testId,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up auto-dismiss timer
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const delay = typeof autoDismiss === 'number' ? autoDismiss : 5000; // Default 5 seconds
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, delay);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [autoDismiss, onDismiss]);

  const handleDismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  // Determine styling based on type
  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border border-yellow-400 text-yellow-700';
      case 'info':
      default:
        return 'bg-blue-100 border border-blue-400 text-blue-700';
    }
  };

  // Get icon for each type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg
            data-testid="success-icon"
            className="w-4 h-4 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            data-testid="error-icon"
            className="w-4 h-4 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            data-testid="warning-icon"
            className="w-4 h-4 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg
            data-testid="info-icon"
            className="w-4 h-4 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div
      data-testid={testId || 'notification'}
      className={`flex items-center p-3 rounded-md ${getTypeClasses()} ${className}`}
      role="alert"
      aria-live="polite"
    >
      {getIcon()}
      <span className="flex-grow text-sm font-medium">{message}</span>

      {dismissible && (
        <button
          data-testid="dismiss-button"
          type="button"
          onClick={handleDismiss}
          className="ml-3 inline-flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors ease-in-out duration-150"
          aria-label="Dismiss notification"
        >
          <svg
            className="w-4 h-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {message && (
            <span className="sr-only">Dismiss notification</span>
          )}
        </button>
      )}
    </div>
  );
};

export default Notification;