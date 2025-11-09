import React from 'react';
import type { GithubProfile } from '../types';
import { XIcon } from './icons';

interface HistoryProps {
  items: GithubProfile[];
  onSelect: (username: string) => void;
  onRemove: (login: string) => void;
  onClear: () => void;
  loadingLogin: string | null;
}

export const History: React.FC<HistoryProps> = ({ items, onSelect, onRemove, onClear, loadingLogin }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">Recent Analyses</h2>
        <button
          onClick={onClear}
          className="text-sm text-text-secondary dark:text-text-secondary-dark hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          Clear History
        </button>
      </div>
      <div className="flex gap-4 pb-4 overflow-x-auto">
        {items.map(profile => (
          <div key={profile.id} className="relative group flex-shrink-0">
            <button
              onClick={() => onSelect(profile.login)}
              disabled={!!loadingLogin}
              className="flex flex-col items-center gap-2 w-24 text-center transition-transform transform group-hover:scale-105 disabled:cursor-not-allowed"
            >
              <div className="relative">
                <img
                  src={profile.avatar_url}
                  alt={profile.login}
                  className={`w-16 h-16 rounded-full ring-2 ring-black/10 dark:ring-white/10 group-hover:ring-brand-purple transition-all duration-200 ${loadingLogin === profile.login ? 'opacity-50' : ''}`}
                />
                {loadingLogin === profile.login && (
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   </div>
                )}
              </div>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark truncate w-full">@{profile.login}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(profile.login);
              }}
              className="absolute top-0 right-2 w-6 h-6 bg-surface dark:bg-surface-dark rounded-full flex items-center justify-center text-text-secondary dark:text-text-secondary-dark opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200"
              aria-label={`Remove ${profile.login} from history`}
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};