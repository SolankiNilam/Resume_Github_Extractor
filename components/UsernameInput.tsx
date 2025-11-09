import React, { useState } from 'react';
import { SearchIcon } from './icons';

interface UsernameInputProps {
  onSubmit: (username: string) => void;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({ onSubmit }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(username);
    }
    
    return (
        <form onSubmit={handleSubmit} className="group p-8 sm:p-12 flex flex-col items-center space-y-4">
             <SearchIcon className="w-20 h-20 text-text-secondary/50 dark:text-text-secondary-dark/50 group-hover:text-brand-pink transition-colors duration-300" />
            <p className="text-xl font-semibold text-text-primary dark:text-text-primary-dark">Enter a GitHub Username</p>
            <div className="relative w-full max-w-sm">
                 <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., torvalds"
                    className="w-full px-4 py-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-brand-purple focus:outline-none transition-colors"
                    aria-label="GitHub username"
                />
            </div>
            <button
                type="submit"
                className="w-full max-w-sm px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-lg shadow-lg shadow-pink-500/20 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark focus:ring-brand-purple disabled:from-gray-400 disabled:to-gray-500 disabled:dark:from-gray-600 disabled:dark:to-gray-700 disabled:scale-100 disabled:cursor-not-allowed"
            >
                Fetch Profile
            </button>
        </form>
    );
};