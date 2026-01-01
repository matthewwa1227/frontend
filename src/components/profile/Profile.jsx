// frontend/src/components/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { getUser } from '../../utils/auth';
import { studentAPI } from '../../utils/api';
import PixelCard from '../shared/PixelCard';
import ProgressBar from '../shared/ProgressBar';
import { 
  User, 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  Flame, 
  Calendar,
  Edit3,
  Save,
  X,
  Award,
  TrendingUp,
  BookOpen
} from 'lucide-react';

export default function Profile() {
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    avatar_url: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, achievementsRes] = await Promise.all([
        studentAPI.getStats(),
        studentAPI.getAchievements().catch(() => ({ data: { achievements: [] } }))
      ]);

      const studentData = statsRes.data.student;
      setProfile(studentData);
      setStats(studentData);
      setAchievements(achievementsRes.data.achievements || []);
      
      setEditForm({
        full_name: studentData.full_name || '',
        bio: studentData.bio || '',
        avatar_url: studentData.avatar_url || ''
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await studentAPI.updateProfile(editForm);
      setProfile(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    // Generate a pixel art style avatar based on username
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'F7DC6F', 'BB8FCE', '58D68D'];
    const colorIndex = (profile?.username || 'user').charCodeAt(0) % colors.length;
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile?.username || 'user'}&backgroundColor=${colors[colorIndex]}`;
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: 'Novice Scholar',
      2: 'Apprentice Learner',
      3: 'Dedicated Student',
      4: 'Knowledge Seeker',
      5: 'Wisdom Warrior',
      6: 'Master Scholar',
      7: 'Grand Sage',
      8: 'Legendary Learner',
      9: 'Epic Educator',
      10: 'Mythic Mind'
    };
    return titles[Math.min(level, 10)] || 'Ultimate Scholar';
  };

  const formatStudyTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getJoinDate = () => {
    if (!profile?.created_at) return 'Unknown';
    return new Date(profile.created_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pixel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-pixel text-sm">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-dark px-4">
        <div className="bg-red-900 border-4 border-red-600 p-8 max-w-md">
          <p className="text-white font-pixel text-sm mb-4">⚠️ {error}</p>
          <button
            onClick={fetchProfileData}
            className="w-full bg-pixel-gold border-4 border-white py-2 font-pixel text-sm hover:bg-yellow-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentLevel = profile?.level || 1;
  const currentXP = (profile?.xp || 0) % 100;
  const xpToNextLevel = 100 - currentXP;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <PixelCard className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-pixel-gold bg-pixel-dark overflow-hidden">
                <img 
                  src={getAvatarUrl()} 
                  alt="Avatar"
                  className="w-full h-full object-cover pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-pixel-gold border-2 border-white px-2 py-1">
                <span className="font-pixel text-xs text-black">LV.{currentLevel}</span>
              </div>
            </div>
            
            {/* Level Title */}
            <div className="mt-4 text-center">
              <span className="font-pixel text-xs text-pixel-gold">
                {getLevelTitle(currentLevel)}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-pixel text-gray-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full bg-pixel-dark border-2 border-pixel-accent p-2 text-white font-mono text-sm focus:border-pixel-gold outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-pixel text-gray-400 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-pixel-dark border-2 border-pixel-accent p-2 text-white font-mono text-sm focus:border-pixel-gold outline-none resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    maxLength={200}
                  />
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    {editForm.bio.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-pixel text-gray-400 mb-1">
                    Avatar URL (optional)
                  </label>
                  <input
                    type="url"
                    value={editForm.avatar_url}
                    onChange={(e) => setEditForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                    className="w-full bg-pixel-dark border-2 border-pixel-accent p-2 text-white font-mono text-sm focus:border-pixel-gold outline-none"
                    placeholder="https://example.com/avatar.png"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 bg-pixel-success border-2 border-white px-4 py-2 font-pixel text-xs hover:bg-green-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        full_name: profile?.full_name || '',
                        bio: profile?.bio || '',
                        avatar_url: profile?.avatar_url || ''
                      });
                    }}
                    className="flex items-center gap-2 bg-pixel-dark border-2 border-pixel-accent px-4 py-2 font-pixel text-xs text-gray-400 hover:border-red-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-pixel text-white mb-1">
                      {profile?.full_name || profile?.username || 'Student'}
                    </h1>
                    <p className="text-sm font-mono text-pixel-gold">
                      @{profile?.username}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-pixel-dark border-2 border-pixel-accent px-3 py-2 font-pixel text-xs text-gray-400 hover:border-pixel-gold hover:text-pixel-gold transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <p className="text-sm font-mono text-gray-400 mb-4">
                  {profile?.bio || 'No bio yet. Click Edit to add one!'}
                </p>

                <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {getJoinDate()}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {profile?.total_sessions || 0} sessions
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PixelCard>

      {/* XP Progress */}
      <PixelCard title="Experience Progress" icon="⚡" className="mb-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-pixel text-sm text-white">Level {currentLevel}</span>
            <span className="font-pixel text-sm text-pixel-gold">Level {currentLevel + 1}</span>
          </div>
          
          <ProgressBar
            current={currentXP}
            max={100}
            color="bg-pixel-gold"
          />
          
          <div className="flex justify-between text-xs font-mono text-gray-400">
            <span>{currentXP} / 100 XP</span>
            <span>{xpToNextLevel} XP to next level</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t-2 border-pixel-accent">
            <div className="text-center">
              <p className="text-2xl font-pixel text-pixel-success">{profile?.xp || 0}</p>
              <p className="text-xs font-pixel text-gray-400">Total XP Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-pixel text-pixel-info">{profile?.total_points || 0}</p>
              <p className="text-xs font-pixel text-gray-400">Total Points</p>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-pixel-primary border-4 border-pixel-accent p-4 text-center">
          <Clock className="w-8 h-8 text-pixel-info mx-auto mb-2" />
          <p className="text-xl font-pixel text-white">
            {formatStudyTime(profile?.total_study_time || profile?.total_study_minutes || 0)}
          </p>
          <p className="text-xs font-pixel text-gray-400">Study Time</p>
        </div>
        
        <div className="bg-pixel-primary border-4 border-pixel-accent p-4 text-center">
          <Target className="w-8 h-8 text-pixel-success mx-auto mb-2" />
          <p className="text-xl font-pixel text-white">{profile?.total_sessions || 0}</p>
          <p className="text-xs font-pixel text-gray-400">Sessions</p>
        </div>
        
        <div className="bg-pixel-primary border-4 border-pixel-accent p-4 text-center">
          <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-xl font-pixel text-white">{profile?.current_streak || 0}</p>
          <p className="text-xs font-pixel text-gray-400">Day Streak</p>
        </div>
        
        <div className="bg-pixel-primary border-4 border-pixel-accent p-4 text-center">
          <TrendingUp className="w-8 h-8 text-pixel-gold mx-auto mb-2" />
          <p className="text-xl font-pixel text-white">{profile?.longest_streak || 0}</p>
          <p className="text-xs font-pixel text-gray-400">Best Streak</p>
        </div>
      </div>

      {/* Recent Achievements */}
      <PixelCard title="Achievements" icon="🏆" className="mb-8">
        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎖️</div>
            <p className="text-white font-pixel text-sm mb-2">No achievements yet!</p>
            <p className="text-gray-400 font-pixel text-xs">
              Complete study sessions to unlock achievements
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.slice(0, 8).map((achievement) => (
              <div
                key={achievement.id}
                className={`border-2 p-3 text-center transition-all ${
                  achievement.unlocked
                    ? 'border-pixel-gold bg-pixel-dark'
                    : 'border-pixel-accent bg-pixel-primary opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">
                  {achievement.icon || '🏅'}
                </div>
                <p className="text-xs font-pixel text-white truncate">
                  {achievement.name}
                </p>
                {achievement.unlocked && (
                  <p className="text-xs font-mono text-pixel-gold mt-1">
                    +{achievement.points_reward} pts
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {achievements.length > 8 && (
          <button
            onClick={() => window.location.href = '/achievements'}
            className="w-full mt-4 border-2 border-pixel-accent py-2 font-pixel text-xs text-pixel-gold hover:bg-pixel-accent transition-colors"
          >
            View All Achievements →
          </button>
        )}
      </PixelCard>

      {/* Study Breakdown */}
      <PixelCard title="Subject Breakdown" icon="📊">
        {profile?.subject_stats && profile.subject_stats.length > 0 ? (
          <div className="space-y-3">
            {profile.subject_stats.map((subject, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-pixel text-white">{subject.name}</span>
                  <span className="font-mono text-gray-400">
                    {formatStudyTime(subject.minutes)}
                  </span>
                </div>
                <div className="h-3 bg-pixel-dark border border-pixel-accent overflow-hidden">
                  <div
                    className="h-full bg-pixel-info transition-all duration-500"
                    style={{
                      width: `${Math.min((subject.minutes / (profile.total_study_minutes || 1)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-white font-pixel text-sm mb-2">No study data yet!</p>
            <p className="text-gray-400 font-pixel text-xs">
              Start studying to see your subject breakdown
            </p>
          </div>
        )}
      </PixelCard>
    </div>
  );
}