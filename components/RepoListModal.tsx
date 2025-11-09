import React, { useState, useMemo } from 'react';
import type { GithubRepo } from '../types';
import { XIcon, StarIcon, ForkIcon, SearchIcon } from './icons';

interface RepoListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  repos: GithubRepo[];
  showControls?: boolean;
}

export const RepoListModal: React.FC<RepoListModalProps> = ({ isOpen, onClose, title, repos, showControls = true }) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'stargazers_count' | 'forks_count' | 'updated_at'>('stargazers_count');
  const [languageFilter, setLanguageFilter] = useState('All');

  const languages = useMemo(() => ['All', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort()], [repos]);

  const filteredRepos = useMemo(() => {
    if (!showControls) {
      // Default sort by stars when controls are hidden, as it's a common metric for importance.
      return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
    }
    
    return [...repos]
      .filter(repo => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = repo.name.toLowerCase().includes(query) || (repo.description?.toLowerCase().includes(query) ?? false);
        const matchesLang = languageFilter === 'All' || repo.language === languageFilter;
        return matchesQuery && matchesLang;
      })
      .sort((a, b) => {
        if (sortKey === 'updated_at') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        return b[sortKey] - a[sortKey];
      });
  }, [repos, searchQuery, sortKey, languageFilter, showControls]);

  const SortButton: React.FC<{ value: typeof sortKey, children: React.ReactNode }> = ({ value, children }) => (
    <button onClick={() => setSortKey(value)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${sortKey === value ? 'bg-brand-purple text-white' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>{children}</button>
  );


  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-surface dark:bg-surface-dark w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">{title} ({filteredRepos.length})</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close modal">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        {showControls && (
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                      <input type="text" placeholder="Search repositories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-md bg-surface dark:bg-surface-dark border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-brand-purple focus:outline-none transition-colors" />
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/70" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="w-full px-3 py-2 rounded-md bg-surface dark:bg-surface-dark border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-brand-purple focus:outline-none transition-colors">
                          {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                      </select>
                      <div className="flex items-center justify-around bg-black/5 dark:bg-white/5 p-1 rounded-md">
                          <SortButton value="stargazers_count">Stars</SortButton>
                          <SortButton value="forks_count">Forks</SortButton>
                          <SortButton value="updated_at">Updated</SortButton>
                      </div>
                  </div>
              </div>
          </div>
        )}
        
        <div className="p-2 overflow-y-auto">
            {filteredRepos.length > 0 ? (
              <ul className="divide-y divide-black/5 dark:divide-white/10">
                {filteredRepos.map(repo => (
                  <li key={repo.id}>
                    <a 
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start">
                          <h3 className="font-bold text-brand-purple text-lg">{repo.name}</h3>
                          {repo.language && (
                              <div className="flex-shrink-0 ml-4 text-sm bg-black/10 text-text-secondary dark:bg-white/10 dark:text-text-secondary-dark px-2 py-0.5 rounded-full">
                                  {repo.language}
                              </div>
                          )}
                      </div>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark my-1 line-clamp-2">
                          {repo.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center text-sm text-text-secondary dark:text-text-secondary-dark space-x-4 mt-2">
                          <div className="flex items-center">
                              <StarIcon className="w-4 h-4 mr-1 text-yellow-400"/>
                              <span>{repo.stargazers_count.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                              <ForkIcon className="w-4 h-4 mr-1 text-fuchsia-400"/>
                              <span>{repo.forks_count.toLocaleString()}</span>
                          </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
                <div className="text-center text-text-secondary dark:text-text-secondary-dark py-8">
                    {repos.length > 0 ? "No repositories match your filters." : "No public repositories to display."}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};