import React, { useState, useCallback, useEffect } from 'react';
import { ProfileDisplay } from './components/ProfileDisplay';
import { analyzeResume } from './services/geminiService';
import { fetchGithubProfile } from './services/githubService';
import { fileToBase64 } from './utils/fileUtils';
import type { GithubProfile, GithubRepo, PinnedRepo, ResumeAnalysisResult } from './types';
import { GithubIcon, SparklesIcon, UploadIcon, ChartBarIcon, DocumentIcon, AnalyticsIcon } from './components/icons';
import { History } from './components/History';
import * as historyService from './services/historyService';
import { InputCard } from './components/InputCard';
import { ErrorMessage } from './components/ErrorMessage';
import { Chatbot } from './components/Chatbot';
import { Loader } from './components/Loader';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import AnimatedBackground from './components/AnimatedBackground';

type AppState = 'landing' | 'input' | 'processing' | 'success' | 'error';
export type Theme = 'light' | 'dark';

interface CategorizedUrls {
  linkedInUrl: string | null;
  portfolioUrls: string[];
  projectUrls:string[];
  otherUrls: string[];
}

const GitProfileAILogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="bg-gradient-to-br from-brand-purple to-brand-pink p-2 rounded-lg shadow-lg">
      <GithubIcon className="w-6 h-6 text-white" />
    </div>
    <span className="font-bold text-xl text-text-primary dark:text-text-primary-dark">GitProfile AI</span>
  </div>
);

const AppHeader: React.FC<{ theme: Theme, onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => (
  <header className="py-6 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
    <nav className="flex items-center justify-between">
      <GitProfileAILogo />
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-3 py-1.5 rounded-full">
          <SparklesIcon className="w-4 h-4 text-brand-purple" />
          <span>AI-Powered Profile Analysis</span>
        </div>
        <ThemeSwitcher theme={theme} onToggle={onToggleTheme} />
      </div>
    </nav>
  </header>
);

const HeroSection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10 dark:opacity-10"></div>
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Column */}
      <div className="text-center lg:text-left">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary dark:text-text-primary-dark">
          Turn Your Resume Into{' '}
          <span className="bg-gradient-to-r from-brand-purple to-brand-pink text-transparent bg-clip-text">
            GitHub Insights
          </span>
        </h1>
        <p className="mt-6 text-lg text-text-secondary dark:text-text-secondary-dark max-w-xl mx-auto lg:mx-0">
          Upload your resume and let our AI automatically extract your GitHub profile, analyze your repositories, and visualize your development journey with beautiful, interactive dashboards.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            <div className="flex items-center justify-center gap-2">
              <UploadIcon className="w-5 h-5"/>
              <span>Get Started</span>
            </div>
          </button>
        </div>
      </div>

      {/* Right Column - Decorative floating cards */}
      <div className="relative h-96 hidden lg:block">
         <div className="absolute top-0 right-10 w-64 h-40 bg-surface dark:bg-surface-dark/80 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 p-4 shadow-2xl animate-float" style={{ animationDelay: '0s' }}>
            <div className="flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark"/>
                <p className="text-sm font-semibold">GitHub Profile</p>
            </div>
            <div className="w-full h-px bg-black/10 dark:bg-white/10 my-3"></div>
            <p className="text-xs text-green-500 dark:text-green-400">auto-detected</p>
            <div className="w-full mt-6 py-3 bg-gradient-to-r from-brand-purple to-brand-pink rounded-lg flex items-center justify-center">
                <UploadIcon className="w-5 h-5 text-white"/>
            </div>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2 w-48 bg-surface dark:bg-surface-dark/80 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 p-4 shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-purple/20 rounded-lg"><AnalyticsIcon className="w-6 h-6 text-brand-purple"/></div>
                <div>
                    <p className="font-semibold">Analytics</p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">Real-time insights</p>
                </div>
            </div>
        </div>
         <div className="absolute bottom-0 right-20 w-56 bg-surface dark:bg-surface-dark/80 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 p-4 shadow-2xl animate-float" style={{ animationDelay: '4s' }}>
            <p className="text-sm font-semibold">Languages</p>
            <div className="mt-2 space-y-1.5 text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> JavaScript <span className="ml-auto opacity-60">45%</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> TypeScript <span className="ml-auto opacity-60">30%</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> Python <span className="ml-auto opacity-60">15%</span></div>
            </div>
        </div>
      </div>
    </div>
  </section>
);


