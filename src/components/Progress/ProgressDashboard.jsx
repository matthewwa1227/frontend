import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';

// Layout Components
import TopAppBar from '../layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../layout/SideNavBar';

const ProgressDashboard = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [user, setUser] = useState(currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  // Navigation items matching the design
  const navItems = useMemo(() => [
    // Main Navigation
    { id: 'dashboard', label: 'DASHBOARD', icon: 'target', href: '/dashboard', category: 'main' },
    { id: 'tasks', label: 'QUEST LOG', icon: 'checklist', href: '/tasks', category: 'main' },
    { id: 'timer', label: 'CHAMBER OF FOCUS', icon: 'timer', href: '/timer', category: 'main' },
    { id: 'progress', label: 'PROGRESS', icon: 'trending_up', href: '/progress', category: 'main' },
    { id: 'social', label: 'SOCIAL', icon: 'groups', href: '/social', category: 'main' },
    { id: 'leaderboard', label: 'LEADERBOARD', icon: 'trophy', href: '/leaderboard', category: 'main' },
    
    // Study Tools
    { id: 'study-buddy', label: 'STUDY BUDDY', icon: 'chat', href: '/study-buddy', category: 'study' },
    { id: 'newquest', label: 'NEWQUEST', icon: 'smart_toy', href: '/newquest', category: 'study' },
    { id: 'archive', label: 'ARCHIVE', icon: 'book-open', href: '/archive-alchemist', category: 'study' },
    { id: 'schedule', label: 'SCHEDULE', icon: 'calendar_month', href: '/schedule', category: 'study' },
    { id: 'exercise-gen', label: 'EXERCISE GEN', icon: 'edit_document', href: '/exercise-generator', category: 'study' },
    
    // More
    { id: 'portal', label: 'PARENTS', icon: 'family_restroom', href: '/portal', category: 'more' },
    { id: 'profile', label: 'PROFILE', icon: 'person', href: '/profile', category: 'more' },
  ], []);

  // Fetch progress data
  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/progress/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProgress(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for display (replace with real data from API)
  const stats = {
    totalHours: progress?.summary?.totalStudyHours || 1284,
    questsCompleted: 412,
    rank: 14,
    league: 'GOLD III',
    topPercent: 'TOP 2%',
    streak: 14,
    shadowLevel: 16,
    heroDominance: 84
  };

  // Weekly data for chart
  const weeklyData = [
    { day: 'MON', hours: 2.4, percent: 40 },
    { day: 'TUE', hours: 4.2, percent: 65 },
    { day: 'WED', hours: 3.1, percent: 50 },
    { day: 'THU', hours: 6.8, percent: 90, highlight: true },
    { day: 'FRI', hours: 2.8, percent: 45 },
    { day: 'SAT', hours: 1.5, percent: 30 },
    { day: 'SUN', hours: 0.8, percent: 20 },
  ];

  // Subject mastery data
  const subjects = [
    { name: 'MATHEMATICS', level: 58, title: 'ARCH-GEOMETER', percent: 70, color: 'primary', icon: 'functions' },
    { name: 'ENGLISH LITS', level: 45, title: 'BARDIC SCHOLAR', percent: 50, color: 'secondary', icon: 'history_edu' },
    { name: 'LIBERAL STUDIES', level: 72, title: 'WORLD-SAGE', percent: 80, color: 'tertiary', icon: 'public' },
  ];

  // Relics/achievements
  const relics = [
    { icon: 'diamond', color: 'primary', unlocked: true },
    { icon: 'auto_stories', color: 'secondary', unlocked: true },
    { icon: 'shield_with_heart', color: 'tertiary', unlocked: true },
    { icon: 'bolt', color: 'primary', unlocked: true },
    { icon: 'lock', color: 'outline', unlocked: false },
    { icon: 'lock', color: 'outline', unlocked: false },
    { icon: 'lock', color: 'outline', unlocked: false },
    { icon: 'lock', color: 'outline', unlocked: false },
  ];

  // Streak days
  const streakDays = Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    completed: i < 13,
    special: i === 11 // Day 12 has star
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚔️</div>
          <p className="font-retro text-[10px] text-secondary">LOADING LEGEND...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background retro-grid">
      {/* Top Navigation */}
      <TopAppBar 
        title="STUDYQUEST" 
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation (Desktop) */}
      <SideNavBar 
        items={navItems} 
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeItem="progress"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item && item.href) {
            navigate(item.href);
          }
        }}
      />

      {/* Main Content Canvas */}
      <main className="lg:ml-64 pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Top Metrics Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Metric 1: Total Study Hours */}
          <div className="bg-surface-container border-b-4 border-r-4 border-surface-container-lowest p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <span className="material-symbols-outlined text-6xl">schedule</span>
            </div>
            <div className="font-retro text-[10px] text-primary mb-4">TOTAL STUDY HOURS</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-headline tracking-tighter">{stats.totalHours.toLocaleString()}</span>
              <span className="text-secondary font-headline text-sm font-bold uppercase">h</span>
            </div>
            <div className="mt-4 text-[10px] font-retro text-tertiary">+12.5% vs last month</div>
          </div>

          {/* Metric 2: Quests Completed */}
          <div className="bg-surface-container border-b-4 border-r-4 border-surface-container-lowest p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <span className="material-symbols-outlined text-6xl">swords</span>
            </div>
            <div className="font-retro text-[10px] text-secondary mb-4">QUESTS COMPLETED</div>
            <div className="text-4xl font-bold font-headline tracking-tighter">{stats.questsCompleted}</div>
            <div className="mt-4 text-[10px] font-retro text-primary">LEGENDARY STREAK: {stats.streak}D</div>
          </div>

          {/* Metric 3: League Rank */}
          <div className="bg-surface-container border-b-4 border-r-4 border-surface-container-lowest p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <span className="material-symbols-outlined text-6xl">trophy</span>
            </div>
            <div className="font-retro text-[10px] text-tertiary mb-4">LEAGUE RANK</div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-headline tracking-tighter">#{stats.rank}</span>
              <span className="bg-tertiary-container text-on-tertiary-container px-2 py-1 font-retro text-[8px]">{stats.league}</span>
            </div>
            <div className="mt-4 text-[10px] font-retro text-secondary">{stats.topPercent} OF SCHOLARS</div>
          </div>
        </div>

        {/* Main Grid: Charts & Mastery */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* XP Growth Chart & Dominance */}
          <div className="xl:col-span-2 space-y-8">
            {/* Weekly Knowledge Accrual Chart */}
            <section className="bg-surface-container-low p-8 border-2 border-surface-container-highest">
              <h2 className="font-retro text-[12px] text-on-background mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">analytics</span> WEEKLY KNOWLEDGE ACCRUAL
              </h2>
              <div className="flex items-end justify-between h-48 gap-2 mb-4">
                {weeklyData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div 
                      className="w-full bg-surface-container-highest relative flex flex-col justify-end"
                      style={{ height: `${data.percent}%` }}
                    >
                      <div 
                        className={`bg-primary w-full border-t-2 border-primary-container segmented-progress ${data.highlight ? 'shadow-[0_0_15px_rgba(255,74,141,0.5)]' : ''}`}
                        style={{ height: '100%' }}
                      />
                    </div>
                    <span className="mt-4 font-retro text-[8px] text-secondary">{data.day}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Hero Dominance Ratio */}
            <section className="bg-surface-container-low p-8 border-2 border-surface-container-highest relative">
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col">
                  <span className="font-retro text-[8px] text-secondary mb-1">HERO DOMINANCE</span>
                  <span className="font-headline text-3xl font-bold tracking-tighter">{stats.heroDominance}%</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-retro text-[8px] text-error mb-1">SHADOW CORRUPTION</span>
                  <span className="font-headline text-3xl font-bold tracking-tighter opacity-50">{stats.shadowLevel}%</span>
                </div>
              </div>
              <div className="w-full h-8 bg-surface-container-highest flex border-2 border-surface-container">
                <div 
                  className="h-full bg-secondary shadow-[inset_0_0_10px_rgba(0,241,254,0.5)] border-r-4 border-primary"
                  style={{ width: `${stats.heroDominance}%` }}
                />
                <div className="h-full bg-surface-variant flex-1 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs opacity-30">skull</span>
                </div>
              </div>
              <p className="mt-4 font-headline text-xs text-on-surface-variant italic">The Shadow is fading. Your focus remains absolute.</p>
            </section>
          </div>

          {/* Subject Mastery Trees */}
          <div className="xl:col-span-1 space-y-6">
            <section className="bg-surface-container p-8 border-2 border-surface-container-highest h-full">
              <h2 className="font-retro text-[12px] text-on-background mb-10 flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">account_tree</span> SUBJECT MASTERY
              </h2>
              <div className="space-y-12">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-6">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle 
                          className="text-surface-container-highest" 
                          cx="40" 
                          cy="40" 
                          fill="transparent" 
                          r="36" 
                          stroke="currentColor" 
                          strokeWidth="8"
                        />
                        <circle 
                          className={`text-${subject.color}`}
                          cx="40" 
                          cy="40" 
                          fill="transparent" 
                          r="36" 
                          stroke="currentColor" 
                          strokeDasharray="226.2" 
                          strokeDashoffset={226.2 - (226.2 * subject.percent / 100)}
                          strokeWidth="8"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`material-symbols-outlined text-2xl text-${subject.color}`}>{subject.icon}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-headline font-bold text-lg mb-1">{subject.name}</div>
                      <div className="font-retro text-[8px] text-tertiary">LVL {subject.level} {subject.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Lower Section: Relics & Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Relic Gallery */}
          <section className="bg-surface-container-low p-8 border-2 border-surface-container-highest">
            <h2 className="font-retro text-[12px] text-on-background mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">auto_awesome</span> EARNED RELICS
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {relics.map((relic, index) => (
                <div 
                  key={index}
                  className={`aspect-square bg-surface-container border-2 p-2 flex items-center justify-center transition-colors cursor-pointer ${
                    relic.unlocked 
                      ? `border-${relic.color} hover:bg-${relic.color}-container group` 
                      : 'border-surface-variant grayscale opacity-40'
                  }`}
                >
                  <span 
                    className={`material-symbols-outlined ${relic.unlocked ? `text-${relic.color} group-hover:text-white` : 'text-outline'}`}
                    style={relic.unlocked ? {fontVariationSettings: "'FILL' 1"} : {}}
                  >
                    {relic.icon}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Streak Calendar */}
          <section className="bg-surface-container-low p-8 border-2 border-surface-container-highest">
            <h2 className="font-retro text-[12px] text-on-background mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">local_fire_department</span> {stats.streak}-DAY STREAK TRACKER
            </h2>
            <div className="flex flex-wrap gap-3">
              {streakDays.map((day, index) => (
                <div 
                  key={index}
                  className={`w-10 h-10 flex items-center justify-center relative ${
                    day.completed 
                      ? 'bg-primary border-b-4 border-on-primary-fixed-variant' 
                      : 'bg-surface-container-highest border-b-4 border-surface-variant opacity-50'
                  }`}
                >
                  <span className={`font-retro text-[8px] ${day.completed ? 'text-white' : 'text-on-surface-variant'}`}>
                    {day.day}
                  </span>
                  {day.special && (
                    <div className="absolute -top-2 -right-2 bg-tertiary p-1">
                      <span className="material-symbols-outlined text-[8px] text-on-tertiary">star</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-4 bg-surface-container p-4">
              <div className="text-tertiary">
                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>military_tech</span>
              </div>
              <div>
                <div className="font-headline font-bold text-sm">STREAK MULTIPLIER ACTIVE</div>
                <div className="font-retro text-[8px] text-primary">1.5X XP GAIN ENABLED</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavBar 
        items={navItems.filter(i => ['dashboard', 'tasks', 'timer', 'social'].includes(i.id))} 
        activeItem="progress"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />
    </div>
  );
};

export default ProgressDashboard;
