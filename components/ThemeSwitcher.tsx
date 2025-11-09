import React from 'react';
import { SunIcon, MoonIcon } from './icons';
import type { Theme } from '../App';

interface ThemeSwitcherProps {
  theme: Theme;
  onToggle: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/10"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
    </button>
  );
};
