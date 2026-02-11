import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, Award, BookOpen, Zap } from 'lucide-react';
import { sessionAPI, achievementAPI } from '../../utils/api';

const StudyTimer = () => {
  // Timer states
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [sessionId, setSessionId] = useState(null);
  
  // Session data
  const [subject, setSubject] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(25);
  
  // UI states
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [error, setError] = useState(null);
  
  // Achievement states
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  
  // Refs for preventing race conditions
  const intervalRef = useRef(null);
  const isEndingSession = useRef(false);
  const sessionIdRef = useRef(null);

  // Keep sessionIdRef in sync with sessionId state
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Common study durations (in minutes)
  const durations = [15, 25, 30, 45, 60, 90, 120];

  // Subjects list
  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Other'
  ];

  // Auto-Recovery with auto-cleanup of old sessions
  useEffect(() => {
    const checkAndRecoverActiveSession = async () => {
      try {
        const response = await sessionAPI.getActiveSession();
        
        if (response.data.hasActiveSession && response.data.session) {
          const activeSession = response.data.session;
          const elapsedMinutes = activeSession.currentDuration || 0;
          
          // Auto-end sessions older than 3 hours (180 minutes)
          if (elapsedMinutes > 180) {
            console.log('🗑️ Auto-ending old session (too old):', elapsedMinutes, 'minutes');
            await sessionAPI.endSession(activeSession.id, {
              duration: Math.floor(elapsedMinutes * 60)
            });
            return; 
          }
          
          const elapsedSeconds = Math.floor(elapsedMinutes * 60);
          
          if (activeSession.id && elapsedMinutes > 0) {
            const shouldContinue = window.confirm(
              `📚 Active Session Found!\n\n` +
              `Subject: ${activeSession.subject}\n` +
              `Time Elapsed: ${Math.floor(elapsedMinutes)} minutes ${Math.floor(elapsedSeconds % 60)} seconds\n\n` +
              `Do you want to continue this session?\n` +
              `(Click Cancel to end it)`
            );
            
            if (shouldContinue) {
              setSessionId(activeSession.id);
              setSubject(activeSession.subject);
              setIsActive(true);
              setIsPaused(false);
              
              const originalDuration = activeSession.topic ? parseInt(activeSession.topic) : 25;
              const totalSeconds = originalDuration * 60;
              const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
              
              setTotalTime(totalSeconds);
              setTimeRemaining(remainingSeconds);
              setSelectedDuration(originalDuration);
              
              console.log('✅ Session recovered');
            } else {
              await sessionAPI.endSession(activeSession.id, {
                duration: Math.floor(elapsedSeconds)
              });
              
              console.log('🗑️ Abandoned session ended');
            }
          }
        }
      } catch (error) {
        console.error('❌ Failed to check active session:', error);
      }
    };

    checkAndRecoverActiveSession();
  }, []);

  // Timer Ticker: Handles the countdown interval
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          return prevTime > 0 ? prevTime - 1 : 0;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  // Timer Watcher: Handles completion when time hits 0
  useEffect(() => {
    if (timeRemaining === 0 && isActive && !isPaused && sessionIdRef.current && !isEndingSession.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      handleTimerComplete();
    }
  }, [timeRemaining, isActive, isPaused]);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgress = () => {
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  // Calculate estimated XP (1 XP per 10 seconds)
  const getEstimatedXP = () => {
    const secondsStudied = totalTime - timeRemaining;
    return Math.floor(secondsStudied / 10);
  };

  // Check for achievements
  const handleAchievementCheck = async () => {
    try {
      const response = await achievementAPI.checkAchievements();
      if (response.data.newly_unlocked?.length > 0) {
        setUnlockedAchievements(response.data.newly_unlocked);
        console.log('🎉 New achievements unlocked:', response.data.newly_unlocked);
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  };

  // Start session
  const handleStartSession = async () => {
    if (!subject.trim()) {
      setError('Please select a subject');
      return;
    }

    try {
      setError(null);
      
      const response = await sessionAPI.startSession({ 
        subject,
        topic: selectedDuration.toString() 
      });
      
      const newSessionId = response.data.session.id;
      setSessionId(newSessionId);
      sessionIdRef.current = newSessionId;
      setIsActive(true);
      setIsPaused(false);
      setTimeRemaining(selectedDuration * 60);
      setTotalTime(selectedDuration * 60);
      setShowStartModal(false);
      isEndingSession.current = false;

      console.log('✅ Session started:', response.data);
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      setError(error.response?.data?.message || 'Failed to start session');
    }
  };

  // Pause/Resume session
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  // End session manually
  const handleEndSession = async () => {
    const currentSessionId = sessionIdRef.current;
    
    if (!currentSessionId) {
      console.log('⚠️ No session to end');
      return;
    }
    
    if (isEndingSession.current) {
      console.log('⚠️ Already ending session, skipping');
      return;
    }
    
    isEndingSession.current = true;

    try {
      const durationSeconds = totalTime - timeRemaining;
      
      if (durationSeconds < 10) {
        const shouldForceEnd = window.confirm(
          '⚠️ Session Too Short!\n\n' +
          'You need to study for at least 10 seconds to earn XP.\n\n' +
          'Do you want to cancel this session?\n' +
          '(No XP will be awarded)'
        );
        
        if (!shouldForceEnd) {
          isEndingSession.current = false;
          return; 
        }
        
        console.log('🗑️ Cancelling short session:', currentSessionId);
        await sessionAPI.endSession(currentSessionId, { duration: 0 });
        resetTimer();
        return;
      }
      
      console.log('🏁 Ending session manually:', currentSessionId, 'duration:', durationSeconds, 'seconds');
      const response = await sessionAPI.endSession(currentSessionId, { duration: durationSeconds });
      
      setSessionSummary({
        duration: durationSeconds,
        durationFormatted: formatDurationDisplay(durationSeconds),
        xp_earned: response.data.session.xp_earned,
        subject: response.data.session.subject
      });
      
      await handleAchievementCheck();
      
      setShowEndModal(true);
      resetTimer();

      console.log('✅ Session ended:', response.data);
    } catch (error) {
      console.error('❌ Failed to end session:', error);
      
      if (error.response?.status === 404) {
        console.log('⚠️ Session already ended on server, resetting UI');
        resetTimer();
        setError('Session was already ended. UI has been reset.');
      } else {
        setError(error.response?.data?.message || 'Failed to end session');
      }
    } finally {
      isEndingSession.current = false;
    }
  };

  // Timer completed automatically
  const handleTimerComplete = async () => {
    const currentSessionId = sessionIdRef.current;
    
    if (!currentSessionId) {
      console.log('⚠️ handleTimerComplete - no session ID');
      return;
    }
    
    if (isEndingSession.current) {
      console.log('⚠️ handleTimerComplete - already ending session');
      return;
    }
    
    isEndingSession.current = true;
    console.log('🎯 Timer complete, ending session:', currentSessionId);

    try {
      setIsActive(false);
      
      const durationSeconds = totalTime;
      
      console.log('🏁 Auto-ending session:', currentSessionId, 'duration:', durationSeconds, 'seconds');
      const response = await sessionAPI.endSession(currentSessionId, { duration: durationSeconds });
      
      setSessionSummary({
        duration: durationSeconds,
        durationFormatted: formatDurationDisplay(durationSeconds),
        xp_earned: response.data.session.xp_earned,
        subject: response.data.session.subject,
        completed: true
      });
      
      await handleAchievementCheck();
      
      setShowEndModal(true);
      resetTimer();

      console.log('🎉 Session completed successfully!');
    } catch (error) {
      console.error('❌ Failed to complete session:', error);
      
      if (error.response?.status === 404) {
        console.log('⚠️ Session already ended on server, resetting UI');
        resetTimer();
      } else {
        setError(error.response?.data?.message || 'Failed to complete session');
      }
    } finally {
      isEndingSession.current = false;
    }
  };

  // Format duration for display (seconds to readable format)
  const formatDurationDisplay = (seconds) => {
    if (seconds < 60) {
      return `${seconds} sec`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
    }
  };

  // Reset timer
  const resetTimer = () => {
    console.log('🔄 Resetting timer');
    setIsActive(false);
    setIsPaused(false);
    setSessionId(null);
    sessionIdRef.current = null;
    setTimeRemaining(selectedDuration * 60);
    setTotalTime(selectedDuration * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Close end modal and reset
  const handleCloseEndModal = () => {
    setShowEndModal(false);
    setSessionSummary(null);
    setUnlockedAchievements([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-pixel-bg p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-pixel text-white mb-2 pixel-text-shadow">
            Study Timer
          </h1>
          <p className="text-sm font-pixel text-gray-400">
            Focus • Study • Earn XP!
          </p>
        </div>

        {/* Main Timer Card */}
        <div className="bg-pixel-dark border-4 border-pixel-accent shadow-pixel p-6 sm:p-8 mb-6">
          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              {/* Progress Bar Background */}
              <div className="w-72 h-72 border-8 border-gray-700 bg-gray-800 flex items-center justify-center relative overflow-hidden">
                {/* Progress Bar Fill */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-pixel-gold transition-all duration-1000"
                  style={{ height: `${getProgress()}%` }}
                />
                
                {/* Time Display */}
                <div className="relative z-10 text-center">
                  <div className="text-5xl sm:text-6xl font-pixel text-white pixel-text-shadow mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  {isActive && (
                    <div className="text-xs font-pixel text-pixel-gold">
                      {isPaused ? '⏸ PAUSED' : '▶ IN PROGRESS'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Session Info */}
          {isActive && (
            <div className="bg-gray-800 border-2 border-pixel-accent p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-pixel-gold" />
                  <span className="font-pixel text-white text-sm">{subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pixel-gold" />
                  <span className="font-pixel text-white text-sm">
                    ~{getEstimatedXP()} XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!isActive ? (
              <button
                onClick={() => setShowStartModal(true)}
                className="flex items-center justify-center gap-2 bg-pixel-gold hover:bg-yellow-500 text-pixel-dark px-6 py-4 border-4 border-white shadow-pixel font-pixel transition-all hover:-translate-y-1"
              >
                <Play className="w-5 h-5" />
                <span>START SESSION</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-pixel-dark px-6 py-4 border-4 border-white shadow-pixel font-pixel transition-all hover:-translate-y-1"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5" />
                      <span>RESUME</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>PAUSE</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleEndSession}
                  disabled={isEndingSession.current}
                  className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-4 border-4 border-white shadow-pixel font-pixel transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Square className="w-5 h-5" />
                  <span>END SESSION</span>
                </button>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500 border-4 border-red-700 text-white text-center font-pixel text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Study Tips */}
        <div className="bg-pixel-dark border-4 border-pixel-accent shadow-pixel p-6">
          <h3 className="font-pixel text-pixel-gold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            STUDY TIPS
          </h3>
          <ul className="space-y-2 text-gray-300 font-pixel text-xs">
            <li>• Take breaks every 25 minutes</li>
            <li>• Find a quiet environment</li>
            <li>• Stay hydrated</li>
            <li>• Complete sessions for max XP!</li>
            <li>• Earn 1 XP for every 10 seconds! ⚡</li>
          </ul>
        </div>
      </div>

      {/* Start Session Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-pixel-dark border-4 border-pixel-accent shadow-pixel max-w-md w-full p-6">
            <h2 className="text-2xl font-pixel text-white mb-4 pixel-text-shadow">
              START SESSION
            </h2>
            
            {/* Subject Input */}
            <div className="mb-4">
              <label className="block text-sm font-pixel text-pixel-gold mb-2">
                SUBJECT
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-pixel-accent text-white font-pixel focus:outline-none focus:border-pixel-gold"
              >
                <option value="">Select a subject</option>
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Selection */}
            <div className="mb-6">
              <label className="block text-sm font-pixel text-pixel-gold mb-2">
                DURATION (MIN)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`py-2 px-3 border-2 font-pixel text-sm transition-all ${
                      selectedDuration === duration
                        ? 'bg-pixel-gold text-pixel-dark border-white'
                        : 'bg-gray-800 text-white border-pixel-accent hover:border-pixel-gold'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStartModal(false);
                  setError(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white border-2 border-pixel-accent font-pixel transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleStartSession}
                className="flex-1 px-4 py-2 bg-pixel-gold hover:bg-yellow-500 text-pixel-dark border-2 border-white font-pixel transition-colors"
              >
                START
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Session Modal with Achievements */}
      {showEndModal && sessionSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-pixel-dark border-4 border-pixel-accent shadow-pixel max-w-md w-full p-8 text-center">
            {sessionSummary.completed && (
              <div className="mb-4 text-6xl animate-bounce">🎉</div>
            )}
            
            <h2 className="text-3xl font-pixel text-white mb-2 pixel-text-shadow">
              {sessionSummary.completed ? 'COMPLETED!' : 'SESSION ENDED'}
            </h2>
            
            <p className="text-sm font-pixel text-gray-400 mb-6">
              Great work! Here's your summary:
            </p>
            
            <div className="bg-gray-800 border-2 border-pixel-accent p-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-gray-400 text-sm">Subject:</span>
                  <span className="font-pixel text-white text-sm">{sessionSummary.subject}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-gray-400 text-sm">Duration:</span>
                  <span className="font-pixel text-white text-sm">{sessionSummary.durationFormatted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-gray-400 text-sm">XP Earned:</span>
                  <span className="font-pixel text-pixel-gold text-2xl">+{sessionSummary.xp_earned}</span>
                </div>
              </div>
            </div>

            {/* Achievement Notifications */}
            {unlockedAchievements.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="text-4xl mb-2 animate-pulse">🏆</div>
                <h3 className="font-pixel text-pixel-gold text-sm mb-3">
                  {unlockedAchievements.length > 1 ? 'ACHIEVEMENTS UNLOCKED!' : 'ACHIEVEMENT UNLOCKED!'}
                </h3>
                {unlockedAchievements.map((ach, index) => (
                  <div 
                    key={ach.id || index}
                    className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-2 border-yellow-500 p-3"
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.2}s both`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{ach.icon || '🏅'}</div>
                      <div className="flex-1 text-left">
                        <div className="font-pixel text-white text-sm">
                          {ach.name}
                        </div>
                        {ach.description && (
                          <div className="text-[10px] text-gray-400 font-pixel mt-1">
                            {ach.description}
                          </div>
                        )}
                        <div className="text-xs text-yellow-400 font-pixel mt-1">
                          +{ach.points_reward || 0} pts
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={handleCloseEndModal}
              className="w-full px-6 py-3 bg-pixel-gold hover:bg-yellow-500 text-pixel-dark border-4 border-white shadow-pixel font-pixel transition-all hover:-translate-y-1"
            >
              AWESOME!
            </button>
          </div>
        </div>
      )}

      {/* Achievement Tester - Remove in production */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-purple-900 border-4 border-purple-500 p-4 shadow-pixel max-w-sm">
          <h3 className="font-pixel text-white text-sm mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievement Tester
          </h3>
          
          <div className="space-y-2">
            {/* Test Single Achievement */}
            <button
              onClick={() => {
                setUnlockedAchievements([
                  {
                    id: 1,
                    name: 'First Steps',
                    icon: '🎯',
                    description: 'Complete your first study session',
                    points_reward: 50
                  }
                ]);
                setSessionSummary({
                  duration: 1500,
                  durationFormatted: '25 min',
                  xp_earned: 150,
                  subject: 'Mathematics',
                  completed: true
                });
                setShowEndModal(true);
              }}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-pixel text-xs py-2 px-4 border-2 border-purple-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Test 1 Achievement
            </button>

            {/* Test Multiple Achievements */}
            <button
              onClick={() => {
                setUnlockedAchievements([
                  {
                    id: 1,
                    name: 'First Steps',
                    icon: '🎯',
                    description: 'Complete your first study session',
                    points_reward: 50
                  },
                  {
                    id: 2,
                    name: 'Dedicated Learner',
                    icon: '📚',
                    description: 'Study for 100 minutes total',
                    points_reward: 100
                  },
                  {
                    id: 3,
                    name: 'On Fire!',
                    icon: '🔥',
                    description: 'Reach a 7-day streak',
                    points_reward: 200
                  }
                ]);
                setSessionSummary({
                  duration: 3600,
                  durationFormatted: '1 hr',
                  xp_earned: 360,
                  subject: 'Computer Science',
                  completed: true
                });
                setShowEndModal(true);
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-pixel text-xs py-2 px-4 border-2 border-orange-300 flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              Test 3 Achievements
            </button>

            {/* Test Session End Without Achievements */}
            <button
              onClick={() => {
                setUnlockedAchievements([]);
                setSessionSummary({
                  duration: 900,
                  durationFormatted: '15 min',
                  xp_earned: 90,
                  subject: 'English',
                  completed: false
                });
                setShowEndModal(true);
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-pixel text-xs py-2 px-4 border-2 border-gray-400 flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4" />
              Test No Achievements
            </button>

            {/* Real Achievement Check */}
            <button
              onClick={async () => {
                try {
                  const response = await achievementAPI.checkAchievements();
                  if (response.data.newly_unlocked?.length > 0) {
                    setUnlockedAchievements(response.data.newly_unlocked);
                    setSessionSummary({
                      duration: 0,
                      durationFormatted: '0 min',
                      xp_earned: 0,
                      subject: 'Achievement Check',
                      completed: false
                    });
                    setShowEndModal(true);
                  } else {
                    alert('No new achievements to unlock.\n\nYour current progress has been updated!');
                  }
                } catch (error) {
                  console.error('Error:', error);
                  alert('Error checking achievements: ' + (error.response?.data?.message || error.message));
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-pixel text-xs py-2 px-4 border-2 border-green-400 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Real Check (API)
            </button>
          </div>
          
          <p className="text-[10px] text-purple-300 mt-2 font-pixel">
            ⚠️ Remove before production
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default StudyTimer;