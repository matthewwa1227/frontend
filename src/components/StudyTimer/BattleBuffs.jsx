import React from 'react';
import { cn } from '../../utils/cn';

/**
 * BattleBuffs - Left column component showing subject multipliers and active potions
 * 
 * @param {Object} props
 * @param {string} props.activeSubject - Currently selected subject
 * @param {function} props.onSubjectChange - Handler for subject selection
 * @param {Array} props.activePotions - List of active potions
 * @param {string} props.className - Additional CSS classes
 */
const BattleBuffs = ({
  activeSubject = 'DSE_MATH',
  onSubjectChange,
  activePotions = [
    { id: 1, name: 'Focus Pill', quantity: 3, icon: 'medication' },
    { id: 2, name: 'XP Boost', quantity: 1, icon: 'local_fire_department' },
  ],
  className = '',
}) => {
  const subjects = [
    { id: 'DSE_MATH', name: 'DSE MATH', buff: 'CRIT STUDY +15%', icon: 'functions', color: 'secondary' },
    { id: 'ENGLISH_LANG', name: 'ENGLISH LANG', buff: 'MANA REGEN +10%', icon: 'translate', color: 'primary' },
    { id: 'DSE_PHYSICS', name: 'DSE PHYSICS', buff: 'DEFENSE UP +20%', icon: 'science', color: 'tertiary' },
    { id: 'DSE_CHEM', name: 'DSE CHEM', buff: 'XP GAIN +12%', icon: 'biotech', color: 'secondary' },
    { id: 'DSE_BIO', name: 'DSE BIO', buff: 'HEAL OVER TIME', icon: 'genetics', color: 'primary' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'text-primary border-primary hover:bg-primary/10',
      secondary: 'text-secondary border-secondary hover:bg-secondary/10',
      tertiary: 'text-tertiary border-tertiary hover:bg-tertiary/10',
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Battle Buffs Card */}
      <div className="bg-surface-container border-l-4 border-tertiary p-4 shadow-[4px_4px_0px_0px_#150136]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-tertiary">auto_fix_high</span>
          <h3 className="font-['Press_Start_2P'] text-[10px] text-tertiary">BATTLE BUFFS</h3>
        </div>

        {/* Subject List */}
        <div className="space-y-3">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => onSubjectChange?.(subject.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 transition-all duration-150",
                "border-l-2",
                activeSubject === subject.id
                  ? getColorClasses(subject.color)
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
                activeSubject === subject.id && "bg-surface-container-high"
              )}
            >
              <span className={cn(
                "material-symbols-outlined",
                activeSubject === subject.id ? `text-${subject.color}` : "text-on-surface-variant"
              )}>
                {subject.icon}
              </span>
              <div className="flex-1 text-left">
                <div className={cn(
                  "font-['Press_Start_2P'] text-[8px]",
                  activeSubject === subject.id ? `text-${subject.color}` : "text-on-surface"
                )}>
                  {subject.name}
                </div>
                <div className="font-body text-[10px] text-on-surface-variant">
                  {subject.buff}
                </div>
              </div>
              {activeSubject === subject.id && (
                <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Potions Card */}
      <div className="bg-surface-container border-2 border-outline-variant p-4 shadow-[4px_4px_0px_0px_#150136]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-secondary">medication</span>
          <h3 className="font-['Press_Start_2P'] text-[10px] text-secondary">ACTIVE POTIONS</h3>
        </div>

        {/* Potions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {activePotions.map((potion) => (
            <button
              key={potion.id}
              className="relative p-3 bg-surface-container-high border border-outline-variant hover:border-primary transition-colors group"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                  {potion.icon}
                </span>
                <span className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant text-center">
                  {potion.name}
                </span>
              </div>
              {/* Quantity Badge */}
              {potion.quantity > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-tertiary text-on-tertiary flex items-center justify-center font-['Press_Start_2P'] text-[8px]">
                  {potion.quantity}
                </span>
              )}
            </button>
          ))}
          
          {/* Empty slot */}
          <button className="p-3 bg-surface-container-low border border-dashed border-outline-variant hover:border-secondary transition-colors">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-outline-variant">add</span>
              <span className="font-['Press_Start_2P'] text-[6px] text-outline-variant text-center">
                ADD POTION
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-surface-container-low border-2 border-outline-variant p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant mb-1">MULTIPLIER</div>
            <div className="font-['Press_Start_2P'] text-lg text-tertiary">1.5x</div>
          </div>
          <div className="text-center">
            <div className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant mb-1">STREAK</div>
            <div className="font-['Press_Start_2P'] text-lg text-secondary">7</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleBuffs;
