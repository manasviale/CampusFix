import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
