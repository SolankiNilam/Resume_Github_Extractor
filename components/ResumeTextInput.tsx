import React, { useState } from 'react';
import { FileTextIcon } from './icons';

interface ResumeTextInputProps {
  onSubmit: (text: string) => void;
}

export const ResumeTextInput: React.FC<ResumeTextInputProps> = ({ onSubmit }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(text);
    }
    
    return (
        <form onSubmit={handleSubmit} className="group p-8 sm:p-12 flex flex-col items-center space-y-4">
            <FileTextIcon className="w-20 h-20 text-text-secondary/50 dark:text-text-secondary-dark/50 group-hover:text-brand-pink transition-colors duration-300" />
            <p className="text-xl font-semibold text-text-primary dark:text-text-primary-dark">Paste your resume content</p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the full text of your resume here..."
                className="w-full h-40 px-4 py-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-brand-purple focus:outline-none transition-colors resize-y"
                aria-label="Resume text input"
            />
            <button
                type="submit"
                disabled={!text.trim()}
                className="w-full max-w-sm px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-lg shadow-lg shadow-pink-500/20 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark focus:ring-brand-purple disabled:from-gray-400 disabled:to-gray-500 disabled:dark:from-gray-600 disabled:dark:to-gray-700 disabled:scale-100 disabled:cursor-not-allowed"
            >
                Analyze Resume
            </button>
        </form>
    );
};