import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';

/**
 * AddQuestModal - Modal for creating new quests
 * RPG-style form with difficulty selector and XP calculation
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSubmit - Submit handler (questData) => void
 * @param {string} props.className - Additional CSS classes
 */
const AddQuestModal = ({
  isOpen,
  onClose,
  onSubmit,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'GENERAL',
    difficulty: 'MEDIUM',
    estimatedMinutes: 30,
  });

  const [errors, setErrors] = useState({});

  // Calculate XP based on difficulty and time
  const calculatedXP = useMemo(() => {
    const difficultyMultipliers = {
      EASY: 1,
      MEDIUM: 1.5,
      HARD: 2.5,
      ELITE: 4,
    };
    
    const baseXP = Math.floor(formData.estimatedMinutes / 5) * 5; // 5 XP per 5 minutes
    const multiplier = difficultyMultipliers[formData.difficulty] || 1;
    return Math.floor(baseXP * multiplier);
  }, [formData.difficulty, formData.estimatedMinutes]);

  // Calculate rarity based on XP
  const calculatedRarity = useMemo(() => {
    if (calculatedXP >= 200) return 'LEGENDARY';
    if (calculatedXP >= 150) return 'EPIC';
    if (calculatedXP >= 100) return 'RARE';
    if (calculatedXP >= 50) return 'UNCOMMON';
    return 'COMMON';
  }, [calculatedXP]);

  // Difficulty colors
  const difficultyColors = {
    EASY: { bg: 'bg-secondary/20', border: 'border-secondary', text: 'text-secondary' },
    MEDIUM: { bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary' },
    HARD: { bg: 'bg-tertiary/20', border: 'border-tertiary', text: 'text-tertiary' },
    ELITE: { bg: 'bg-error/20', border: 'border-error', text: 'text-error' },
  };

  // Rarity colors
  const rarityColors = {
    COMMON: 'text-on-surface-variant',
    UNCOMMON: 'text-secondary',
    RARE: 'text-primary',
    EPIC: 'text-tertiary',
    LEGENDARY: 'text-primary animate-pulse',
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Quest title is required';
    }
    if (formData.title.length > 100) {
      newErrors.title = 'Title too long (max 100 chars)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.({
        ...formData,
        xpReward: calculatedXP,
        rarity: calculatedRarity,
        progress: { current: 0, total: 1 },
        status: 'READY',
      });
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: 'GENERAL',
        difficulty: 'MEDIUM',
        estimatedMinutes: 30,
      });
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className={cn(
        "bg-surface-container border-2 border-outline-variant w-full max-w-lg max-h-[90vh] overflow-y-auto",
        "shadow-[8px_8px_0px_0px_#150136]",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-outline-variant bg-surface-container-high">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">add_task</span>
            <h2 className="font-['Press_Start_2P'] text-sm text-primary">SUMMON QUEST</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
              QUEST TITLE *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Master Quadratic Equations"
              className={cn(
                "w-full bg-surface-container-lowest border-2 p-3 font-headline",
                "focus:border-primary focus:outline-none transition-colors",
                errors.title ? "border-error" : "border-outline-variant"
              )}
            />
            {errors.title && (
              <p className="mt-1 font-['Press_Start_2P'] text-[6px] text-error">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
              DESCRIPTION
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What must you accomplish?"
              rows={3}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant p-3 font-body text-sm resize-none focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
              SUBJECT
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['GENERAL', 'MATH', 'ENGLISH', 'SCIENCE', 'HISTORY'].map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => handleChange('subject', subj)}
                  className={cn(
                    "py-2 font-['Press_Start_2P'] text-[8px] uppercase transition-all",
                    "border-b-4 active:translate-y-1 active:border-b-0",
                    formData.subject === subj
                      ? "bg-primary text-on-primary border-on-primary-fixed-variant"
                      : "bg-surface-container-high text-on-surface-variant border-surface-container-highest hover:text-primary"
                  )}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
              DIFFICULTY
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['EASY', 'MEDIUM', 'HARD', 'ELITE'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => handleChange('difficulty', diff)}
                  className={cn(
                    "py-3 font-['Press_Start_2P'] text-[7px] uppercase transition-all",
                    "border-2",
                    formData.difficulty === diff
                      ? `${difficultyColors[diff].bg} ${difficultyColors[diff].border} ${difficultyColors[diff].text}`
                      : "bg-surface-container-high border-outline-variant text-on-surface-variant hover:border-primary"
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Time Estimator */}
          <div>
            <label className="block font-['Press_Start_2P'] text-[8px] text-secondary mb-2">
              ESTIMATED TIME: {formData.estimatedMinutes} MINUTES
            </label>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={formData.estimatedMinutes}
              onChange={(e) => handleChange('estimatedMinutes', parseInt(e.target.value))}
              className="w-full h-2 bg-surface-container-highest appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:bg-primary
                         [&::-webkit-slider-thumb]:border-2
                         [&::-webkit-slider-thumb]:border-on-primary"
            />
            <div className="flex justify-between mt-1">
              <span className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant">15m</span>
              <span className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant">120m</span>
            </div>
          </div>

          {/* XP & Rarity Preview */}
          <div className="bg-surface-container-high border-2 border-outline-variant p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant mb-1">
                  QUEST REWARD
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">stars</span>
                  <span className="font-['Press_Start_2P'] text-xl text-tertiary">{calculatedXP}</span>
                  <span className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant">XP</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant mb-1">
                  RARITY
                </div>
                <span className={cn("font-['Press_Start_2P'] text-[10px]", rarityColors[calculatedRarity])}>
                  {calculatedRarity}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-primary-container text-on-primary-container font-['Press_Start_2P'] text-[12px]
                       border-b-8 border-on-primary-fixed-variant
                       active:translate-y-2 active:border-b-0 transition-all
                       hover:brightness-110"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">flare</span>
              SUMMON QUEST
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestModal;
