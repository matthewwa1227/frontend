import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, Award, BookOpen, Zap } from 'lucide-react';
import api from '../../utils/api';

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
  
  const intervalRef = useRef(null);

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

  // Timer countdown effect
  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            handleTimerComplete();
            return 0;
          }
          return time - 1;
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
  }, [isActive, isPaused, timeRemaining]);

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

  // Calculate estimated XP
  const getEstimatedXP = () => {
    const minutesStudied = Math.floor((totalTime - timeRemaining) / 60);
    return Math.floor(minutesStudied * 10);
  };

  // Start session
  const handleStartSession = async () => {
    if (!subject.trim()) {
      setError('Please select a subject');
      return;
    }

    try {
      setError(null);
      const response = await api.post('/sessions/start', { subject });
      
      setSessionId(response.data.session.id);
      setIsActive(true);
      setIsPaused(false);
      setTimeRemaining(selectedDuration * 60);
      setTotalTime(selectedDuration * 60);
      setShowStartModal(false);

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
    if (!sessionId) return;

    try {
      const duration = Math.floor((totalTime - timeRemaining) / 60);
      
      const response = await api.post(`/sessions/${sessionId}/end`, { duration });
      
      setSessionSummary({
        duration,
        xp_earned: response.data.session.xp_earned,
        subject: response.data.session.subject
      });
      
      setShowEndModal(true);
      resetTimer();

      console.log('✅ Session ended:', response.data);
    } catch (error) {
      console.error('❌ Failed to end session:', error);
      setError(error.response?.data?.message || 'Failed to end session');
    }
  };

  // Timer completed automatically
  const handleTimerComplete = async () => {
    if (!sessionId) return;

    try {
      const duration = Math.floor(totalTime / 60);
      
      const response = await api.post(`/sessions/${sessionId}/end`, { duration });
      
      setSessionSummary({
        duration,
        xp_earned: response.data.session.xp_earned,
        subject: response.data.session.subject,
        completed: true
      });
      
      setShowEndModal(true);
      resetTimer();

      console.log('🎉 Session completed!');
    } catch (error) {
      console.error('❌ Failed to complete session:', error);
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setSessionId(null);
    setTimeRemaining(selectedDuration * 60);
    setTotalTime(selectedDuration * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Close end modal and reset
  const handleCloseEndModal = () => {
    setShowEndModal(false);
    setSessionSummary(null);
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
              <div className="w-72 h-72 border-8 border-gray-700 bg-gray-800 flex items-center justify-center">
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
                  className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-4 border-4 border-white shadow-pixel font-pixel transition-all hover:-translate-y-1"
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

      {/* End Session Modal */}
      {showEndModal && sessionSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-pixel-dark border-4 border-pixel-accent shadow-pixel max-w-md w-full p-8 text-center">
            {sessionSummary.completed && (
              <div className="mb-4 text-6xl">🎉</div>
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
                  <span className="font-pixel text-white text-sm">{sessionSummary.duration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-gray-400 text-sm">XP Earned:</span>
                  <span className="font-pixel text-pixel-gold text-2xl">+{sessionSummary.xp_earned}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCloseEndModal}
              className="w-full px-6 py-3 bg-pixel-gold hover:bg-yellow-500 text-pixel-dark border-4 border-white shadow-pixel font-pixel transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;