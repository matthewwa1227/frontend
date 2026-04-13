import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { studentAPI } from '../../utils/api';

// Layout Components
import TopAppBar from '../layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../layout/SideNavBar';

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [user, setUser] = useState(currentUser);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
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
    { id: 'schedule', label: 'SCHEDULE', icon: 'calendar_month', href: '/schedule', category: 'study' },
    { id: 'exercise-gen', label: 'EXERCISE GEN', icon: 'edit_document', href: '/exercise-generator', category: 'study' },
    
    // More
    { id: 'portal', label: 'PARENTS', icon: 'family_restroom', href: '/portal', category: 'more' },
    { id: 'profile', label: 'PROFILE', icon: 'person', href: '/profile', category: 'more' },
  ], []);

  // Fetch profile data
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const statsRes = await studentAPI.getStats();
      const studentData = statsRes.data.student;
      setProfile(studentData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format study time
  const formatStudyTime = (minutes) => {
    if (!minutes) return { hours: 0, mins: 0 };
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return { hours, mins };
  };

  // Get avatar URL
  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'F7DC6F', 'BB8FCE', '58D68D'];
    const colorIndex = (profile?.username || 'user').charCodeAt(0) % colors.length;
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile?.username || 'user'}&backgroundColor=${colors[colorIndex]}`;
  };

  // Sample data
  const studyTime = formatStudyTime(profile?.total_study_minutes || 23148);
  const level = profile?.level || 182;
  const xp = profile?.xp || 12450;
  const xpRequired = 18000;
  const xpProgress = (xp / xpRequired) * 100;

  // Relics/Achievements
  const unlockedRelics = [
    { id: 1, name: 'Flow State', icon: 'fluid', color: 'tertiary' },
    { id: 2, name: 'Deep Work', icon: 'neurology', color: 'secondary' },
    { id: 3, name: 'Pomodoro Pro', icon: 'timer_10_alt_1', color: 'primary' },
    { id: 4, name: 'On Fire', icon: 'local_fire_department', color: 'tertiary' },
  ];

  const lockedRelics = [
    { id: 5, name: 'LOCKED' },
    { id: 6, name: 'LOCKED' },
    { id: 7, name: 'LOCKED' },
    { id: 8, name: 'LOCKED' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar title="HERO PROFILE" user={currentUser} onMenuClick={() => setMobileMenuOpen(true)} />
        <SideNavBar 
          items={navItems} 
          user={user}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activeItem="profile"
        />
        <main className="lg:ml-64 pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-surface-container w-full" />
              <div className="h-48 bg-surface-container w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopAppBar 
        title="STUDY QUEST" 
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation */}
      <SideNavBar 
        items={navItems} 
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeItem="profile"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item && item.href) navigate(item.href);
        }}
      />

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 pb-20 lg:pb-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Character Identity */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Portrait Card */}
            <div className="bg-surface-container p-2 relative group">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary z-10 hidden lg:block"></div>
              <div className="bg-surface-container-highest p-4 border-4 border-primary shadow-[8px_8px_0_0_#1a063b] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-40"></div>
                <img 
                  src={getAvatarUrl()} 
                  alt={profile?.username || 'Hero'}
                  className="w-full aspect-square object-contain p-4 relative z-10 pixelated"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <h1 className="font-retro text-2xl text-primary drop-shadow-[2px_2px_0_#000]">
                    {profile?.username || 'alice'}
                  </h1>
                  <p className="font-retro text-[10px] text-secondary mt-2 tracking-widest uppercase">
                    MYTHIC MIND
                  </p>
                </div>
              </div>
            </div>

            {/* Attributes Grid */}
            <div className="bg-surface-container-low p-6 border-b-4 border-outline-variant shadow-[4px_4px_0_0_#1a063b]">
              <h3 className="font-retro text-[10px] text-tertiary mb-6 uppercase tracking-tighter">
                Attribute Matrix
              </h3>
              <div className="space-y-6">
                {/* Focus */}
                <div className="space-y-2">
                  <div className="flex justify-between font-retro text-[8px] uppercase">
                    <span>Focus</span>
                    <span className="text-secondary">LVL 82</span>
                  </div>
                  <div className="h-4 bg-surface-container-highest border-2 border-background flex">
                    <div className="h-full bg-secondary w-4/5 xp-segment shadow-[inset_0_0_8px_rgba(0,219,231,0.5)]"></div>
                  </div>
                </div>

                {/* Knowledge */}
                <div className="space-y-2">
                  <div className="flex justify-between font-retro text-[8px] uppercase">
                    <span>Knowledge</span>
                    <span className="text-primary">LVL 124</span>
                  </div>
                  <div className="h-4 bg-surface-container-highest border-2 border-background flex">
                    <div className="h-full bg-primary w-[92%] xp-segment shadow-[inset_0_0_8px_rgba(255,74,141,0.5)]"></div>
                  </div>
                </div>

                {/* Consistency */}
                <div className="space-y-2">
                  <div className="flex justify-between font-retro text-[8px] uppercase">
                    <span>Consistency</span>
                    <span className="text-tertiary">LVL 45</span>
                  </div>
                  <div className="h-4 bg-surface-container-highest border-2 border-background flex">
                    <div className="h-full bg-tertiary w-3/5 xp-segment shadow-[inset_0_0_8px_rgba(233,196,0,0.5)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & XP */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Level & XP Bar */}
            <div className="bg-surface-container p-8 border-b-4 border-primary-container relative overflow-hidden">
              <div className="flex justify-between items-end mb-6">
                <div className="flex flex-col">
                  <span className="font-retro text-[10px] text-secondary uppercase mb-1">
                    Global Progression
                  </span>
                  <span className="font-headline font-black text-6xl text-on-background italic tracking-tighter">
                    LVL {level}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-retro text-[10px] text-outline uppercase">
                    NEXT: {level + 1}
                  </span>
                </div>
              </div>

              {/* Main XP Bar */}
              <div className="relative h-10 bg-surface-container-highest border-4 border-background p-1">
                <div 
                  className="h-full bg-gradient-to-r from-primary-container to-primary xp-segment relative"
                  style={{ width: `${xpProgress}%` }}
                >
                  <div className="absolute right-0 top-0 h-full w-2 bg-white opacity-40 blur-[2px]"></div>
                </div>
              </div>

              <div className="mt-3 flex justify-between font-retro text-[8px] text-outline">
                <span>{xp.toLocaleString()} XP EARNED</span>
                <span>{xpRequired.toLocaleString()} XP REQUIRED</span>
              </div>
            </div>

            {/* Stats Grid - Bento Style */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-6 border-b-4 border-outline-variant group hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-secondary mb-3 text-3xl">schedule</span>
                <p className="font-retro text-[8px] text-outline uppercase mb-2">Study Time</p>
                <p className="font-headline font-bold text-3xl">
                  {studyTime.hours}h <span className="text-lg opacity-60">{studyTime.mins}m</span>
                </p>
              </div>

              <div className="bg-surface-container-low p-6 border-b-4 border-outline-variant group hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-primary mb-3 text-3xl">timer</span>
                <p className="font-retro text-[8px] text-outline uppercase mb-2">Sessions</p>
                <p className="font-headline font-bold text-3xl">
                  {profile?.total_sessions || 67}
                </p>
              </div>

              <div className="bg-surface-container-low p-6 border-b-4 border-outline-variant group hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-tertiary mb-3 text-3xl">local_fire_department</span>
                <p className="font-retro text-[8px] text-outline uppercase mb-2">Day Streak</p>
                <p className="font-headline font-bold text-3xl">
                  {profile?.current_streak || 1}
                </p>
              </div>

              <div className="bg-surface-container-low p-6 border-b-4 border-outline-variant group hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-secondary mb-3 text-3xl">stars</span>
                <p className="font-retro text-[8px] text-outline uppercase mb-2">Best Streak</p>
                <p className="font-headline font-bold text-3xl">
                  {profile?.longest_streak || 2}
                </p>
              </div>
            </div>

            {/* Achievements (Relic Gallery) */}
            <div className="bg-surface-container p-6">
              <h3 className="font-retro text-[10px] text-primary mb-6 uppercase tracking-widest border-b-2 border-outline-variant pb-2">
                Relic Gallery
              </h3>
              
              {/* Unlocked Relics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {unlockedRelics.map((relic) => (
                  <div 
                    key={relic.id} 
                    className="flex flex-col items-center bg-surface-container-lowest p-4 border-b-4 border-background group active:translate-y-1 active:border-b-0 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 mb-3 bg-surface-variant flex items-center justify-center p-2">
                      <span className={`material-symbols-outlined text-${relic.color} text-3xl`} style={{fontVariationSettings: "'FILL' 1"}}>
                        {relic.icon}
                      </span>
                    </div>
                    <span className="font-retro text-[8px] text-center uppercase leading-relaxed">
                      {relic.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Locked Slots */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 opacity-30">
                {lockedRelics.map((relic) => (
                  <div 
                    key={relic.id} 
                    className="flex flex-col items-center bg-surface-container-lowest p-4 border-b-4 border-background"
                  >
                    <div className="w-12 h-12 mb-3 bg-surface-variant flex items-center justify-center p-2">
                      <span className="material-symbols-outlined text-outline text-3xl">lock</span>
                    </div>
                    <span className="font-retro text-[8px] text-center uppercase leading-relaxed">
                      {relic.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavBar 
        items={navItems.filter(i => ['dashboard', 'tasks', 'timer', 'social'].includes(i.id))} 
        activeItem="profile"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />

      {/* Additional CSS */}
      <style>{`
        .pixelated {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .xp-segment {
          background-image: linear-gradient(90deg, transparent 0%, transparent 75%, #1a063b 75%, #1a063b 100%);
          background-size: 16px 100%;
        }
      `}</style>
    </div>
  );
};

export default Profile;
