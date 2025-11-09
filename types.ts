
export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GithubProfile {
  login: string;
  // Fix: Add the 'id' property to match the GitHub API response and resolve an error in the History component.
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  forks_count: number;
  created_at: string;
  updated_at: string;
  license: {
    name: string;
  } | null;
  // Added for commit counting
  commits_url: string; 
}

export interface PinnedRepo {
  owner: string;
  repo: string;
  link: string;
  description: string | null;
  image: string;
  website: string | null;
  language: string | null;
  languageColor: string | null;
  stars: string;
  forks: string;
}

export interface ResumeAnalysisResult {
  githubProfileUrl: string | null;
  linkedInUrl: string | null;
  portfolioUrls: string[];
  projectUrls: string[];
  otherUrls: string[];
}

export interface InsightItem {
    name: string;
    score: number;
    justification: string;
}

export interface InsightsData {
    overallScore: number;
    insights: InsightItem[];
}
