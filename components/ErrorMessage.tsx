
import React from 'react';
import { AlertTriangleIcon } from './icons';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-red-500 dark:text-red-400">
      <AlertTriangleIcon className="w-12 h-12" />
      <p className="text-lg font-semibold">An Error Occurred</p>
      <p className="text-center text-red-600 dark:text-red-300 max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark focus:ring-red-500"
      >
        Try Again
      </button>
    </div>
  );
};
