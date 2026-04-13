import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { getUser } from '../utils/auth';
import { leaderboardAPI } from '../utils/api';

// Layout Components
import TopAppBar from '../components/layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../components/layout/SideNavBar';

// Social Components
import LeaderboardTable, { MVPSpotlight } from '../components/Social/LeaderboardTable';
import GuildPanel from '../components/Social/GuildPanel';
import FriendsList from '../components/Social/FriendsList';
import ChallengeCard, { CreateChallengeForm } from '../components/Social/ChallengeCard';

/**
 * SocialHub - Social features hub with Leaderboard, Guild, Friends, and Challenges
 * Main social interface for StudyQuest
 */
const SocialHub = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  
  // State
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [myRank, setMyRank] = useState(14);
  const [user, setUser] = useState(currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [joinedChallenges, setJoinedChallenges] = useState([]);

  // Navigation items - all links with categories
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

  // Tab configuration
  const tabs = [
    { id: 'leaderboard', label: 'LEADERBOARD', icon: 'emoji_events' },
    { id: 'guild', label: 'MY GUILD', icon: 'shield' },
    { id: 'friends', label: 'FRIENDS', icon: 'group' },
    { id: 'challenges', label: 'CHALLENGES', icon: 'flag' },
  ];

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
    // Poll every 60 seconds
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getLeaderboard({ limit: 10 });
      
      const leaderboardData = response.data?.leaderboard || getDefaultLeaderboard();
      setPlayers(leaderboardData);
      
      // Find user's rank
      const userEntry = leaderboardData.find(p => p.id === currentUser?.id);
      if (userEntry) {
        setMyRank(userEntry.rank);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setPlayers(getDefaultLeaderboard());
    } finally {
      setLoading(false);
    }
  };

  // Default leaderboard data
  const getDefaultLeaderboard = () => [
    { id: 1, rank: 1, name: 'VALKYRIE_STUDY', level: 99, power: 12840, specialty: 'MATH', status: 'online', weeklyXP: 2450, weeklySessions: 23 },
    { id: 2, rank: 2, name: 'CYBER_SCRIBE', level: 87, power: 11200, specialty: 'HISTORY', status: 'idle', weeklyXP: 2100, weeklySessions: 19 },
    { id: 3, rank: 3, name: 'VOID_WALKER', level: 82, power: 10500, specialty: 'SCIENCE', status: 'studying', weeklyXP: 1950, weeklySessions: 18 },
    { id: 4, rank: 4, name: 'PIXEL_MAGE', level: 78, power: 9800, specialty: 'MATH', status: 'online', weeklyXP: 1800, weeklySessions: 16 },
    { id: 5, rank: 5, name: 'STUDY_NINJA', level: 75, power: 9200, specialty: 'ENGLISH', status: 'offline', weeklyXP: 1650, weeklySessions: 15 },
    { id: 6, rank: 6, name: 'CODE_WARRIOR', level: 72, power: 8800, specialty: 'SCIENCE', status: 'online', weeklyXP: 1520, weeklySessions: 14 },
    { id: 7, rank: 7, name: 'BOOK_SAGE', level: 68, power: 8200, specialty: 'HISTORY', status: 'idle', weeklyXP: 1400, weeklySessions: 13 },
    { id: 8, rank: 8, name: 'MATH_PRODIGY', level: 65, power: 7800, specialty: 'MATH', status: 'studying', weeklyXP: 1280, weeklySessions: 12 },
    { id: 9, rank: 9, name: 'NIGHT_READER', level: 62, power: 7200, specialty: 'ENGLISH', status: 'offline', weeklyXP: 1150, weeklySessions: 11 },
    { id: 10, rank: 10, name: 'QUEST_HUNTER', level: 58, power: 6800, specialty: 'GENERAL', status: 'online', weeklyXP: 1000, weeklySessions: 10 },
  ];

  // MVP is rank 1
  const mvpPlayer = players[0];

  // Challenge data
  const challenges = [
    {
      id: 1,
      title: 'Weekend XP Boost',
      description: 'Earn as much XP as possible this weekend! Compete with friends for the top spot.',
      type: 'xp',
      goal: 2000,
      current: joinedChallenges.includes(1) ? 1200 : 0,
      reward: 500,
      timeRemaining: '2 DAYS',
      participantCount: 145,
      difficulty: 'MEDIUM',
      banner: 'gold',
    },
    {
      id: 2,
      title: 'Study Streak Challenge',
      description: 'Maintain a 7-day study streak. No breaks allowed!',
      type: 'streak',
      goal: 7,
      current: joinedChallenges.includes(2) ? 5 : 0,
      reward: 1000,
      timeRemaining: '5 DAYS',
      participantCount: 89,
      difficulty: 'HARD',
      banner: 'fire',
    },
    {
      id: 3,
      title: 'Focus Marathon',
      description: 'Complete 10 hours of focused study time this week.',
      type: 'time',
      goal: 600,
      current: joinedChallenges.includes(3) ? 420 : 0,
      reward: 750,
      timeRemaining: '4 DAYS',
      participantCount: 234,
      difficulty: 'ELITE',
      banner: 'ice',
    },
    {
      id: 4,
      title: 'Math Masters',
      description: 'Complete 20 math problems with 90% accuracy.',
      type: 'xp',
      goal: 500,
      current: joinedChallenges.includes(4) ? 0 : 0,
      reward: 300,
      timeRemaining: '1 WEEK',
      participantCount: 67,
      difficulty: 'EASY',
      banner: 'default',
    },
  ];

  // Handle join challenge
  const handleJoinChallenge = (challenge) => {
    setJoinedChallenges(prev => [...prev, challenge.id]);
  };

  // Handle create challenge
  const handleCreateChallenge = (formData) => {
    console.log('Creating challenge:', formData);
    setShowCreateChallenge(false);
  };

  // Handle add friend
  const handleAddFriend = (username) => {
    console.log('Adding friend:', username);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return (
          <div className="space-y-6">
            {/* MVP Spotlight */}
            <MVPSpotlight player={mvpPlayer} />
            
            {/* Leaderboard Table */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <LeaderboardTable players={players} myRank={myRank} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                {/* Additional sidebar content can go here */}
                <div className="bg-surface-container border-2 border-outline-variant p-4">
                  <h3 className="font-['Press_Start_2P'] text-[10px] text-secondary mb-4">
                    WEEKLY STATS
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-on-surface-variant">Total Heroes</span>
                      <span className="font-['Press_Start_2P'] text-[10px] text-on-surface">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-on-surface-variant">XP Earned (All)</span>
                      <span className="font-['Press_Start_2P'] text-[10px] text-tertiary">892K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-on-surface-variant">Study Sessions</span>
                      <span className="font-['Press_Start_2P'] text-[10px] text-secondary">5,431</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'guild':
        return <GuildPanel />;

      case 'friends':
        return (
          <FriendsList 
            onAddFriend={handleAddFriend}
            onInviteToStudy={(friendId) => navigate('/timer', { state: { inviteFriend: friendId } })}
          />
        );

      case 'challenges':
        return (
          <div className="space-y-6">
            {/* Create Challenge Button */}
            {!showCreateChallenge && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateChallenge(true)}
                  className="px-4 py-3 bg-primary-container text-on-primary-container font-['Press_Start_2P'] text-[10px] border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all hover:brightness-110 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">add</span>
                  CREATE CHALLENGE
                </button>
              </div>
            )}

            {/* Create Challenge Form */}
            {showCreateChallenge && (
              <CreateChallengeForm 
                onSubmit={handleCreateChallenge}
                onCancel={() => setShowCreateChallenge(false)}
              />
            )}

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isJoined={joinedChallenges.includes(challenge.id)}
                  onJoin={handleJoinChallenge}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <TopAppBar title="SOCIAL HUB" user={currentUser} onMenuClick={() => setMobileMenuOpen(true)} />
        
        {/* Side Navigation */}
        <SideNavBar 
          items={navItems} 
          user={user}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activeItem="social"
          onItemClick={(id) => {
            const item = navItems.find(n => n.id === id);
            if (item && item.href) navigate(item.href);
          }}
        />
        
        <main className="lg:ml-64 pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-surface-container w-full" />
              <div className="h-64 bg-surface-container w-full" />
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
        title="SOCIAL HUB" 
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation - Desktop Sidebar */}
      <SideNavBar 
        items={navItems} 
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeItem="social"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item && item.href) {
            navigate(item.href);
          }
        }}
      />

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 px-4 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-['Press_Start_2P'] text-xl text-primary mb-1">SOCIAL HUB</h1>
            <p className="font-body text-sm text-on-surface-variant">
              Compete, collaborate, and conquer together
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-outline-variant pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 font-['Press_Start_2P'] text-[10px] uppercase transition-all",
                  "border-b-4 active:translate-y-1 active:border-b-0",
                  activeTab === tab.id
                    ? "bg-primary text-on-primary border-on-primary-fixed-variant"
                    : "bg-surface-container text-on-surface-variant border-surface-container-high hover:text-primary"
                )}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavBar 
        items={navItems.filter(i => ['dashboard', 'tasks', 'timer', 'social'].includes(i.id))} 
        activeItem="social"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />
    </div>
  );
};

export default SocialHub;
