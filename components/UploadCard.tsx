import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

interface UploadCardProps {
  onFileUpload: (file: File) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const containerClasses = `relative w-full border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 group ${isDragging ? 'border-brand-pink scale-105 shadow-2xl shadow-pink-500/20' : 'border-black/10 dark:border-white/10'}`;

  return (
    <div 
      className={containerClasses}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
        <div className="flex flex-col items-center space-y-4">
          <UploadIcon className="w-20 h-20 text-text-secondary/50 dark:text-text-secondary-dark/50 group-hover:text-brand-pink transition-colors duration-300" />
          <p className="text-xl font-semibold text-text-primary dark:text-text-primary-dark">Drag & Drop your PDF resume here</p>
          <p className="text-text-secondary dark:text-text-secondary-dark">or</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
            aria-label="File upload"
          />
          <button
            onClick={openFileDialog}
            className="px-6 py-2 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-lg shadow-lg shadow-pink-500/20 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark focus:ring-brand-purple"
          >
            Select Resume
          </button>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">Only .pdf files are accepted</p>
        </div>
    </div>
  );
};