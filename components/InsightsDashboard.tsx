import React, { useState, useEffect, useMemo } from 'react';
import { generateInsightsScores } from '../services/geminiService';
import type { GithubProfile, GithubRepo, InsightsData } from '../types';
import { Loader } from './Loader';
import { XIcon, DownloadIcon, SparklesIcon, GithubIcon, StarIcon, RepoIcon, CalendarIcon, ChartBarIcon, UsersIcon, CodeIcon, ForkIcon } from './icons';
import { LanguagePieChart, RepoBarChart, ActivityLineChart } from './Charts';

interface InsightsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  profile: GithubProfile;
  repos: GithubRepo[];
}

const InsightStatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-surface dark:bg-surface-dark p-4 rounded-lg flex items-center gap-4 border border-black/5 dark:border-white/10">
        <div className="p-2 bg-brand-purple/10 rounded-md">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">{value}</p>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{label}</p>
        </div>
    </div>
);

const insightDetails: { [key: string]: { icon: React.ReactNode; description: string; color: string } } = {
    'Open Source Contributor': {
        icon: <SparklesIcon className="w-6 h-6 text-green-500" />,
        description: 'Active in open source development with consistent contributions and community engagement.',
        color: 'green',
    },
    'Full Stack Developer': {
        icon: <CodeIcon className="w-6 h-6 text-orange-500" />,
        description: 'Demonstrates proficiency across multiple programming languages and technologies.',
        color: 'orange',
    },
    'Project Maintainer': {
        icon: <RepoIcon className="w-6 h-6 text-blue-500" />,
        description: 'Shows strong project management skills with well-maintained repositories.',
        color: 'blue',
    },
    'Community Leader': {
        icon: <UsersIcon className="w-6 h-6 text-yellow-500" />,
        description: 'Builds strong developer networks with active follower engagement.',
        color: 'yellow',
    }
};

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ isOpen, onClose, profile, repos }) => {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !insightsData && !isLoading) {
      const fetchInsights = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await generateInsightsScores(profile, repos);
          setInsightsData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchInsights();
    }
  }, [isOpen, profile, repos, insightsData, isLoading]);
  
  const languageData = useMemo(() => {
      const langMap = new Map<string, number>();
      repos.forEach(repo => {
          if (repo.language) {
              langMap.set(repo.language, (langMap.get(repo.language) || 0) + 1);
          }
      });
      return Array.from(langMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
  }, [repos]);

  const topReposByStars = useMemo(() => {
      return [...repos]
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 6)
          .map(repo => ({ name: repo.name, stars: repo.stargazers_count, forks: repo.forks_count }));
  }, [repos]);
  
  const activityData = useMemo(() => {
    const activityMap = new Map<number, number>();
    repos.forEach(repo => {
        const year = new Date(repo.created_at).getFullYear();
        activityMap.set(year, (activityMap.get(year) || 0) + 1);
    });
    const sortedYears = Array.from(activityMap.keys()).sort();
    if (sortedYears.length < 2) return [];

    // Fill in missing years with 0 count
    const minYear = sortedYears[0];
    const maxYear = sortedYears[sortedYears.length - 1];
    for (let year = minYear; year <= maxYear; year++) {
        if (!activityMap.has(year)) {
            activityMap.set(year, 0);
        }
    }

    return Array.from(activityMap.entries())
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year - b.year);
  }, [repos]);

  const recentActivityDays = useMemo(() => {
      if (!profile.created_at) return 'N/A';
      const lastUpdate = repos.length > 0 ? Math.max(...repos.map(r => new Date(r.updated_at).getTime())) : new Date().getTime();
      const diffDays = Math.floor((new Date().getTime() - lastUpdate) / (1000 * 60 * 60 * 24));
      return diffDays === 0 ? 'Today' : `${diffDays}d ago`;
  }, [repos, profile]);

  const handleExport = () => {
    if (!insightsData) return;
    
    let content = `# GitHub AI Insights for ${profile.name || profile.login}\n\n`;
    content += `**Overall Score:** ${insightsData.overallScore}/100\n\n`;
    content += `## Key Skill Areas\n\n`;
    insightsData.insights.forEach(item => {
        content += `### ${item.name}: ${item.score}/100\n`;
        content += `*${item.justification}*\n\n`;
    });

    content += `## Statistics\n\n`;
    content += `- **Languages:** ${languageData.length}\n`;
    content += `- **Total Repositories:** ${profile.public_repos}\n`;
    content += `- **Last Activity:** ${recentActivityDays}\n`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GitHub-Insights-${profile.login}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-background dark:bg-background-dark w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-brand-purple" />
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">AI Insights for {profile.name || profile.login}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} disabled={!insightsData} className="p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Export Insights">
                <DownloadIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close modal">
                <XIcon className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="p-6 overflow-y-auto bg-surface dark:bg-surface-dark">
          {isLoading && (
            <div className="py-20 flex items-center justify-center">
              <Loader message="Generating AI Insights..." subMessage="This might take a moment." />
            </div>
          )}
          {error && (
            <div className="py-20 text-center text-red-500">
                <p className="font-semibold">Failed to generate insights.</p>
                <p className="text-sm">{error}</p>
            </div>
          )}
          {insightsData && (
            <div className="space-y-6">
                <div className="bg-surface dark:bg-surface-dark/50 p-6 rounded-lg border border-black/5 dark:border-white/10">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-1"><SparklesIcon className="w-5 h-5 text-brand-purple" /> AI-Generated Insights</h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4">Based on GitHub profile analysis</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {insightsData.insights.map(item => {
                            const details = insightDetails[item.name];
                            if (!details) return null;
                            const colorClass = {
                                green: 'bg-green-500 text-green-500',
                                orange: 'bg-orange-500 text-orange-500',
                                blue: 'bg-blue-500 text-blue-500',
                                yellow: 'bg-yellow-500 text-yellow-500',
                            }[details.color] || 'bg-gray-500 text-gray-500';

                            return (
                                <div key={item.name} className="bg-surface dark:bg-surface-dark p-4 rounded-lg border border-black/5 dark:border-white/10 flex flex-col">
                                    <div className="flex items-start gap-4">
                                        {details.icon}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-text-primary dark:text-text-primary-dark">{item.name}</p>
                                                <p className={`font-bold ${colorClass.split(' ')[1]}`}>{item.score}%</p>
                                            </div>
                                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">{details.description}</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 mt-3">
                                        <div className={`${colorClass.split(' ')[0]} h-2 rounded-full`} style={{ width: `${item.score}%` }}></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-surface dark:bg-surface-dark/50 rounded-lg border border-black/5 dark:border-white/10">
                        <h3 className="text-lg font-bold mb-1 flex justify-between items-center">Programming Languages <span className="text-sm font-normal text-text-secondary dark:text-text-secondary-dark">{languageData.length} languages</span></h3>
                        <LanguagePieChart data={languageData.slice(0, 6)} />
                    </div>
                     <div className="p-6 bg-surface dark:bg-surface-dark/50 rounded-lg border border-black/5 dark:border-white/10">
                        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                           <CalendarIcon className="w-5 h-5 text-brand-purple" /> Activity Timeline
                        </h3>
                         <ActivityLineChart data={activityData} />
                    </div>
                </div>
                
                <div className="p-6 bg-surface dark:bg-surface-dark/50 rounded-lg border border-black/5 dark:border-white/10">
                    <h3 className="text-lg font-bold mb-2 flex justify-between items-center">
                        <span className="flex items-center gap-2"><StarIcon className="w-5 h-5 text-yellow-400"/> Top Repositories by Stars</span>
                        <span className="text-sm font-normal text-text-secondary dark:text-text-secondary-dark">Top {topReposByStars.length} repos</span>
                    </h3>
                    <RepoBarChart data={topReposByStars} />
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};