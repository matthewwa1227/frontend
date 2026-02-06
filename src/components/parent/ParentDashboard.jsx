import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { familyAPI } from '../../utils/api';
import { getUser, logout } from '../../utils/auth';
// NEW imports from familyApi.js
import {
  fetchChildMastery,
  updateChildTimeLimit,
  setChildRestDay,
  acknowledgeBurnout
} from '../../utils/familyApi';

// Helper to format minutes into readable time
const formatStudyTime = (minutes) => {
  if (!minutes || minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// XP needed for each level
const getXpForLevel = (level) => level * 100;

// Tier display config
const TIER_CONFIG = {
  'P1-P3': { label: 'Explorer', color: 'border-green-500 text-green-400', bg: 'bg-green-500/20' },
  'P4-P6': { label: 'Adventurer', color: 'border-blue-500 text-blue-400', bg: 'bg-blue-500/20' },
  'S1-S3': { label: 'Investigator', color: 'border-purple-500 text-purple-400', bg: 'bg-purple-500/20' },
  'S4-S6': { label: 'Scholar', color: 'border-amber-500 text-amber-400', bg: 'bg-amber-500/20' },
};

// Simple mastery bar
function MasteryBar({ value, gate, label, size = 'normal' }) {
  const pct = Math.min(Math.max(value || 0, 0), 100);
  const barColor = pct >= gate ? 'bg-green-500' : pct >= gate * 0.7 ? 'bg-yellow-500' : 'bg-red-500';
  const height = size === 'small' ? 'h-2' : 'h-3';

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={pct >= gate ? 'text-green-400' : 'text-gray-300'}>{Math.round(pct)}%</span>
      </div>
      <div className={`${height} bg-gray-700 rounded-full overflow-hidden relative`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
        {/* Gate marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white/40"
          style={{ left: `${gate}%` }}
        />
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  // Main state
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  // Detail view state
  const [selectedChild, setSelectedChild] = useState(null);
  const [childDetail, setChildDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Parent controls state
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLimitSaving, setTimeLimitSaving] = useState(false);
  const [restDayLoading, setRestDayLoading] = useState(false);
  const [restDayConfirm, setRestDayConfirm] = useState(false);
  const [controlSuccess, setControlSuccess] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  // Still uses existing familyAPI from api.js (axios)
  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await familyAPI.getChildrenStats();
      if (response.data.success) {
        setChildren(response.data.children);
      } else {
        setError('Failed to load children data');
      }
    } catch (err) {
      console.error('Failed to fetch children:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Open child detail view — uses NEW familyApi.js (fetch, returns data directly)
  const openChildDetail = async (child) => {
    setSelectedChild(child);
    setDetailLoading(true);
    setDetailError('');
    setChildDetail(null);
    setTimeLimit(child.dailyTimeLimit || 60);
    setControlSuccess('');
    setRestDayConfirm(false);

    try {
      const data = await fetchChildMastery(child.id);
      // fetchChildMastery returns parsed JSON directly (no .data wrapper)
      if (data.success) {
        setChildDetail(data.data);
      } else {
        setDetailError('Failed to load detail data');
      }
    } catch (err) {
      console.error('Failed to fetch child detail:', err);
      setDetailError(err.message || 'Failed to load details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeChildDetail = () => {
    setSelectedChild(null);
    setChildDetail(null);
    setDetailError('');
    setControlSuccess('');
    setRestDayConfirm(false);
  };

  // Parent control: time limit — uses NEW familyApi.js
  const handleTimeLimitSave = async () => {
    if (!selectedChild) return;
    setTimeLimitSaving(true);
    setControlSuccess('');
    try {
      const data = await updateChildTimeLimit(selectedChild.id, timeLimit);
      if (data.success) {
        setControlSuccess(`Time limit updated to ${timeLimit} minutes`);
        setChildren(prev =>
          prev.map(c => c.id === selectedChild.id ? { ...c, dailyTimeLimit: timeLimit } : c)
        );
        setSelectedChild(prev => ({ ...prev, dailyTimeLimit: timeLimit }));
        setTimeout(() => setControlSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Time limit update error:', err);
      setControlSuccess('');
      setDetailError(err.message || 'Failed to update time limit');
      setTimeout(() => setDetailError(''), 3000);
    } finally {
      setTimeLimitSaving(false);
    }
  };

  // Parent control: rest day — uses NEW familyApi.js
  const handleRestDay = async () => {
    if (!selectedChild) return;
    setRestDayLoading(true);
    try {
      const data = await setChildRestDay(selectedChild.id);
      if (data.success) {
        setControlSuccess('Rest day set for today! Your child cannot start new sessions.');
        setRestDayConfirm(false);
        setTimeout(() => setControlSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Rest day error:', err);
      setDetailError(err.message || 'Failed to set rest day');
      setTimeout(() => setDetailError(''), 3000);
    } finally {
      setRestDayLoading(false);
    }
  };

  // Parent control: acknowledge burnout — uses NEW familyApi.js
  const handleAcknowledgeBurnout = async () => {
    if (!selectedChild) return;
    try {
      await acknowledgeBurnout(selectedChild.id);
      setChildDetail(prev => prev ? { ...prev, burnoutAlert: null } : prev);
      setControlSuccess('Burnout alert acknowledged');
      setTimeout(() => setControlSuccess(''), 3000);
    } catch (err) {
      console.error('Burnout ack error:', err);
    }
  };

  // Still uses existing familyAPI from api.js (axios)
  const handleLinkChild = async (e) => {
    e.preventDefault();
    if (!linkCode.trim()) {
      setLinkError('Please enter a code');
      return;
    }
    try {
      setLinkLoading(true);
      setLinkError('');
      setLinkSuccess('');
      const response = await familyAPI.linkChild(linkCode.trim().toUpperCase());
      if (response.data.success) {
        setLinkSuccess(`Successfully linked to ${response.data.student.fullName}!`);
        setLinkCode('');
        await fetchChildren();
        setTimeout(() => {
          setShowLinkModal(false);
          setLinkSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Link error:', err);
      setLinkError(err.response?.data?.message || 'Failed to link. Check the code and try again.');
    } finally {
      setLinkLoading(false);
    }
  };

  // Still uses existing familyAPI from api.js (axios)
  const handleRemoveChild = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to unlink ${studentName}?`)) return;
    try {
      await familyAPI.removeChild(studentId);
      setChildren(children.filter(c => c.id !== studentId));
      if (selectedChild?.id === studentId) closeChildDetail();
    } catch (err) {
      console.error('Remove error:', err);
      alert(err.response?.data?.message || 'Failed to remove child');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Summary stats
  const totalStudyTime = children.reduce((sum, c) => sum + (c.totalStudyTime || 0), 0);
  const averageLevel = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + (c.level || 1), 0) / children.length)
    : 0;
  const totalXp = children.reduce((sum, c) => sum + (c.xp || 0), 0);
  const totalTodayMinutes = children.reduce((sum, c) => sum + (c.todayMinutes || 0), 0);

  // ============================================
  // CHILD DETAIL VIEW
  // ============================================
  if (selectedChild) {
    const tierCfg = TIER_CONFIG[selectedChild.ageTier] || {};

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        {/* Header */}
        <header className="bg-gray-800/50 border-b-4 border-purple-500 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <button
              onClick={closeChildDetail}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-gray-300 rounded transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
                {selectedChild.fullName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{selectedChild.fullName}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">@{selectedChild.username}</span>
                  {selectedChild.formLevel && (
                    <span className={`text-xs px-2 py-0.5 border rounded-full ${tierCfg.color} ${tierCfg.bg}`}>
                      {selectedChild.formLevel} · {tierCfg.label || selectedChild.ageTier}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-yellow-400 font-bold">Level {selectedChild.level || 1}</div>
              <div className="text-gray-400 text-sm">{selectedChild.xp?.toLocaleString() || 0} XP</div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Success / Error Messages */}
          {controlSuccess && (
            <div className="p-4 bg-green-500/20 border-2 border-green-500 rounded-lg text-green-300 flex items-center gap-2">
              <span>✅</span> {controlSuccess}
            </div>
          )}
          {detailError && (
            <div className="p-4 bg-red-500/20 border-2 border-red-500 rounded-lg text-red-300">
              {detailError}
            </div>
          )}

          {/* Burnout Alert */}
          {childDetail?.burnoutAlert && (
            <div className="p-4 bg-red-500/20 border-2 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-red-300 font-bold mb-1">
                    Burnout Warning — Level {childDetail.burnoutAlert.flag_level}
                  </h3>
                  <p className="text-red-200/80 text-sm">{childDetail.burnoutAlert.recommendation}</p>
                  <button
                    onClick={handleAcknowledgeBurnout}
                    className="mt-2 px-4 py-1.5 bg-red-600/30 border border-red-500 text-red-300 rounded text-sm hover:bg-red-600/50 transition-colors"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 border-2 border-gray-600 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xl font-bold text-white">{selectedChild.currentStreak || 0}</div>
              <div className="text-gray-400 text-xs">Day Streak</div>
            </div>
            <div className="bg-gray-800/50 border-2 border-gray-600 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-xl font-bold text-white">{selectedChild.activeSchedules || 0}</div>
              <div className="text-gray-400 text-xs">Active Schedules</div>
            </div>
            <div className="bg-gray-800/50 border-2 border-gray-600 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-xl font-bold text-white">{selectedChild.todayMinutes || 0}m</div>
              <div className="text-gray-400 text-xs">Today's Study</div>
            </div>
            <div className="bg-gray-800/50 border-2 border-gray-600 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">⏳</div>
              <div className="text-xl font-bold text-white">{selectedChild.dailyTimeLimit || 60}m</div>
              <div className="text-gray-400 text-xs">Daily Limit</div>
            </div>
          </div>

          {/* Today's Time Progress */}
          <div className="bg-gray-800/50 border-2 border-gray-600 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Today's Study Progress</span>
              <span className="text-purple-300">
                {selectedChild.todayMinutes || 0} / {selectedChild.dailyTimeLimit || 60} min
              </span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (selectedChild.todayMinutes || 0) >= (selectedChild.dailyTimeLimit || 60)
                    ? 'bg-red-500'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}
                style={{
                  width: `${Math.min(((selectedChild.todayMinutes || 0) / (selectedChild.dailyTimeLimit || 60)) * 100, 100)}%`
                }}
              />
            </div>
          </div>

          {/* Parent Controls */}
          <div className="bg-gray-800/50 border-2 border-cyan-600 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🛡️</span> Parent Controls
            </h3>

            {/* Time Limit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-700">
              <div>
                <div className="text-white font-medium">⏱️ Daily Time Limit</div>
                <p className="text-gray-500 text-xs mt-1">Set how long your child can study per day (10–120 min)</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTimeLimit(Math.max(10, timeLimit - 5))}
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 rounded text-white text-xl font-bold transition-colors"
                >
                  −
                </button>
                <span className="text-white font-bold text-xl w-12 text-center">{timeLimit}</span>
                <button
                  onClick={() => setTimeLimit(Math.min(120, timeLimit + 5))}
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 rounded text-white text-xl font-bold transition-colors"
                >
                  +
                </button>
                <span className="text-gray-400 text-sm">min</span>
                {timeLimit !== (selectedChild.dailyTimeLimit || 60) && (
                  <button
                    onClick={handleTimeLimitSave}
                    disabled={timeLimitSaving}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white rounded font-medium text-sm transition-colors"
                  >
                    {timeLimitSaving ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Rest Day */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-white font-medium">😴 Force Rest Day</div>
                <p className="text-gray-500 text-xs mt-1">Blocks all study sessions for today</p>
              </div>
              {!restDayConfirm ? (
                <button
                  onClick={() => setRestDayConfirm(true)}
                  className="px-4 py-2 bg-orange-600/30 border-2 border-orange-500 text-orange-400 rounded font-medium text-sm hover:bg-orange-600/50 transition-colors"
                >
                  Set Rest Day
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setRestDayConfirm(false)}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRestDay}
                    disabled={restDayLoading}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 text-white rounded font-medium text-sm transition-colors"
                  >
                    {restDayLoading ? 'Setting...' : 'Confirm Rest Day'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Activity */}
          {childDetail?.weeklyActivity && childDetail.weeklyActivity.length > 0 && (
            <div className="bg-gray-800/50 border-2 border-gray-600 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span> Last 7 Days
              </h3>
              <div className="space-y-3">
                {childDetail.weeklyActivity.map((day, i) => {
                  const maxMinutes = Math.max(...childDetail.weeklyActivity.map(d => d.minutes), 1);
                  const pct = (day.minutes / maxMinutes) * 100;
                  const dateStr = new Date(day.session_date).toLocaleDateString('en-HK', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  });
                  const accuracy = day.questions > 0
                    ? Math.round((day.correct / day.questions) * 100)
                    : 0;

                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs w-24 flex-shrink-0">{dateStr}</span>
                      <div className="flex-1 h-5 bg-gray-700 rounded overflow-hidden">
                        <div
                          className={`h-full rounded transition-all duration-500 ${
                            day.minutes === 0 ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                          }`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-xs w-12 text-right">{day.minutes}m</span>
                      <span className="text-gray-500 text-xs w-10 text-right">
                        {day.questions > 0 ? `${accuracy}%` : '—'}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-end gap-4 text-xs text-gray-500 pt-2 border-t border-gray-700">
                  <span>■ Minutes studied</span>
                  <span>% Accuracy</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading Detail */}
          {detailLoading && (
            <div className="text-center py-8">
              <div className="text-3xl animate-bounce mb-3">📖</div>
              <p className="text-gray-400">Loading learning data...</p>
            </div>
          )}

          {/* Schedules & Mastery */}
          {childDetail?.schedules && childDetail.schedules.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🗺️</span> Learning Schedules
              </h3>
              <div className="space-y-4">
                {childDetail.schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="bg-gray-800/50 border-2 border-gray-600 rounded-lg p-5"
                  >
                    {/* Schedule Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-white font-bold text-lg">{schedule.topic}</h4>
                        <span className="text-gray-400 text-sm">{schedule.subject}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          schedule.status === 'active'
                            ? 'border-green-500 text-green-400 bg-green-500/20'
                            : schedule.status === 'completed'
                            ? 'border-amber-500 text-amber-400 bg-amber-500/20'
                            : 'border-gray-500 text-gray-400 bg-gray-500/20'
                        }`}>
                          {schedule.status}
                        </span>
                        <div className="text-gray-400 text-xs mt-1">
                          Ch {schedule.currentChapter}/{schedule.totalChapters}
                        </div>
                      </div>
                    </div>

                    {/* Overall Mastery */}
                    <MasteryBar
                      value={schedule.overallMastery}
                      gate={schedule.masteryGate}
                      label="Overall Mastery"
                    />

                    {/* Chapter Mastery */}
                    {schedule.chapters && typeof schedule.chapters === 'object' && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-gray-500 text-xs mb-2">Chapter Breakdown:</p>
                        {Object.entries(schedule.chapters).map(([ch, info]) => (
                          <MasteryBar
                            key={ch}
                            value={info.mastery}
                            gate={schedule.masteryGate}
                            label={`Ch ${ch} (${info.questionsCorrect || 0}/${info.questionsAnswered || 0} correct)`}
                            size="small"
                          />
                        ))}
                      </div>
                    )}

                    {/* Stats Row */}
                    <div className="flex gap-4 mt-3 pt-3 border-t border-gray-700">
                      <div className="text-center flex-1">
                        <div className="text-white font-bold">{schedule.accuracy}%</div>
                        <div className="text-gray-500 text-xs">Accuracy</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-white font-bold">{schedule.totalQuestions}</div>
                        <div className="text-gray-500 text-xs">Questions</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-white font-bold">{formatStudyTime(schedule.totalTime)}</div>
                        <div className="text-gray-500 text-xs">Time Spent</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No schedules */}
          {childDetail && childDetail.schedules && childDetail.schedules.length === 0 && (
            <div className="bg-gray-800/30 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400">No learning schedules yet.</p>
              <p className="text-gray-500 text-sm mt-1">Your child hasn't started any Story Quest topics.</p>
            </div>
          )}

          {/* Unlink button at bottom */}
          <div className="pt-6 border-t border-gray-700">
            <button
              onClick={() => handleRemoveChild(selectedChild.id, selectedChild.fullName)}
              className="px-4 py-2 bg-red-600/20 border-2 border-red-500/50 text-red-400 rounded hover:bg-red-600/40 transition-colors text-sm"
            >
              Unlink {selectedChild.fullName}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // MAIN DASHBOARD VIEW
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 border-b-4 border-purple-500 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍👩‍👧‍👦</span>
            <div>
              <h1 className="text-xl font-bold text-white">Parent Dashboard</h1>
              <p className="text-purple-300 text-sm">Welcome, {user?.full_name || user?.username || 'Parent'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 border-2 border-red-500 text-red-400 rounded hover:bg-red-600/40 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500 rounded-lg text-red-300">
            {error}
            <button onClick={fetchChildren} className="ml-4 underline hover:text-red-200">
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800/50 border-2 border-blue-500 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">👶</div>
            <div className="text-2xl font-bold text-white">{children.length}</div>
            <div className="text-blue-300 text-sm">Children</div>
          </div>
          <div className="bg-gray-800/50 border-2 border-green-500 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-white">{formatStudyTime(totalStudyTime)}</div>
            <div className="text-green-300 text-sm">Total Study</div>
          </div>
          <div className="bg-gray-800/50 border-2 border-yellow-500 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-white">{totalXp.toLocaleString()}</div>
            <div className="text-yellow-300 text-sm">Total XP</div>
          </div>
          <div className="bg-gray-800/50 border-2 border-purple-500 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white">Lvl {averageLevel}</div>
            <div className="text-purple-300 text-sm">Avg Level</div>
          </div>
          <div className="bg-gray-800/50 border-2 border-cyan-500 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-white">{totalTodayMinutes}m</div>
            <div className="text-cyan-300 text-sm">Today</div>
          </div>
        </div>

        {/* Children Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📚</span> Your Children's Progress
          </h2>
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>➕</span> Link Child
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl animate-bounce mb-4">⏳</div>
            <p className="text-gray-400">Loading children data...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && children.length === 0 && (
          <div className="bg-gray-800/30 border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">👶</div>
            <h3 className="text-xl font-bold text-white mb-2">No Children Linked Yet</h3>
            <p className="text-gray-400 mb-6">
              Ask your child to generate an invite code from their StudyQuest app, then click "Link Child" to connect.
            </p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
            >
              Link Your First Child
            </button>
          </div>
        )}

        {/* Children Cards */}
        {!loading && children.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onRemove={() => handleRemoveChild(child.id, child.fullName)}
                onViewDetail={() => openChildDetail(child)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-4 border-purple-500 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Link a Child</h3>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkCode('');
                  setLinkError('');
                  setLinkSuccess('');
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-300 mb-4">
              Enter the 6-character code from your child's StudyQuest app.
            </p>
            <form onSubmit={handleLinkChild}>
              <input
                type="text"
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g., ABC123)"
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white text-center text-2xl tracking-widest font-mono placeholder:text-sm placeholder:tracking-normal focus:border-purple-500 focus:outline-none"
              />
              {linkError && <p className="mt-2 text-red-400 text-sm">{linkError}</p>}
              {linkSuccess && <p className="mt-2 text-green-400 text-sm">{linkSuccess}</p>}
              <button
                type="submit"
                disabled={linkLoading || linkCode.length < 6}
                className="w-full mt-4 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {linkLoading ? 'Linking...' : 'Link Child'}
              </button>
            </form>
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400 text-sm">
                <strong className="text-yellow-400">💡 Tip:</strong> Your child can generate a code from their Profile → Parent Portal section.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// CHILD CARD COMPONENT
// ============================================
function ChildCard({ child, onRemove, onViewDetail }) {
  const xpProgress = ((child.xp || 0) % 100);
  const xpForNextLevel = getXpForLevel(child.level || 1);
  const progressPercent = Math.min((xpProgress / xpForNextLevel) * 100, 100);

  const tierCfg = TIER_CONFIG[child.ageTier] || {};
  const todayPct = child.dailyTimeLimit
    ? Math.min(((child.todayMinutes || 0) / child.dailyTimeLimit) * 100, 100)
    : 0;

  return (
    <div className="bg-gray-800/50 border-2 border-gray-600 hover:border-purple-500 rounded-lg p-6 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
            {child.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{child.fullName}</h3>
            <p className="text-gray-400 text-sm">@{child.username}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-full text-yellow-400 text-sm font-bold">
            Level {child.level || 1}
          </div>
          {child.formLevel && (
            <div className={`px-2 py-0.5 rounded-full text-xs border ${tierCfg.color} ${tierCfg.bg}`}>
              {child.formLevel}
            </div>
          )}
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">XP Progress</span>
          <span className="text-purple-400">{child.xp?.toLocaleString() || 0} XP</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Today's Study Progress */}
      {child.dailyTimeLimit && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Today</span>
            <span className="text-cyan-400">
              {child.todayMinutes || 0}/{child.dailyTimeLimit}m
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                todayPct >= 100 ? 'bg-red-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${todayPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl">⏱️</div>
          <div className="text-white font-bold">{formatStudyTime(child.totalStudyTime)}</div>
          <div className="text-gray-400 text-xs">Study Time</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl">🔥</div>
          <div className="text-white font-bold">{child.currentStreak || 0}</div>
          <div className="text-gray-400 text-xs">Day Streak</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl">📚</div>
          <div className="text-white font-bold">{child.activeSchedules || 0}</div>
          <div className="text-gray-400 text-xs">Schedules</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewDetail}
          className="flex-1 px-3 py-2 bg-purple-600/30 border border-purple-500 text-purple-300 rounded hover:bg-purple-600/50 transition-colors text-sm font-medium"
        >
          📊 View Details
        </button>
        <button
          onClick={onRemove}
          className="px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded hover:bg-red-600/40 transition-colors text-sm"
        >
          Unlink
        </button>
      </div>

      {/* Connected Date */}
      <p className="text-gray-500 text-xs mt-3 text-center">
        Connected {new Date(child.connectedAt).toLocaleDateString()}
        {child.relationship && ` · ${child.relationship}`}
      </p>
    </div>
  );
}