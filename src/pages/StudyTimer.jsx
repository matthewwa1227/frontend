import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { getUser } from '../utils/auth';

// Layout Components
import TopAppBar from '../components/layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../components/layout/SideNavBar';

// Study Timer Components
import BattleBuffs from '../components/StudyTimer/BattleBuffs';
import BossArena from '../components/StudyTimer/BossArena';
import CombatLog, { generateInitialLog, generateCombatEvents } from '../components/StudyTimer/CombatLog';

// Custom Hooks
import { useStudySession } from '../hooks/useStudySession';

/**
 * StudyTimer - Chamber of Focus (Boss Battle Arena)
 * 3-Column gamified Pomodoro timer where students battle the Shadow of Doom
 */
const StudyTimer = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  
  // Combat log state
  const [logEntries, setLogEntries] = useState([]);
  const [activeSubject, setActiveSubject] = useState('DSE_MATH');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFleeModal, setShowFleeModal] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);

  // Study session hook
  const {
    formattedTime,
    timeRemaining,
    status,
    elapsedTime,
    bossHP,
    bossHPPercent,
    xpEarned,
    stamina,
    focus,
    isRunning,
    isPaused,
    isIdle,
    isVictory,
    isDefeat,
    isComplete,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    fleeSession,
    resetSession,
  } = useStudySession(1500); // 25 minutes

  // Navigation items
  const navItems = [
    { id: 'study', label: 'STUDY', icon: 'menu_book', href: '/timer', active: true },
    { id: 'tasks', label: 'TASKS', icon: 'checklist', href: '/tasks', badge: '3' },
    { id: 'ai-tutor', label: 'AI TUTOR', icon: 'smart_toy', href: '/study-buddy' },
    { id: 'social', label: 'SOCIAL', icon: 'groups', href: '/social' },
  ];

  // Add log entry helper
  const addLogEntry = useCallback((text, type = 'system') => {
    const newEntry = {
      id: Date.now(),
      timestamp: Date.now(),
      text,
      type,
    };
    setLogEntries(prev => [...prev.slice(-49), newEntry]); // Keep last 50 entries
  }, []);

  // Handle session start
  const handleStart = useCallback(async () => {
    if (isIdle) {
      // Starting new session
      const subjectNames = {
        DSE_MATH: 'DSE Mathematics',
        ENGLISH_LANG: 'English Language',
        DSE_PHYSICS: 'DSE Physics',
        DSE_CHEM: 'DSE Chemistry',
        DSE_BIO: 'DSE Biology',
      };
      
      const result = await startSession(subjectNames[activeSubject] || 'General');
      
      if (result.success) {
        setLogEntries(generateInitialLog());
        addLogEntry(`Subject: ${subjectNames[activeSubject]} selected. Buff active!`, 'buff');
      }
    } else if (isPaused) {
      // Resuming session
      resumeSession();
      addLogEntry('Battle resumed! Your focus returns!', 'player');
    }
  }, [isIdle, isPaused, activeSubject, startSession, resumeSession, addLogEntry]);

  // Handle session pause
  const handlePause = useCallback(() => {
    if (isRunning) {
      pauseSession();
      addLogEntry('You take a moment to rest...', 'system');
    }
  }, [isRunning, pauseSession, addLogEntry]);

  // Handle flee attempt
  const handleFleeClick = useCallback(() => {
    if (!isIdle) {
      setShowFleeModal(true);
    }
  }, [isIdle]);

  // Confirm flee
  const confirmFlee = useCallback(async () => {
    const result = await fleeSession();
    setShowFleeModal(false);
    
    if (result.success) {
      addLogEntry('You fled the battle! The Shadow grows stronger...', 'boss');
      setSessionStats(result);
      setShowVictoryModal(true);
    }
  }, [fleeSession, addLogEntry]);

  // Handle victory
  useEffect(() => {
    if (isVictory && !showVictoryModal) {
      const stats = {
        xpEarned,
        duration: Math.floor(elapsedTime / 60),
        completed: true,
        bossHPRemaining: bossHP,
      };
      setSessionStats(stats);
      setShowVictoryModal(true);
      addLogEntry('VICTORY! The Shadow of Doom is banished!', 'reward');
      addLogEntry(`You earned ${xpEarned} XP!`, 'reward');
    }
  }, [isVictory, xpEarned, elapsedTime, bossHP, showVictoryModal, addLogEntry]);

  // Periodic combat events
  useEffect(() => {
    if (isRunning) {
      const elapsedMinutes = Math.floor(elapsedTime / 60);
      const events = generateCombatEvents(elapsedMinutes, xpEarned);
      
      events.forEach(event => {
        // Check if this event was already logged
        const exists = logEntries.some(e => e.id === event.id);
        if (!exists) {
          addLogEntry(event.text, event.type);
        }
      });
    }
  }, [isRunning, elapsedTime, xpEarned, logEntries, addLogEntry]);

  // Current action indicator
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        // Remove previous current entries
        setLogEntries(prev => prev.filter(e => e.type !== 'current'));
        
        // Add new current entry
        const actions = [
          'Concentrating...',
          'Deep in thought...',
          'Knowledge flowing...',
          'Mind sharpening...',
          'Focus intensifying...',
        ];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        setLogEntries(prev => [...prev, {
          id: `current-${Date.now()}`,
          text: randomAction,
          type: 'current',
        }]);
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  // Close victory modal and reset
  const handleVictoryClose = useCallback(() => {
    setShowVictoryModal(false);
    resetSession();
    setLogEntries([]);
  }, [resetSession]);

  // Continue to dashboard after victory
  const handleContinue = useCallback(() => {
    setShowVictoryModal(false);
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopAppBar 
        title="CHAMBER OF FOCUS" 
        user={currentUser}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation (Desktop) */}
      <SideNavBar 
        items={navItems} 
        user={currentUser}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content - 3 Column Layout */}
      <main className="md:ml-64 pt-20 px-4 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* 12-Column Grid */}
          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column: Battle Buffs (25%) */}
            <section className="col-span-12 lg:col-span-3 order-2 lg:order-1">
              <BattleBuffs 
                activeSubject={activeSubject}
                onSubjectChange={setActiveSubject}
              />
            </section>

            {/* Center Column: Boss Arena (50%) */}
            <section className="col-span-12 lg:col-span-6 order-1 lg:order-2">
              <BossArena
                formattedTime={formattedTime}
                timeRemaining={timeRemaining}
                bossHPPercent={bossHPPercent}
                stamina={stamina}
                focus={focus}
                level={currentUser?.level || 42}
                status={status}
                onStart={handleStart}
                onPause={handlePause}
                onFlee={handleFleeClick}
              />
            </section>

            {/* Right Column: Combat Log (25%) */}
            <section className="col-span-12 lg:col-span-3 order-3">
              <CombatLog entries={logEntries} />
            </section>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavBar 
        items={navItems} 
        activeItem="study"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />

      {/* Flee Confirmation Modal */}
      {showFleeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-surface-container border-2 border-error p-6 max-w-md w-full shadow-[8px_8px_0px_0px_#690005]">
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-6xl text-error mb-4">warning</span>
              <h2 className="font-['Press_Start_2P'] text-xl text-error mb-2">FLEE BATTLE?</h2>
              <p className="font-body text-on-surface-variant">
                Fleeing now will forfeit all progress and XP earned. The Shadow of Doom will grow stronger!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowFleeModal(false)}
                className="py-3 bg-surface-container-high text-on-surface font-['Press_Start_2P'] text-[10px] border-b-4 border-surface-container-highest active:translate-y-1 active:border-b-0 transition-all"
              >
                STAY AND FIGHT
              </button>
              <button
                onClick={confirmFlee}
                className="py-3 bg-error text-on-error font-['Press_Start_2P'] text-[10px] border-b-4 border-error-container active:translate-y-1 active:border-b-0 transition-all"
              >
                FLEE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory/Defeat Modal */}
      {showVictoryModal && sessionStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className={cn(
            "bg-surface-container border-2 p-6 max-w-md w-full",
            sessionStats.completed ? "border-primary shadow-[8px_8px_0px_0px_#65002e]" : "border-error shadow-[8px_8px_0px_0px_#690005]"
          )}>
            <div className="text-center mb-6">
              <span className={cn(
                "material-symbols-outlined text-6xl mb-4",
                sessionStats.completed ? "text-primary" : "text-error"
              )} style={{fontVariationSettings: "'FILL' 1"}}>
                {sessionStats.completed ? 'emoji_events' : 'skull'}
              </span>
              <h2 className={cn(
                "font-['Press_Start_2P'] text-2xl mb-2",
                sessionStats.completed ? "text-primary" : "text-error"
              )}>
                {sessionStats.completed ? 'VICTORY!' : 'DEFEAT...'}
              </h2>
              <p className="font-body text-on-surface-variant">
                {sessionStats.completed 
                  ? 'You have conquered the Shadow of Doom and proven your focus!' 
                  : 'The Shadow was too strong this time. Rest and try again!'}
              </p>
            </div>

            {/* Stats */}
            <div className="bg-surface-container-high p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant">TIME FOCUSED</span>
                <span className="font-['Press_Start_2P'] text-[10px] text-secondary">{sessionStats.duration} MIN</span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant">XP EARNED</span>
                <span className="font-['Press_Start_2P'] text-[10px] text-tertiary">+{sessionStats.xpEarned}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant">BOSS HP LEFT</span>
                <span className="font-['Press_Start_2P'] text-[10px] text-primary">{sessionStats.bossHPRemaining}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleVictoryClose}
                className="py-3 bg-surface-container-high text-on-surface font-['Press_Start_2P'] text-[10px] border-b-4 border-surface-container-highest active:translate-y-1 active:border-b-0 transition-all"
              >
                NEW BATTLE
              </button>
              <button
                onClick={handleContinue}
                className="py-3 bg-primary-container text-on-primary-container font-['Press_Start_2P'] text-[10px] border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
