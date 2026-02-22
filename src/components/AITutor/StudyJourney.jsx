import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Map, Sword, Shield, Star, Trophy, Flame, Lock,
  ChevronRight, CheckCircle, Circle, Zap, Target,
  BookOpen, Clock, TrendingUp, Award, Gem, Crown,
  ChevronLeft, Sparkles, Scroll
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const pixelText = { fontFamily: 'monospace' };

// ============================================
// PIXEL COMPONENTS
// ============================================
const PixelCard = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-800 border-slate-600',
    primary: 'bg-blue-900 border-blue-600',
    success: 'bg-emerald-900 border-emerald-600',
    gold: 'bg-amber-900 border-amber-600',
    danger: 'bg-rose-900 border-rose-600'
  };
  
  return (
    <div className={`${variants[variant]} border-4 border-b-slate-900 border-r-slate-900 ${className}`}>
      {children}
    </div>
  );
};

const PixelButton = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-400 border-blue-700 text-white',
    success: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-700 text-white',
    ghost: 'bg-slate-700 hover:bg-slate-600 border-slate-800 text-slate-200',
    gold: 'bg-amber-500 hover:bg-amber-400 border-amber-700 text-amber-950'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95, y: 2 }}
      className={`${variants[variant]} px-4 py-2 text-xs border-b-4 border-r-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${className}`}
      style={pixelText}
    >
      {children}
    </motion.button>
  );
};

// ============================================
// ENHANCED JOURNEY STAGES DATA
// ============================================
const JOURNEY_STAGES = [
  {
    stage: 1,
    title: "The Awakening",
    description: "You discover your learning power. The journey begins.",
    challenge: "Complete your first study session",
    reward: "Novice Badge",
    enemy: "Sleepy Sloth",
    requiredMinutes: 15,
    icon: Star
  },
  {
    stage: 2,
    title: "First Steps",
    description: "Build momentum with consistent daily study.",
    challenge: "Maintain a 3-day streak",
    reward: "Streak Shield",
    enemy: "Doubt Imp",
    requiredMinutes: 45,
    icon: Flame
  },
  {
    stage: 3,
    title: "The Spark",
    description: "Your knowledge begins to shine brighter.",
    challenge: "Study 5 different subjects",
    reward: "Knowledge Crystal",
    enemy: "Distraction Demon",
    requiredMinutes: 90,
    icon: BookOpen
  },
  {
    stage: 4,
    title: "Rising Dawn",
    description: "You are becoming a true scholar.",
    challenge: "Complete a 7-day streak",
    reward: "Focus Helm",
    enemy: "Procrastination Beast",
    requiredMinutes: 180,
    icon: Target
  },
  {
    stage: 5,
    title: "The Guardian",
    description: "Protect your time and focus.",
    challenge: "Study 100 minutes in one week",
    reward: "Time Amulet",
    enemy: "Chaos Lord",
    requiredMinutes: 300,
    icon: Shield
  },
  {
    stage: 6,
    title: "Steady Flame",
    description: "Your dedication burns bright.",
    challenge: "Complete a 14-day streak",
    reward: "Persistence Armor",
    enemy: "Burnout Dragon",
    requiredMinutes: 450,
    icon: Zap
  },
  {
    stage: 7,
    title: "The Scholar",
    description: "Others seek your wisdom.",
    challenge: "Answer 50 quiz questions correctly",
    reward: "Wisdom Tome",
    enemy: "Confusion Sorcerer",
    requiredMinutes: 600,
    icon: Scroll
  },
  {
    stage: 8,
    title: "Beacon of Light",
    description: "You inspire others to learn.",
    challenge: "Study 200 minutes in one week",
    reward: "Inspiration Cape",
    enemy: "Despair Phantom",
    requiredMinutes: 800,
    icon: Trophy
  },
  {
    stage: 9,
    title: "Master of Self",
    description: "You control your learning destiny.",
    challenge: "Complete a 30-day streak",
    reward: "Mastery Crown",
    enemy: "Shadow of Doom",
    requiredMinutes: 1000,
    icon: Crown
  },
  {
    stage: 10,
    title: "The Legend",
    description: "Your name will be remembered forever.",
    challenge: "Complete 50 hours of study total",
    reward: "Legendary Status",
    enemy: "Final Boss: Ignorance",
    requiredMinutes: 1500,
    icon: Gem
  }
];

