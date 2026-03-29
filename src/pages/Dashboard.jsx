import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import TopAppBar from '../components/layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../components/layout/SideNavBar';
import PixelButton from '../components/ui/PixelButton';
import PixelCard, { PixelCardHeader, PixelCardTitle } from '../components/ui/PixelCard';
import ProgressBar from '../components/ui/ProgressBar';
import Avatar from '../components/ui/Avatar';

/**
 * Hero's Hub (Dashboard) - Main landing page for StudyQuest
 * Features:
 * - Hero Status HUD (XP, Shadow, Level)
 * - Guild Stats Card
 * - Quest Map visualization
 * - Daily Quests List
 * - Recent Sessions & Badges
 */
const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('study');
  
  // Mock user data - in production, this comes from API/context
  const user = {
    username: 'ARCHMAGE_OF_ALGEBRA',
    level: 42,
    xp: 9000,
    maxXp: 11250,
    heroPower: 9000,
    shadowLevel: 15,
    rpgClass: 'archmage',
    avatar: null, // Use default avatar
    streak: 7,
    rank: 'ELITE',
  };
  
  // Mock daily quests
  const dailyQuests = [
    {
      id: 1,
      title: 'Master 5 Math Problems',
      description: 'Focus area: Logarithmic Functions',
      xp: 200,
      progress: 3,
      total: 5,
      variant: 'primary',
      icon: 'swords',
      status: 'active',
    },
    {
      id: 2,
      title: '15-min Pomodoro Focus',
      description: 'Uninterrupted deep work session',
      xp: 150,
      progress: 0,
      total: 1,
      variant: 'secondary',
      icon: 'timer',
      status: 'ready',
    },
    {
      id: 3,
      title: 'Review Flashcards',
      description: 'Daily vocab set (30 cards)',
      xp: 100,
      progress: 30,
      total: 30,
      variant: 'tertiary',
      icon: 'check',
      status: 'completed',
    },
  ];
  
  // Mock recent sessions
  const recentSessions = [
    { id: 1, title: 'Calculus Boss Battle', xp: 450, duration: '45m', time: '2h ago' },
    { id: 2, title: 'Ancient History Lab', xp: 200, duration: '25m', time: 'Yesterday' },
  ];
  
  // Mock badges
  const badges = [
    { id: 1, name: 'BRONZE FOCUS', icon: 'bolt', color: '#cd7f32', unlocked: true },
    { id: 2, name: 'SILVER STREAK', icon: 'local_fire_department', color: '#c0c0c0', unlocked: true },
    { id: 3, name: 'GOLD SCHOLAR', icon: 'auto_awesome', color: '#e9c400', unlocked: true },
  ];
  
  // Navigation items
  const navItems = [
    { id: 'study', label: 'Study', icon: 'menu_book', href: '#', active: true },
    { id: 'ai-tutor', label: 'AI Tutor', icon: 'psychology', href: '#' },
    { id: 'social', label: 'Social', icon: 'groups', href: '#' },
    { id: 'tasks', label: 'Tasks', icon: 'checklist', href: '#', badge: '3' },
  ];
  
  return (
    <div className="min-h-screen bg-surface text-on-background font-body">
      {/* Top Navigation */}
      <TopAppBar
        title="HERO'S HUB"
        user={user}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      
      {/* Side Navigation */}
      <SideNavBar
        items={navItems}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <main className="lg:ml-64 pt-24 px-6 pb-24 min-h-screen">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          
          {/* Hero Status HUD */}
          <section className="col-span-12 lg:col-span-8">
            <HeroStatusCard user={user} />
          </section>
          
          {/* Guild Stats Card */}
          <section className="col-span-12 lg:col-span-4">
            <GuildStatsCard />
          </section>
          
          {/* Quest Map Area */}
          <section className="col-span-12">
            <QuestMapCard />
          </section>
          
          {/* Daily Quests List */}
          <section className="col-span-12 lg:col-span-7">
            <DailyQuestsCard quests={dailyQuests} />
          </section>
          
          {/* Recent Sessions & Badges */}
          <section className="col-span-12 lg:col-span-5">
            <RecentVictoriesCard sessions={recentSessions} badges={badges} />
          </section>
          
        </div>
      </main>
      
      {/* Bottom Navigation (Mobile) */}
      <BottomNavBar
        items={navItems}
        activeItem={activeNavItem}
        onItemClick={setActiveNavItem}
      />
      
      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-primary shadow-pixel-primary text-on-primary flex items-center justify-center active:translate-y-2 transition-transform z-30 hover:scale-105">
        <span className="material-symbols-outlined text-4xl">add</span>
      </button>
    </div>
  );
};

/**
 * Hero Status Card - Main player stats display
 */
