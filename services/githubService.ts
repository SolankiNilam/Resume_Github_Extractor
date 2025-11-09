import type { GithubProfile, GithubRepo, GithubUser, PinnedRepo } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

async function fetchGitHubAPI<T,>(endpoint: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let message = errorData.message || `An unexpected error occurred while fetching from GitHub.`;

    switch (response.status) {
        case 403:
            message = "GitHub API rate limit exceeded. Please wait a while before trying again.";
            break;
        case 404:
            message = `The requested resource was not found on GitHub.`;
            break;
        case 500:
        case 503:
            message = "GitHub's servers are experiencing issues. Please try again later.";
            break;
    }
    
    throw new Error(message);
  }
  return response.json();
}

async function fetchAllGithubRepos(username: string, repoCount: number): Promise<GithubRepo[]> {
  if (repoCount === 0) return [];

  const perPage = 100; // Max per page from GitHub API
  const numPages = Math.ceil(repoCount / perPage);
  const promises: Promise<GithubRepo[]>[] = [];

  for (let i = 1; i <= numPages; i++) {
    promises.push(fetchGitHubAPI<GithubRepo[]>(`/users/${username}/repos?sort=updated&per_page=${perPage}&page=${i}`));
  }

  const repoPages = await Promise.all(promises);
  return repoPages.flat();
}

async function fetchPinnedRepos(username: string): Promise<PinnedRepo[]> {
  try {
    // This uses a third-party service to scrape pinned repos, as it's not available in GitHub's REST API v3.
    const response = await fetch(`https://gh-pinned-repos.egoist.dev/?username=${username}`);
    if (!response.ok) {
        // Don't throw an error, just return empty array and log it.
        // This prevents the whole profile from failing if this service is down.
        console.error(`Failed to fetch pinned repos for ${username}. Status: ${response.status}`);
        return [];
    }
    return response.json();
  } catch (error) {
     console.error(`Error fetching pinned repos for ${username}:`, error);
     return []; // Gracefully fail
  }
}


export async function fetchGithubProfile(username: string): Promise<{ profile: GithubProfile; repos: GithubRepo[]; pinnedRepos: PinnedRepo[] }> {
  try {
    const profile = await fetchGitHubAPI<GithubProfile>(`/users/${username}`);
    
    // Fetch all repos and pinned repos in parallel
    const [repos, pinnedRepos] = await Promise.all([
        fetchAllGithubRepos(username, profile.public_repos),
        fetchPinnedRepos(username)
    ]);

    return { profile, repos, pinnedRepos };
  } catch (error) {
    console.error("Error fetching GitHub data for user:", username, error);
    if (error instanceof Error && error.message.includes('Not Found')) {
      throw new Error(`GitHub user "${username}" not found.`);
    }
    // Re-throw the more specific error from fetchGitHubAPI
    throw error;
  }
}

export async function fetchGithubFollowers(username: string): Promise<GithubUser[]> {
  try {
    return await fetchGitHubAPI<GithubUser[]>(`/users/${username}/followers?per_page=100`);
  } catch (error) {
    console.error(`Error fetching followers for ${username}:`, error);
    throw new Error(`Failed to fetch followers for "${username}".`);
  }
}

export async function fetchGithubFollowing(username: string): Promise<GithubUser[]> {
  try {
    return await fetchGitHubAPI<GithubUser[]>(`/users/${username}/following?per_page=100`);
  } catch (error) {
    console.error(`Error fetching following for ${username}:`, error);
    throw new Error(`Failed to fetch users followed by "${username}".`);
  }
}
