import React, { useEffect } from 'react';

const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const tierColors = {
    bronze: 'border-orange-500 bg-orange-900/90',
    silver: 'border-gray-400 bg-gray-800/90',
    gold: 'border-yellow-500 bg-yellow-900/90',
    platinum: 'border-purple-500 bg-purple-900/90'
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className={`
        ${tierColors[achievement.badge_tier]}
        border-4 rounded-lg p-4 shadow-2xl max-w-sm
      `}>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-white text-sm mb-1">
              🎉 Achievement Unlocked!
            </div>
            <div className="text-yellow-400 font-bold">
              {achievement.name}
            </div>
            <div className="text-xs text-gray-300 mt-1">
              +{achievement.points_reward} points
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;