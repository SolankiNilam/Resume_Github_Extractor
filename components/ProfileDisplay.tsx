import React, { useState, useMemo } from 'react';
// Fix: Import the 'GithubUser' type to resolve a type error.
import type { GithubProfile, GithubRepo, PinnedRepo, GithubUser } from '../types';
import { RepoCard } from './RepoCard';
import { UsersIcon, RepoIcon, BuildingIcon, LocationIcon, LinkIcon, PinIcon, XIcon, SparklesIcon, SearchIcon, ChartBarIcon } from './icons';
import { UserListModal } from './UserListModal';
import { fetchGithubFollowers, fetchGithubFollowing } from '../services/githubService';
import { RepoListModal } from './RepoListModal';
import { PinnedRepoCard } from './PinnedRepoCard';
import { Loader } from './Loader';
import { generateGithubSummary as generateSummary } from '../services/geminiService';
import { marked } from 'marked';
import { InsightsDashboard } from './InsightsDashboard';

interface ProfileDisplayProps {
  profile: GithubProfile;
  repos: GithubRepo[];
  pinnedRepos: PinnedRepo[];
  onReset: () => void;
  categorizedUrls: {
    linkedInUrl: string | null;
    portfolioUrls: string[];
    projectUrls: string[];
    otherUrls: string[];
  } | null;
}

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
  isLoading: boolean;
  profileName: string | null;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, content, isLoading, profileName }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-surface dark:bg-surface-dark w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-stone-900/10 dark:ring-white/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-brand-purple" />
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">AI Summary for {profileName}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close modal">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="py-20">
              <Loader message="Generating Summary..." subMessage="The AI is analyzing the profile." />
            </div>
          )}
          {!isLoading && content && (
             <div 
                className="prose prose-stone dark:prose-invert max-w-none prose-h2:text-text-primary dark:prose-h2:text-text-primary-dark"
                dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
             />
          )}
        </div>
      </div>
    </div>
  );
};


const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: number | string; onClick?: () => void }> = ({ icon, label, value, onClick }) => {
    const isClickable = !!onClick;
    const classes = `bg-surface dark:bg-surface-dark p-4 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300 border border-black/5 dark:border-white/10 ${isClickable ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 hover:ring-2 hover:ring-brand-purple' : ''}`;

    return (
        <div className={classes} onClick={onClick}>
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">{value}</span>
            </div>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider mt-1">{label}</p>
        </div>
    );
};

