import React, { useState } from 'react';
import { UploadCard } from './UploadCard';
import { UsernameInput } from './UsernameInput';
import { ResumeTextInput } from './ResumeTextInput';

type InputMode = 'upload' | 'text' | 'username';

interface InputCardProps {
  onFileUpload: (file: File) => void;
  onUsernameSubmit: (username: string) => void;
  onTextSubmit: (text: string) => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 px-4 text-center font-semibold rounded-t-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                active 
                ? 'bg-surface dark:bg-surface-dark text-brand-purple' 
                : 'bg-transparent text-text-secondary dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5'
            }`}
        >
            {children}
        </button>
    );
}

export const InputCard: React.FC<InputCardProps> = ({ onFileUpload, onUsernameSubmit, onTextSubmit }) => {
  const [mode, setMode] = useState<InputMode>('upload');

  const containerClasses = "relative w-full max-w-2xl mx-auto bg-surface dark:bg-surface-dark rounded-xl shadow-lg border border-black/5 dark:border-white/10 overflow-hidden";
  
  return (
    <div className={containerClasses}>
        <div className="flex bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
            <TabButton active={mode === 'upload'} onClick={() => setMode('upload')}>Upload PDF</TabButton>
            <TabButton active={mode === 'text'} onClick={() => setMode('text')}>Paste Text</TabButton>
            <TabButton active={mode === 'username'} onClick={() => setMode('username')}>By Username</TabButton>
        </div>
        <div>
            {mode === 'upload' && 
                <UploadCard 
                    onFileUpload={onFileUpload} 
                />
            }
            {mode === 'text' &&
                <ResumeTextInput
                    onSubmit={onTextSubmit}
                />
            }
            {mode === 'username' &&
                <UsernameInput
                    onSubmit={onUsernameSubmit}
                />
            }
        </div>
    </div>
  );
};
