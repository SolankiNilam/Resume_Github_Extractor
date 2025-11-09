import React from 'react';

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  message = 'Processing...', 
  subMessage = 'Please wait a moment.' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-text-secondary dark:text-text-secondary-dark">
      <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">{message}</p>
      <p className="text-sm">{subMessage}</p>
    </div>
  );
};