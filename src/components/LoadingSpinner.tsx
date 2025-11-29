// LoadingSpinner Component
// Provides accessible loading indicators with various sizes and variants
// Following component standards: React functional component with TypeScript
// Supports custom labels, sizes, and visual variants

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'light' | 'dark' | 'success' | 'warning' | 'error';
  label?: string;
  showLabel?: boolean;
  className?: string;
  'aria-hidden'?: boolean;
  tabIndex?: number;
  'data-testid'?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'default',
  label = 'Loading...',
  showLabel = true,
  className = '',
  'aria-hidden': ariaHidden = false,
  tabIndex,
  'data-testid': testId,
}) => {
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'medium':
      default:
        return 'w-8 h-8';
      case 'large':
        return 'w-12 h-12';
      case 'xlarge':
        return 'w-16 h-16';
    }
  };

  // Get color classes based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'light':
        return 'text-white fill-gray-200';
      case 'dark':
        return 'text-gray-900 fill-gray-100';
      case 'success':
        return 'text-green-600 fill-green-200';
      case 'warning':
        return 'text-yellow-600 fill-yellow-200';
      case 'error':
        return 'text-red-600 fill-red-200';
      case 'default':
      default:
        return 'text-blue-600 fill-blue-200';
    }
  };

  return (
    <div
      data-testid={testId || 'loading-spinner'}
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      role={ariaHidden ? undefined : 'status'}
      aria-label={ariaHidden ? undefined : label}
      aria-live={ariaHidden ? undefined : 'polite'}
      aria-hidden={ariaHidden}
      tabIndex={tabIndex}
    >
      {/* SVG Spinner */}
      <svg
        data-testid="spinner-element"
        className={`animate-spin ${getSizeClasses()} ${getVariantClasses()}`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      {/* Optional Label */}
      {showLabel && label && (
        <span className={`ml-2 text-sm font-medium ${getVariantClasses().split(' ')[0]}`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;