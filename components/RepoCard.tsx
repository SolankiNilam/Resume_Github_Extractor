import React from 'react';
import type { GithubRepo } from '../types';
import { StarIcon, ForkIcon, RepoIcon, CalendarIcon, LicenseIcon } from './icons';

interface RepoCardProps {
  repo: GithubRepo;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <a 
      href={repo.html_url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="group block p-5 bg-surface dark:bg-surface-dark rounded-lg border border-black/5 dark:border-white/10 hover:border-brand-purple transition-all duration-300 shadow-md h-full flex flex-col justify-between transform hover:-translate-y-1 hover:scale-[1.02] dark:hover:shadow-lg dark:hover:shadow-brand-purple/20"
    >
      <div>
        <div className="flex items-center mb-2">
            <RepoIcon className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark mr-2 flex-shrink-0" />
            <h4 className="text-lg font-bold text-brand-purple truncate group-hover:text-brand-pink transition-colors">{repo.name}</h4>
        </div>
        <p 
            className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4 line-clamp-2 h-10"
            title={repo.description || undefined}
        >
            {repo.description || 'No description provided.'}
        </p>
      </div>
      <div className="flex flex-col gap-3 text-sm text-text-secondary dark:text-text-secondary-dark mt-auto pt-4 border-t border-black/5 dark:border-white/10">
        <div className="flex items-center space-x-4">
            {repo.language && (
                <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-1.5 bg-pink-400`}></span>
                    <span>{repo.language}</span>
                </div>
            )}
            <div className="flex items-center">
                <StarIcon className="w-4 h-4 mr-1 text-yellow-400"/>
                <span>{repo.stargazers_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
                <ForkIcon className="w-4 h-4 mr-1 text-fuchsia-400"/>
                <span>{repo.forks_count.toLocaleString()}</span>
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1.5" />
                <span>Updated {updatedDate}</span>
            </div>
            {repo.license && (
                 <div className="flex items-center">
                    <LicenseIcon className="w-4 h-4 mr-1.5" />
                    <span>{repo.license.name}</span>
                </div>
            )}
        </div>
      </div>
    </a>
  );
};