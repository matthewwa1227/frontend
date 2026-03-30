import React from 'react';
import { cn } from '../../utils/cn';

/**
 * ChallengeCard - Individual challenge display
 * Shows challenge progress, time remaining, and join button
 * 
 * @param {Object} props
 * @param {Object} props.challenge - Challenge data
 * @param {boolean} props.isJoined - Whether user joined this challenge
 * @param {function} props.onJoin - Join handler
 * @param {function} props.onView - View details handler
 * @param {string} props.className - Additional CSS classes
 */
const ChallengeCard = ({
  challenge,
  isJoined = false,
  onJoin,
  onView,
  className = '',
}) => {
  const {
    id,
    title,
    description,
    type = 'xp', // xp, time, streak
    goal,
    current = 0,
    reward,
    timeRemaining,
    participantCount = 0,
    difficulty = 'MEDIUM',
    endDate,
    banner = 'default',
  } = challenge;

  // Type configuration
  const typeConfig = {
    xp: { icon: 'stars', color: 'tertiary', label: 'XP CHALLENGE' },
    time: { icon: 'timer', color: 'secondary', label: 'TIME CHALLENGE' },
    streak: { icon: 'local_fire_department', color: 'primary', label: 'STREAK CHALLENGE' },
  };

  const typeInfo = typeConfig[type] || typeConfig.xp;

  // Difficulty colors
  const difficultyColors = {
    EASY: 'text-secondary border-secondary',
    MEDIUM: 'text-primary border-primary',
    HARD: 'text-tertiary border-tertiary',
    ELITE: 'text-error border-error',
  };

  // Calculate progress
  const progressPercent = Math.min(100, Math.round((current / goal) * 100));

  // Format time remaining
  const formatTime = (timeStr) => {
    if (!timeStr) return 'ONGOING';
    return timeStr;
  };

  return (
    <div
      onClick={() => onView?.(challenge)}
      className={cn(
        "bg-surface-container border-2 overflow-hidden transition-all",
        isJoined ? "border-primary shadow-[0_0_15px_rgba(255,177,196,0.2)]" : "border-outline-variant hover:border-primary",
        onView && "cursor-pointer",
        className
      )}
    >
      {/* Banner/Header */}
      <div className={cn(
        "h-20 relative overflow-hidden",
        banner === 'default' && "bg-gradient-to-r from-surface-container-high to-surface-container",
        banner === 'gold' && "bg-gradient-to-r from-tertiary/20 to-surface-container",
        banner === 'fire' && "bg-gradient-to-r from-primary/20 to-surface-container",
        banner === 'ice' && "bg-gradient-to-r from-secondary/20 to-surface-container"
      )}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-pixel-grid-bg opacity-20" />
        
        {/* Type Icon */}
        <div className="absolute top-4 right-4">
          <div className={cn("w-12 h-12 flex items-center justify-center border-2 bg-surface-container", `border-${typeInfo.color}`)}>
            <span className={cn("material-symbols-outlined text-2xl", `text-${typeInfo.color}`)}>
              {typeInfo.icon}
            </span>
          </div>
        </div>

        {/* Type Label */}
        <div className="absolute bottom-2 left-4">
          <span className={cn("font-['Press_Start_2P'] text-[8px] px-2 py-1 border", `text-${typeInfo.color} border-${typeInfo.color} bg-surface-container`)}>
            {typeInfo.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Difficulty */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-headline font-bold text-on-surface text-lg">
            {title}
          </h3>
          <span className={cn("font-['Press_Start_2P'] text-[6px] px-2 py-1 border uppercase", difficultyColors[difficulty])}>
            {difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="font-body text-sm text-on-surface-variant mb-4 line-clamp-2">
          {description}
        </p>

        {/* Progress Section (if joined) */}
        {isJoined && (
          <div className="mb-4 p-3 bg-surface-container-high border border-outline-variant">
            <div className="flex justify-between items-center mb-2">
              <span className="font-['Press_Start_2P'] text-[8px] text-secondary">YOUR PROGRESS</span>
              <span className="font-['Press_Start_2P'] text-[10px] text-primary">
                {current} / {goal}
              </span>
            </div>
            <div className="h-2 bg-surface-container-lowest border border-outline-variant overflow-hidden">
              <div 
                className={cn("h-full pixel-segmented", `bg-${typeInfo.color}`)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">
                {progressPercent}% COMPLETE
              </span>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4">
          {/* Time Remaining */}
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
            <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">groups</span>
            <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">
              {participantCount}
            </span>
          </div>

          {/* Reward */}
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-tertiary">emoji_events</span>
            <span className="font-['Press_Start_2P'] text-[8px] text-tertiary">
              {reward} XP
            </span>
          </div>
        </div>

        {/* Action Button */}
        {isJoined ? (
          <button
            disabled
            className="w-full py-3 bg-surface-container-high text-on-surface-variant font-['Press_Start_2P'] text-[10px] cursor-not-allowed border border-outline-variant"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check</span>
              JOINED
            </span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.(challenge);
            }}
            className="w-full py-3 bg-primary-container text-on-primary-container font-['Press_Start_2P'] text-[10px] border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all hover:brightness-110"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add</span>
              JOIN CHALLENGE
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * CreateChallengeForm - Form to create new challenges
 */
export const CreateChallengeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    type: 'xp',
    goal: 1000,
    difficulty: 'MEDIUM',
    duration: 7, // days
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="bg-surface-container border-2 border-outline-variant p-6">
      <h3 className="font-['Press_Start_2P'] text-sm text-primary mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">add_box</span>
        CREATE CHALLENGE
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
            CHALLENGE TITLE
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Weekend XP Boost"
            className="w-full bg-surface-container-lowest border-2 border-outline-variant p-3 font-headline focus:border-primary focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
            DESCRIPTION
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What's the challenge about?"
            rows={3}
            className="w-full bg-surface-container-lowest border-2 border-outline-variant p-3 font-body text-sm resize-none focus:border-primary focus:outline-none"
          />
        </div>

        {/* Type & Goal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
              TYPE
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant p-3 font-headline text-sm focus:border-primary focus:outline-none"
            >
              <option value="xp">XP Challenge</option>
              <option value="time">Time Challenge</option>
              <option value="streak">Streak Challenge</option>
            </select>
          </div>

          <div>
            <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
              GOAL
            </label>
            <input
              type="number"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) })}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant p-3 font-headline focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Difficulty & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
              DIFFICULTY
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant p-3 font-headline text-sm focus:border-primary focus:outline-none"
            >
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
              <option value="ELITE">ELITE</option>
            </select>
          </div>

          <div>
            <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
              DURATION (DAYS)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant p-3 font-headline focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-surface-container-high text-on-surface font-['Press_Start_2P'] text-[10px] border-b-4 border-surface-container-highest active:translate-y-1 active:border-b-0 transition-all"
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-primary-container text-on-primary-container font-['Press_Start_2P'] text-[10px] border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all hover:brightness-110"
          >
            CREATE
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChallengeCard;
