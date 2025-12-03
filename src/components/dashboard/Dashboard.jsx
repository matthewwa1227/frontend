import React, { useState, useEffect } from 'react';
import { getUser } from '../../utils/auth';
import { studentAPI, sessionAPI } from '../../utils/api'; // ✅ Added sessionAPI
import PixelCard from '../shared/PixelCard';
import ProgressBar from '../shared/ProgressBar';
import StatCard from '../shared/StatCard';
import { Trophy, Target, Book, Star, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

const fetchDashboardData = async () => {
  try {
    setLoading(true);
    setError(null);

    // Only fetch stats - it includes recent_sessions
    const statsRes = await studentAPI.getStats();

    const studentStats = statsRes.data.student;
    
    setStats(studentStats);
    setSessions(studentStats.recent_sessions || []); // ✅ Get sessions from stats

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    setError(error.response?.data?.message || 'Failed to load dashboard');
  } finally {
    setLoading(false);
  }
};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pixel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-pixel text-sm">Loading Quest Data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-dark px-4">
        <div className="bg-red-900 border-4 border-red-600 p-8 max-w-md">
          <p className="text-white font-pixel text-sm mb-4">⚠️ {error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-pixel-gold border-4 border-white py-2 font-pixel text-sm hover:bg-yellow-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate XP progress (assuming 100 XP per level)
  const currentLevelXP = (stats?.xp || 0) % 100;
  const currentLevel = stats?.level || user?.level || 1;

  // Calculate stats
  const totalSessions = sessions.length;
  const totalStudyTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const todaySessions = sessions.filter(s => {
    const today = new Date().toDateString();
    const sessionDate = new Date(s.started_at).toDateString();
    return today === sessionDate;
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-pixel text-white mb-2">
          Welcome back, {user?.username || 'Student'}! 🎮
        </h1>
        <p className="text-sm font-pixel text-gray-400">
          Ready to continue your learning quest?
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={Trophy}
          label="Level"
          value={currentLevel}
          color="text-pixel-gold"
        />
        <StatCard 
          icon={Star}
          label="Total XP"
          value={stats?.xp || 0}
          color="text-pixel-success"
        />
        <StatCard 
          icon={Target}
          label="Study Sessions"
          value={totalSessions}
          color="text-pixel-info"
        />
        <StatCard 
          icon={Clock}
          label="Total Minutes"
          value={totalStudyTime}
          color="text-pixel-warning"
        />
      </div>

      {/* Level Progress */}
      <PixelCard title="Level Progress" icon="⚡" className="mb-8">
        <div className="space-y-4">
          <ProgressBar
            current={currentLevelXP}
            max={100}
            label={`Level ${currentLevel} → Level ${currentLevel + 1}`}
            color="bg-pixel-gold"
          />
          <p className="text-xs font-mono text-gray-400">
            {100 - currentLevelXP} XP needed to reach Level {currentLevel + 1}
          </p>
        </div>
      </PixelCard>

      {/* Today's Progress */}
      <PixelCard title="Today's Progress" icon="📅" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-pixel-dark border-2 border-pixel-accent p-4">
            <div className="flex items-center gap-2 mb-2">
              <Book className="w-5 h-5 text-pixel-info" />
              <span className="text-xs font-pixel text-gray-400">Sessions Today</span>
            </div>
            <p className="text-2xl font-pixel text-white">{todaySessions}</p>
          </div>
          
          <div className="bg-pixel-dark border-2 border-pixel-accent p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-pixel-success" />
              <span className="text-xs font-pixel text-gray-400">Current Streak</span>
            </div>
            <p className="text-2xl font-pixel text-white">{stats?.current_streak || 0} days 🔥</p>
          </div>
          
          <div className="bg-pixel-dark border-2 border-pixel-accent p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-pixel-gold" />
              <span className="text-xs font-pixel text-gray-400">Longest Streak</span>
            </div>
            <p className="text-2xl font-pixel text-white">{stats?.longest_streak || 0} days</p>
          </div>
        </div>
      </PixelCard>

      {/* Recent Study Sessions */}
      <PixelCard title="Recent Study Sessions" icon="📚" className="mb-8">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-white font-pixel text-sm mb-2">
              No study sessions yet!
            </p>
            <p className="text-gray-400 font-pixel text-xs mb-6">
              Start your first session to begin earning XP
            </p>
            <button
              onClick={() => window.location.href = '/sessions/new'}
              className="bg-pixel-success border-4 border-white px-6 py-3 font-pixel text-sm hover:bg-green-600"
            >
              Start First Session 🚀
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="bg-pixel-dark border-2 border-pixel-accent p-4 hover:border-pixel-gold transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-pixel text-sm text-white mb-1">
                      {session.subject || 'General Study'}
                    </h4>
                    <p className="text-xs font-mono text-gray-400">
                      {new Date(session.started_at).toLocaleDateString()} at{' '}
                      {new Date(session.started_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-pixel text-pixel-gold">
                      +{session.xp_earned || 0} XP
                    </p>
                    <p className="text-xs font-mono text-gray-400">
                      {session.duration || 0} mins
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {sessions.length > 5 && (
              <button
                onClick={() => window.location.href = '/sessions'}
                className="w-full border-2 border-pixel-accent py-2 font-pixel text-xs text-pixel-gold hover:bg-pixel-accent transition-colors"
              >
                View All Sessions →
              </button>
            )}
          </div>
        )}
      </PixelCard>

      {/* Quick Actions */}
      <PixelCard title="Quick Actions" icon="⚡">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/sessions/new'}
            className="bg-pixel-success border-4 border-white p-6 hover:bg-green-600 transition-colors"
          >
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-pixel text-sm text-white mb-1">Start Study Session</h3>
            <p className="text-xs font-mono text-gray-300">Begin earning XP now</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/achievements'}
            className="bg-pixel-primary border-4 border-pixel-accent p-6 hover:bg-gray-700 transition-colors"
          >
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="font-pixel text-sm text-white mb-1">View Achievements</h3>
            <p className="text-xs font-mono text-gray-300">Check your progress</p>
          </button>
        </div>
      </PixelCard>
    </div>
  );
}