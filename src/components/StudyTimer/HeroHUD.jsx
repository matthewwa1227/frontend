import React from 'react';
import { cn } from '../../utils/cn';

/**
 * HeroHUD - Displays hero's HP (Stamina) and XP (Focus) bars
 * Part of the Boss Arena center column
 * 
 * @param {Object} props
 * @param {number} props.stamina - Current stamina (0-100)
 * @param {number} props.focus - Current focus/xp (0-100)
 * @param {number} props.level - Hero level
 * @param {string} props.className - Additional CSS classes
 */
const HeroHUD = ({
  stamina = 100,
  focus = 0,
  level = 42,
  className = '',
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Level */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">shield_with_heart</span>
          <span className="font-['Press_Start_2P'] text-[10px] text-tertiary">HERO STATUS</span>
        </div>
        <span className="font-['Press_Start_2P'] text-[10px] text-secondary">LVL {level}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* HP / Stamina Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-['Press_Start_2P'] text-[8px] text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">favorite</span>
              HP (STAMINA)
            </span>
            <span className="font-['Press_Start_2P'] text-[8px] text-error">
              {stamina}%
            </span>
          </div>
          <div className="h-4 bg-surface-container-lowest border-2 border-surface-container-highest overflow-hidden relative">
            <div 
              className="h-full bg-error pixel-segmented transition-all duration-500"
              style={{ width: `${stamina}%` }}
            />
          </div>
        </div>

        {/* XP / Focus Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-['Press_Start_2P'] text-[8px] text-tertiary flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">bolt</span>
              XP (FOCUS)
            </span>
            <span className="font-['Press_Start_2P'] text-[8px] text-tertiary">
              {Math.round(focus)}%
            </span>
          </div>
          <div className="h-4 bg-surface-container-lowest border-2 border-surface-container-highest overflow-hidden relative">
            <div 
              className="h-full bg-tertiary pixel-segmented transition-all duration-500"
              style={{ width: `${focus}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroHUD;
