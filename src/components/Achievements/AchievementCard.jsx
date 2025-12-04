import React from 'react';
import { Lock } from 'lucide-react';

const AchievementCard = ({ achievement }) => {
  const { 
    name, 
    description, 
    icon, 
    requirement_value, 
    progress = 0, 
    unlocked, 
    progress_percentage = 0,
    badge_tier,
    points_reward 
  } = achievement;

  const tierColors = {
    bronze: 'border-orange-600 bg-orange-900/20',
    silver: 'border-gray-400 bg-gray-800/20',
    gold: 'border-yellow-500 bg-yellow-900/20',
    platinum: 'border-purple-500 bg-purple-900/20'
  };

  const tierGlow = {
    bronze: 'shadow-orange-500/50',
    silver: 'shadow-gray-400/50',
    gold: 'shadow-yellow-500/50',
    platinum: 'shadow-purple-500/50'
  };

  return (
    <div
      className={`
        relative bg-gray-800 border-4 p-4 rounded-lg transition-all duration-300
        ${unlocked 
          ? `${tierColors[badge_tier]} shadow-lg hover:shadow-xl hover:-translate-y-1 ${tierGlow[badge_tier]}` 
          : 'border-gray-600 opacity-60'
        }
      `}
    >
      {/* Badge Tier */}
      <div className="absolute top-2 left-2">
        <span className={`
          text-xs font-bold px-2 py-1 border-2 rounded
          ${unlocked 
            ? badge_tier === 'bronze' ? 'border-orange-600 text-orange-400 bg-orange-900/50' :
              badge_tier === 'silver' ? 'border-gray-400 text-gray-300 bg-gray-700/50' :
              badge_tier === 'gold' ? 'border-yellow-500 text-yellow-400 bg-yellow-900/50' :
              'border-purple-500 text-purple-400 bg-purple-900/50'
            : 'border-gray-600 text-gray-500 bg-gray-800/50'
          }
        `}>
          {badge_tier?.toUpperCase()}
        </span>
      </div>

      {/* Lock Icon */}
      {!unlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-gray-500" />
        </div>
      )}

      {/* Icon */}
      <div className="text-center mb-3 mt-6">
        <div className={`text-5xl mb-2 ${unlocked ? '' : 'grayscale opacity-50'}`}>
          {icon}
        </div>
        <h3 className={`font-bold text-sm mb-1
          ${unlocked 
            ? badge_tier === 'bronze' ? 'text-orange-400' :
              badge_tier === 'silver' ? 'text-gray-300' :
              badge_tier === 'gold' ? 'text-yellow-400' :
              'text-purple-400'
            : 'text-gray-400'
          }
        `}>
          {name}
        </h3>
        <p className="text-xs text-gray-400">
          {description}
        </p>
      </div>

      {/* Points */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-1 text-xs font-bold text-yellow-500">
          <span>⭐</span>
          <span>{points_reward} pts</span>
        </div>
      </div>

      {/* Progress Bar (only for locked) */}
      {!unlocked && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}/{requirement_value}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 border-2 border-gray-600 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300
                ${badge_tier === 'bronze' ? 'bg-orange-600' :
                  badge_tier === 'silver' ? 'bg-gray-400' :
                  badge_tier === 'gold' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }
              `}
              style={{ width: `${Math.min(progress_percentage || 0, 100)}%` }}
            />
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">
            {parseFloat(progress_percentage || 0).toFixed(1)}%
          </div>
        </div>
      )}

      {/* Unlocked Badge */}
      {unlocked && (
        <div className="mt-3 text-center">
          <div className={`inline-block px-3 py-1 border-2 font-bold text-xs rounded
            ${badge_tier === 'bronze' ? 'bg-orange-600 border-orange-400 text-white' :
              badge_tier === 'silver' ? 'bg-gray-400 border-gray-200 text-gray-900' :
              badge_tier === 'gold' ? 'bg-yellow-500 border-yellow-300 text-gray-900' :
              'bg-purple-500 border-purple-300 text-white'
            }
          `}>
            ✓ UNLOCKED
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementCard;