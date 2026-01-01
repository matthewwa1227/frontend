import React, { useState, useEffect } from 'react';
import { Trophy, Target, Clock, Flame, Zap, Star } from 'lucide-react';
import api from '../../utils/api';
import AchievementCard from './AchievementCard';
import AchievementNotification from './AchievementNotification';

const Achievements = () => {
  const [achievements, setAchievements] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notifications, setNotifications] = useState([]); // ✅ NEW: Store multiple notifications

  const categories = [
    { id: 'all', name: 'All', icon: Star },
    { id: 'milestone', name: 'Milestones', icon: Target },
    { id: 'time', name: 'Time Mastery', icon: Clock },
    { id: 'streak', name: 'Streaks', icon: Flame },
    { id: 'focus', name: 'Focus', icon: Zap },
  ];

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await api.get('/achievements');
      console.log('Achievements response:', response.data);
      setAchievements(response.data.achievements);
      setStats(response.data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      setLoading(false);
    }
  };

  // ✅ NEW: Check achievements and show popup
  const handleCheckAchievements = async () => {
    try {
      console.log('🔍 Manually checking achievements...');
      const response = await api.post('/achievements/check');
      
      console.log('Check response:', response.data);
      
      // If achievements were unlocked, show notifications
      if (response.data.unlocked && response.data.unlocked.length > 0) {
        const newlyUnlocked = response.data.unlocked;
        
        console.log(`🎉 ${newlyUnlocked.length} achievement(s) unlocked!`);
        
        // Add each unlocked achievement to notifications with a slight delay
        newlyUnlocked.forEach((achievement, index) => {
          setTimeout(() => {
            setNotifications(prev => [...prev, {
              ...achievement,
              id: `${achievement.id}-${Date.now()}-${index}` // Unique ID for each notification
            }]);
          }, index * 300); // Stagger notifications by 300ms
        });
        
        // Refresh achievements after unlocking
        await fetchAchievements();
      } else {
        console.log('ℹ️ No new achievements unlocked');
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  };

  // ✅ NEW: Remove notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getFilteredAchievements = () => {
    if (!achievements) return [];
    
    if (selectedCategory === 'all') {
      return Object.values(achievements).flat();
    }
    
    return achievements[selectedCategory] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold text-sm">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const filteredAchievements = getFilteredAchievements();

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      {/* ✅ Achievement Notifications - Steam Style Popups */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map((achievement) => (
          <AchievementNotification
            key={achievement.id}
            achievement={achievement}
            onClose={() => removeNotification(achievement.id)}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            🏆 Achievements
          </h1>
          <p className="text-sm text-gray-400">
            Unlock badges and track your progress!
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="bg-gray-800 border-4 border-yellow-500 shadow-lg p-6 mb-8 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-1">
                  {stats.unlocked}
                </div>
                <div className="text-xs text-gray-400">Unlocked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-500 mb-1">
                  {stats.locked}
                </div>
                <div className="text-xs text-gray-400">Locked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.total}
                </div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-1">
                  {stats.completion_percentage}%
                </div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full h-4 bg-gray-700 border-2 border-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${stats.completion_percentage}%` }}
                />
              </div>
            </div>

            {/* ✅ NEW: Manual Check Button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleCheckAchievements}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-white shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🔍 Check Achievements Now
              </button>
              <p className="text-xs text-gray-400 mt-2">
                Manually trigger achievement unlock check
              </p>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 border-2 font-bold text-sm transition-all rounded-lg
                  ${selectedCategory === category.id
                    ? 'bg-yellow-500 text-gray-900 border-white shadow-lg'
                    : 'bg-gray-800 text-white border-yellow-500 hover:border-white'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-white font-bold text-lg mb-2">No achievements in this category</p>
            <p className="text-gray-400 text-sm">
              Try a different category or start studying!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;