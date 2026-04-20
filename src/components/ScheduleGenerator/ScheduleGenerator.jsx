import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI, taskAPI } from '../../utils/api';

const ScheduleGenerator = () => {
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [showSettings, setShowSettings] = useState(false);
  
  const [preferences, setPreferences] = useState({
    preferredStartTime: '09:00',
    preferredEndTime: '21:00',
    sessionLength: 45,
    breakLength: 10,
    maxSessionsPerDay: 4
  });

  // Get start of week (Monday)
  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await taskAPI.getAll();
      const pendingTasks = (response.data.tasks || response.data || [])
        .filter(t => t.status !== 'completed');
      setTasks(pendingTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  const generateSchedule = async () => {
    if (tasks.length === 0) {
      setError('No pending tasks to schedule. Add some tasks first!');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await aiAPI.generateSchedule(preferences, 7, tasks);
      
      if (response.data.success) {
        setSchedule(response.data.schedule);
      } else {
        setError(response.data.message || 'Failed to generate schedule');
      }
    } catch (err) {
      console.error('Schedule generation error:', err);
      setError('Failed to generate schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction * 7));
    setCurrentWeekStart(newStart);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSessionsForDay = (date) => {
    if (!schedule?.sessions) return [];
    
    return schedule.sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-error';
      case 'medium': return 'border-l-tertiary';
      case 'low': return 'border-l-secondary';
      default: return 'border-l-primary';
    }
  };

  const getPriorityTextColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-tertiary';
      case 'low': return 'text-secondary';
      default: return 'text-primary';
    }
  };

  const weekDays = getWeekDays();
  const weekRangeLabel = `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const estStudyHours = Math.round(tasks.reduce((sum, t) => sum + (t.estimated_duration || t.estimatedMinutes || 30), 0) / 60);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Hero Section */}
      <section className="mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50 rounded-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-pixel text-2xl md:text-4xl text-primary mb-4 leading-relaxed">
              AI SCHEDULE<br/>GENERATOR
            </h1>
            <p className="font-body text-secondary opacity-80 max-w-md">
              The Chronicles of Time predict your path to mastery. Let the AI Weaver craft your daily study scrolls.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="px-6 py-3 font-pixel text-[12px] bg-surface-container border-2 border-outline-variant hover:bg-surface-bright text-on-surface transition-colors"
            >
              SETTING
            </button>
            <button 
              onClick={generateSchedule}
              disabled={loading || loadingTasks || tasks.length === 0}
              className="px-8 py-3 font-pixel text-[12px] bg-secondary-container text-on-secondary-fixed shadow-pixel-secondary border-b-4 border-on-secondary-fixed-variant active:translate-y-1 active:border-b-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'GENERATING...' : 'GENERATE!'}
            </button>
          </div>
        </div>
      </section>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-10"
          >
            <div className="bg-surface-container border-2 border-outline-variant p-6 shadow-pixel">
              <h3 className="font-pixel text-sm text-primary mb-4">WEAVER SETTINGS</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label font-bold text-on-surface text-xs uppercase tracking-wider">Start Time</label>
                  <input 
                    type="time" 
                    value={preferences.preferredStartTime}
                    onChange={(e) => setPreferences({...preferences, preferredStartTime: e.target.value})}
                    className="px-3 py-2 border-2 border-outline-variant bg-surface-container-low font-mono text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label font-bold text-on-surface text-xs uppercase tracking-wider">End Time</label>
                  <input 
                    type="time" 
                    value={preferences.preferredEndTime}
                    onChange={(e) => setPreferences({...preferences, preferredEndTime: e.target.value})}
                    className="px-3 py-2 border-2 border-outline-variant bg-surface-container-low font-mono text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label font-bold text-on-surface text-xs uppercase tracking-wider">Session (min)</label>
                  <input 
                    type="number" 
                    value={preferences.sessionLength}
                    onChange={(e) => setPreferences({...preferences, sessionLength: parseInt(e.target.value)})}
                    min={15}
                    max={90}
                    className="px-3 py-2 border-2 border-outline-variant bg-surface-container-low font-mono text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label font-bold text-on-surface text-xs uppercase tracking-wider">Break (min)</label>
                  <input 
                    type="number" 
                    value={preferences.breakLength}
                    onChange={(e) => setPreferences({...preferences, breakLength: parseInt(e.target.value)})}
                    min={5}
                    max={30}
                    className="px-3 py-2 border-2 border-outline-variant bg-surface-container-low font-mono text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8"
          >
            <div className="bg-error/10 border-2 border-error p-4 flex items-center gap-3 text-error">
              <span className="material-symbols-outlined">error</span>
              <span className="font-bold text-sm">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto material-symbols-outlined hover:opacity-70"
              >
                close
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Status Cards Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Pending Quests */}
        <div className="bg-surface-container p-6 border-b-4 border-surface-container-highest shadow-pixel-dark relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <span className="material-symbols-outlined text-8xl fill">assignment_late</span>
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-pixel text-secondary mb-4">Pending Quests</div>
            <div className="text-4xl font-headline font-black text-primary">{tasks.length}</div>
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-surface-container p-6 border-b-4 border-surface-container-highest shadow-pixel-dark relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-error/10 group-hover:text-error/20 transition-colors">
            <span className="material-symbols-outlined text-8xl fill">priority_high</span>
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-pixel text-error mb-4">High Priority</div>
            <div className="text-4xl font-headline font-black text-error">
              {String(tasks.filter(t => t.priority === 'high').length).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Est. Study Time */}
        <div className="bg-surface-container p-6 border-b-4 border-surface-container-highest shadow-pixel-dark relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-secondary/10 group-hover:text-secondary/20 transition-colors">
            <span className="material-symbols-outlined text-8xl fill">hourglass_empty</span>
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-pixel text-secondary mb-4">Est. Study Time</div>
            <div className="text-4xl font-headline font-black text-secondary">
              {estStudyHours}<span className="text-xl">h</span>
            </div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-surface-container p-6 border-b-4 border-surface-container-highest shadow-pixel-dark relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-tertiary/10 group-hover:text-tertiary/20 transition-colors">
            <span className="material-symbols-outlined text-8xl fill">auto_awesome</span>
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-pixel text-tertiary mb-4">Total Sessions</div>
            <div className="text-4xl font-headline font-black text-tertiary">
              {schedule?.sessions?.filter(s => s.type !== 'break').length || 0}
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Calendar Log */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel text-sm text-secondary">CHRONICLE TRAVEL LOG: {weekRangeLabel.toUpperCase()}</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => navigateWeek(-1)}
              className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors p-1"
            >
              chevron_left
            </button>
            <button 
              onClick={() => navigateWeek(1)}
              className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors p-1"
            >
              chevron_right
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const sessions = getSessionsForDay(day);
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const dayNum = day.getDate();
            const today = isToday(day);
            
            return (
              <div 
                key={index} 
                className={`border-4 p-4 min-h-[180px] flex flex-col transition-colors ${
                  today 
                    ? 'bg-tertiary-container/20 border-tertiary' 
                    : 'bg-surface-container-low border-surface-container-highest'
                }`}
              >
                {/* Day Header */}
                <div className={`flex flex-col items-center pb-3 mb-3 border-b-2 ${
                  today ? 'border-tertiary' : 'border-surface-container-highest'
                }`}>
                  <span className={`text-[10px] font-pixel tracking-wide ${
                    today ? 'text-tertiary' : 'text-on-surface opacity-70'
                  }`}>
                    {dayName} {dayNum}
                  </span>
                  {today && <span className="text-[8px] font-pixel text-tertiary mt-1">TODAY</span>}
                </div>
                
                {/* Sessions */}
                <div className="flex-1 space-y-2 overflow-y-auto scrollbar-pixel">
                  {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <span className={`font-pixel text-[8px] ${
                        today ? 'text-on-tertiary-container opacity-60' : 'text-on-surface opacity-30'
                      }`}>
                        NO SESSIONS
                      </span>
                      <span className={`material-symbols-outlined mt-2 transition-opacity cursor-pointer hover:opacity-100 ${
                        today ? 'text-tertiary opacity-50' : 'text-on-surface opacity-20'
                      }`}>
                        add_box
                      </span>
                    </div>
                  ) : (
                    sessions.map((session, sIndex) => (
                      <motion.div
                        key={sIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sIndex * 0.05 }}
                        className={`p-2 border-l-4 bg-surface-container ${
                          session.type === 'break' 
                            ? 'border-l-secondary opacity-70' 
                            : getPriorityColor(session.priority)
                        }`}
                      >
                        {session.type === 'break' ? (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-secondary">coffee</span>
                            <span className="text-[10px] font-pixel text-secondary">BREAK</span>
                            <span className="text-[10px] text-on-surface opacity-60 ml-auto">
                              {formatTime(session.startTime)}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-bold ${getPriorityTextColor(session.priority)}`}>
                                {formatTime(session.startTime)}
                              </span>
                              <span className="text-[10px] text-on-surface opacity-50">
                                {formatTime(session.endTime)}
                              </span>
                            </div>
                            <div className="text-xs font-headline font-bold text-on-surface leading-tight">
                              {session.title}
                            </div>
                            {session.subject && (
                              <div className="text-[10px] font-label text-primary mt-1 uppercase tracking-wider">
                                {session.subject}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Schedule Summary */}
      <AnimatePresence>
        {schedule?.summary && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-12"
          >
            <div className="bg-surface-container border-2 border-outline-variant p-6 shadow-pixel">
              <h3 className="font-pixel text-sm text-primary mb-3">📋 SCHEDULE SUMMARY</h3>
              <p className="text-on-surface opacity-80 font-body mb-5 leading-relaxed">
                {schedule.summary}
              </p>
              
              {schedule.tips && schedule.tips.length > 0 && (
                <div className="bg-tertiary-container/20 border-2 border-tertiary p-4 shadow-pixel-tertiary">
                  <h4 className="font-pixel text-[10px] text-tertiary mb-3 uppercase">💡 Study Tips</h4>
                  <ul className="space-y-2">
                    {schedule.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-on-surface text-sm">
                        <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Bottom Action Card */}
      {!schedule && !loading && (
        <section>
          <div className="glass-panel border-4 border-primary/30 p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[300px]">psychology</span>
            </div>
            <div className="bg-primary/20 p-6 pixel-border text-primary">
              <span className="material-symbols-outlined text-6xl fill">psychology</span>
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
              <h3 className="font-pixel text-xl text-primary mb-4">READY TO OPTIMIZE?</h3>
              <p className="font-body text-on-surface opacity-80 mb-6 leading-relaxed">
                {tasks.length === 0 
                  ? "Our AI Oracle analyzes your learning patterns, pending boss quests, and available mana (time) to forge a perfectly balanced study path. Add some tasks to get started!"
                  : "Our AI Oracle analyzes your learning patterns, pending boss quests, and available mana (time) to forge a perfectly balanced study path. Maximize your XP gain without burning out your scholar's spirit."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={generateSchedule}
                  disabled={loading || loadingTasks || tasks.length === 0}
                  className="flex-1 bg-primary text-on-primary-fixed font-pixel text-[12px] py-4 shadow-pixel-primary active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                >
                  INVOKE AI WEAVER
                </button>
                <button 
                  onClick={() => window.location.href = '/tasks'}
                  className="px-8 py-4 bg-transparent border-2 border-primary text-primary font-pixel text-[12px] hover:bg-primary/10 transition-all"
                >
                  MANUAL LOG
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-12"
          >
            <div className="bg-surface-container border-4 border-primary/30 p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="inline-block p-6 bg-primary-container border-4 border-primary mb-6 animate-bounce">
                  <span className="material-symbols-outlined text-6xl text-on-primary fill">auto_awesome</span>
                </div>
                <h3 className="font-pixel text-2xl text-primary mb-3">AI IS WORKING...</h3>
                <p className="text-on-surface opacity-70 font-body mb-8">
                  The Oracle is weaving your study chronicles...
                </p>
                <div className="flex justify-center gap-3">
                  <div className="w-4 h-4 bg-primary border-2 border-on-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-4 h-4 bg-secondary border-2 border-on-secondary animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-4 h-4 bg-tertiary border-2 border-on-tertiary animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleGenerator;
