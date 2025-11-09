import React from 'react';
import type { PinnedRepo } from '../types';
import { StarIcon, ForkIcon } from './icons';

interface PinnedRepoCardProps {
  repo: PinnedRepo;
}

export const PinnedRepoCard: React.FC<PinnedRepoCardProps> = ({ repo }) => {
  return (
    <a 
      href={repo.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="group relative block rounded-lg border border-black/5 dark:border-white/10 hover:border-brand-purple transition-all duration-300 shadow-md h-full transform hover:-translate-y-1 overflow-hidden"
      style={{
          backgroundImage: `url(${repo.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 p-4 bg-black/80 flex flex-col justify-between h-full">
        <div>
            <h4 className="text-lg font-bold text-pink-300 truncate group-hover:text-pink-200 transition-colors">{repo.repo}</h4>
            <p className="text-sm text-stone-300 mb-4 mt-1 line-clamp-2 h-10">
                {repo.description || 'No description provided.'}
            </p>
        </div>
        <div className="flex items-center text-sm text-stone-300 space-x-4 mt-auto pt-2">
            {repo.language && (
                <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-1.5`} style={{backgroundColor: repo.languageColor || '#fff'}}></span>
                    <span>{repo.language}</span>
                </div>
            )}
            <div className="flex items-center">
                <StarIcon className="w-4 h-4 mr-1 text-yellow-400"/>
                <span>{repo.stars}</span>
            </div>
            <div className="flex items-center">
                <ForkIcon className="w-4 h-4 mr-1 text-fuchsia-400"/>
                <span>{repo.forks}</span>
            </div>
        </div>
      </div>
       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300"></div>
    </a>
  );
};
