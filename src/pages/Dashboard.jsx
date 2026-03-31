import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { getUser } from '../utils/auth';
import { authAPI, leaderboardAPI, taskAPI, sessionAPI } from '../utils/api';

// Layout Components
import TopAppBar from '../components/layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../components/layout/SideNavBar';

// UI Components
import PixelCard, { PixelCardHeader, PixelCardTitle } from '../components/ui/PixelCard';
import PixelButton from '../components/ui/PixelButton';
import ProgressBar from '../components/ui/ProgressBar';
import Avatar from '../components/ui/Avatar';

/**
 * Hero's Hub Dashboard - Main student landing page
 * 6 Sections: Hero Status, Guild Stats, Quest Map, Daily Quests, Recent Victories
 * Matches Stitch Pixel-Art Design exactly
 * 
 * PERFORMANCE OPTIMIZED: Progressive loading with timeouts and caching
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  
  // State - separate loading states for progressive rendering
  const [user, setUser] = useState(currentUser || null);
  const [guildRank, setGuildRank] = useState(null);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [heroStatus, setHeroStatus] = useState(null);
  
  // Individual loading states for progressive UI
  const [initialLoading, setInitialLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Cache duration: 5 minutes for non-critical data
  const CACHE_DURATION = 5 * 60 * 1000;

  // Navigation items with proper Material Symbols icons
  const navItems = [
    { id: 'study', label: 'STUDY', icon: 'menu_book', href: '/dashboard', active: true },
    { id: 'tasks', label: 'TASKS', icon: 'checklist', href: '/tasks', badge: dailyQuests.filter(q => !q.completed).length.toString() },
    { id: 'ai-tutor', label: 'AI TUTOR', icon: 'smart_toy', href: '/study-buddy' },
    { id: 'social', label: 'SOCIAL', icon: 'groups', href: '/social' },
    { id: 'progress', label: 'PROGRESS', icon: 'trending_up', href: '/progress' },
  ];

  // Fetch with timeout helper
  const fetchWithTimeout = async (promise, timeout = 5000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  };

  // Load cached data immediately
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedRank = localStorage.getItem('sq_cached_rank');
        const cachedTasks = localStorage.getItem('sq_cached_tasks');
        const cachedSessions = localStorage.getItem('sq_cached_sessions');
        const cachedTimestamp = localStorage.getItem('sq_cache_timestamp');
        
        if (cachedTimestamp && Date.now() - parseInt(cachedTimestamp) < CACHE_DURATION) {
          if (cachedRank) {
            setGuildRank(JSON.parse(cachedRank));
            setRankLoading(false);
          }
          if (cachedTasks) {
            setDailyQuests(JSON.parse(cachedTasks));
            setTasksLoading(false);
          }
          if (cachedSessions) {
            setRecentSessions(JSON.parse(cachedSessions));
            setSessionsLoading(false);
          }
        }
      } catch (e) {
        console.log('Cache read error:', e);
      }
      setInitialLoading(false);
    };
    
    loadCachedData();
  }, []);

  // Fetch dashboard data with progressive loading
  // FIXED: Removed state dependencies to prevent infinite re-render loop
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      
      // Use current user as fallback immediately
      if (currentUser) {
        setUser(currentUser);
        setUserLoading(false);
      }

      // Fetch all data in parallel with individual timeout handling
      const fetchUser = async () => {
        try {
          const res = await fetchWithTimeout(authAPI.getMe(), 3000);
          setUser(res.data);
          localStorage.setItem('sq_user', JSON.stringify(res.data));
        } catch (err) {
          console.log('User fetch failed, using cached:', err);
          const cached = localStorage.getItem('sq_user');
          if (cached) setUser(JSON.parse(cached));
        } finally {
          setUserLoading(false);
        }
      };

      const fetchRank = async () => {
        try {
          const res = await fetchWithTimeout(leaderboardAPI.getMyRank(), 3000);
          const rankData = res.data?.rank || { rank: 12, league: 'S4', percentile: 5 };
          setGuildRank(rankData);
          localStorage.setItem('sq_cached_rank', JSON.stringify(rankData));
        } catch (err) {
          console.log('Rank fetch failed:', err);
          // Use localStorage cache as fallback, then default
          const cached = localStorage.getItem('sq_cached_rank');
          if (cached) {
            setGuildRank(JSON.parse(cached));
          } else {
            setGuildRank({ rank: 12, league: 'S4', percentile: 5 });
          }
        } finally {
          setRankLoading(false);
        }
      };

      const fetchTasks = async () => {
        try {
          const res = await fetchWithTimeout(taskAPI.getAll(), 3000);
          const tasks = res.data?.tasks?.slice(0, 3) || getDefaultQuests();
          setDailyQuests(tasks);
          localStorage.setItem('sq_cached_tasks', JSON.stringify(tasks));
        } catch (err) {
          console.log('Tasks fetch failed:', err);
          const cached = localStorage.getItem('sq_cached_tasks');
          if (cached) {
            setDailyQuests(JSON.parse(cached));
          } else {
            setDailyQuests(getDefaultQuests());
          }
        } finally {
          setTasksLoading(false);
        }
      };

      const fetchSessions = async () => {
        try {
          const res = await fetchWithTimeout(sessionAPI.getSessions(), 3000);
          const sessions = res.data?.sessions?.slice(0, 2) || getDefaultSessions();
          setRecentSessions(sessions);
          localStorage.setItem('sq_cached_sessions', JSON.stringify(sessions));
        } catch (err) {
          console.log('Sessions fetch failed:', err);
          const cached = localStorage.getItem('sq_cached_sessions');
          if (cached) {
            setRecentSessions(JSON.parse(cached));
          } else {
            setRecentSessions(getDefaultSessions());
          }
        } finally {
          setSessionsLoading(false);
        }
      };

      // Execute all fetches in parallel
      await Promise.all([
        fetchUser(),
        fetchRank(),
        fetchTasks(),
        fetchSessions(),
      ]);

      // Update cache timestamp
      localStorage.setItem('sq_cache_timestamp', Date.now().toString());
      setLastUpdated(Date.now());

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('CONNECTION LOST TO SERVER');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // Only depend on currentUser which is stable

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    
    // Set up refresh interval (every 2 minutes)
    const interval = setInterval(fetchDashboardData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Default quests for demo/loading state
  const getDefaultQuests = () => [
    { id: 1, title: 'Master 5 Math Problems', xp: 200, progress: 3, total: 5, type: 'math', icon: 'swords', color: 'primary' },
    { id: 2, title: '15-min Pomodoro Focus', xp: 150, progress: 0, total: 1, type: 'focus', icon: 'timer', color: 'secondary' },
    { id: 3, title: 'Review Flashcards', xp: 100, progress: 1, total: 1, type: 'review', icon: 'school', color: 'tertiary', completed: true },
  ];

  // Default sessions
  const getDefaultSessions = () => [
    { id: 1, subject: 'Calculus Boss Battle', started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), xp_earned: 450, duration: 45 },
    { id: 2, subject: 'Ancient History Lab', started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), xp_earned: 200, duration: 25 },
  ];

  // Calculate XP percentage for next level
  const getXPPercentage = () => {
    if (!user) return 80;
    const currentXP = user.xp || 9000;
    const level = user.level || 9;
    const nextLevelXP = level * 1250;
    const currentLevelBaseXP = (level - 1) * 1250;
    const xpInLevel = currentXP - currentLevelBaseXP;
    const xpNeeded = nextLevelXP - currentLevelBaseXP;
    return Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));
  };

  // Get Shadow of Doom percentage
  const getShadowPercentage = () => {
    return user?.shadowLevel || user?.shadow_level || 15;
  };

  // Get user title based on level/subject
  const getUserTitle = () => {
    const titles = ['NOVICE', 'APPRENTICE', 'SCHOLAR', 'ADEPT', 'MAGE', 'ARCHMAGE', 'SAGE'];
    const level = user?.level || 9;
    const index = Math.min(Math.floor((level - 1) / 2), titles.length - 1);
    return `${titles[index]} OF ALGEBRA`;
  };

  // Handle quest item click
  const handleQuestClick = (quest) => {
    if (quest.completed) {
      console.log('Quest already claimed');
      return;
    }
    if (quest.type === 'focus') {
      navigate('/timer');
    } else {
      navigate('/tasks');
    }
  };

  // Handle quest node click
  const handleNodeClick = (nodeIndex) => {
    console.log(`Navigate to quest node ${nodeIndex}`);
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const hours = Math.floor((now - date) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return 'Yesterday';
  };

  // Check if any data is still loading
  const isLoading = userLoading || rankLoading || tasksLoading || sessionsLoading;

  // Error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <PixelCard variant="elevated" className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">
            <span className="material-symbols-outlined text-6xl text-error">skull</span>
          </div>
          <h2 className="font-['Press_Start_2P'] text-lg text-error mb-4">{error}</h2>
          <p className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant mb-6">
            THE SHADOW HAS SEVERED YOUR CONNECTION
          </p>
          <PixelButton onClick={fetchDashboardData} variant="tertiary">
            RETRY CONNECTION
          </PixelButton>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopAppBar 
        title="HERO'S HUB" 
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation (Desktop) */}
      <SideNavBar 
        items={navItems} 
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content - Match Stitch HTML: grid-cols-12 gap-6, max-w-7xl */}
      <main className="md:ml-64 pt-24 px-6 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          
          {/* Row 1: Hero Status HUD - col-span-12 lg:col-span-8 */}
          <section className="col-span-12 lg:col-span-8">
            <HeroStatusCard 
              user={user}
              title={getUserTitle()}
              xpPercentage={getXPPercentage()}
              shadowPercentage={getShadowPercentage()}
              loading={userLoading}
            />
          </section>

          {/* Row 1: Guild Stats Card - col-span-12 lg:col-span-4 */}
          <section className="col-span-12 lg:col-span-4">
            <GuildStatsCard 
              rank={guildRank?.rank || 12}
              league={guildRank?.league || 'S4'}
              percentile={guildRank?.percentile || 5}
              onViewLeaderboard={() => navigate('/leaderboard')}
              loading={rankLoading}
            />
          </section>

          {/* Row 2: Quest Map - col-span-12, aspect-[21/9] */}
          <section className="col-span-12">
            <QuestMap 
              progress={64}
              onNodeClick={handleNodeClick}
            />
          </section>

          {/* Row 3: Daily Quests - col-span-12 lg:col-span-7 */}
          <section className="col-span-12 lg:col-span-7">
            <DailyQuests 
              quests={dailyQuests}
              onQuestClick={handleQuestClick}
              loading={tasksLoading}
            />
          </section>

          {/* Row 3: Recent Victories - col-span-12 lg:col-span-5 */}
          <section className="col-span-12 lg:col-span-5">
            <RecentVictories 
              sessions={recentSessions}
              loading={sessionsLoading}
            />
          </section>
        </div>
        
        {/* Refresh indicator */}
        {isLoading && (
          <div className="fixed bottom-4 right-4 bg-surface-container border-2 border-outline-variant px-4 py-2 shadow-lg z-50">
            <span className="font-['Press_Start_2P'] text-[10px] text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
              SYNCING...
            </span>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavBar 
        items={navItems.slice(0, 4)} 
        activeItem="study"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />
    </div>
  );
};