const HeroStatusCard = ({ user }) => {
  const xpPercentage = (user.xp / user.maxXp) * 100;
  
  return (
    <PixelCard className="relative overflow-hidden">
      {/* Background Shadow Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <span className="material-symbols-outlined text-[200px]">skull</span>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <Avatar
              rpgClass={user.rpgClass}
              size="2xl"
              variant="tertiary"
              border
              glow
            />
            <div>
              <h1 className="font-pixel text-xl text-primary mb-2">
                {user.username}
              </h1>
              <div className="flex gap-4">
                <span className="px-2 py-1 bg-surface-container-lowest text-secondary font-pixel text-[10px]">
                  RANK: {user.rank}
                </span>
                <span className="px-2 py-1 bg-surface-container-lowest text-tertiary font-pixel text-[10px]">
                  WIN STREAK: {user.streak}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className="font-pixel text-[10px] text-secondary/60">
              NEXT REWARD: VOID POTION
            </span>
            <div className="flex justify-end gap-1 mt-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-3 h-3 bg-tertiary" />
              ))}
              {[1, 2].map(i => (
                <div key={i} className="w-3 h-3 bg-surface-container" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Progress Bars */}
        <div className="space-y-6">
          {/* XP Bar */}
          <ProgressBar
            value={user.xp}
            max={user.maxXp}
            variant="xp"
            size="lg"
            segmented
            showLabel
            label="EXPERIENCE POINTS (XP)"
            glow
          />
          
          {/* Shadow of Doom Bar */}
          <div>
            <div className="flex justify-between mb-2 font-pixel text-[10px]">
              <span className="text-error flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                SHADOW OF DOOM (PROCRASTINATION)
              </span>
              <span className="text-error">{user.shadowLevel}%</span>
            </div>
            <div className="h-4 bg-surface-container-lowest border-2 border-outline-variant overflow-hidden">
              <div 
                className="h-full bg-error pixel-segmented transition-all duration-500"
                style={{ width: `${user.shadowLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </PixelCard>
  );
};

/**
 * Guild Stats Card - Display guild rankings and stats
 */
const GuildStatsCard = () => {
  return (
    <PixelCard className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-tertiary">military_tech</span>
          <h3 className="font-pixel text-[12px] text-on-surface">GUILD RANKINGS</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-surface-container-low p-4 flex justify-between items-center border-l-4 border-tertiary">
            <div>
              <p className="font-pixel text-[10px] text-on-surface-variant">S4 LEAGUE (HK)</p>
              <p className="font-headline font-bold text-xl text-tertiary">RANK #12</p>
            </div>
            <div className="text-right">
              <p className="font-pixel text-[8px] text-secondary">TOP 5%</p>
            </div>
          </div>
          
          <div className="font-body text-sm text-on-surface-variant leading-relaxed">
            Your guild "NEON SCHOLARS" is 450 XP away from Rank #11. Complete a group study session to boost ranking!
          </div>
        </div>
      </div>
      
      <PixelButton
        variant="secondary"
        fullWidth
        className="mt-6"
        icon={<span className="material-symbols-outlined text-sm">arrow_forward</span>}
        iconPosition="right"
      >
        VIEW LEADERBOARD
      </PixelButton>
    </PixelCard>
  );
};

/**
 * Quest Map Card - Visual map of learning journey
 */
const QuestMapCard = () => {
  const nodes = [
    { id: 1, name: 'LIMITS', status: 'completed', position: 'left' },
    { id: 2, name: 'CONTINUITY', status: 'completed', position: 'center-left' },
    { id: 3, name: 'BOSS: DERIVATIVES', status: 'current', position: 'center' },
    { id: 4, name: 'INTEGRALS', status: 'locked', position: 'right' },
  ];
  
  return (
    <div className="bg-surface-container-high border-2 border-outline-variant relative overflow-hidden aspect-[21/9]">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-surface-container-high via-surface-container to-surface-dim opacity-40" />
        {/* Decorative Grid */}
        <div className="absolute inset-0 pixel-grid-bg opacity-30" />
      </div>
      
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface via-transparent to-transparent" />
      
      <div className="relative z-20 p-8 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-pixel text-2xl text-secondary mb-2 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
              KINGDOM OF CALCULUS
            </h2>
            <p className="font-headline text-on-surface-variant font-bold tracking-widest">
              CHAPTER 4: THE DERIVATIVE WASTELAND
            </p>
          </div>
          <div className="bg-surface/80 p-4 border-2 border-primary backdrop-blur-md">
            <span className="font-pixel text-[10px] text-primary">MAP COMPLETION: 64%</span>
          </div>
        </div>
        
        {/* Quest Nodes */}
        <div className="flex gap-12 justify-center mb-12">
          {nodes.map((node) => (
            <QuestNode key={node.id} {...node} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Quest Node - Individual map node
 */
const QuestNode = ({ name, status }) => {
  const styles = {
    completed: {
      container: 'bg-tertiary shadow-glow-tertiary border-4 border-on-tertiary',
      icon: 'check',
      label: 'text-on-tertiary',
    },
    current: {
      container: 'bg-primary-container shadow-glow-primary border-4 border-on-primary-container -translate-y-2 scale-110',
      icon: 'swords',
      label: 'text-primary animate-pulse',
    },
    locked: {
      container: 'bg-surface-container border-4 border-outline-variant opacity-30 grayscale',
      icon: 'lock',
      label: 'text-on-surface-variant',
    },
  };
  
  const style = styles[status];
  
  return (
    <div className="relative flex flex-col items-center">
      <div className={cn(
        "w-12 h-12 flex items-center justify-center transition-all duration-300",
        style.container,
        status === 'current' && 'w-16 h-16'
      )}>
        <span className={cn(
          "material-symbols-outlined",
          status === 'current' ? 'text-white' : ''
        )}>
          {style.icon}
        </span>
      </div>
      <div className={cn(
        "absolute -bottom-6 left-1/2 -translate-x-1/2 font-pixel text-[8px] whitespace-nowrap",
        style.label,
        status === 'current' && '-bottom-8 text-[10px]'
      )}>
        {name}
      </div>
    </div>
  );
};

/**
 * Daily Quests Card - List of daily bounties
 */
const DailyQuestsCard = ({ quests }) => {
  return (
    <PixelCard>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">checklist</span>
          <h3 className="font-pixel text-[12px] text-on-surface">DAILY BOUNTIES</h3>
        </div>
        <span className="font-pixel text-[10px] text-on-surface-variant/50">
          RESET IN 14H 22M
        </span>
      </div>
      
      <div className="space-y-4">
        {quests.map((quest) => (
          <QuestItem key={quest.id} {...quest} />
        ))}
      </div>
    </PixelCard>
  );
};

/**
 * Quest Item - Individual quest row
 */
const QuestItem = ({ title, description, xp, progress, total, variant, icon, status }) => {
  const borderColors = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    tertiary: 'border-tertiary',
  };
  
  const isCompleted = status === 'completed';
  
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 bg-surface-container-low group hover:bg-surface-container-high transition-colors",
      "border-l-4",
      borderColors[variant],
      isCompleted && "opacity-60"
    )}>
      <div className={cn(
        "w-10 h-10 flex-shrink-0 border-2 flex items-center justify-center",
        isCompleted 
          ? "border-tertiary bg-surface-container-lowest" 
          : "border-outline-variant bg-background group-hover:border-primary"
      )}>
        <span className={cn(
          "material-symbols-outlined",
          isCompleted ? "text-tertiary" : "text-outline group-hover:text-primary"
        )}>
          {isCompleted ? 'check' : icon}
        </span>
      </div>
      
      <div className="flex-1">
        <h4 className={cn(
          "font-headline font-bold",
          isCompleted ? "text-on-surface line-through" : "text-on-surface"
        )}>
          {title}
        </h4>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
      
      <div className="text-right font-pixel text-[10px]">
        {!isCompleted ? (
          <>
            <span className="text-tertiary">+{xp} XP</span>
            <div className="mt-1 text-on-surface-variant">
              {progress}/{total}
            </div>
          </>
        ) : (
          <span className="text-tertiary">CLAIMED</span>
        )}
      </div>
    </div>
  );
};

/**
 * Recent Victories Card - Badges and recent sessions
 */
const RecentVictoriesCard = ({ sessions, badges }) => {
  return (
    <PixelCard className="h-full">
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-tertiary">trophy</span>
        <h3 className="font-pixel text-[12px] text-on-surface">RECENT VICTORIES</h3>
      </div>
      
      {/* Badges Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className="flex flex-col items-center p-3 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high transition-colors cursor-help group"
          >
            <div 
              className="w-12 h-12 border-2 flex items-center justify-center mb-2"
              style={{ 
                backgroundColor: `${badge.color}20`,
                borderColor: badge.color 
              }}
            >
              <span 
                className="material-symbols-outlined"
                style={{ color: badge.color }}
              >
                {badge.icon}
              </span>
            </div>
            <span className="font-pixel text-[8px] text-center text-on-surface-variant leading-tight">
              {badge.name}
            </span>
          </div>
        ))}
      </div>
      
      {/* Recent Sessions */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className="p-3 border-l-2 border-outline-variant font-body text-sm hover:bg-surface-container-low transition-colors"
          >
            <div className="flex justify-between mb-1">
              <span className="font-bold text-on-surface">{session.title}</span>
              <span className="text-xs text-on-surface-variant">{session.time}</span>
            </div>
            <div className="text-xs text-on-surface-variant">
              +{session.xp} XP • {session.duration} Focused
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
};

export default Dashboard;
