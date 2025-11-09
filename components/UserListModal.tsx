import React from 'react';
import type { GithubUser } from '../types';
import { Loader } from './Loader';
import { XIcon } from './icons';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: GithubUser[] | null;
  isLoading: boolean;
}

export const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, title, users, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-surface dark:bg-surface-dark w-full max-w-md max-h-[80vh] rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close modal">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-2 overflow-y-auto">
          {isLoading && (
            <div className="py-20">
              <Loader />
            </div>
          )}
          {!isLoading && users && (
             <ul className="divide-y divide-black/5 dark:divide-white/10">
              {users.length > 0 ? users.map(user => (
                <li key={user.id}>
                  <a 
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 gap-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors duration-200"
                  >
                    <img src={user.avatar_url} alt={`${user.login}'s avatar`} className="w-12 h-12 rounded-full ring-2 ring-black/10 dark:ring-white/10" />
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{user.login}</span>
                  </a>
                </li>
              )) : (
                <li className="text-center text-text-secondary dark:text-text-secondary-dark py-8">No users to display.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};