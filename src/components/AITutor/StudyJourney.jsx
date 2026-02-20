import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  Sword,
  Shield,
  Star,
  Trophy,
  Flame,
  Lock,
  ChevronRight,
  CheckCircle,
  Circle,
  Zap,
  Moon,
  Sun,
  Target
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const pixelText = { fontFamily: 'monospace' };

// ============================================
// PIXEL COMPONENTS
// ============================================
const PixelCard = ({ children, className = '' }) => (
  <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-600 border-b-slate-900 border-r-slate-900 ${className}`}>
    {children}
  </div>
);

const PixelButton = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-700 text-white',
    secondary: 'bg-violet-500 hover:bg-violet-400 border-violet-700 text-white',
    ghost: 'bg-slate-700 hover:bg-slate-600 border-slate-800 text-slate-200',
    gold: 'bg-amber-500 hover:bg-amber-400 border-amber-700 text-amber-950',
    danger: 'bg-rose-500 hover:bg-rose-400 border-rose-700 text-white'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95, y: 2 }}
      className={`
        ${variants[variant]}
        px-4 py-2 text-xs border-b-4 border-r-4
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors font-bold uppercase tracking-wider
        flex items-center justify-center gap-2
        ${className}
      `}
      style={pixelText}
    >
      {children}
    </motion.button>
  );
};

// ============================================
// STAGE ICON COMPONENT
// ============================================
const StageIcon = ({ stage, isCompleted, isCurrent, isUnlocked }) => {
  const getIcon = () => {
    if (stage.stage_number === 10) return Trophy;
    if (stage.stage_number === 1) return Star;
    if (stage.challenge_type === 'battle') return Sword;
    if (stage.challenge_type === 'quiz') return Target;
    return Shield;
  };

  const Icon = getIcon();

  if (isCompleted) {
    return (
      <div className="w-12 h-12 bg-emerald-500 border-4 border-emerald-700 flex items-center justify-center">
        <CheckCircle className="w-6 h-6 text-white" />
      </div>
    );
  }

  if (isCurrent) {
    return (
      <motion.div 
        className="w-12 h-12 bg-amber-500 border-4 border-amber-700 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Icon className="w-6 h-6 text-amber-950" />
      </motion.div>
    );
  }

  if (isUnlocked) {
    return (
      <div className="w-12 h-12 bg-violet-500 border-4 border-violet-700 flex items-center justify-center">
        <Circle className="w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 bg-slate-700 border-4 border-slate-800 flex items-center justify-center">
      <Lock className="w-5 h-5 text-slate-500" />
    </div>
  );
};

// ============================================
// HERO STATS COMPONENT
// ============================================
const HeroStats = ({ hero, shadow }) => {
  return (
    <PixelCard className="p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-amber-800 flex items-center justify-center">
            <Zap className="w-8 h-8 text-amber-950" />
          </div>
          <div>
            <p className="text-amber-400 font-bold" style={{ ...pixelText, fontSize: '12px' }}>
              HERO POWER
            </p>
            <p className="text-white" style={{ ...pixelText, fontSize: '16px' }}>
              {hero.power} <span className="text-slate-500 text-xs">/ {hero.powerMax}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-orange-400" style={{ ...pixelText, fontSize: '14px' }}>
              {hero.streakDays} day{hero.streakDays !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Power Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-amber-400" style={pixelText}>POWER LEVEL</span>
        </div>
        <div className="h-4 bg-slate-900 border-2 border-slate-700">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${(hero.power / hero.powerMax) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Shadow of Doom */}
      {shadow.level > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-500" />
              <span className="text-purple-400" style={{ ...pixelText, fontSize: '10px' }}>
                SHADOW OF DOOM
              </span>
            </div>
            <span className="text-purple-400" style={{ ...pixelText, fontSize: '12px' }}>
              {shadow.level}%
            </span>
          </div>
          <div className="h-3 bg-slate-900 border-2 border-slate-700">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-900 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${shadow.level}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          {shadow.message && (
            <p className="text-purple-300 mt-2 text-xs" style={{ ...pixelText, fontSize: '9px' }}>
              ⚠️ {shadow.message}
            </p>
          )}
        </div>
      )}
    </PixelCard>
  );
};

// ============================================
// STAGE DETAIL MODAL
// ============================================
const StageDetailModal = ({ stage, onClose, onStart, isCompleted, isCurrent, isUnlocked }) => {
  if (!stage) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <PixelCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StageIcon stage={stage} isCompleted={isCompleted} isCurrent={isCurrent} isUnlocked={isUnlocked} />
              <div>
                <p className="text-slate-400" style={{ ...pixelText, fontSize: '9px' }}>
                  STAGE {stage.stage_number}
                </p>
                <h3 className="text-white font-bold" style={{ ...pixelText, fontSize: '14px' }}>
                  {stage.title}
                </h3>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white">
              ✕
            </button>
          </div>

          <p className="text-slate-300 mb-4" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.7' }}>
            {stage.description}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-xs">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400" style={pixelText}>CHALLENGE:</span>
              <span className="text-slate-300" style={pixelText}>{stage.challenge}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400" style={pixelText}>REWARD:</span>
              <span className="text-slate-300" style={pixelText}>{stage.reward}</span>
            </div>
            {stage.required_streak_days > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400" style={pixelText}>REQUIRED STREAK:</span>
                <span className="text-slate-300" style={pixelText}>{stage.required_streak_days} days</span>
              </div>
            )}
          </div>

          {isCompleted ? (
            <PixelButton variant="ghost" onClick={onClose} className="w-full">
              <CheckCircle className="w-4 h-4" />
              Completed
            </PixelButton>
          ) : isCurrent || isUnlocked ? (
            <PixelButton variant="primary" onClick={() => onStart(stage)} className="w-full">
              <Sword className="w-4 h-4" />
              Start Challenge
            </PixelButton>
          ) : (
            <PixelButton variant="ghost" disabled className="w-full">
              <Lock className="w-4 h-4" />
              Locked
            </PixelButton>
          )}
        </PixelCard>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// MAIN STUDY JOURNEY COMPONENT
// ============================================
export default function StudyJourney({ onClose, onStartTopic }) {
  const [journey, setJourney] = useState(null);
  const [heroStatus, setHeroStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);

  const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('authToken');

  useEffect(() => {
    fetchJourneyData();
  }, []);

  const fetchJourneyData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Fetch hero status
      const statusRes = await fetch(`${API_BASE}/api/ai/story/hero-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!statusRes.ok) throw new Error('Failed to fetch hero status');
      const statusData = await statusRes.json();
      setHeroStatus(statusData);

      // Fetch journey
      const journeyRes = await fetch(`${API_BASE}/api/ai/story/journey`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!journeyRes.ok) throw new Error('Failed to fetch journey');
      const journeyData = await journeyRes.json();
      setJourney(journeyData.journey);

    } catch (err) {
      console.error('Error fetching journey:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStage = (stage) => {
    // If there's a lesson topic, use it
    if (stage.lesson_topic) {
      onStartTopic?.(stage.lesson_topic);
    } else {
      // Default to a generic topic for this stage
      const topics = ['Study Skills', 'Focus Training', 'Time Management', 'Learning Power'];
      onStartTopic?.(topics[(stage.stage_number - 1) % topics.length]);
    }
    setSelectedStage(null);
    onClose?.();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <PixelCard className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400" style={pixelText}>Loading your journey...</p>
        </PixelCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <PixelCard className="p-8 text-center">
          <p className="text-rose-400 mb-4" style={pixelText}>⚠️ {error}</p>
          <PixelButton onClick={onClose} variant="ghost">
            Go Back
          </PixelButton>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Map className="w-6 h-6 text-amber-400" />
          <div>
            <h1 className="text-white font-bold" style={{ ...pixelText, fontSize: '16px' }}>
              {journey?.title || 'Study Journey'}
            </h1>
            <p className="text-slate-400 text-xs" style={pixelText}>
              {journey?.subtitle || 'Conquer the Procrastination Prophecy'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Hero Stats */}
      {heroStatus && (
        <HeroStats 
          hero={heroStatus.hero} 
          shadow={heroStatus.shadow}
        />
      )}

      {/* Journey Path */}
      <PixelCard className="p-4">
        <h2 className="text-amber-400 font-bold mb-4" style={{ ...pixelText, fontSize: '12px' }}>
          📍 YOUR PATH
        </h2>
        
        <div className="space-y-4">
          {journey?.stages?.map((stage, index) => {
            const isCompleted = stage.completed;
            const isCurrent = stage.stage_number === journey.currentStage;
            const isUnlocked = stage.unlocked;

            return (
              <motion.div
                key={stage.stage_number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedStage(stage)}
                className={`
                  flex items-center gap-4 p-3 border-2 cursor-pointer transition-all
                  ${isCompleted ? 'border-emerald-700 bg-emerald-950/30' : ''}
                  ${isCurrent ? 'border-amber-500 bg-amber-950/30' : ''}
                  ${isUnlocked && !isCurrent && !isCompleted ? 'border-violet-700 hover:border-violet-500 bg-violet-950/20' : ''}
                  ${!isUnlocked ? 'border-slate-700 bg-slate-900/50 opacity-60' : ''}
                `}
              >
                <StageIcon 
                  stage={stage} 
                  isCompleted={isCompleted} 
                  isCurrent={isCurrent}
                  isUnlocked={isUnlocked}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs" style={pixelText}>
                      #{stage.stage_number}
                    </span>
                    <h3 
                      className={`font-bold truncate ${isCompleted ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-slate-300'}`}
                      style={{ ...pixelText, fontSize: '12px' }}
                    >
                      {stage.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-xs truncate" style={{ ...pixelText, fontSize: '9px' }}>
                    {stage.description}
                  </p>
                </div>

                <ChevronRight className={`w-5 h-5 ${isUnlocked ? 'text-slate-400' : 'text-slate-700'}`} />
              </motion.div>
            );
          })}
        </div>
      </PixelCard>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 border-2 border-emerald-700" />
          <span className="text-slate-400" style={pixelText}>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 border-2 border-amber-700" />
          <span className="text-slate-400" style={pixelText}>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-violet-500 border-2 border-violet-700" />
          <span className="text-slate-400" style={pixelText}>Unlocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700 border-2 border-slate-800" />
          <span className="text-slate-400" style={pixelText}>Locked</span>
        </div>
      </div>

      {/* Stage Detail Modal */}
      <AnimatePresence>
        {selectedStage && (
          <StageDetailModal
            stage={selectedStage}
            onClose={() => setSelectedStage(null)}
            onStart={handleStartStage}
            isCompleted={selectedStage.completed}
            isCurrent={selectedStage.stage_number === journey?.currentStage}
            isUnlocked={selectedStage.unlocked}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
