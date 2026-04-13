import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { getUser } from '../utils/auth';
import { taskAPI } from '../utils/api';

// Layout Components
import TopAppBar from '../components/layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../components/layout/SideNavBar';

// Quest Log Components
import QuestCard from '../components/questlog/QuestCard';
import QuestFilters, { SubjectFilter } from '../components/questlog/QuestFilters';
import AddQuestModal from '../components/questlog/AddQuestModal';
import HeroStatusSidebar from '../components/questlog/HeroStatusSidebar';

/**
 * QuestLog - Task management page with RPG quest styling
 * Shows active quests, daily bounties, and completed quests
 */
const QuestLog = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  
  // State
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeSubject, setActiveSubject] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(currentUser);

  // Navigation items - all links from Navbar.jsx
  const navItems = [
    // Main Navigation
    { id: 'dashboard', label: 'DASHBOARD', icon: 'target', href: '/dashboard', category: 'main' },
    { id: 'tasks', label: 'QUEST LOG', icon: 'checklist', href: '/tasks', category: 'main', badge: '3' },
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
  ];

  // Fetch quests on mount
  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAll();
      
      // Transform backend data to quest format
      const transformedQuests = response.data?.tasks?.map(transformTaskToQuest) || getDefaultQuests();
      setQuests(transformedQuests);
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      // Use default quests for demo
      setQuests(getDefaultQuests());
    } finally {
      setLoading(false);
    }
  };

  // Transform backend task to quest format
  const transformTaskToQuest = (task) => ({
    id: task.id,
    title: task.title || task.name,
    description: task.description || '',
    subject: task.subject || 'GENERAL',
    rarity: calculateRarity(task.xp_reward || 100),
    status: task.completed ? 'COMPLETED' : task.in_progress ? 'IN_PROGRESS' : 'READY',
    progress: { 
      current: task.progress || (task.completed ? 1 : 0), 
      total: task.total || 1 
    },
    xpReward: task.xp_reward || 100,
    estimatedMinutes: task.estimated_minutes || 30,
    difficulty: task.difficulty || 'MEDIUM',
    icon: task.icon || 'scroll',
    isDaily: task.is_daily || false,
    createdAt: task.created_at,
  });

  // Calculate rarity based on XP
  const calculateRarity = (xp) => {
    if (xp >= 200) return 'LEGENDARY';
    if (xp >= 150) return 'EPIC';
    if (xp >= 100) return 'RARE';
    if (xp >= 50) return 'UNCOMMON';
    return 'COMMON';
  };

  // Default quests for demo
  const getDefaultQuests = () => [
    {
      id: 1,
      title: 'Master Quadratic Equations',
      description: 'Complete 10 problems from Chapter 4, focusing on factoring methods',
      subject: 'MATH',
      rarity: 'RARE',
      status: 'IN_PROGRESS',
      progress: { current: 3, total: 5 },
      xpReward: 200,
      estimatedMinutes: 45,
      difficulty: 'MEDIUM',
      icon: 'calculate',
      isDaily: false,
    },
    {
      id: 2,
      title: 'Read Macbeth Act 2',
      description: 'Read and annotate Act 2, Scene 1-3 with character analysis',
      subject: 'ENGLISH',
      rarity: 'UNCOMMON',
      status: 'READY',
      progress: { current: 0, total: 1 },
      xpReward: 150,
      estimatedMinutes: 30,
      difficulty: 'MEDIUM',
      icon: 'menu_book',
      isDaily: false,
    },
    {
      id: 3,
      title: 'Physics Lab Report',
      description: 'Write up the pendulum experiment results and analysis',
      subject: 'SCIENCE',
      rarity: 'EPIC',
      status: 'READY',
      progress: { current: 0, total: 1 },
      xpReward: 300,
      estimatedMinutes: 60,
      difficulty: 'HARD',
      icon: 'science',
      isDaily: false,
    },
    {
      id: 4,
      title: 'Login Streak',
      description: 'Log in to StudyQuest today',
      subject: 'GENERAL',
      rarity: 'COMMON',
      status: 'COMPLETED',
      progress: { current: 1, total: 1 },
      xpReward: 10,
      estimatedMinutes: 1,
      difficulty: 'EASY',
      icon: 'login',
      isDaily: true,
    },
    {
      id: 5,
      title: 'Focus Fire Session',
      description: 'Complete a 15-minute Pomodoro session in Chamber of Focus',
      subject: 'GENERAL',
      rarity: 'UNCOMMON',
      status: 'READY',
      progress: { current: 0, total: 1 },
      xpReward: 50,
      estimatedMinutes: 15,
      difficulty: 'EASY',
      icon: 'timer',
      isDaily: true,
    },
    {
      id: 6,
      title: 'Master 5 Math Problems',
      description: 'Solve any 5 math problems correctly',
      subject: 'MATH',
      rarity: 'RARE',
      status: 'CLAIMED',
      progress: { current: 5, total: 5 },
      xpReward: 100,
      estimatedMinutes: 25,
      difficulty: 'MEDIUM',
      icon: 'calculate',
      isDaily: true,
    },
  ];

  // Filter and sort quests
  const filteredQuests = useMemo(() => {
    let result = [...quests];

    // Filter by tab
    if (activeTab === 'ACTIVE') {
      result = result.filter(q => q.status === 'READY' || q.status === 'IN_PROGRESS');
    } else if (activeTab === 'DAILY') {
      result = result.filter(q => q.isDaily);
    } else if (activeTab === 'COMPLETED') {
      result = result.filter(q => q.status === 'COMPLETED' || q.status === 'CLAIMED');
    }

    // Filter by category
    if (activeFilter !== 'ALL') {
      const filterMap = {
        'STUDY': ['MATH', 'ENGLISH', 'SCIENCE', 'HISTORY'],
        'ASSIGNMENTS': ['HOMEWORK', 'PROJECT'],
        'CHALLENGES': ['CHALLENGE'],
      };
      const allowedSubjects = filterMap[activeFilter] || [];
      if (allowedSubjects.length > 0) {
        result = result.filter(q => allowedSubjects.includes(q.subject));
      }
    }

    // Filter by subject
    if (activeSubject !== 'ALL') {
      result = result.filter(q => q.subject === activeSubject);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'NEWEST':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'OLDEST':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'XP_HIGH':
          return b.xpReward - a.xpReward;
        case 'XP_LOW':
          return a.xpReward - b.xpReward;
        default:
          return 0;
      }
    });

    return result;
  }, [quests, activeTab, activeFilter, activeSubject, sortBy]);

  // Group quests for display
  const activeQuests = filteredQuests.filter(q => !q.isDaily && (q.status === 'READY' || q.status === 'IN_PROGRESS'));
  const dailyQuests = filteredQuests.filter(q => q.isDaily);
  const completedQuests = filteredQuests.filter(q => q.status === 'COMPLETED' || q.status === 'CLAIMED');

  // Handle quest click
  const handleQuestClick = (quest) => {
    // Navigate to StudyTimer with quest context
    navigate('/timer', { state: { selectedQuest: quest } });
  };

  // Handle add quest
  const handleAddQuest = async (questData) => {
    try {
      // Create quest via API
      const response = await taskAPI.create({
        title: questData.title,
        description: questData.description,
        subject: questData.subject,
        difficulty: questData.difficulty,
        estimated_minutes: questData.estimatedMinutes,
        xp_reward: questData.xpReward,
      });

      // Add new quest to list
      const newQuest = transformTaskToQuest(response.data?.task || { ...questData, id: Date.now() });
      setQuests(prev => [newQuest, ...prev]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create quest:', error);
      // Add locally for demo
      const newQuest = { ...questData, id: Date.now(), status: 'READY', progress: { current: 0, total: 1 } };
      setQuests(prev => [newQuest, ...prev]);
      setShowAddModal(false);
    }
  };

  // Handle complete quest
  const handleCompleteQuest = async (quest) => {
    try {
      await taskAPI.toggle(quest.id);
      // Update local state
      setQuests(prev => prev.map(q => 
        q.id === quest.id 
          ? { ...q, status: 'COMPLETED', progress: { current: 1, total: 1 } }
          : q
      ));
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const completed = quests.filter(q => q.status === 'COMPLETED' || q.status === 'CLAIMED').length;
    const xpEarned = quests
      .filter(q => q.status === 'COMPLETED' || q.status === 'CLAIMED')
      .reduce((sum, q) => sum + q.xpReward, 0);
    return { completed, total: 50, xpEarned };
  }, [quests]);

  // Daily reset countdown (static for now)
  const dailyResetTime = "14H 22M";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar title="QUEST LOG" user={currentUser} />
        <main className="md:ml-64 pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-surface-container w-48" />
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-surface-container" />
                  ))}
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <div className="h-64 bg-surface-container" />
                </div>
              </div>
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
        title="QUEST LOG" 
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation */}
      <SideNavBar 
        items={navItems} 
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeItem="tasks"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item && item.href) {
            navigate(item.href);
          }
        }}
      />

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-4 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-['Press_Start_2P'] text-xl text-primary mb-1">QUEST LOG</h1>
              <p className="font-body text-sm text-on-surface-variant">
                Manage your study missions and track progress
              </p>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-primary-container text-on-primary-container
                         font-['Press_Start_2P'] text-[10px] border-b-4 border-on-primary-fixed-variant
                         active:translate-y-1 active:border-b-0 transition-all hover:brightness-110"
            >
              <span className="material-symbols-outlined">add</span>
              ADD QUEST
            </button>
          </div>

          {/* Filters */}
          <QuestFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            className="mb-6"
          />

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Quest Lists */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Active Quests */}
              {(activeTab === 'ACTIVE' || activeTab === 'ALL') && activeQuests.length > 0 && (
                <section>
                  <h2 className="font-['Press_Start_2P'] text-[10px] text-secondary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">swords</span>
                    ACTIVE QUESTS ({activeQuests.length})
                  </h2>
                  <div className="space-y-3">
                    {activeQuests.map(quest => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onClick={handleQuestClick}
                        onComplete={handleCompleteQuest}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Daily Bounties */}
              {(activeTab === 'DAILY' || activeTab === 'ALL') && dailyQuests.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-['Press_Start_2P'] text-[10px] text-tertiary flex items-center gap-2">
                      <span className="material-symbols-outlined">schedule</span>
                      DAILY BOUNTIES
                    </h2>
                    <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">
                      RESET IN {dailyResetTime}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dailyQuests.map(quest => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onClick={handleQuestClick}
                        onComplete={handleCompleteQuest}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Quests */}
              {(activeTab === 'COMPLETED' || activeTab === 'ALL') && completedQuests.length > 0 && (
                <section>
                  <h2 className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">inventory</span>
                    COMPLETED ({completedQuests.length})
                  </h2>
                  <div className="space-y-3">
                    {completedQuests.map(quest => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onClick={handleQuestClick}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {filteredQuests.length === 0 && (
                <div className="text-center py-12 bg-surface-container border-2 border-outline-variant border-dashed">
                  <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">scroll</span>
                  <h3 className="font-['Press_Start_2P'] text-sm text-on-surface-variant mb-2">
                    NO QUESTS AVAILABLE
                  </h3>
                  <p className="font-body text-sm text-on-surface-variant mb-4">
                    Summon your first quest to begin your adventure!
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-primary text-on-primary font-['Press_Start_2P'] text-[10px]
                               border-b-4 border-on-primary-fixed-variant
                               active:translate-y-1 active:border-b-0 transition-all"
                  >
                    SUMMON QUEST
                  </button>
                </div>
              )}

              {/* All Completed Celebration */}
              {activeTab === 'ACTIVE' && activeQuests.length === 0 && dailyQuests.filter(q => !q.isCompleted).length === 0 && (
                <div className="text-center py-8 bg-tertiary/10 border-2 border-tertiary">
                  <span className="material-symbols-outlined text-4xl text-tertiary mb-2">emoji_events</span>
                  <h3 className="font-['Press_Start_2P'] text-sm text-tertiary">
                    ALL QUESTS CLEARED!
                  </h3>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Subject Filter */}
              <SubjectFilter
                activeSubject={activeSubject}
                onSubjectChange={setActiveSubject}
              />

              {/* Hero Status */}
              <HeroStatusSidebar
                user={user}
                weeklyStats={weeklyStats}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavBar 
        items={navItems} 
        activeItem="tasks"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />

      {/* Add Quest Modal */}
      <AddQuestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddQuest}
      />
    </div>
  );
};

export default QuestLog;