const StatsSection: React.FC = () => {
    const stats = [
        { value: '1000+', label: 'Profiles Analyzed' },
        { value: '50K+', label: 'Repos Scanned' },
        { value: '99%', label: 'Accuracy Rate' },
    ];
    return (
        <section className="py-12 w-full max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
                {stats.map(stat => (
                    <div key={stat.label} className="text-center">
                        <p className="text-4xl font-bold bg-gradient-to-r from-brand-purple to-brand-pink text-transparent bg-clip-text">{stat.value}</p>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: <UploadIcon className="w-8 h-8 text-brand-purple" />,
      title: 'Upload Resume',
      description: 'Drop your resume or paste the text directly.',
    },
    {
      icon: <SparklesIcon className="w-8 h-8 text-brand-purple" />,
      title: 'AI Extraction',
      description: 'Our AI detects and extracts your GitHub profile.',
    },
    {
      icon: <ChartBarIcon className="w-8 h-8 text-brand-purple" />,
      title: 'View Insights',
      description: 'Get beautiful visualizations of your GitHub activity.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 lg:py-32">
      <div className="text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-text-primary dark:text-text-primary-dark">
          How It <span className="bg-gradient-to-r from-brand-purple to-brand-pink text-transparent bg-clip-text">Works</span>
        </h2>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {steps.map((step, index) => (
          <div key={index} className="bg-surface dark:bg-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-8 text-center flex flex-col items-center transition-transform transform hover:-translate-y-2" style={{animationDelay: `${index * 200}ms`}}>
            <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mb-6">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const AppFooter: React.FC = () => (
    <footer className="text-center text-text-secondary dark:text-text-secondary-dark text-sm py-12 border-t border-black/5 dark:border-white/5">
        <p>Built with <span className="font-semibold text-text-primary dark:text-text-primary-dark">React</span>, <span className="font-semibold text-text-primary dark:text-text-primary-dark">Tailwind CSS</span>, and the <span className="font-semibold text-text-primary dark:text-text-primary-dark">Gemini API</span>.</p>
    </footer>
);

const updateMetaTags = (profile: GithubProfile | null) => {
  const title = profile ? `${profile.name || profile.login}'s GitHub Profile` : 'GitProfile AI';
  const description = profile ? (profile.bio || `Explore the GitHub profile of ${profile.login}.`) : 'Turn your resume into beautiful, interactive GitHub profile insights.';
  const image = profile ? profile.avatar_url : 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png';
  const url = profile ? profile.html_url : '';

  document.title = title;
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [githubData, setGithubData] = useState<{ profile: GithubProfile; repos: GithubRepo[]; pinnedRepos: PinnedRepo[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GithubProfile[]>([]);
  const [loadingHistoryLogin, setLoadingHistoryLogin] = useState<string | null>(null);
  const [categorizedUrls, setCategorizedUrls] = useState<CategorizedUrls | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  const processUsername = useCallback(async (username: string) => {
    if(!username) {
      setError("Username cannot be empty.");
      setAppState('error');
      return;
    }
    setAppState('processing');
    setError(null);
    setGithubData(null);
    try {
      const data = await fetchGithubProfile(username);
      setGithubData(data);
      setAppState('success');
      const updatedHistory = historyService.addToHistory(data.profile);
      setHistory(updatedHistory);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error(errorMessage);
      setError(errorMessage);
      setAppState('error');
    } finally {
      setLoadingHistoryLogin(null);
    }
  }, []);
  
  const processResumeAnalysis = useCallback(async (analysisResult: ResumeAnalysisResult) => {
    const { githubProfileUrl, ...urls } = analysisResult;
    setCategorizedUrls(urls);
    
    if (!analysisResult.githubProfileUrl) {
      throw new Error('Could not find a GitHub profile link in the resume.');
    }

    const githubUrlRegex = /https?:\/\/(www\.)?github\.com\/([A-Za-z0-9_-]+)\/?/;
    const match = analysisResult.githubProfileUrl.match(githubUrlRegex);

    if (!match || !match[2]) {
      throw new Error('Found a link, but it does not appear to be a valid GitHub profile URL.');
    }
    
    const username = match[2];
    await processUsername(username);
  }, [processUsername]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    setAppState('processing');
    setError(null);
    setGithubData(null);
    setCategorizedUrls(null);

    try {
      if (file.type !== 'application/pdf') {
        throw new Error('Invalid file type. Please upload a PDF.');
      }

      const pdfBase64 = await fileToBase64(file);
      const analysisResult = await analyzeResume(pdfBase64, 'application/pdf');
      await processResumeAnalysis(analysisResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error(errorMessage);
      setError(errorMessage);
      setAppState('error');
    }
  }, [processResumeAnalysis]);
  
  const handleTextSubmit = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setAppState('processing');
    setError(null);
    setGithubData(null);
    setCategorizedUrls(null);

    try {
      const analysisResult = await analyzeResume(text, 'text/plain');
      await processResumeAnalysis(analysisResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error(errorMessage);
      setError(errorMessage);
      setAppState('error');
    }
  }, [processResumeAnalysis]);

  const handleHistorySelect = useCallback(async (username: string) => {
    setLoadingHistoryLogin(username);
    await processUsername(username);
  }, [processUsername]);

  // Initialization effect
  useEffect(() => {
    // Set theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    // Load history
    setHistory(historyService.getHistory());
    updateMetaTags(null);

    // Check for username in URL to allow sharing
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    if (username) {
        processUsername(username);
    }
  }, [processUsername]);

  // Effect to apply theme class to HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Effect to update meta tags on successful profile load
  useEffect(() => {
    if (appState === 'success' && githubData) {
      updateMetaTags(githubData.profile);
    }
  }, [appState, githubData]);

  const handleReset = () => {
    setAppState('landing');
    setGithubData(null);
    setError(null);
    setCategorizedUrls(null);
    updateMetaTags(null);
  };
  
  const handleRemoveFromHistory = (login: string) => {
    const updatedHistory = historyService.removeFromHistory(login);
    setHistory(updatedHistory);
  };

  const handleClearHistory = () => {
    historyService.clearHistory();
    setHistory([]);
  };

  const renderContent = () => {
    switch (appState) {
      case 'landing':
        return (
          <>
            <AppHeader theme={theme} onToggleTheme={toggleTheme} />
            <main>
              <HeroSection onGetStarted={() => setAppState('input')} />
              <StatsSection />
              <HowItWorksSection />
            </main>
            <AppFooter />
          </>
        );
      case 'input':
      case 'processing':
      case 'error':
      case 'success':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
              <header className="flex items-center justify-between mb-10 animate-fade-in w-full">
                <button onClick={handleReset} className="inline-block">
                  <GitProfileAILogo />
                </button>
                <ThemeSwitcher theme={theme} onToggle={toggleTheme} />
              </header>
              <main>
                {appState === 'input' && (
                  <>
                    <div className="animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
                      <InputCard onFileUpload={handleFileUpload} onUsernameSubmit={processUsername} onTextSubmit={handleTextSubmit} />
                    </div>
                    {history.length > 0 && (
                      <History items={history} onSelect={handleHistorySelect} onRemove={handleRemoveFromHistory} onClear={handleClearHistory} loadingLogin={loadingHistoryLogin} />
                    )}
                  </>
                )}
                {appState === 'processing' && (
                  <div className="w-full max-w-2xl mx-auto bg-surface dark:bg-surface-dark border border-black/5 dark:border-white/10 rounded-xl shadow-lg p-12 flex items-center justify-center animate-fade-in">
                    <Loader message="Analyzing..." subMessage="Extracting GitHub link and fetching profile." />
                  </div>
                )}
                {appState === 'error' && (
                  <div className="w-full max-w-2xl mx-auto bg-surface dark:bg-surface-dark border border-black/5 dark:border-white/10 rounded-xl shadow-lg p-12 flex items-center justify-center animate-fade-in">
                    <ErrorMessage message={error!} onRetry={() => setAppState('input')} />
                  </div>
                )}
                {appState === 'success' && githubData && (
                  <ProfileDisplay profile={githubData.profile} repos={githubData.repos} pinnedRepos={githubData.pinnedRepos} onReset={() => setAppState('input')} categorizedUrls={categorizedUrls} />
                )}
              </main>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      {renderContent()}
      <Chatbot profileData={appState === 'success' ? githubData : null} />
    </div>
  );
}