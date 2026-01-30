import React, { useState, useEffect } from 'react';
import { aiAPI } from '../../utils/api';
import { Calendar, Clock, Zap, RefreshCw, ChevronLeft, ChevronRight, BookOpen, Coffee, Target } from 'lucide-react';

const ScheduleGenerator = () => {
  const [schedule, setSchedule] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(3);
  const [preferences, setPreferences] = useState({
    preferredStartTime: '09:00',
    preferredEndTime: '21:00',
    sessionLength: 45,
    breakLength: 10
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDay, setSelectedDay] = useState(0);

  const generateSchedule = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await aiAPI.generateSchedule(preferences, dateRange);
      
      if (response.data.success) {
        setSchedule(response.data.schedule);
      } else {
        throw new Error(response.data.message || 'Failed to generate schedule');
      }
    } catch (err) {
      console.error('Schedule generation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const minutes = Math.round((endDate - startDate) / 60000);
    return `${minutes} min`;
  };

  // Group sessions by day
  const getSessionsByDay = () => {
    if (!schedule?.sessions) return {};
    
    const grouped = {};
    schedule.sessions.forEach(session => {
      const dateKey = new Date(session.startTime).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });
    
    // Sort sessions within each day
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    });
    
    return grouped;
  };

  const sessionsByDay = getSessionsByDay();
  const dayKeys = Object.keys(sessionsByDay).sort((a, b) => new Date(a) - new Date(b));

  const getSessionColor = (type, index) => {
    const colors = [
      'from-blue-600 to-blue-700 border-blue-400',
      'from-purple-600 to-purple-700 border-purple-400',
      'from-green-600 to-green-700 border-green-400',
      'from-orange-600 to-orange-700 border-orange-400',
      'from-pink-600 to-pink-700 border-pink-400',
      'from-cyan-600 to-cyan-700 border-cyan-400'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-pixel-dark p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 border-4 border-white p-4 md:p-6 mb-6 shadow-pixel">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">📅</div>
              <div>
                <h1 className="text-xl md:text-2xl font-pixel text-white">AI Schedule Generator</h1>
                <p className="text-green-200 text-sm">Let AI optimize your study time</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 font-pixel text-xs border-2 transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-green-700 border-white' 
                    : 'bg-transparent text-white border-white/50 hover:border-white'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 font-pixel text-xs border-2 transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-green-700 border-white' 
                    : 'bg-transparent text-white border-white/50 hover:border-white'
                }`}
              >
                📆 Calendar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <div className="bg-pixel-primary border-4 border-pixel-accent p-4 shadow-pixel sticky top-4">
              <h2 className="font-pixel text-yellow-400 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Settings
              </h2>

              {/* Date Range */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Schedule Duration</label>
                <div className="flex gap-2">
                  {[1, 3, 5, 7].map(days => (
                    <button
                      key={days}
                      onClick={() => setDateRange(days)}
                      className={`flex-1 py-2 text-sm font-pixel border-2 transition-all ${
                        dateRange === days
                          ? 'bg-green-600 border-green-400 text-white'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Times */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Study Hours</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="time"
                    value={preferences.preferredStartTime}
                    onChange={(e) => setPreferences(p => ({ ...p, preferredStartTime: e.target.value }))}
                    className="flex-1 bg-gray-800 border-2 border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={preferences.preferredEndTime}
                    onChange={(e) => setPreferences(p => ({ ...p, preferredEndTime: e.target.value }))}
                    className="flex-1 bg-gray-800 border-2 border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>

              {/* Session Length */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">
                  Session Length: {preferences.sessionLength} min
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={preferences.sessionLength}
                  onChange={(e) => setPreferences(p => ({ ...p, sessionLength: parseInt(e.target.value) }))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15m</span>
                  <span>90m</span>
                </div>
              </div>

              {/* Break Length */}
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">
                  Break Length: {preferences.breakLength} min
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={preferences.breakLength}
                  onChange={(e) => setPreferences(p => ({ ...p, breakLength: parseInt(e.target.value) }))}
                  className="w-full accent-yellow-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5m</span>
                  <span>30m</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateSchedule}
                disabled={isGenerating}
                className={`w-full py-3 font-pixel text-sm border-4 transition-all flex items-center justify-center gap-2 ${
                  isGenerating
                    ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 border-green-400 text-white hover:bg-green-500 hover:scale-105'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Schedule
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-red-900/50 border-2 border-red-600 p-3 rounded">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Display */}
          <div className="lg:col-span-2">
            {!schedule ? (
              <div className="bg-pixel-primary border-4 border-pixel-accent p-8 shadow-pixel text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="font-pixel text-white text-lg mb-2">No Schedule Yet</h3>
                <p className="text-gray-400 mb-4">
                  Configure your preferences and click "Generate Schedule" to create an AI-optimized study plan.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Smart timing
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" /> Priority-based
                  </span>
                  <span className="flex items-center gap-1">
                    <Coffee className="w-4 h-4" /> Built-in breaks
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Card */}
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-4 border-purple-500/50 p-4 shadow-pixel">
                  <h3 className="font-pixel text-purple-300 mb-2">📊 Schedule Summary</h3>
                  <p className="text-gray-300 mb-3">{schedule.summary}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="bg-purple-600/30 px-3 py-1 rounded-full text-purple-200">
                      📚 {schedule.sessions?.length || 0} sessions
                    </span>
                    <span className="bg-blue-600/30 px-3 py-1 rounded-full text-blue-200">
                      📅 {dayKeys.length} days
                    </span>
                  </div>
                </div>

                {/* Tips */}
                {schedule.tips && schedule.tips.length > 0 && (
                  <div className="bg-yellow-600/10 border-4 border-yellow-500/50 p-4 shadow-pixel">
                    <h3 className="font-pixel text-yellow-400 mb-2">💡 AI Tips</h3>
                    <ul className="space-y-1">
                      {schedule.tips.map((tip, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-yellow-400">▸</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sessions */}
                {viewMode === 'list' ? (
                  /* List View */
                  <div className="space-y-4">
                    {dayKeys.length === 0 ? (
                      <div className="bg-pixel-primary border-4 border-pixel-accent p-6 shadow-pixel text-center">
                        <p className="text-gray-400">No sessions scheduled. Add some tasks first!</p>
                      </div>
                    ) : (
                      dayKeys.map((dayKey, dayIndex) => (
                        <div key={dayKey} className="bg-pixel-primary border-4 border-pixel-accent shadow-pixel overflow-hidden">
                          <div className="bg-gray-700/50 px-4 py-2 border-b-2 border-gray-600">
                            <h3 className="font-pixel text-white flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-green-400" />
                              {formatDate(sessionsByDay[dayKey][0].startTime)}
                              <span className="text-gray-500 text-xs ml-2">
                                ({sessionsByDay[dayKey].length} sessions)
                              </span>
                            </h3>
                          </div>
                          <div className="p-4 space-y-3">
                            {sessionsByDay[dayKey].map((session, sessionIndex) => (
                              <div
                                key={sessionIndex}
                                className={`bg-gradient-to-r ${getSessionColor(session.type, sessionIndex)} border-2 p-3 rounded-lg`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-pixel text-white text-sm mb-1">
                                      {session.title}
                                    </h4>
                                    {session.description && (
                                      <p className="text-gray-200 text-xs mb-2">{session.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="bg-black/20 px-2 py-1 rounded text-xs text-white">
                                      {formatDuration(session.startTime, session.endTime)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-200">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* Calendar View */
                  <div className="bg-pixel-primary border-4 border-pixel-accent shadow-pixel">
                    {/* Day Navigation */}
                    <div className="flex items-center justify-between px-4 py-3 border-b-2 border-gray-600">
                      <button
                        onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                        disabled={selectedDay === 0}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-pixel text-white">
                        {dayKeys[selectedDay] ? formatDate(sessionsByDay[dayKeys[selectedDay]][0].startTime) : 'No sessions'}
                      </h3>
                      <button
                        onClick={() => setSelectedDay(Math.min(dayKeys.length - 1, selectedDay + 1))}
                        disabled={selectedDay >= dayKeys.length - 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Timeline */}
                    <div className="p-4">
                      {dayKeys[selectedDay] && sessionsByDay[dayKeys[selectedDay]] ? (
                        <div className="relative">
                          {/* Time line */}
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-600"></div>
                          
                          <div className="space-y-4 pl-10">
                            {sessionsByDay[dayKeys[selectedDay]].map((session, index) => (
                              <div key={index} className="relative">
                                {/* Time dot */}
                                <div className="absolute -left-10 top-3 w-4 h-4 bg-green-500 rounded-full border-2 border-green-300"></div>
                                
                                <div className={`bg-gradient-to-r ${getSessionColor(session.type, index)} border-2 p-3 rounded-lg`}>
                                  <div className="flex items-center gap-2 text-xs text-gray-200 mb-2">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                    <span className="bg-black/20 px-2 py-0.5 rounded">
                                      {formatDuration(session.startTime, session.endTime)}
                                    </span>
                                  </div>
                                  <h4 className="font-pixel text-white text-sm">{session.title}</h4>
                                  {session.description && (
                                    <p className="text-gray-200 text-xs mt-1">{session.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          No sessions for this day
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Regenerate Button */}
                <div className="text-center">
                  <button
                    onClick={generateSchedule}
                    disabled={isGenerating}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded border-2 border-gray-600 text-sm flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate Schedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleGenerator;