import type { GithubProfile } from '../types';

const HISTORY_KEY = 'github-extractor-history';
const MAX_HISTORY_ITEMS = 10;

export function getHistory(): GithubProfile[] {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
}

function saveHistory(history: GithubProfile[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }
}

export function addToHistory(profile: GithubProfile): GithubProfile[] {
  const currentHistory = getHistory();
  // Remove existing entry for the same user to move it to the front
  const filteredHistory = currentHistory.filter(p => p.login !== profile.login);
  // Add the new profile to the beginning
  const newHistory = [profile, ...filteredHistory];
  // Limit the number of history items
  const slicedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
  saveHistory(slicedHistory);
  return slicedHistory;
}

export function removeFromHistory(login: string): GithubProfile[] {
    const currentHistory = getHistory();
    const newHistory = currentHistory.filter(p => p.login !== login);
    saveHistory(newHistory);
    return newHistory;
}

export function clearHistory(): void {
    saveHistory([]);
}
