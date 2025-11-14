import React from 'react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: { container: 'w-6 h-6', border: 'border-2', dot: 'w-1.5 h-1.5' },
    md: { container: 'w-12 h-12', border: 'border-[3px]', dot: 'w-2.5 h-2.5' },
    lg: { container: 'w-16 h-16', border: 'border-4', dot: 'w-3.5 h-3.5' },
  };

  const dimensions = sizeClasses[size];

  const containerClasses = fullScreen
    ? 'w-full h-screen flex items-center justify-center bg-gray-50'
    : 'w-full flex items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative">
          {/* Outer spinning ring - primary */}
          <div
            className={`${dimensions.container} ${dimensions.border} border-t-blue-600 border-r-blue-100 border-b-blue-100 border-l-blue-100 rounded-full animate-spin`}
            style={{
              animationDuration: '1s',
            }}
          />
          {/* Middle ring - slower rotation */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'} ${dimensions.border} border-r-blue-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}
            style={{
              animationDuration: '1.5s',
              animationDirection: 'reverse',
            }}
          />
          {/* Inner pulsing dot */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${dimensions.dot} bg-blue-600 rounded-full shadow-lg shadow-blue-600/50 animate-pulse`}
          />
        </div>
        {message && (
          <p className="text-gray-600 text-sm font-medium tracking-wide select-none">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loader;

