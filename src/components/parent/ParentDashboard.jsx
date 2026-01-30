import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { familyAPI, authAPI } from '../../utils/api';
import { getUser, logout } from '../../utils/auth';

// Helper to format minutes into readable time
const formatStudyTime = (minutes) => {
  if (!minutes || minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// XP needed for each level (simple formula)
const getXpForLevel = (level) => level * 100;

export default function ParentDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  
  // State
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  // Fetch children on mount
  useEffect(() => {
    fetchChildren();
  }, []);

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
        // Refresh children list
        await fetchChildren();
        // Close modal after delay
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

  const handleRemoveChild = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to unlink ${studentName}?`)) {
      return;
    }

    try {
      await familyAPI.removeChild(studentId);
      setChildren(children.filter(c => c.id !== studentId));
    } catch (err) {
      console.error('Remove error:', err);
      alert(err.response?.data?.message || 'Failed to remove child');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate summary stats
  const totalStudyTime = children.reduce((sum, c) => sum + (c.totalStudyTime || 0), 0);
  const averageLevel = children.length > 0 
    ? Math.round(children.reduce((sum, c) => sum + (c.level || 1), 0) / children.length) 
    : 0;
  const totalXp = children.reduce((sum, c) => sum + (c.xp || 0), 0);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border-2 border-blue-500 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">👶</div>
            <div className="text-2xl font-bold text-white">{children.length}</div>
            <div className="text-blue-300 text-sm">Connected Children</div>
          </div>
          <div className="bg-gray-800/50 border-2 border-green-500 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-white">{formatStudyTime(totalStudyTime)}</div>
            <div className="text-green-300 text-sm">Total Study Time</div>
          </div>
          <div className="bg-gray-800/50 border-2 border-yellow-500 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-white">{totalXp.toLocaleString()}</div>
            <div className="text-yellow-300 text-sm">Total XP Earned</div>
          </div>
          <div className="bg-gray-800/50 border-2 border-purple-500 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white">Lvl {averageLevel}</div>
            <div className="text-purple-300 text-sm">Average Level</div>
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

        {/* Loading State */}
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

              {linkError && (
                <p className="mt-2 text-red-400 text-sm">{linkError}</p>
              )}
              
              {linkSuccess && (
                <p className="mt-2 text-green-400 text-sm">{linkSuccess}</p>
              )}

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

// Child Card Component
function ChildCard({ child, onRemove }) {
  const xpForNextLevel = getXpForLevel(child.level || 1);
  const xpProgress = ((child.xp || 0) % 100); // Assuming 100 XP per level
  const progressPercent = Math.min((xpProgress / xpForNextLevel) * 100, 100);

  return (
    <div className="bg-gray-800/50 border-2 border-gray-600 hover:border-purple-500 rounded-lg p-6 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
            {child.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{child.fullName}</h3>
            <p className="text-gray-400 text-sm">@{child.username}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-full text-yellow-400 text-sm font-bold">
            Level {child.level || 1}
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
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
          <div className="text-xl">💎</div>
          <div className="text-white font-bold">{child.relationship}</div>
          <div className="text-gray-400 text-xs">Relation</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onRemove}
          className="flex-1 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded hover:bg-red-600/40 transition-colors text-sm"
        >
          Unlink
        </button>
      </div>

      {/* Connected Date */}
      <p className="text-gray-500 text-xs mt-3 text-center">
        Connected {new Date(child.connectedAt).toLocaleDateString()}
      </p>
    </div>
  );
}