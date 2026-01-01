import React, { useEffect } from 'react';

const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const tierColors = {
    bronze: 'border-orange-500 bg-gradient-to-r from-orange-900/95 to-orange-800/95',
    silver: 'border-gray-400 bg-gradient-to-r from-gray-800/95 to-gray-700/95',
    gold: 'border-yellow-500 bg-gradient-to-r from-yellow-900/95 to-yellow-800/95',
    platinum: 'border-purple-500 bg-gradient-to-r from-purple-900/95 to-purple-800/95'
  };

  const tierGlow = {
    bronze: 'shadow-orange-500/50',
    silver: 'shadow-gray-400/50',
    gold: 'shadow-yellow-500/50',
    platinum: 'shadow-purple-500/50'
  };

  return (
    <div className="animate-slide-in-right">
      <div className={`
        ${tierColors[achievement.badge_tier]}
        ${tierGlow[achievement.badge_tier]}
        border-4 rounded-lg p-4 shadow-2xl max-w-sm backdrop-blur-sm
        transform transition-all duration-300 hover:scale-105
      `}>
        <div className="flex items-center gap-3">
          <div className="text-5xl animate-bounce">{achievement.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-white text-sm mb-1 flex items-center gap-2">
              <span className="animate-pulse">🎉</span>
              Achievement Unlocked!
            </div>
            <div className="text-yellow-400 font-bold text-lg">
              {achievement.name}
            </div>
            <div className="text-xs text-gray-300 mt-1 flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              +{achievement.points_reward} points
            </div>
          </div>
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/50 hover:text-white text-xl font-bold w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AchievementNotification;