// ============================================
// STATS CARD
// ============================================
const StatsCard = ({ hero, shadow }) => {
  return (
    <PixelCard className="p-4 mb-4" variant="primary">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-amber-800 flex items-center justify-center rounded-lg">
          <Zap className="w-8 h-8 text-amber-950" />
        </div>
        <div className="flex-1">
          <p className="text-amber-400 text-xs font-bold" style={pixelText}>HERO POWER</p>
          <div className="flex items-baseline gap-2">
            <p className="text-white text-2xl font-bold" style={pixelText}>{hero?.power || 10}</p>
            <span className="text-slate-500 text-xs">/ 100</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-orange-400">
            <Flame className="w-5 h-5" />
            <span className="text-lg font-bold" style={pixelText}>{hero?.streakDays || 0}</span>
          </div>
          <p className="text-slate-500 text-[10px]" style={pixelText}>DAY STREAK</p>
        </div>
      </div>

      {/* Power Bar */}
      <div className="mb-4">
        <div className="h-3 bg-slate-900 border-2 border-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${((hero?.power || 10) / 100) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Shadow of Doom */}
      {shadow?.level > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-xs" style={pixelText}>SHADOW OF DOOM</span>
            </div>
            <span className="text-purple-400 text-sm font-bold" style={pixelText}>{shadow.level}%</span>
          </div>
          <div className="h-2 bg-slate-900 border-2 border-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-900 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${shadow.level}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          {shadow.message && (
            <p className="text-purple-300 text-xs mt-2" style={{ ...pixelText, fontSize: '9px' }}>
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
const StageDetailModal = ({ stage, onClose, onStart, isCompleted, isCurrent, isUnlocked, userMinutes = 0 }) => {
  if (!stage) return null;
  const Icon = stage.icon;
  const progress = Math.min(100, (userMinutes / stage.requiredMinutes) * 100);

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
        <PixelCard className="p-6" variant={isCompleted ? 'success' : isCurrent ? 'gold' : 'default'}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 flex items-center justify-center ${
                isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-amber-500' : 'bg-slate-700'
              }`}>
                <Icon className={`w-6 h-6 ${isCompleted || isCurrent ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px]" style={pixelText}>STAGE {stage.stage}</p>
                <h3 className="text-white font-bold" style={{ ...pixelText, fontSize: '14px' }}>
                  {stage.title}
                </h3>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-sm mb-4" style={{ ...pixelText, lineHeight: '1.7' }}>
            {stage.description}
          </p>

          {/* Enemy Preview */}
          <div className="bg-rose-950/30 border-2 border-rose-800 p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👹</span>
              <span className="text-rose-400 text-xs font-bold" style={pixelText}>ENEMY: {stage.enemy}</span>
            </div>
          </div>

          {/* Challenge */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400" style={pixelText}>CHALLENGE:</span>
              <span className="text-slate-300" style={pixelText}>{stage.challenge}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400" style={pixelText}>REWARD:</span>
              <span className="text-slate-300" style={pixelText}>{stage.reward}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400" style={pixelText}>REQUIRED:</span>
              <span className="text-slate-300" style={pixelText}>{stage.requiredMinutes} mins</span>
            </div>
          </div>

          {/* Progress Bar */}
          {isCurrent && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400" style={pixelText}>YOUR PROGRESS</span>
                <span className="text-emerald-400" style={pixelText}>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-slate-500 text-[10px] mt-1" style={pixelText}>
                {userMinutes} / {stage.requiredMinutes} minutes
              </p>
            </div>
          )}

          {/* Action Button */}
          {isCompleted ? (
            <PixelButton variant="ghost" onClick={onClose} className="w-full">
              <CheckCircle className="w-4 h-4" />
              COMPLETED
            </PixelButton>
          ) : isCurrent || isUnlocked ? (
            <PixelButton variant={isCurrent ? 'gold' : 'primary'} onClick={() => onStart(stage)} className="w-full">
              <Sword className="w-4 h-4" />
              {isCurrent ? 'START STAGE' : 'BEGIN'}
            </PixelButton>
          ) : (
            <PixelButton variant="ghost" disabled className="w-full">
              <Lock className="w-4 h-4" />
              LOCKED
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
  const navigate = useNavigate();
  const [heroStatus, setHeroStatus] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [userMinutes, setUserMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('authToken');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/ai/story/hero-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHeroStatus(data);
        // Estimate user minutes based on hero power (10 base + 2 per minute studied roughly)
        setUserMinutes(data.hero?.power ? (data.hero.power - 10) * 3 : 0);
      }
    } catch (err) {
      console.error('Error fetching journey data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStage = (stage) => {
    // Navigate to story quest with suggested topic
    const topics = ['Mathematics', 'Science', 'History', 'English', 'Coding'];
    const topic = topics[(stage.stage - 1) % topics.length];
    onStartTopic?.(topic);
    setSelectedStage(null);
    onClose?.();
  };

  // Calculate current stage based on hero power
  const currentStage = heroStatus?.journey?.currentStage || 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
            <Clock className="w-12 h-12 text-amber-400 mx-auto" />
          </motion.div>
          <p className="text-slate-400 mt-4" style={pixelText}>Loading journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center border-2 border-amber-400">
            <Map className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold" style={{ ...pixelText, fontSize: '18px' }}>
              PATH OF THE HERO
            </h1>
            <p className="text-slate-400 text-xs" style={pixelText}>
              Your learning adventure awaits
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      {/* Hero Stats */}
      {heroStatus && (
        <StatsCard hero={heroStatus.hero} shadow={heroStatus.shadow} />
      )}

      {/* Journey Path */}
      <PixelCard className="p-4 mb-4" variant="default">
        <h2 className="text-amber-400 font-bold mb-4 flex items-center gap-2" style={{ ...pixelText, fontSize: '12px' }}>
          <Sparkles className="w-4 h-4" />
          YOUR DESTINY
        </h2>
        
        <div className="space-y-3">
          {JOURNEY_STAGES.map((stage, index) => {
            const isCompleted = index < currentStage - 1;
            const isCurrent = index === currentStage - 1;
            const isUnlocked = index <= currentStage;

            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => isUnlocked && setSelectedStage(stage)}
                className={`
                  relative flex items-center gap-4 p-4 border-4 cursor-pointer transition-all
                  ${isCompleted ? 'bg-emerald-950/30 border-emerald-700' : ''}
                  ${isCurrent ? 'bg-amber-950/30 border-amber-500 shadow-lg shadow-amber-900/20' : ''}
                  ${isUnlocked && !isCurrent && !isCompleted ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : ''}
                  ${!isUnlocked ? 'bg-slate-900 border-slate-800 opacity-50' : ''}
                `}
              >
                {/* Stage Icon */}
                <div className={`
                  w-12 h-12 flex items-center justify-center border-2 flex-shrink-0
                  ${isCompleted ? 'bg-emerald-600 border-emerald-400' : 
                    isCurrent ? 'bg-amber-500 border-amber-300 animate-pulse' : 
                    isUnlocked ? 'bg-blue-900 border-blue-600' : 'bg-slate-800 border-slate-700'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : !isUnlocked ? (
                    <Lock className="w-5 h-5 text-slate-500" />
                  ) : (
                    <stage.icon className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-blue-400'}`} />
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]" style={pixelText}>#{stage.stage}</span>
                    <h3 
                      className={`font-bold truncate ${isCompleted ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-slate-300'}`}
                      style={{ ...pixelText, fontSize: '12px' }}
                    >
                      {stage.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-[10px] truncate" style={pixelText}>
                    {stage.description}
                  </p>
                  
                  {/* Progress indicator for current stage */}
                  {isCurrent && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, (userMinutes / stage.requiredMinutes) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-amber-400" style={pixelText}>
                        {Math.round((userMinutes / stage.requiredMinutes) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className={`w-5 h-5 ${isUnlocked ? 'text-slate-400' : 'text-slate-700'}`} />

                {/* Connecting line */}
                {index < JOURNEY_STAGES.length - 1 && (
                  <div className="absolute left-7 top-full w-0.5 h-3 bg-slate-700 -z-10" />
                )}
              </motion.div>
            );
          })}
        </div>
      </PixelCard>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-600 border border-emerald-400" />
          <span className="text-slate-400" style={pixelText}>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 border border-amber-300" />
          <span className="text-slate-400" style={pixelText}>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-900 border border-blue-600" />
          <span className="text-slate-400" style={pixelText}>Unlocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-800 border border-slate-700" />
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
            isCompleted={selectedStage.stage < currentStage}
            isCurrent={selectedStage.stage === currentStage}
            isUnlocked={selectedStage.stage <= currentStage}
            userMinutes={userMinutes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
