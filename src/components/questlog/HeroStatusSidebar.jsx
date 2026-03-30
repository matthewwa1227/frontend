import React from 'react';
import { cn } from '../../utils/cn';

/**
 * HeroStatusSidebar - Right column sidebar showing hero stats
 * Includes level, XP progress, subject mastery, weekly stats
 * 
 * @param {Object} props
 * @param {Object} props.user - User data
 * @param {Array} props.subjectMastery - Subject progress data
 * @param {Object} props.weeklyStats - Weekly completion stats
 * @param {Array} props.activePotions - Active buffs/potions
 * @param {string} props.className - Additional CSS classes
 */
const HeroStatusSidebar = ({
  user,
  subjectMastery = [],
  weeklyStats = { completed: 12, total: 50, xpEarned: 2450 },
  activePotions = [],
  className = '',
}) => {
  const level = user?.level || 42;
  const xp = user?.xp || 9000;
  const nextLevelXP = level * 1250;
  const currentLevelBaseXP = (level - 1) * 1250;
  const xpInLevel = xp - currentLevelBaseXP;
  const xpNeeded = nextLevelXP - currentLevelBaseXP;
  const xpPercent = Math.round((xpInLevel / xpNeeded) * 100);

  const defaultSubjects = [
    { id: 'MATH', name: 'Math', progress: 75, color: 'secondary' },
    { id: 'ENGLISH', name: 'English', progress: 60, color: 'primary' },
    { id: 'SCIENCE', name: 'Science', progress: 45, color: 'tertiary' },
    { id: 'HISTORY', name: 'History', progress: 30, color: 'secondary' },
  ];

  const subjects = subjectMastery.length > 0 ? subjectMastery : defaultSubjects;

  const defaultPotions = [
    { id: 1, name: 'Focus Boost', icon: 'auto_fix_high', color: 'primary' },
    { id: 2, name: 'XP Multiplier', icon: 'local_fire_department', color: 'tertiary' },
  ];

  const potions = activePotions.length > 0 ? activePotions : defaultPotions;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Hero Level Card */}
      <div className="bg-surface-container border-2 border-outline-variant p-4 shadow-[4px_4px_0px_0px_#150136]">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 border-4 border-tertiary bg-surface-container-low flex items-center justify-center shadow-[4px_4px_0px_0px_#4c3f00]">
            <span className="material-symbols-outlined text-3xl text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>
              shield_with_heart
            </span>
          </div>
          
          {/* Level Info */}
          <div className="flex-1">
            <div className="font-['Press_Start_2P'] text-2xl text-tertiary mb-1">LEVEL {level}</div>
            <div className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">
              {xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-['Press_Start_2P'] text-[6px] text-secondary">PROGRESS TO LVL {level + 1}</span>
            <span className="font-['Press_Start_2P'] text-[6px] text-secondary">{xpPercent}%</span>
          </div>
          <div className="h-3 bg-surface-container-lowest border border-outline-variant overflow-hidden">
            <div 
              className="h-full bg-tertiary pixel-segmented transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subject Mastery */}
      <div className="bg-surface-container border-2 border-outline-variant p-4 shadow-[4px_4px_0px_0px_#150136]">
        <h3 className="font-['Press_Start_2P'] text-[10px] text-secondary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">school</span>
          SUBJECT MASTERY
        </h3>
        
        <div className="space-y-3">
          {subjects.map((subject) => (
            <div key={subject.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-['Press_Start_2P'] text-[8px] text-on-surface">{subject.name}</span>
                <span className={cn("font-['Press_Start_2P'] text-[6px]", `text-${subject.color}`)}>
                  {subject.progress}%
                </span>
              </div>
              <div className="h-2 bg-surface-container-lowest border border-outline-variant overflow-hidden">
                <div 
                  className={cn("h-full pixel-segmented", `bg-${subject.color}`)}
                  style={{ width: `${subject.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Potions / Buffs */}
      <div className="bg-surface-container border-2 border-outline-variant p-4 shadow-[4px_4px_0px_0px_#150136]">
        <h3 className="font-['Press_Start_2P'] text-[10px] text-secondary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">auto_fix_high</span>
          ACTIVE BUFFS
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {potions.map((potion) => (
            <div 
              key={potion.id}
              className="flex flex-col items-center p-3 bg-surface-container-high border border-outline-variant"
            >
              <span className={cn("material-symbols-outlined text-xl mb-1", `text-${potion.color}`)}>
                {potion.icon}
              </span>
              <span className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant text-center">
                {potion.name}
              </span>
            </div>
          ))}
          
          {/* Empty slot */}
          <button className="flex flex-col items-center p-3 bg-surface-container-low border border-dashed border-outline-variant hover:border-primary transition-colors">
            <span className="material-symbols-outlined text-xl text-outline-variant mb-1">add</span>
            <span className="font-['Press_Start_2P'] text-[6px] text-outline-variant text-center">
              ADD BUFF
            </span>
          </button>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="bg-surface-container border-2 border-tertiary p-4 shadow-[4px_4px_0px_0px_#4c3f00]">
        <h3 className="font-['Press_Start_2P'] text-[10px] text-tertiary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">calendar_view_week</span>
          WEEKLY PROGRESS
        </h3>
        
        <div className="space-y-4">
          {/* Quest Completion */}
          <div className="flex items-center justify-between">
            <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">QUESTS</span>
            <span className="font-['Press_Start_2P'] text-[10px] text-on-surface">
              <span className="text-tertiary">{weeklyStats.completed}</span>
              <span className="text-on-surface-variant">/{weeklyStats.total}</span>
            </span>
          </div>
          
          {/* XP Earned */}
          <div className="flex items-center justify-between">
            <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">XP EARNED</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-tertiary">stars</span>
              <span className="font-['Press_Start_2P'] text-[10px] text-tertiary">
                {weeklyStats.xpEarned.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Mini Progress Bar */}
          <div className="h-2 bg-surface-container-lowest border border-outline-variant overflow-hidden">
            <div 
              className="h-full bg-tertiary pixel-segmented"
              style={{ width: `${(weeklyStats.completed / weeklyStats.total) * 100}%` }}
            />
          </div>
          
          {/* Completion Text */}
          <div className="text-center">
            <span className="font-['Press_Start_2P'] text-[8px] text-tertiary">
              {weeklyStats.completed >= weeklyStats.total 
                ? 'WEEKLY GOAL ACHIEVED!' 
                : `${weeklyStats.total - weeklyStats.completed} MORE TO GOAL!`}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="bg-surface-container-low border-l-4 border-primary p-3">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
          <div>
            <div className="font-['Press_Start_2P'] text-[6px] text-primary mb-1">HERO TIP</div>
            <p className="font-body text-xs text-on-surface-variant">
              Complete daily bounties for bonus XP multipliers!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroStatusSidebar;