/**
 * Hero Status HUD Component - Matches Stitch HTML exactly
 * Shows avatar, XP bar, Shadow of Doom bar, and rank badges
 */
const HeroStatusCard = ({ user, title, xpPercentage, shadowPercentage, loading }) => {
  const level = user?.level || 42;
  const xp = user?.xp || 9000;
  const nextLevelXP = level * 1250;

  if (loading && !user) {
    return (
      <div className="bg-surface-container-high border-2 border-outline-variant p-6 shadow-[4px_4px_0px_0px_#150136] h-full animate-pulse">
        <div className="h-32 bg-surface-container rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-high border-2 border-outline-variant p-6 shadow-[4px_4px_0px_0px_#150136] relative overflow-hidden h-full">
      {/* Background Shadow Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <span className="material-symbols-outlined text-[200px]" style={{fontVariationSettings: "'FILL' 1"}}>skull</span>
      </div>
      
      <div className="relative z-10">
        {/* Header: Avatar + Title + Reward */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            {/* Avatar Placeholder with Shield Icon */}
            <div className="w-20 h-20 border-4 border-tertiary bg-surface-container shadow-[4px_4px_0px_0px_#4c3f00] flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>
                shield_with_heart
              </span>
            </div>
            <div>
              <h1 className="font-['Press_Start_2P'] text-xl text-primary mb-2">{title}</h1>
              <div className="flex gap-4">
                <span className="px-2 py-1 bg-surface-container-lowest text-secondary font-['Press_Start_2P'] text-[10px]">RANK: ELITE</span>
                <span className="px-2 py-1 bg-surface-container-lowest text-tertiary font-['Press_Start_2P'] text-[10px]">WIN STREAK: {user?.current_streak || user?.streak || 7}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-['Press_Start_2P'] text-[10px] text-secondary opacity-60">NEXT REWARD: VOID POTION</span>
            <div className="flex justify-end gap-1 mt-2">
              <div className="w-3 h-3 bg-tertiary"></div>
              <div className="w-3 h-3 bg-tertiary"></div>
              <div className="w-3 h-3 bg-tertiary"></div>
              <div className="w-3 h-3 bg-surface-container"></div>
              <div className="w-3 h-3 bg-surface-container"></div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-6">
          {/* XP Bar */}
          <div>
            <div className="flex justify-between mb-2 font-['Press_Start_2P'] text-[10px]">
              <span className="text-secondary">EXPERIENCE POINTS (XP)</span>
              <span className="text-secondary">{Math.round(xpPercentage)}% [{xp.toLocaleString()} / {nextLevelXP.toLocaleString()}]</span>
            </div>
            <div className="h-6 bg-surface-container-lowest border-2 border-outline-variant overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-secondary to-secondary-container pixel-segmented shadow-[0px_0px_10px_rgba(0,241,254,0.3)] transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Shadow of Doom Bar */}
          <div>
            <div className="flex justify-between mb-2 font-['Press_Start_2P'] text-[10px]">
              <span className="text-error flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                SHADOW OF DOOM (PROCRASTINATION)
              </span>
              <span className="text-error">{shadowPercentage}%</span>
            </div>
            <div className="h-4 bg-surface-container-lowest border-2 border-outline-variant overflow-hidden">
              <div 
                className="h-full bg-error pixel-segmented transition-all duration-500"
                style={{ width: `${shadowPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Guild Stats Card Component - Matches Stitch HTML
 */
const GuildStatsCard = ({ rank, league, percentile, onViewLeaderboard, loading }) => {
  if (loading) {
    return (
      <div className="h-full bg-surface-container border-2 border-outline-variant p-6 shadow-[4px_4px_0px_0px_#150136] animate-pulse">
        <div className="h-32 bg-surface-container-high rounded"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-surface-container border-2 border-outline-variant p-6 shadow-[4px_4px_0px_0px_#150136] flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-tertiary">military_tech</span>
          <h3 className="font-['Press_Start_2P'] text-[12px] text-on-surface">GUILD RANKINGS</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-surface-container-low p-4 flex justify-between items-center border-l-4 border-tertiary">
            <div>
              <p className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant">{league} LEAGUE (HK)</p>
              <p className="font-headline font-bold text-xl text-tertiary">RANK #{rank}</p>
            </div>
            <div className="text-right">
              <p className="font-['Press_Start_2P'] text-[8px] text-secondary">TOP {percentile}%</p>
            </div>
          </div>
          <div className="font-body text-sm text-on-surface-variant leading-relaxed">
            Your guild &quot;NEON SCHOLARS&quot; is 450 XP away from Rank #{rank - 1}. Complete a group study session to boost ranking!
          </div>
        </div>
      </div>
      <button 
        onClick={onViewLeaderboard}
        className="w-full mt-6 bg-secondary-container text-on-secondary-container font-['Press_Start_2P'] text-[10px] py-3 shadow-[3px_3px_0px_0px_#006a70] active:translate-y-1 transition-transform hover:brightness-110"
      >
        VIEW LEADERBOARD
      </button>
    </div>
  );
};

/**
 * Quest Map Component - RPG-style map with progression nodes
 * Matches Stitch HTML: aspect-[21/9], gradient overlays, quest nodes
 */
const QuestMap = ({ progress, onNodeClick }) => {
  const nodes = [
    { id: 1, status: 'completed', label: 'LIMITS', icon: 'check' },
    { id: 2, status: 'completed', label: 'CONTINUITY', icon: 'check' },
    { id: 3, status: 'current', label: 'BOSS: DERIVATIVES', icon: 'swords' },
    { id: 4, status: 'locked', label: 'INTEGRALS', icon: 'lock' },
  ];

  return (
    <div className="bg-surface-container-high border-2 border-outline-variant relative overflow-hidden aspect-[21/9]">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, #3d2b5e 0%, transparent 50%),
              radial-gradient(circle at 80% 30%, #412f63 0%, transparent 40%),
              radial-gradient(circle at 50% 80%, #271448 0%, transparent 60%)
            `
          }}
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-20 p-8 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-['Press_Start_2P'] text-2xl text-secondary mb-2 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">KINGDOM OF CALCULUS</h2>
            <p className="font-headline text-on-surface-variant font-bold tracking-widest">CHAPTER 4: THE DERIVATIVE WASTELAND</p>
          </div>
          <div className="bg-background/80 p-4 border-2 border-primary backdrop-blur-md">
            <span className="font-['Press_Start_2P'] text-[10px] text-primary">MAP COMPLETION: {progress}%</span>
          </div>
        </div>
        
        {/* Interactive Nodes */}
        <div className="flex gap-12 justify-center mb-12">
          {nodes.map((node, index) => (
            <QuestNode 
              key={node.id}
              node={node}
              index={index}
              onClick={() => onNodeClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Quest Node Component - Individual map node
 */
const QuestNode = ({ node, index, onClick }) => {
  const styles = {
    completed: {
      container: 'w-12 h-12 bg-tertiary shadow-[0_0_20px_#e9c400] border-4 border-on-tertiary',
      icon: 'text-on-tertiary',
      size: 'text-xl',
    },
    current: {
      container: 'w-16 h-16 bg-primary-container shadow-[0_0_30px_#ff4a8d] border-4 border-on-primary-container -translate-y-2 animate-pulse',
      icon: 'text-white',
      size: 'text-2xl',
    },
    locked: {
      container: 'w-12 h-12 bg-surface-container border-4 border-outline-variant opacity-30 grayscale',
      icon: 'text-on-surface-variant',
      size: 'text-xl',
    },
  };

  const style = styles[node.status];

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        disabled={node.status === 'locked'}
        className={cn(
          "flex items-center justify-center transition-transform hover:scale-110 active:scale-95",
          style.container,
          node.status !== 'locked' && 'cursor-pointer'
        )}
      >
        <span className={cn("material-symbols-outlined", style.size, style.icon)}>
          {node.icon}
        </span>
      </button>
      <span className={cn(
        "font-['Press_Start_2P'] whitespace-nowrap",
        node.status === 'current' ? 'text-[10px] text-primary' : 'text-[8px] text-on-surface-variant'
      )}>
        {node.label}
      </span>
    </div>
  );
};

/**
 * Daily Quests Component - Matches Stitch HTML
 */
const DailyQuests = ({ quests, onQuestClick, loading }) => {
  // Format quests data
  const formattedQuests = quests.length > 0 ? quests.map(q => ({
    id: q.id,
    title: q.title || q.name || 'Quest',
    xp: q.xp_reward || q.xp || 100,
    progress: q.completed ? q.total : (q.progress || 0),
    total: q.total || 1,
    icon: q.icon || (q.type === 'focus' ? 'timer' : q.type === 'review' ? 'school' : 'swords'),
    color: q.color || (q.completed ? 'tertiary' : q.type === 'focus' ? 'secondary' : 'primary'),
    completed: q.completed,
    type: q.type,
  })) : getDefaultQuests();

  function getDefaultQuests() {
    return [
      { id: 1, title: 'Master 5 Math Problems', xp: 200, progress: 3, total: 5, icon: 'swords', color: 'primary', completed: false },
      { id: 2, title: '15-min Pomodoro Focus', xp: 150, progress: 0, total: 1, icon: 'timer', color: 'secondary', completed: false },
      { id: 3, title: 'Review Flashcards', xp: 100, progress: 1, total: 1, icon: 'school', color: 'tertiary', completed: true },
    ];
  }

  if (loading && quests.length === 0) {
    return (
      <div className="bg-surface-container border-2 border-outline-variant p-6 shadow-[4px_4px_0px_0px_#150136] animate-pulse">
        <div className="h-48 bg-surface-container-high rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container border-2 border-outline-variant p-6 shadow-[4px_4px_0px_0px_#150136]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">checklist</span>
          <h3 className="font-['Press_Start_2P'] text-[12px] text-on-surface">DAILY BOUNTIES</h3>
        </div>
        <span className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant opacity-50">RESET IN 14H 22M</span>
      </div>

      <div className="space-y-4">
        {formattedQuests.map((quest) => (
          <QuestItem 
            key={quest.id}
            quest={quest}
            onClick={() => onQuestClick(quest)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Quest Item Component - Individual quest row
 */
const QuestItem = ({ quest, onClick }) => {
  const borderColors = {
    primary: 'border-l-4 border-primary',
    secondary: 'border-l-4 border-secondary',
    tertiary: 'border-l-4 border-tertiary',
  };

  return (
    <button
      onClick={onClick}
      disabled={quest.completed}
      className={cn(
        "w-full flex items-center gap-4 p-4 bg-surface-container-low group hover:bg-surface-container-high transition-colors",
        borderColors[quest.color],
        quest.completed && 'opacity-60'
      )}
    >
      {/* Icon Box */}
      <div className={cn(
        "w-10 h-10 flex items-center justify-center flex-shrink-0 border-2 border-outline-variant bg-background group-hover:bg-surface-container",
        quest.completed && 'bg-tertiary/20 border-tertiary'
      )}>
        <span className={cn(
          "material-symbols-outlined",
          quest.completed ? 'text-tertiary' : 'text-outline group-hover:text-' + quest.color
        )} style={quest.completed ? {fontVariationSettings: "'FILL' 1"} : {}}>
          {quest.completed ? 'check' : quest.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <h4 className={cn(
          "font-headline font-bold text-on-surface",
          quest.completed && 'line-through'
        )}>
          {quest.title}
        </h4>
        <p className="text-xs text-on-surface-variant mt-1">
          {quest.completed ? 'Daily vocab set (30 cards)' : 
           quest.type === 'math' ? 'Focus area: Logarithmic Functions' : 
           'Uninterrupted deep work session'}
        </p>
      </div>

      {/* Status */}
      <div className="text-right font-['Press_Start_2P'] text-[10px]">
        <span className="text-tertiary">+{quest.xp} XP</span>
        {!quest.completed && (
          <div className="mt-1 text-on-surface-variant">{quest.progress}/{quest.total}</div>
        )}
        {quest.completed && (
          <div className="mt-1 text-tertiary">CLAIMED</div>
        )}
        {!quest.completed && quest.progress >= quest.total && (
          <div className="mt-1 text-secondary">READY</div>
        )}
      </div>
    </button>
  );
};

/**
 * Recent Victories Component - Matches Stitch HTML
 */
const RecentVictories = ({ sessions, loading }) => {
  const badges = [
    { type: 'BRONZE FOCUS', icon: 'bolt', color: '#cd7f32' },
    { type: 'SILVER STREAK', icon: 'local_fire_department', color: '#c0c0c0' },
    { type: 'GOLD SCHOLAR', icon: 'auto_awesome', color: '#e9c400' },
  ];

  const formattedSessions = sessions.length > 0 ? sessions.map(s => ({
    id: s.id,
    title: s.subject || 'Study Session',
    time: s.started_at || s.created_at,
    xp: s.xp_earned || 0,
    duration: s.duration || 0,
  })) : [
    { id: 1, title: 'Calculus Boss Battle', time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), xp: 450, duration: 45 },
    { id: 2, title: 'Ancient History Lab', time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), xp: 200, duration: 25 },
  ];

  if (loading && sessions.length === 0) {
    return (
      <div className="bg-surface-container border-2 border-outline-variant p-6 shadow-[4px_4px_0px_0px_#150136] h-full animate-pulse">
        <div className="h-48 bg-surface-container-high rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container border-2 border-outline-variant p-6 shadow-[4px_4px_0px_0px_#150136] h-full">
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-tertiary">trophy</span>
        <h3 className="font-['Press_Start_2P'] text-[12px] text-on-surface">RECENT VICTORIES</h3>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {badges.map((badge) => (
          <div 
            key={badge.type}
            className="flex flex-col items-center p-3 bg-surface-container-low border border-outline-variant"
            style={{ 
              backgroundColor: `${badge.color}20`,
              borderColor: badge.color 
            }}
          >
            <div 
              className="w-12 h-12 flex items-center justify-center mb-2"
              style={{ backgroundColor: `${badge.color}20`, border: `2px solid ${badge.color}` }}
            >
              <span 
                className="material-symbols-outlined text-2xl"
                style={{ color: badge.color, fontVariationSettings: "'FILL' 1" }}
              >
                {badge.icon}
              </span>
            </div>
            <span className="font-['Press_Start_2P'] text-[8px] text-center text-on-surface-variant">
              {badge.type}
            </span>
          </div>
        ))}
      </div>

      {/* Recent Sessions List */}
      <div className="space-y-4">
        {formattedSessions.map((session) => (
          <div 
            key={session.id}
            className="p-3 border-l-2 border-outline-variant font-body text-sm hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <div className="flex justify-between mb-1">
              <span className="font-bold text-on-surface">{session.title}</span>
              <span className="text-xs text-on-surface-variant">{formatTimeAgo(session.time)}</span>
            </div>
            <div className="text-xs text-on-surface-variant">+{session.xp} XP • {session.duration}m Focused</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function for time formatting
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const hours = Math.floor((now - date) / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return 'Yesterday';
};

export default Dashboard;