export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile, repos, pinnedRepos, onReset, categorizedUrls }) => {
  const [userModalState, setUserModalState] = useState<{ isOpen: boolean; title: string; users: GithubUser[] | null; isLoading: boolean; }>({ isOpen: false, title: '', users: null, isLoading: false });
  const [repoModalState, setRepoModalState] = useState<{ isOpen: boolean, title: string, repos: GithubRepo[], showControls: boolean }>({ isOpen: false, title: '', repos: [], showControls: true });
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isInsightsDashboardOpen, setIsInsightsDashboardOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'stargazers_count' | 'forks_count' | 'updated_at'>('stargazers_count');
  const [languageFilter, setLanguageFilter] = useState('All');

  const languages = useMemo(() => ['All', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort()], [repos]);

  const processedRepos = useMemo(() => {
    return [...repos]
      .filter(repo => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = repo.name.toLowerCase().includes(query) || repo.description?.toLowerCase().includes(query);
        const matchesLang = languageFilter === 'All' || repo.language === languageFilter;
        return matchesQuery && matchesLang;
      })
      .sort((a, b) => {
        if (sortKey === 'updated_at') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        return b[sortKey] - a[sortKey];
      });
  }, [repos, searchQuery, sortKey, languageFilter]);

  const topRepos = processedRepos.slice(0, 6);

  const handleShowFollowers = async () => {
    setUserModalState({ isOpen: true, title: 'Followers', users: null, isLoading: true });
    const followers = await fetchGithubFollowers(profile.login);
    setUserModalState(s => ({ ...s, users: followers, isLoading: false }));
  };

  const handleShowFollowing = async () => {
    setUserModalState({ isOpen: true, title: 'Following', users: null, isLoading: true });
    const following = await fetchGithubFollowing(profile.login);
    setUserModalState(s => ({ ...s, users: following, isLoading: false }));
  };
  
  const handleShowAllRepos = () => {
      setRepoModalState({ isOpen: true, title: `${profile.login}'s Repositories`, repos, showControls: false });
  };
  
  const handleShowFilteredRepos = () => {
      setRepoModalState({ isOpen: true, title: `Filtered Repositories`, repos: processedRepos, showControls: true });
  };

  const handleCloseUserModal = () => setUserModalState({ isOpen: false, title: '', users: null, isLoading: false });
  const handleCloseRepoModal = () => setRepoModalState(s => ({ ...s, isOpen: false }));

  const handleGenerateSummary = async () => {
    setIsSummaryModalOpen(true);
    setIsSummaryLoading(true);
    setSummaryContent(null);
    try {
        const summary = await generateSummary(profile, repos);
        setSummaryContent(summary);
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        setSummaryContent(`**Error:** ${errorMessage}`);
    } finally {
        setIsSummaryLoading(false);
    }
  };

  const stats = [
    { icon: <UsersIcon className="w-6 h-6 text-brand-purple"/>, label: "followers", value: profile.followers.toLocaleString(), onClick: handleShowFollowers },
    { icon: <UsersIcon className="w-6 h-6 text-brand-purple -scale-x-100"/>, label: "following", value: profile.following.toLocaleString(), onClick: handleShowFollowing },
    { icon: <RepoIcon className="w-6 h-6 text-brand-purple"/>, label: "public repos", value: profile.public_repos.toLocaleString(), onClick: handleShowAllRepos },
  ];
  
  const SortButton: React.FC<{ value: typeof sortKey, children: React.ReactNode }> = ({ value, children }) => (
    <button onClick={() => setSortKey(value)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${sortKey === value ? 'bg-brand-purple text-white' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>{children}</button>
  );

  return (
    <>
      <div className="w-full max-w-4xl mx-auto bg-surface dark:bg-surface-dark rounded-xl shadow-lg border border-black/5 dark:border-white/10 overflow-hidden animate-fade-in">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8">
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple to-brand-pink rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <img src={profile.avatar_url} alt={`${profile.name || profile.login}'s avatar`} className="relative w-32 h-32 rounded-full ring-4 ring-surface dark:ring-surface-dark shadow-lg"/>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-4">
                 <h2 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">{profile.name}</h2>
              </div>
              <a href={profile.html_url} target="_blank" rel="noopener noreferrer" className="text-xl text-brand-purple hover:text-brand-pink transition-colors">@{profile.login}</a>
              {profile.bio && <p className="mt-2 text-text-secondary dark:text-text-secondary-dark">{profile.bio}</p>}
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-text-secondary dark:text-text-secondary-dark">
                {profile.company && <div className="flex items-center"><BuildingIcon className="w-4 h-4 mr-2" /> {profile.company}</div>}
                {profile.location && <div className="flex items-center"><LocationIcon className="w-4 h-4 mr-2" /> {profile.location}</div>}
                {profile.blog && <a href={profile.blog} target="_blank" rel="noopener noreferrer" className="flex items-center text-brand-purple hover:underline"><LinkIcon className="w-4 h-4 mr-2" /> {profile.blog}</a>}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map(stat => <StatItem key={stat.label} {...stat} />)}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <button onClick={handleGenerateSummary} className="w-full flex items-center justify-center gap-2 p-4 bg-surface dark:bg-surface-dark hover:bg-black/5 dark:hover:bg-white/5 text-text-primary dark:text-text-primary-dark font-semibold rounded-lg transition-all duration-300 border border-black/5 dark:border-white/10 hover:ring-2 hover:ring-brand-purple"><SparklesIcon className="w-5 h-5 text-brand-purple" />Generate AI Summary</button>
              <button onClick={() => setIsInsightsDashboardOpen(true)} className="w-full flex items-center justify-center gap-2 p-4 bg-surface dark:bg-surface-dark hover:bg-black/5 dark:hover:bg-white/5 text-text-primary dark:text-text-primary-dark font-semibold rounded-lg transition-all duration-300 border border-black/5 dark:border-white/10 hover:ring-2 hover:ring-brand-purple"><ChartBarIcon className="w-5 h-5 text-brand-purple" />Show AI Insights</button>
          </div>
          
          {pinnedRepos.length > 0 && (
            <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/10">
              <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2"><PinIcon className="w-6 h-6"/>Pinned Repositories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedRepos.map((repo, index) => <div key={repo.repo} className="animate-slide-up opacity-0" style={{animationDelay: `${index * 100}ms`}}><PinnedRepoCard repo={repo} /></div>)}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">Repositories ({processedRepos.length})</h3>
              {repos.length > 6 && (
                <button 
                  onClick={handleShowAllRepos} 
                  className="px-4 py-1.5 text-sm bg-surface dark:bg-surface-dark hover:bg-black/5 dark:hover:bg-white/5 font-semibold rounded-lg shadow-sm transition-colors border border-black/5 dark:border-white/10"
                >
                  View All ({repos.length})
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <div className="relative"><input type="text" placeholder="Search repositories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-md bg-surface dark:bg-surface-dark border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-brand-purple focus:outline-none transition-colors" /><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-secondary-dark" /></div>
                <div className="grid grid-cols-2 gap-4">
                    <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="w-full px-3 py-2 rounded-md bg-surface dark:bg-surface-dark border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-brand-purple focus:outline-none transition-colors">{languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}</select>
                    <div className="flex items-center justify-around bg-surface/50 dark:bg-surface-dark/50 p-1 rounded-md"><SortButton value="stargazers_count">Stars</SortButton><SortButton value="forks_count">Forks</SortButton><SortButton value="updated_at">Updated</SortButton></div>
                </div>
            </div>
            {topRepos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{topRepos.map((repo, index) => <div key={repo.id} className="animate-slide-up opacity-0" style={{animationDelay: `${(pinnedRepos.length > 0 ? 0 : index) * 150}ms`}}><RepoCard repo={repo} /></div>)}</div>
            ) : (<p className="text-text-secondary dark:text-text-secondary-dark text-center py-8 bg-black/5 dark:bg-white/5 rounded-lg">{repos.length > 0 ? "No repositories match your filters." : "No public repositories found."}</p>)}
            {processedRepos.length > topRepos.length && (
              <div className="mt-6 text-center"><button onClick={handleShowFilteredRepos} className="px-6 py-2 bg-surface dark:bg-surface-dark hover:bg-black/5 dark:hover:bg-white/5 font-semibold rounded-lg shadow-sm border border-black/5 dark:border-white/10">Show All {processedRepos.length} Filtered Repositories</button></div>
            )}
          </div>
        </div>
        
        <div className="bg-black/5 dark:bg-black/20 p-6 text-center mt-8"><button onClick={onReset} className="px-8 py-3 bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 text-white font-semibold rounded-lg shadow-lg shadow-pink-500/30 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark focus:ring-brand-purple">Analyze Another</button></div>
      </div>
      <UserListModal isOpen={userModalState.isOpen} onClose={handleCloseUserModal} title={userModalState.title} users={userModalState.users} isLoading={userModalState.isLoading}/>
      <RepoListModal isOpen={repoModalState.isOpen} onClose={handleCloseRepoModal} title={repoModalState.title} repos={repoModalState.repos} showControls={repoModalState.showControls}/>
      <SummaryModal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} content={summaryContent} isLoading={isSummaryLoading} profileName={profile.name || profile.login}/>
      <InsightsDashboard isOpen={isInsightsDashboardOpen} onClose={() => setIsInsightsDashboardOpen(false)} profile={profile} repos={repos} />
    </>
  );
};