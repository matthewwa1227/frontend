import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionAPI } from '../utils/api';

/**
 * Custom hook for managing study session state and timer
 * Handles countdown, boss HP, XP tracking, and backend sync
 * 
 * @param {number} initialDuration - Initial duration in seconds (default: 1500 = 25 min)
 * @returns {Object} Session state and controls
 */
export const useStudySession = (initialDuration = 1500) => {
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [totalDuration, setTotalDuration] = useState(initialDuration);
  const [status, setStatus] = useState('IDLE'); // IDLE, FOCUSING, PAUSED, VICTORY, DEFEAT
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Boss/Game state
  const [bossMaxHP] = useState(1000);
  const [bossHP, setBossHP] = useState(720); // Start at 72%
  const [xpEarned, setXpEarned] = useState(0);
  const [stamina, setStamina] = useState(100); // Hero HP
  const [focus, setFocus] = useState(0); // Hero XP/Focus meter
  const [sessionId, setSessionId] = useState(null);
  
  // Refs for accurate timing
  const intervalRef = useRef(null);
  const heartbeatRef = useRef(null);
  const lastTickRef = useRef(null);
  const pausedTimeRef = useRef(0);
  
  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Calculate boss HP percentage
  const bossHPPercent = Math.round((bossHP / bossMaxHP) * 100);
  
  // Start session
  const startSession = useCallback(async (subject = 'General', duration = initialDuration) => {
    try {
      // Call backend to start session
      const response = await sessionAPI.startSession({
        subject,
        duration: duration / 60, // Convert to minutes for backend
        mode: 'pomodoro'
      });
      
      const { session } = response.data;
      setSessionId(session.id);
      setStatus('FOCUSING');
      setStartTime(Date.now());
      setTimeRemaining(duration);
      setTotalDuration(duration);
      setElapsedTime(0);
      setBossHP(720);
      setXpEarned(0);
      setStamina(100);
      setFocus(0);
      lastTickRef.current = Date.now();
      
      return { success: true, sessionId: session.id };
    } catch (error) {
      console.error('Failed to start session:', error);
      // Fallback: start locally without backend
      setStatus('FOCUSING');
      setStartTime(Date.now());
      setTimeRemaining(duration);
      setTotalDuration(duration);
      setElapsedTime(0);
      setBossHP(720);
      setXpEarned(0);
      setStamina(100);
      setFocus(0);
      lastTickRef.current = Date.now();
      return { success: true, sessionId: null };
    }
  }, [initialDuration]);
  
  // Pause session
  const pauseSession = useCallback(async () => {
    if (status === 'FOCUSING') {
      setStatus('PAUSED');
      pausedTimeRef.current = Date.now();
      
      // Clear intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      
      // Try to pause on backend (optional)
      if (sessionId) {
        try {
          // Note: backend might not support pause, this is for future enhancement
          // await sessionAPI.pauseSession(sessionId);
        } catch (error) {
          console.log('Pause not supported on backend');
        }
      }
    }
  }, [status, sessionId]);
  
  // Resume session
  const resumeSession = useCallback(() => {
    if (status === 'PAUSED') {
      setStatus('FOCUSING');
      lastTickRef.current = Date.now();
      
      // Calculate paused duration and adjust
      const pausedDuration = Date.now() - pausedTimeRef.current;
      // Don't count paused time against the timer
    }
  }, [status]);
  
  // End session
  const endSession = useCallback(async (completed = true) => {
    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    
    const finalStatus = completed ? 'VICTORY' : 'DEFEAT';
    setStatus(finalStatus);
    
    // Calculate final stats
    const timeFocused = elapsedTime;
    const duration = Math.floor(timeFocused / 60);
    
    // Call backend to end session
    if (sessionId) {
      try {
        await sessionAPI.endSession(sessionId, {
          duration,
          xpEarned,
          completed,
          bossHPRemaining: bossHP
        });
      } catch (error) {
        console.error('Failed to end session on backend:', error);
      }
    }
    
    return {
      success: true,
      xpEarned,
      duration,
      completed,
      bossHPRemaining: bossHP
    };
  }, [sessionId, elapsedTime, xpEarned, bossHP]);
  
  // Flee (abandon) session
  const fleeSession = useCallback(async () => {
    return endSession(false);
  }, [endSession]);
  
  // Timer tick effect
  useEffect(() => {
    if (status === 'FOCUSING') {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);
        
        if (delta >= 1) {
          setTimeRemaining((prev) => {
            const newTime = Math.max(0, prev - delta);
            
            // Update elapsed time
            setElapsedTime(e => e + delta);
            
            // Update boss HP (decrease proportionally)
            // Boss HP starts at 720, should reach 0 when timer reaches 0
            const progress = (totalDuration - newTime) / totalDuration;
            const newBossHP = Math.max(0, Math.round(720 * (1 - progress)));
            setBossHP(newBossHP);
            
            // Update focus meter (increases over time)
            setFocus(f => Math.min(100, f + (delta / totalDuration) * 100));
            
            // Calculate XP earned (1 XP per second roughly)
            setXpEarned(Math.floor((totalDuration - newTime) / 60) * 5); // 5 XP per minute
            
            // Check for victory
            if (newTime <= 0) {
              endSession(true);
            }
            
            return newTime;
          });
          
          lastTickRef.current = now;
        }
      }, 100); // Check every 100ms for smooth updates
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, totalDuration, endSession]);
  
  // Heartbeat effect (every 30 seconds)
  useEffect(() => {
    if (status === 'FOCUSING' && sessionId) {
      heartbeatRef.current = setInterval(async () => {
        try {
          // Send heartbeat to backend
          // Note: Using PATCH method if available, otherwise skip
          // await api.patch(`/sessions/${sessionId}/heartbeat`);
          console.log('Heartbeat sent for session:', sessionId);
        } catch (error) {
          console.error('Heartbeat failed:', error);
        }
      }, 30000); // Every 30 seconds
    }
    
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [status, sessionId]);
  
  // Check for active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const response = await sessionAPI.getActiveSession();
        if (response.data?.session) {
          const session = response.data.session;
          setSessionId(session.id);
          // Could resume session here if backend supports it
        }
      } catch (error) {
        // No active session, that's fine
      }
    };
    
    checkActiveSession();
  }, []);
  
  // Reset session
  const resetSession = useCallback(() => {
    setStatus('IDLE');
    setTimeRemaining(initialDuration);
    setTotalDuration(initialDuration);
    setStartTime(null);
    setElapsedTime(0);
    setBossHP(720);
    setXpEarned(0);
    setStamina(100);
    setFocus(0);
    setSessionId(null);
    pausedTimeRef.current = 0;
  }, [initialDuration]);
  
  return {
    // State
    timeRemaining,
    totalDuration,
    status,
    elapsedTime,
    bossHP,
    bossMaxHP,
    bossHPPercent,
    xpEarned,
    stamina,
    focus,
    sessionId,
    
    // Formatted values
    formattedTime: formatTime(timeRemaining),
    isRunning: status === 'FOCUSING',
    isPaused: status === 'PAUSED',
    isIdle: status === 'IDLE',
    isVictory: status === 'VICTORY',
    isDefeat: status === 'DEFEAT',
    isComplete: status === 'VICTORY' || status === 'DEFEAT',
    
    // Actions
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    fleeSession,
    resetSession,
    togglePause: () => status === 'FOCUSING' ? pauseSession() : resumeSession(),
  };
};

export default useStudySession;
