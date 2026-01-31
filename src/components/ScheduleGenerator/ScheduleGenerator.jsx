import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Brain, Sparkles, RefreshCw, 
  ChevronLeft, ChevronRight, Check, AlertCircle,
  Coffee, Target, Zap, Settings
} from 'lucide-react';
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
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-blue-500';
    }
  };

  const weekDays = getWeekDays();

  // Pixel Card Component
  const PixelCard = ({ children, className = '', noPadding = false }) => (
    <div className={`bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${noPadding ? '' : 'p-4'} ${className}`}>
      {children}
    </div>
  );

  // Pixel Button Component
  const PixelButton = ({ children, onClick, disabled, variant = 'primary', className = '' }) => {
    const baseClasses = "font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    
    const variants = {
      primary: "bg-purple-500 hover:bg-purple-600 text-white",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
      success: "bg-green-500 hover:bg-green-600 text-white",
      danger: "bg-red-500 hover:bg-red-600 text-white",
    };

    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <PixelCard className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-400 border-4 border-black">
              <Brain className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wide">
                ⚡ AI Schedule Generator
              </h1>
              <p className="text-black/80 font-medium mt-1">
                Let AI optimize your study plan!
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <PixelButton 
              onClick={() => setShowSettings(!showSettings)}
              variant="secondary"
              className="px-4 py-2 flex items-center gap-2"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">SETTINGS</span>
            </PixelButton>
            
            <PixelButton 
              onClick={generateSchedule}
              disabled={loading || loadingTasks || tasks.length === 0}
              variant="success"
              className="px-4 py-2 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  GENERATING...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  GENERATE!
                </>
              )}
            </PixelButton>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t-4 border-black/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-black text-sm uppercase">Start Time</label>
                    <input 
                      type="time" 
                      value={preferences.preferredStartTime}
                      onChange={(e) => setPreferences({...preferences, preferredStartTime: e.target.value})}
                      className="px-3 py-2 border-4 border-black bg-white font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-black text-sm uppercase">End Time</label>
                    <input 
                      type="time" 
                      value={preferences.preferredEndTime}
                      onChange={(e) => setPreferences({...preferences, preferredEndTime: e.target.value})}
                      className="px-3 py-2 border-4 border-black bg-white font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-black text-sm uppercase">Session (min)</label>
                    <input 
                      type="number" 
                      value={preferences.sessionLength}
                      onChange={(e) => setPreferences({...preferences, sessionLength: parseInt(e.target.value)})}
                      min={15}
                      max={90}
                      className="px-3 py-2 border-4 border-black bg-white font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-black text-sm uppercase">Break (min)</label>
                    <input 
                      type="number" 
                      value={preferences.breakLength}
                      onChange={(e) => setPreferences({...preferences, breakLength: parseInt(e.target.value)})}
                      min={5}
                      max={30}
                      className="px-3 py-2 border-4 border-black bg-white font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PixelCard>

      {/* Error Message */}
      {error && (
        <PixelCard className="bg-red-100 border-red-500 mb-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <span className="font-bold">{error}</span>
          </div>
        </PixelCard>
      )}

      {/* Task Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PixelCard className="bg-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 border-2 border-black">
              <Target className="text-white" size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-black">{tasks.length}</div>
              <div className="text-xs font-bold text-gray-600 uppercase">Pending</div>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="bg-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 border-2 border-black">
              <Zap className="text-white" size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-black">
                {tasks.filter(t => t.priority === 'high').length}
              </div>
              <div className="text-xs font-bold text-gray-600 uppercase">High Priority</div>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="bg-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 border-2 border-black">
              <Clock className="text-white" size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-black">
                {Math.round(tasks.reduce((sum, t) => sum + (t.estimated_duration || t.estimatedMinutes || 30), 0) / 60)}h
              </div>
              <div className="text-xs font-bold text-gray-600 uppercase">Est. Time</div>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="bg-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 border-2 border-black">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-black">
                {schedule?.sessions?.filter(s => s.type !== 'break').length || 0}
              </div>
              <div className="text-xs font-bold text-gray-600 uppercase">Sessions</div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Calendar View */}
      <PixelCard noPadding className="mb-6 overflow-hidden">
        {/* Calendar Navigation */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-100 border-b-4 border-black">
          <button 
            onClick={() => navigateWeek(-1)}
            className="p-2 bg-white border-2 border-black hover:bg-yellow-200 transition-colors active:translate-x-0.5 active:translate-y-0.5"
          >
            <ChevronLeft size={20} className="text-black" />
          </button>
          <span className="font-black text-black uppercase">
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button 
            onClick={() => navigateWeek(1)}
            className="p-2 bg-white border-2 border-black hover:bg-yellow-200 transition-colors active:translate-x-0.5 active:translate-y-0.5"
          >
            <ChevronRight size={20} className="text-black" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {weekDays.map((day, index) => {
            const sessions = getSessionsForDay(day);
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = day.getDate();
            const today = isToday(day);
            
            return (
              <div 
                key={index} 
                className={`border-r-4 border-b-4 border-black last:border-r-0 min-h-80 flex flex-col ${
                  today ? 'bg-yellow-50' : 'bg-white'
                } ${index >= 4 ? 'hidden lg:flex' : ''} ${index >= 2 ? 'hidden md:flex' : ''} ${index >= 1 ? 'hidden sm:flex' : 'flex'}`}
              >
                {/* Day Header */}
                <div className={`flex flex-col items-center py-3 border-b-4 border-black ${
                  today ? 'bg-yellow-400' : 'bg-gray-200'
                }`}>
                  <span className="text-xs font-black uppercase tracking-wide text-black">
                    {dayName}
                  </span>
                  <span className="text-2xl font-black text-black mt-0.5">{dayNum}</span>
                  {today && <span className="text-xs font-bold text-black">TODAY!</span>}
                </div>
                
                {/* Sessions */}
                <div className="flex-1 p-2 overflow-y-auto space-y-2">
                  {sessions.length === 0 ? (
                    <div className="text-center text-gray-400 font-bold text-sm py-8 uppercase">
                      No sessions
                    </div>
                  ) : (
                    sessions.map((session, sIndex) => (
                      <motion.div
                        key={sIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sIndex * 0.05 }}
                        className={`p-2 border-2 border-black cursor-pointer transition-all hover:translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          session.type === 'break' 
                            ? 'bg-green-200 border-l-4 border-l-green-600' 
                            : `bg-purple-100 border-l-4 ${getPriorityBorder(session.priority)}`
                        }`}
                      >
                        {session.type === 'break' ? (
                          <div className="flex items-center gap-2">
                            <Coffee size={14} className="text-green-700" />
                            <span className="text-xs text-gray-600 font-bold">
                              {formatTime(session.startTime)}
                            </span>
                            <span className="text-sm font-black text-green-800">BREAK</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`w-2 h-2 border border-black ${getPriorityColor(session.priority)}`} />
                              <span className="text-xs text-gray-600 font-bold">
                                {formatTime(session.startTime)} - {formatTime(session.endTime)}
                              </span>
                            </div>
                            <div className="text-sm font-black text-gray-900 leading-tight">
                              {session.title}
                            </div>
                            {session.subject && (
                              <div className="text-xs font-bold text-purple-600 mt-1 uppercase">
                                📚 {session.subject}
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </PixelCard>

      {/* Schedule Summary */}
      {schedule && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PixelCard className="bg-blue-50">
            <h3 className="text-xl font-black text-black mb-3 uppercase">
              📋 Schedule Summary
            </h3>
            <p className="text-gray-700 font-medium mb-5 leading-relaxed">
              {schedule.summary}
            </p>
            
            {schedule.tips && schedule.tips.length > 0 && (
              <div className="bg-yellow-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-black text-black mb-3 uppercase">💡 Study Tips</h4>
                <ul className="space-y-2">
                  {schedule.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-800">
                      <Check size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </PixelCard>
        </motion.div>
      )}

      {/* Empty State */}
      {!schedule && !loading && (
        <PixelCard className="text-center py-12 bg-gradient-to-b from-purple-100 to-pink-100">
          <div className="inline-block p-4 bg-yellow-400 border-4 border-black mb-4">
            <Brain size={48} className="text-black" />
          </div>
          <h3 className="text-2xl font-black text-black mb-2 uppercase">
            Ready to Optimize?
          </h3>
          <p className="text-gray-700 font-medium max-w-md mx-auto">
            {tasks.length === 0 
              ? "🎮 Add some tasks first, then let AI create the perfect study schedule!"
              : "🚀 Click 'GENERATE!' to let AI create an optimized study plan based on your tasks!"
            }
          </p>
          
          {tasks.length === 0 && (
            <div className="mt-6">
              <PixelButton 
                variant="primary"
                className="px-6 py-3"
                onClick={() => window.location.href = '/tasks'}
              >
                ➕ ADD TASKS
              </PixelButton>
            </div>
          )}
        </PixelCard>
      )}

      {/* Loading State */}
      {loading && (
        <PixelCard className="text-center py-12 bg-gradient-to-b from-blue-100 to-purple-100">
          <div className="inline-block p-4 bg-purple-400 border-4 border-black mb-4 animate-bounce">
            <Sparkles size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-black text-black mb-2 uppercase">
            🤖 AI is Working...
          </h3>
          <p className="text-gray-700 font-medium">
            Generating your optimized study schedule!
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-4 h-4 bg-purple-500 border-2 border-black animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-4 h-4 bg-pink-500 border-2 border-black animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-4 h-4 bg-yellow-500 border-2 border-black animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </PixelCard>
      )}
    </div>
  );
};

export default ScheduleGenerator;