import React from 'react';
import { cn } from '../../utils/cn';

/**
 * PlayerCard - Reusable player display component
 * Supports small (lists), medium (grids), and large (MVP spotlight) sizes
 * 
 * @param {Object} props
 * @param {Object} props.player - Player data
 * @param {string} props.size - 'small' | 'medium' | 'large'
 * @param {boolean} props.showStatus - Whether to show online status
 * @param {function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
const PlayerCard = ({
  player,
  size = 'medium',
  showStatus = true,
  onClick,
  className = '',
}) => {
  const {
    name = 'Unknown Hero',
    level = 1,
    power = 0,
    specialty = 'GENERAL',
    status = 'offline',
    avatar,
    guild,
    streak = 0,
    rank,
  } = player;

  // Status configuration
  const statusConfig = {
    online: { color: 'bg-secondary', label: 'ONLINE', animate: true },
    idle: { color: 'bg-tertiary', label: 'IDLE', animate: false },
    studying: { color: 'bg-primary', label: 'STUDYING', animate: true },
    offline: { color: 'bg-outline-variant', label: 'OFFLINE', animate: false },
  };

  const statusInfo = statusConfig[status] || statusConfig.offline;

  // Specialty icons
  const specialtyIcons = {
    MATH: 'calculate',
    ENGLISH: 'menu_book',
    SCIENCE: 'science',
    HISTORY: 'history',
    GENERAL: 'school',
  };

  // Size configurations
  const sizes = {
    small: {
      container: 'flex items-center gap-3 p-2',
      avatar: 'w-10 h-10',
      name: 'font-headline font-bold text-sm',
      level: 'font-["Press_Start_2P"] text-[6px] text-on-surface-variant',
      showPower: false,
      showSpecialty: false,
    },
    medium: {
      container: 'flex items-center gap-4 p-3',
      avatar: 'w-12 h-12',
      name: 'font-headline font-bold text-base',
      level: 'font-["Press_Start_2P"] text-[8px] text-on-surface-variant',
      showPower: true,
      showSpecialty: true,
    },
    large: {
      container: 'flex flex-col items-center text-center p-6',
      avatar: 'w-24 h-24 mb-4',
      name: 'font-["Press_Start_2P"] text-lg text-primary mb-2',
      level: 'font-["Press_Start_2P"] text-[10px] text-tertiary mb-1',
      showPower: true,
      showSpecialty: true,
    },
  };

  const config = sizes[size];

  return (
    <div
      onClick={() => onClick?.(player)}
      className={cn(
        "relative transition-all duration-200",
        size === 'large' ? 'bg-surface-container border-l-8 border-primary-container' : 'hover:bg-surface-container-high',
        onClick && 'cursor-pointer',
        config.container,
        className
      )}
    >
      {/* Rank Badge (if provided) */}
      {rank && rank <= 3 && (
        <div className={cn(
          "absolute -top-2 -left-2 w-8 h-8 flex items-center justify-center font-['Press_Start_2P'] text-sm",
          rank === 1 && "bg-tertiary text-on-tertiary border-2 border-on-tertiary shadow-[0_0_10px_#e9c400]",
          rank === 2 && "bg-secondary text-on-secondary border-2 border-on-secondary",
          rank === 3 && "bg-primary text-on-primary border-2 border-on-primary"
        )}>
          {rank === 1 ? '👑' : rank}
        </div>
      )}

      {/* Avatar */}
      <div className={cn(
        "relative flex-shrink-0 border-2 overflow-hidden",
        size === 'large' ? 'border-tertiary shadow-[4px_4px_0px_0px_#4c3f00]' : 'border-outline-variant',
        config.avatar
      )}>
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">
              {specialtyIcons[specialty] || 'person'}
            </span>
          </div>
        )}
        
        {/* Status Indicator */}
        {showStatus && (
          <div className={cn(
            "absolute bottom-0 right-0 w-3 h-3 border-2 border-surface-container",
            statusInfo.color,
            statusInfo.animate && "animate-pulse"
          )} />
        )}
      </div>

      {/* Info */}
      <div className={cn("flex-1 min-w-0", size === 'large' && 'w-full')}>
        {/* Name */}
        <h4 className={cn(config.name, "truncate")}>
          {name}
        </h4>
        
        {/* Level & Specialty */}
        <div className={cn("flex items-center gap-2", size === 'large' && 'justify-center')}>
          <span className={config.level}>LVL {level}</span>
          {config.showSpecialty && (
            <>
              <span className="text-on-surface-variant">•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-secondary">
                  {specialtyIcons[specialty]}
                </span>
                <span className="font-['Press_Start_2P'] text-[6px] text-secondary uppercase">
                  {specialty}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Power & Status (large only) */}
        {size === 'large' && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-tertiary">bolt</span>
              <span className="font-['Press_Start_2P'] text-xl text-tertiary">
                {power.toLocaleString()}
              </span>
              <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">HP</span>
            </div>
            
            {streak > 0 && (
              <div className="flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-error text-sm">local_fire_department</span>
                <span className="font-['Press_Start_2P'] text-[10px] text-error">
                  {streak} DAY STREAK
                </span>
              </div>
            )}
            
            {guild && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="material-symbols-outlined text-primary text-sm">shield</span>
                <span className="font-['Press_Start_2P'] text-[8px] text-primary">
                  {guild}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Power (medium only) */}
        {config.showPower && size !== 'large' && (
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-xs text-tertiary">bolt</span>
            <span className="font-['Press_Start_2P'] text-[8px] text-tertiary">
              {power.toLocaleString()}
            </span>
          </div>
        )}

        {/* Status Label (medium only) */}
        {size === 'medium' && showStatus && (
          <div className="flex items-center gap-1 mt-1">
            <div className={cn("w-2 h-2", statusInfo.color, statusInfo.animate && "animate-pulse")} />
            <span className={cn(
              "font-['Press_Start_2P'] text-[6px] uppercase",
              status === 'online' ? 'text-secondary' : 
              status === 'studying' ? 'text-primary' : 'text-on-surface-variant'
            )}>
              {statusInfo.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
