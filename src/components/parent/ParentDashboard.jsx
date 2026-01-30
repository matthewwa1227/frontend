import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { familyAPI } from '../../utils/api';
import { getUser, clearAuth } from '../../utils/auth';
import PixelButton from '../shared/PixelButton';
import { 
  Users, 
  Plus, 
  LogOut, 
  Trophy, 
  Flame, 
  Clock, 
  Star,
  X,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Link child modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [relationship, setRelationship] = useState('Guardian');
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
      setChildren(response.data.children || []);
    } catch (err) {
      console.error('Failed to fetch children:', err);
      setError('Failed to load children data');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (e) => {
    e.preventDefault();
    setLinkLoading(true);
    setLinkError('');
    setLinkSuccess('');

    try {
      const response = await familyAPI.linkChild(linkCode, relationship);
      setLinkSuccess(`Successfully linked to ${response.data.student.fullName}!`);
      setLinkCode('');
      setRelationship('Guardian');
      
      // Refresh children list
      await fetchChildren();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowLinkModal(false);
        setLinkSuccess('');
      }, 2000);
    } catch (err) {
      setLinkError(err.response?.data?.message || 'Failed to link child');
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
      await fetchChildren();
    } catch (err) {
      alert('Failed to remove child: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const formatStudyTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-pixel-dark">
      {/* Header */}
      <header className="bg-pixel-primary border-b-4 border-pixel-accent">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-pixel-gold border-4 border-white shadow-pixel p-2">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <div>
              <h1 className="text-xl font-pixel text-white">Parent Dashboard</h1>
              <p className="text-xs font-pixel text-gray-400">
                Welcome, {user?.fullName || user?.username || 'Parent'}
              </p>
            </div>
          </div>
          
          <PixelButton onClick={handleLogout} variant="secondary">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </PixelButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-pixel text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-pixel-gold" />
            Linked Children ({children.length})
          </h2>
          
          <div className="flex gap-4">
            <PixelButton onClick={fetchChildren} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </PixelButton>
            <PixelButton onClick={() => setShowLinkModal(true)} variant="gold">
              <Plus className="w-4 h-4 mr-2" />
              Link Child
            </PixelButton>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900 border-4 border-red-600 text-white text-sm font-pixel p-4 mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block bg-pixel-primary border-4 border-pixel-accent p-8">
              <div className="animate-pulse text-4xl mb-4">🔄</div>
              <p className="text-sm font-pixel text-gray-400">Loading children data...</p>
            </div>
          </div>
        ) : children.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="inline-block bg-pixel-primary border-4 border-pixel-accent p-8 max-w-md">
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-lg font-pixel text-white mb-2">No Children Linked</h3>
              <p className="text-xs font-pixel text-gray-400 mb-6">
                Ask your child to generate an invite code from their StudyQuest app, 
                then click "Link Child" to connect.
              </p>
              <PixelButton onClick={() => setShowLinkModal(true)} variant="gold">
                <Plus className="w-4 h-4 mr-2" />
                Link Your First Child
              </PixelButton>
            </div>
          </div>
        ) : (
          /* Children Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-pixel-primary border-4 border-pixel-accent shadow-pixel hover:border-pixel-gold transition-colors"
              >
                {/* Child Header */}
                <div className="bg-pixel-dark p-4 border-b-4 border-pixel-accent flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pixel-gold border-4 border-white flex items-center justify-center">
                      <span className="text-xl">🧑‍🎓</span>
                    </div>
                    <div>
                      <h3 className="font-pixel text-white text-sm">{child.fullName}</h3>
                      <p className="text-xs font-pixel text-gray-400">@{child.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveChild(child.id, child.fullName)}
                    className="text-red-400 hover:text-red-300 p-2"
                    title="Unlink child"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats */}
                <div className="p-4 space-y-4">
                  {/* Level & XP */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-pixel-gold" />
                      <span className="text-xs font-pixel text-gray-400">Level</span>
                    </div>
                    <span className="font-pixel text-white text-lg">{child.level}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-pixel text-gray-400">XP</span>
                    </div>
                    <span className="font-pixel text-pixel-gold">{child.xp.toLocaleString()}</span>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-pixel text-gray-400">Streak</span>
                    </div>
                    <span className="font-pixel text-orange-400">
                      {child.currentStreak} day{child.currentStreak !== 1 ? 's' : ''} 🔥
                    </span>
                  </div>

                  {/* Study Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-pixel text-gray-400">Total Study</span>
                    </div>
                    <span className="font-pixel text-blue-400">
                      {formatStudyTime(child.totalStudyTime)}
                    </span>
                  </div>

                  {/* Relationship Badge */}
                  <div className="pt-4 border-t-2 border-pixel-accent">
                    <span className="inline-block bg-pixel-dark border-2 border-pixel-accent px-3 py-1 text-xs font-pixel text-gray-400">
                      {child.relationship}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-pixel-primary border-4 border-pixel-accent shadow-pixel max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-pixel-dark p-4 border-b-4 border-pixel-accent flex items-center justify-between">
              <h3 className="font-pixel text-white">Link Child Account</h3>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkError('');
                  setLinkSuccess('');
                  setLinkCode('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-xs font-pixel text-gray-400 mb-6">
                Ask your child to generate an invite code from their StudyQuest settings, 
                then enter it below.
              </p>

              {linkError && (
                <div className="bg-red-900 border-4 border-red-600 text-white text-xs font-pixel p-3 mb-4">
                  ⚠️ {linkError}
                </div>
              )}

              {linkSuccess && (
                <div className="bg-green-900 border-4 border-green-600 text-white text-xs font-pixel p-3 mb-4">
                  ✅ {linkSuccess}
                </div>
              )}

              <form onSubmit={handleLinkChild} className="space-y-4">
                {/* Code Input */}
                <div>
                  <label className="block text-xs font-pixel text-white mb-2">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    maxLength={6}
                    required
                    className="w-full bg-pixel-dark border-4 border-pixel-accent text-white font-mono text-xl text-center tracking-widest px-4 py-3 focus:outline-none focus:border-pixel-gold uppercase"
                  />
                </div>

                {/* Relationship Select */}
                <div>
                  <label className="block text-xs font-pixel text-white mb-2">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-pixel-dark border-4 border-pixel-accent text-white font-pixel text-sm px-4 py-3 focus:outline-none focus:border-pixel-gold"
                  >
                    <option value="Guardian">Guardian</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Submit Button */}
                <PixelButton
                  type="submit"
                  disabled={linkLoading || linkCode.length !== 6}
                  variant="gold"
                  className="w-full"
                >
                  {linkLoading ? 'Linking...' : 'Link Child'}
                </PixelButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}