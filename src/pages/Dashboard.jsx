import React, { useState, useEffect } from 'react';
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
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  
  // State
  const [user, setUser] = useState(null);
  const [guildRank, setGuildRank] = useState(null);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { id: 'study', label: 'Study', icon: 'menu_book', href: '/dashboard', active: true },
    { id: 'tasks', label: 'Tasks', icon: 'checklist', href: '/tasks', badge: '3' },
    { id: 'ai-tutor', label: 'AI Tutor', icon: 'psychology', href: '/study-buddy' },
    { id: 'social', label: 'Social', icon: 'groups', href: '/social' },
    { id: 'progress', label: 'Progress', icon: 'trending_up', href: '/progress' },
  ];

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [userRes, rankRes, tasksRes, sessionsRes] = await Promise.all([
        authAPI.getMe().catch(() => ({ data: currentUser })),
        leaderboardAPI.getMyRank().catch(() => ({ data: { rank: 12, league: 'S4', percentile: 5 } })),
        taskAPI.getAll().catch(() => ({ data: [] })),
        sessionAPI.getSessions().catch(() => ({ data: [] })),
      ]);

      setUser(userRes.data);
      setGuildRank(rankRes.data?.rank || { rank: 12, league: 'S4', percentile: 5 });
      setDailyQuests(tasksRes.data?.tasks?.slice(0, 3) || getDefaultQuests());
      setRecentSessions(sessionsRes.data?.sessions?.slice(0, 2) || []);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('CONNECTION LOST TO SERVER');
    } finally {
      setLoading(false);
    }
  };

  // Default quests for demo/loading state
  const getDefaultQuests = () => [
    { id: 1, title: 'Master 5 Math Problems', xp: 200, progress: 3, total: 5, type: 'math', icon: 'swords', color: 'primary' },
    { id: 2, title: '15-min Pomodoro Focus', xp: 150, progress: 0, total: 1, type: 'focus', icon: 'timer', color: 'secondary' },
    { id: 3, title: 'Review Flashcards', xp: 100, progress: 1, total: 1, type: 'review', icon: 'school', color: 'tertiary', completed: true },
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
    return user?.shadowLevel || 15;
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
    const date = new Date(dateString);
    const now = new Date();
    const hours = Math.floor((now - date) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return 'Yesterday';
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar title="HERO'S HUB" user={currentUser} />
        <SideNavBar 
          items={navItems} 
          user={currentUser}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main className="lg:ml-64 pt-20 px-4 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-8">
                <PixelCard className="h-64 animate-pulse" />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <PixelCard className="h-64 animate-pulse" />
              </div>
              <div className="col-span-12">
                <PixelCard className="h-48 animate-pulse" />
              </div>
              <div className="col-span-12 lg:col-span-7">
                <PixelCard className="h-64 animate-pulse" />
              </div>
              <div className="col-span-12 lg:col-span-5">
                <PixelCard className="h-64 animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <BottomNavBar items={navItems.slice(0, 4)} activeItem="study" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <PixelCard variant="elevated" className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="font-pixel text-lg text-error mb-4">{error}</h2>
          <p className="font-pixel text-[10px] text-on-surface-variant mb-6">
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

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 px-4 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            
            {/* Row 1: Hero Status HUD */}
            <div className="col-span-12 lg:col-span-8">
              <HeroStatusCard 
                user={user}
                title={getUserTitle()}
                xpPercentage={getXPPercentage()}
                shadowPercentage={getShadowPercentage()}
              />
            </div>

            {/* Row 1: Guild Stats Card */}
            <div className="col-span-12 lg:col-span-4">
              <GuildStatsCard 
                rank={guildRank?.rank || 12}
                onViewLeaderboard={() => navigate('/leaderboard')}
              />
            </div>

            {/* Row 2: Quest Map */}
            <div className="col-span-12">
              <QuestMap 
                progress={64}
                onNodeClick={handleNodeClick}
              />
            </div>

            {/* Row 3: Daily Quests */}
            <div className="col-span-12 lg:col-span-7">
              <DailyQuests 
                quests={dailyQuests}
                onQuestClick={handleQuestClick}
              />
            </div>

            {/* Row 3: Recent Victories */}
            <div className="col-span-12 lg:col-span-5">
              <RecentVictories 
                sessions={recentSessions}
              />
            </div>
          </div>
        </div>
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
 * Hero Status HUD Component
 * Shows avatar, XP bar, Shadow of Doom bar, and rank badges
 */
const HeroStatusCard = ({ user, title, xpPercentage, shadowPercentage }) => {
  const level = user?.level || 9;
  const xp = user?.xp || 9000;
  const nextLevelXP = level * 1250;

  return (
    <PixelCard variant="primary" className="h-full">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Avatar & Level */}
        <div className="flex flex-col items-center lg:items-start gap-2">
          <Avatar 
            src={user?.avatar}
            alt={user?.username}
            size="2xl"
            variant="tertiary"
            rpgClass="mage"
            level={level}
            glow
          />
          <div className="text-center lg:text-left">
            <div className="font-pixel text-[10px] text-tertiary">LEVEL {level}</div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <div>
            <h2 className="font-headline text-xl lg:text-2xl font-black text-primary uppercase tracking-tight">
              {title}
            </h2>
            <p className="font-pixel text-[10px] text-on-surface-variant mt-1">
              {user?.username || 'HERO'}
            </p>
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-[10px] text-secondary uppercase tracking-wider">
                Experience
              </span>
              <span className="font-pixel text-[10px] text-secondary">
                {xp.toLocaleString()} / {nextLevelXP.toLocaleString()}
              </span>
            </div>
            <ProgressBar 
              value={xpPercentage}
              variant="xp"
              size="lg"
              segmented
              showLabel={false}
            />
          </div>

          {/* Shadow of Doom Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-[10px] text-error uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">warning</span>
                Shadow of Doom
              </span>
              <span className="font-pixel text-[10px] text-error">
                {shadowPercentage}%
              </span>
            </div>
            <ProgressBar 
              value={shadowPercentage}
              variant="shadow"
              size="md"
              segmented
              showLabel={false}
            />
          </div>

          {/* Rank Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <RankBadge label="RANK: ELITE" color="tertiary" />
            <RankBadge label="WIN STREAK: 7" color="secondary" />
          </div>
        </div>
      </div>
    </PixelCard>
  );
};

/**
 * Rank Badge Component
 */
const RankBadge = ({ label, color }) => {
  const colorClasses = {
    primary: 'bg-primary/20 text-primary border-primary',
    secondary: 'bg-secondary/20 text-secondary border-secondary',
    tertiary: 'bg-tertiary/20 text-tertiary border-tertiary',
  };

  return (
    <span className={cn(
      "px-3 py-1 font-pixel text-[8px] uppercase border",
      colorClasses[color]
    )}>
      {label}
    </span>
  );
};

/**
 * Guild Stats Card Component
 */
const GuildStatsCard = ({ rank, onViewLeaderboard }) => {
  return (
    <PixelCard variant="tertiary" className="h-full flex flex-col">
      <PixelCardHeader icon={<span className="material-symbols-outlined text-tertiary">military_tech</span>}>
        Guild Rankings
      </PixelCardHeader>
      
      <div className="flex-1 flex flex-col justify-center py-4">
        <div className="text-center">
          <div className="font-pixel text-4xl lg:text-5xl text-tertiary mb-2">
            #{rank}
          </div>
          <div className="font-label text-sm text-on-surface mb-4">
            S4 LEAGUE (HK)
          </div>
          <span className="inline-block px-3 py-1 bg-tertiary text-on-tertiary font-pixel text-[10px]">
            TOP 5%
          </span>
        </div>
      </div>

      <PixelButton 
        variant="secondary" 
        fullWidth 
        onClick={onViewLeaderboard}
        icon={<span className="material-symbols-outlined">emoji_events</span>}
      >
        View Leaderboard
      </PixelButton>
    </PixelCard>
  );
};

/**
 * Quest Map Component
 * RPG-style map with progression nodes
 */
const QuestMap = ({ progress, onNodeClick }) => {
  const nodes = [
    { id: 1, status: 'completed', label: 'The Basics', icon: 'check' },
    { id: 2, status: 'completed', label: 'Equations', icon: 'check' },
    { id: 3, status: 'current', label: 'Boss Battle', icon: 'swords' },
    { id: 4, status: 'locked', label: 'Advanced', icon: 'lock' },
  ];

  return (
    <PixelCard variant="elevated" className="relative overflow-hidden">
      {/* Map Container */}
      <div className="relative aspect-[21/9] bg-surface-container-high overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, #3d2b5e 0%, transparent 50%),
              radial-gradient(circle at 80% 30%, #412f63 0%, transparent 40%),
              radial-gradient(circle at 50% 80%, #271448 0%, transparent 60%)
            `
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-pixel-grid-bg opacity-20" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Header Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div>
            <h3 className="font-pixel text-[10px] lg:text-xs text-primary uppercase tracking-wider mb-1">
              Kingdom of Calculus
            </h3>
            <p className="font-label text-xs lg:text-sm text-on-surface-variant">
              Chapter 4: The Derivative Wasteland
            </p>
          </div>
          <div className="px-3 py-1 bg-surface-container border border-outline-variant">
            <span className="font-pixel text-[8px] text-tertiary">
              MAP: {progress}%
            </span>
          </div>
        </div>

        {/* Connection Line */}
        <div className="absolute bottom-16 lg:bottom-20 left-1/2 transform -translate-x-1/2 w-3/4 lg:w-1/2">
          <div className="h-1 bg-surface-container-highest relative">
            <div 
              className="absolute inset-y-0 left-0 bg-tertiary transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quest Nodes */}
        <div className="absolute bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 flex items-end gap-8 lg:gap-16">
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
    </PixelCard>
  );
};

/**
 * Quest Node Component
 */
const QuestNode = ({ node, index, onClick }) => {
  const styles = {
    completed: {
      container: 'w-10 h-10 lg:w-12 lg:h-12 bg-tertiary shadow-[0_0_20px_#e9c400]',
      icon: 'text-on-tertiary',
    },
    current: {
      container: 'w-12 h-12 lg:w-16 lg:h-16 bg-primary-container shadow-[0_0_30px_#ff4a8d] animate-pulse',
      icon: 'text-on-primary',
    },
    locked: {
      container: 'w-10 h-10 lg:w-12 lg:h-12 bg-surface-container grayscale opacity-60',
      icon: 'text-on-surface-variant',
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
        <span className={cn("material-symbols-outlined lg:text-2xl", style.icon)}>
          {node.icon}
        </span>
      </button>
      <span className="font-pixel text-[7px] lg:text-[8px] text-on-surface-variant uppercase whitespace-nowrap">
        {node.label}
      </span>
    </div>
  );
};

/**
 * Daily Quests Component
 */
const DailyQuests = ({ quests, onQuestClick }) => {
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
  })) : getDefaultQuests();

  function getDefaultQuests() {
    return [
      { id: 1, title: 'Master 5 Math Problems', xp: 200, progress: 3, total: 5, icon: 'swords', color: 'primary', completed: false },
      { id: 2, title: '15-min Pomodoro Focus', xp: 150, progress: 0, total: 1, icon: 'timer', color: 'secondary', completed: false },
      { id: 3, title: 'Review Flashcards', xp: 100, progress: 1, total: 1, icon: 'school', color: 'tertiary', completed: true },
    ];
  }

  return (
    <PixelCard variant="default">
      <div className="flex items-center justify-between mb-4">
        <PixelCardHeader icon={<span className="material-symbols-outlined text-primary">scroll</span>}>
          Daily Bounties
        </PixelCardHeader>
        <span className="font-pixel text-[8px] text-on-surface-variant">
          RESET IN 14H 22M
        </span>
      </div>

      <div className="space-y-3">
        {formattedQuests.map((quest) => (
          <QuestItem 
            key={quest.id}
            quest={quest}
            onClick={() => onQuestClick(quest)}
          />
        ))}
      </div>
    </PixelCard>
  );
};

/**
 * Quest Item Component
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
        "w-full flex items-center gap-3 p-3 bg-surface-container-high hover:bg-surface-container transition-colors",
        borderColors[quest.color],
        quest.completed && 'opacity-60'
      )}
    >
      {/* Icon Box */}
      <div className={cn(
        "w-10 h-10 flex items-center justify-center flex-shrink-0",
        quest.completed ? 'bg-tertiary/20' : `bg-${quest.color}/20`
      )}>
        <span className={cn(
          "material-symbols-outlined",
          quest.completed ? 'text-tertiary' : `text-${quest.color}`
        )}>
          {quest.completed ? 'check' : quest.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <h4 className="font-label text-sm text-on-surface truncate">
          {quest.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-pixel text-[8px] text-tertiary">
            +{quest.xp} XP
          </span>
          {!quest.completed && (
            <span className="font-pixel text-[8px] text-on-surface-variant">
              {quest.progress}/{quest.total}
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        {quest.completed ? (
          <span className="font-pixel text-[8px] text-tertiary uppercase">Claimed</span>
        ) : quest.progress >= quest.total ? (
          <span className="font-pixel text-[8px] text-primary uppercase">Ready</span>
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        )}
      </div>
    </button>
  );
};

/**
 * Recent Victories Component
 */
const RecentVictories = ({ sessions }) => {
  const badges = [
    { type: 'bronze', icon: 'bolt', color: '#cd7f32' },
    { type: 'silver', icon: 'local_fire_department', color: '#c0c0c0' },
    { type: 'gold', icon: 'auto_awesome', color: '#e9c400' },
  ];

  const formattedSessions = sessions.length > 0 ? sessions.map(s => ({
    id: s.id,
    title: s.subject || 'Study Session',
    time: s.started_at,
    xp: s.xp_earned || 0,
    duration: s.duration || 0,
  })) : [
    { id: 1, title: 'Calculus Boss Battle', time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), xp: 450, duration: 45 },
    { id: 2, title: 'Ancient History Lab', time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), xp: 200, duration: 25 },
  ];

  return (
    <PixelCard variant="default">
      <PixelCardHeader icon={<span className="material-symbols-outlined text-tertiary">emoji_events</span>}>
        Recent Victories
      </PixelCardHeader>

      {/* Badge Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4 mt-4">
        {badges.map((badge) => (
          <div 
            key={badge.type}
            className="flex flex-col items-center p-3 border-2"
            style={{ 
              backgroundColor: `${badge.color}20`,
              borderColor: badge.color 
            }}
          >
            <span 
              className="material-symbols-outlined text-2xl"
              style={{ color: badge.color }}
            >
              {badge.icon}
            </span>
            <span className="font-pixel text-[7px] uppercase mt-1" style={{ color: badge.color }}>
              {badge.type}
            </span>
          </div>
        ))}
      </div>

      {/* Recent Sessions List */}
      <div className="space-y-3">
        {formattedSessions.map((session) => (
          <div 
            key={session.id}
            className="p-3 border-l-2 border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-label text-sm text-on-surface truncate pr-2">
                {session.title}
              </h4>
              <span className="font-pixel text-[7px] text-on-surface-variant whitespace-nowrap">
                {formatTimeAgo(session.time)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-pixel text-[8px] text-tertiary">
                +{session.xp} XP
              </span>
              <span className="font-pixel text-[8px] text-on-surface-variant">
                {session.duration}m Focused
              </span>
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
};

// Helper function for time formatting
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const hours = Math.floor((now - date) / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return 'Yesterday';
};

export default Dashboard;
