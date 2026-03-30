import React from 'react';
import { cn } from '../../utils/cn';

/**
 * QuestCard - RPG-styled quest card with rarity system
 * 
 * Rarities:
 * - COMMON: White/gray border
 * - UNCOMMON: Cyan border
 * - RARE: Pink border  
 * - EPIC: Gold border with glow
 * - LEGENDARY: Animated rainbow border
 * 
 * @param {Object} props
 * @param {Object} props.quest - Quest data
 * @param {function} props.onClick - Click handler
 * @param {function} props.onComplete - Complete handler
 * @param {string} props.className - Additional CSS classes
 */
const QuestCard = ({
  quest,
  onClick,
  onComplete,
  className = '',
}) => {
  const {
    id,
    title,
    description,
    subject,
    rarity = 'COMMON',
    status = 'READY',
    progress = { current: 0, total: 1 },
    xpReward = 100,
    estimatedMinutes = 30,
    difficulty = 'MEDIUM',
    icon = 'scroll',
  } = quest;

  // Rarity configuration
  const rarityConfig = {
    COMMON: {
      border: 'border-outline-variant',
      bg: 'bg-surface-container',
      progress: 'bg-outline',
      shadow: '',
      label: 'COMMON',
      labelColor: 'text-on-surface-variant',
    },
    UNCOMMON: {
      border: 'border-secondary',
      bg: 'bg-surface-container',
      progress: 'bg-secondary',
      shadow: 'shadow-[0_0_10px_rgba(0,241,254,0.2)]',
      label: 'UNCOMMON',
      labelColor: 'text-secondary',
    },
    RARE: {
      border: 'border-primary',
      bg: 'bg-surface-container',
      progress: 'bg-primary',
      shadow: 'shadow-[0_0_10px_rgba(255,177,196,0.2)]',
      label: 'RARE',
      labelColor: 'text-primary',
    },
    EPIC: {
      border: 'border-tertiary',
      bg: 'bg-surface-container',
      progress: 'bg-tertiary',
      shadow: 'shadow-[0_0_15px_rgba(233,196,0,0.3)]',
      label: 'EPIC',
      labelColor: 'text-tertiary',
    },
    LEGENDARY: {
      border: 'border-primary',
      bg: 'bg-surface-container',
      progress: 'bg-gradient-to-r from-primary via-tertiary to-secondary',
      shadow: 'shadow-[0_0_20px_rgba(255,74,141,0.4)]',
      label: 'LEGENDARY',
      labelColor: 'text-primary animate-pulse',
      animated: true,
    },
  };

  const config = rarityConfig[rarity] || rarityConfig.COMMON;

  // Status configuration
  const isCompleted = status === 'COMPLETED' || status === 'CLAIMED';
  const isInProgress = status === 'IN_PROGRESS';
  const isReady = status === 'READY';
  const isClaimed = status === 'CLAIMED';

  // Progress percentage
  const progressPercent = Math.min(100, Math.round((progress.current / progress.total) * 100));

  // Difficulty colors
  const difficultyColors = {
    EASY: 'text-secondary',
    MEDIUM: 'text-primary',
    HARD: 'text-tertiary',
    ELITE: 'text-error',
  };

  // Subject icons
  const subjectIcons = {
    MATH: 'calculate',
    ENGLISH: 'menu_book',
    SCIENCE: 'science',
    HISTORY: 'history',
    GENERAL: 'school',
  };

  return (
    <div
      onClick={() => onClick?.(quest)}
      className={cn(
        "relative group cursor-pointer transition-all duration-200",
        "border-l-4 p-4",
        config.border,
        config.bg,
        config.shadow,
        "hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#150136]",
        isCompleted && "opacity-60",
        isClaimed && "grayscale",
        config.animated && "animate-pulse",
        className
      )}
    >
      {/* Rarity glow effect for EPIC+ */}
      {(rarity === 'EPIC' || rarity === 'LEGENDARY') && (
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
          rarity === 'EPIC' && "bg-tertiary/5",
          rarity === 'LEGENDARY' && "bg-primary/5"
        )} />
      )}

      <div className="relative flex items-start gap-4">
        {/* Icon Box */}
        <div className={cn(
          "w-10 h-10 flex-shrink-0 flex items-center justify-center",
          "border-2 bg-background",
          isCompleted ? 'border-tertiary' : config.border
        )}>
          <span className={cn(
            "material-symbols-outlined",
            isCompleted ? 'text-tertiary' : config.labelColor
          )} style={isCompleted ? {fontVariationSettings: "'FILL' 1"} : {}}>
            {isCompleted ? 'check_circle' : (subjectIcons[subject] || icon)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn(
              "font-headline font-bold text-on-surface truncate pr-2",
              isCompleted && "line-through"
            )}>
              {title}
            </h4>
            {/* Rarity Badge */}
            <span className={cn(
              "font-['Press_Start_2P'] text-[6px] uppercase whitespace-nowrap px-1.5 py-0.5 border",
              config.labelColor,
              config.border
            )}>
              {config.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">
            {description}
          </p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className={cn(
                "font-['Press_Start_2P'] text-[6px]",
                isReady ? 'text-secondary' : 
                isInProgress ? 'text-primary' : 'text-tertiary'
              )}>
                {isReady ? 'READY' : 
                 isInProgress ? `${progress.current}/${progress.total}` : 
                 isClaimed ? 'CLAIMED' : 'COMPLETED'}
              </span>
              <span className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant">
                {progressPercent}%
              </span>
            </div>
            <div className="h-2 bg-surface-container-lowest border border-outline-variant overflow-hidden">
              <div 
                className={cn(
                  "h-full pixel-segmented transition-all duration-500",
                  config.progress,
                  isInProgress && "animate-pulse"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between">
            {/* Left: Difficulty & Time */}
            <div className="flex items-center gap-3">
              <span className={cn(
                "font-['Press_Start_2P'] text-[6px] uppercase",
                difficultyColors[difficulty] || 'text-on-surface-variant'
              )}>
                {difficulty}
              </span>
              <span className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant">
                {estimatedMinutes}MIN
              </span>
            </div>

            {/* Right: XP Reward */}
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-tertiary">stars</span>
              <span className="font-['Press_Start_2P'] text-[8px] text-tertiary">
                +{xpReward}
              </span>
            </div>
          </div>
        </div>

        {/* Complete Button (if ready) */}
        {isReady && onComplete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete?.(quest);
            }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-on-primary flex items-center justify-center
                       border-2 border-on-primary shadow-[2px_2px_0px_0px_#65002e]
                       hover:brightness-110 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestCard;
