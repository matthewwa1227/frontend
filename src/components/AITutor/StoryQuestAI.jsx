import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, ChevronRight, Zap,
  BookOpen, Trophy, RotateCcw, Loader2,
  Target, CheckCircle,
  ArrowLeft, Clock, Compass,
  Lightbulb, Swords, ShieldCheck
} from 'lucide-react';
import StudyJourney from './StudyJourney';
import api from '../../utils/api';

const pixelText = { fontFamily: 'monospace' };
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('authToken');

// ============================================
// ENHANCED TOPIC THEMES WITH BETTER VISUALS
// ============================================
const TOPIC_THEMES = {
  math: {
    icon: '📐',
    gradient: 'from-blue-600 via-blue-800 to-slate-900',
    accent: 'blue',
    world: 'Kingdom of Numbers',
    enemy: 'Chaos Dragon',
    weapon: 'Sword of Logic',
    heroTitle: 'Mathematician',
    setting: 'The ancient Kingdom of Numbers has fallen into chaos. Formulas that once brought order now twist into confusion.'
  },
  mathematics: {
    icon: '📐',
    gradient: 'from-blue-600 via-blue-800 to-slate-900',
    accent: 'blue',
    world: 'Kingdom of Numbers',
    enemy: 'Chaos Dragon',
    weapon: 'Sword of Logic',
    heroTitle: 'Mathematician',
    setting: 'The ancient Kingdom of Numbers has fallen into chaos.'
  },
  science: {
    icon: '🔬',
    gradient: 'from-emerald-600 via-emerald-800 to-slate-900',
    accent: 'emerald',
    world: 'Laboratory of Wonders',
    enemy: 'Ignorance Beast',
    weapon: 'Staff of Knowledge',
    heroTitle: 'Scientist',
    setting: 'Darkness spreads across the Laboratory of Wonders. Experiments fail, discoveries hide in shadows.'
  },
  physics: {
    icon: '⚛️',
    gradient: 'from-purple-600 via-purple-800 to-slate-900',
    accent: 'purple',
    world: 'Realm of Forces',
    enemy: 'Entropy Demon',
    weapon: 'Quantum Blade',
    heroTitle: 'Physicist',
    setting: 'The fundamental forces of nature are unraveling.'
  },
  history: {
    icon: '🏛️',
    gradient: 'from-amber-600 via-amber-800 to-slate-900',
    accent: 'amber',
    world: 'Chronicles of Time',
    enemy: 'Forgetting Phantom',
    weapon: 'Chronicle Blade',
    heroTitle: 'Historian',
    setting: 'The threads of time are unraveling. Great events fade from memory.'
  },
  english: {
    icon: '📚',
    gradient: 'from-rose-600 via-rose-800 to-slate-900',
    accent: 'rose',
    world: 'Library of Words',
    enemy: 'Grammar Goblin',
    weapon: 'Pen of Power',
    heroTitle: 'Linguist',
    setting: 'Words scatter like leaves in a storm. Stories lose their meaning.'
  },
  coding: {
    icon: '💻',
    gradient: 'from-cyan-600 via-cyan-800 to-slate-900',
    accent: 'cyan',
    world: 'Digital Realm',
    enemy: 'Bug Monster',
    weapon: 'Code Sword',
    heroTitle: 'Programmer',
    setting: 'The Digital Realm is corrupted with bugs and errors.'
  },
  programming: {
    icon: '💻',
    gradient: 'from-cyan-600 via-cyan-800 to-slate-900',
    accent: 'cyan',
    world: 'Digital Realm',
    enemy: 'Bug Monster',
    weapon: 'Code Sword',
    heroTitle: 'Programmer',
    setting: 'The Digital Realm is corrupted with bugs and errors.'
  },
  default: {
    icon: '⚔️',
    gradient: 'from-indigo-600 via-indigo-800 to-slate-900',
    accent: 'indigo',
    world: 'Realm of Knowledge',
    enemy: 'Shadow of Ignorance',
    weapon: 'Blade of Wisdom',
    heroTitle: 'Scholar',
    setting: 'The Shadow of Ignorance has consumed the land.'
  }
};

const getTopicTheme = (topic) => {
  const key = Object.keys(TOPIC_THEMES).find(k => topic?.toLowerCase().includes(k));
  return TOPIC_THEMES[key] || TOPIC_THEMES.default;
};

// ============================================
// PIXEL COMPONENTS
// ============================================
const PixelButton = ({ children, onClick, variant = 'primary', disabled = false, className = '', icon: Icon }) => {
  const baseStyles = "px-6 py-3 text-sm border-b-4 border-r-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold uppercase tracking-wider flex items-center justify-center gap-2";
  
  const variants = {
    primary: `${baseStyles} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border-blue-800 text-white shadow-lg shadow-blue-900/50`,
    danger: `${baseStyles} bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 border-rose-800 text-white shadow-lg shadow-rose-900/50`,
    ghost: `${baseStyles} bg-slate-700/80 hover:bg-slate-600 border-slate-900 text-slate-200`,
    gold: `${baseStyles} bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border-amber-700 text-amber-950 shadow-lg shadow-amber-900/50`,
    magic: `${baseStyles} bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 border-purple-800 text-white shadow-lg shadow-purple-900/50`,
    success: `${baseStyles} bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border-emerald-800 text-white shadow-lg shadow-emerald-900/50`
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, y: -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98, y: 0 }}
      className={`${variants[variant]} ${className}`}
      style={pixelText}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.button>
  );
};

const Card = ({ children, className = '', variant = 'default', glow = false }) => {
  const variants = {
    default: 'bg-slate-800/90 border-slate-600',
    primary: 'bg-blue-900/90 border-blue-500',
    danger: 'bg-rose-900/90 border-rose-500',
    gold: 'bg-amber-900/90 border-amber-500',
    magic: 'bg-purple-900/90 border-purple-500',
    success: 'bg-emerald-900/90 border-emerald-500'
  };

  return (
    <div className={`${variants[variant]} border-2 backdrop-blur-sm rounded-xl p-6 ${glow ? 'shadow-2xl' : ''} ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// AI SERVICE
// ============================================
const AIService = {
  generateChapterSchedule: async (topic) => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE}/api/ai/story/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ topic })
      });
      if (!response.ok) throw new Error('Failed');
      return await response.json();
    } catch (error) {
      // Fallback schedule
      return {
        chapters: [
          { title: 'The Beginning', focus: 'Foundation Concepts', estimatedTime: '15 min' },
          { title: 'First Steps', focus: 'Core Principles', estimatedTime: '20 min' },
          { title: 'The Challenge', focus: 'Advanced Application', estimatedTime: '25 min' },
          { title: 'Mastery', focus: 'Expert Level', estimatedTime: '30 min' }
        ]
      };
    }
  },

  generateQuestion: async (topic, difficulty, concept) => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE}/api/ai/story/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ topic, difficulty, conceptTitle: concept })
      });
      if (!response.ok) throw new Error('Failed');
      return await response.json();
    } catch (error) {
      return {
        text: `What is an important concept in ${topic}?`,
        choices: [
          { text: 'Understanding the fundamentals', correct: true },
          { text: 'Guessing randomly', correct: false },
          { text: 'Ignoring the basics', correct: false },
          { text: 'Skipping practice', correct: false }
        ],
        explanation: 'Mastering fundamentals is essential for success.',
        xp: 25
      };
    }
  }
};

// ============================================
// SCHEDULE SCREEN - AI GENERATED CHAPTER OUTLINE
// ============================================
const ScheduleScreen = ({ topic, theme, schedule, onStart, onBack }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} p-6`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              QUEST SCHEDULE
            </h1>
            <p className="text-slate-300 text-sm" style={pixelText}>AI-generated learning path</p>
          </div>
        </div>

        {/* Schedule Card */}
        <Card variant="gold" glow className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">{theme.icon}</div>
            <div>
              <h2 className="text-xl text-amber-400 font-bold" style={pixelText}>{topic}</h2>
              <p className="text-slate-300 text-sm" style={pixelText}>{theme.world}</p>
            </div>
          </div>
          
          <div className="p-4 bg-black/30 rounded-lg mb-4">
            <p className="text-slate-200 text-sm italic" style={pixelText}>"{theme.setting}"</p>
          </div>
        </Card>

        {/* Chapter List */}
        <div className="space-y-4 mb-8">
          {schedule.chapters.map((chapter, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center text-xl font-bold text-white" style={pixelText}>
                {index + 1}
              </div>
              <Card className="flex-1" variant="default">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold" style={pixelText}>{chapter.title}</h3>
                    <p className="text-slate-400 text-xs" style={pixelText}>{chapter.focus}</p>
                  </div>
                  <div className="text-right">
                    <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <span className="text-slate-400 text-xs" style={pixelText}>{chapter.estimatedTime}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Start Button */}
        <PixelButton onClick={onStart} variant="gold" className="w-full" icon={Swords}>
          BEGIN YOUR QUEST
        </PixelButton>
      </div>
    </div>
  );
};

// ============================================
// STORY SCENE
// ============================================
const StoryScene = ({ scene, theme, onContinue }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`min-h-screen bg-gradient-to-b ${theme.gradient} flex flex-col items-center justify-center p-6`}
  >
    <div className="w-full max-w-2xl">
      <Card variant="magic" glow className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-5xl shadow-2xl shadow-purple-500/50"
        >
          📖
        </motion.div>
        
        <h2 className="text-2xl text-purple-400 font-bold mb-6" style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          THE STORY CONTINUES...
        </h2>
        
        <p className="text-white text-lg leading-relaxed mb-8" style={{ ...pixelText, lineHeight: '2' }}>
          {scene.text}
        </p>

        <PixelButton onClick={onContinue} variant="magic" icon={ChevronRight}>
          CONTINUE
        </PixelButton>
      </Card>
    </div>
  </motion.div>
);

// ============================================
// LEARN SCENE - Enhanced with robust error handling
// ============================================
const LearnScene = ({ topic, onComplete }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(0);
  const [longLoading, setLongLoading] = useState(false);
  const [dots, setDots] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const maxRetries = 3;

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Dot animation for loading text
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  // Long loading timeout (8 seconds)
  useEffect(() => {
    if (!loading || content) return;
    const timer = setTimeout(() => setLongLoading(true), 8000);
    return () => clearTimeout(timer);
  }, [loading, content]);

  // Retry delay countdown
  useEffect(() => {
    if (retryDelay <= 0) return;
    const timer = setTimeout(() => setRetryDelay(prev => prev - 1000), 1000);
    return () => clearTimeout(timer);
  }, [retryDelay]);

  // Fetch explanation with retry logic
  const fetchExplanation = async (isRetry = false) => {
    // Check online status
    if (!navigator.onLine) {
      setIsOnline(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLongLoading(false);
    
    try {
      const res = await api.post('/storyquest/learn', { topic });
      setContent(res.data.content);
      setErrorCount(0);
    } catch (err) {
      console.error('LearnScene error:', err);
      const newErrorCount = errorCount + 1;
      setErrorCount(newErrorCount);
      
      // Exponential backoff delay
      if (newErrorCount >= 2) {
        setRetryDelay(newErrorCount === 2 ? 1000 : 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (topic && !content && errorCount === 0) {
      fetchExplanation();
    }
  }, [topic]);

  // Handle skip
  const handleSkip = () => {
    if (onComplete) {
      onComplete({ skipped: true });
    }
  };

  // Handle success completion
  const handleComplete = () => {
    if (onComplete) {
      onComplete({ skipped: false, content });
    }
  };

  // Offline State
  if (!isOnline) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
        <Card variant="danger" glow className="max-w-md text-center">
          <div className="text-5xl mb-4">📡</div>
          <h2 className="font-['Press_Start_2P'] text-sm text-rose-400 mb-4">
            NO INTERNET
          </h2>
          <p className="font-['Press_Start_2P'] text-xs text-rose-300 mb-6">
            The spirit realm is unreachable...
          </p>
          <div className="flex gap-2 justify-center">
            <PixelButton 
              variant="danger" 
              onClick={() => {
                setIsOnline(navigator.onLine);
                if (navigator.onLine) fetchExplanation();
              }}
            >
              RETRY ↻
            </PixelButton>
            <PixelButton variant="secondary" onClick={handleSkip}>
              SKIP →
            </PixelButton>
          </div>
        </Card>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
        <Card variant="gold" glow className="max-w-md text-center">
          <div className="py-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🔮
            </motion.div>
            <p className="font-['Press_Start_2P'] text-sm text-amber-400 animate-pulse mb-2">
              Consulting the ancient scrolls{dots}
            </p>
            <p className="font-['Press_Start_2P'] text-[10px] text-amber-600">
              Channeling knowledge from the elders...
            </p>
            
            {longLoading && (
              <div className="mt-6">
                <p className="font-['Press_Start_2P'] text-[10px] text-amber-700 mb-3">
                  The spirits are slow today...
                </p>
                <PixelButton variant="secondary" onClick={handleSkip}>
                  SKIP →
                </PixelButton>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Error State (with retries exhausted)
  if (errorCount > 0 && !content) {
    const isMaxRetries = errorCount >= maxRetries;
    const errorMessage = errorCount === 1 
      ? "📜 Scroll damaged..." 
      : errorCount === 2 
      ? "🔮 Connection unstable..."
      : "⚠️ The knowledge crystal is dim";

    return (
      <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
        <Card variant="danger" glow className="max-w-md text-center">
          <div className="text-5xl mb-4">💀</div>
          <p className="font-['Press_Start_2P'] text-xs text-rose-400 mb-6">
            {errorMessage}
          </p>
          
          {isMaxRetries && (
            <p className="font-['Press_Start_2P'] text-[10px] text-rose-500 mb-4">
              Max retries reached. You may skip this lesson.
            </p>
          )}
          
          <div className="flex gap-2 justify-center">
            {!isMaxRetries && (
              <PixelButton 
                variant="danger" 
                onClick={() => fetchExplanation(true)}
                disabled={retryDelay > 0}
              >
                {retryDelay > 0 ? `WAIT ${retryDelay/1000}s` : 'RETRY ↻'}
              </PixelButton>
            )}
            <PixelButton variant="secondary" onClick={handleSkip}>
              {isMaxRetries ? 'SKIP LEARNING →' : 'SKIP →'}
            </PixelButton>
          </div>
        </Card>
      </div>
    );
  }

  // Content State
  return (
    <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card variant="primary" glow>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💡</span>
            <h2 className="font-['Press_Start_2P'] text-sm text-blue-400">
              📜 LEARNING SCENE
            </h2>
          </div>
          <div className="bg-slate-900 p-6 border-2 border-slate-700 mb-6">
            <p className="font-['Press_Start_2P'] text-xs text-blue-300 leading-6">
              {content}
            </p>
          </div>
          <PixelButton variant="gold" onClick={handleComplete}>
            I UNDERSTOOD! →
          </PixelButton>
        </Card>
      </div>
    </div>
  );
};

// ============================================
// BATTLE SCENE
// ============================================
const BattleScene = ({ scene, question, onAnswer, battleNumber, totalBattles }) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card variant="primary" className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white" style={pixelText}>Summoning enemy...</p>
        </Card>
      </div>
    );
  }

  const handleSelect = (choice, index) => {
    if (showResult) return;
    setSelected(index);
    setIsCorrect(choice.correct);
    setShowResult(true);
  };

  const handleContinue = () => {
    onAnswer(question.choices[selected], isCorrect);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 p-4 pt-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* Battle Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Swords className="w-6 h-6 text-rose-400" />
            <span className="text-rose-400 text-sm font-bold" style={pixelText}>BATTLE {battleNumber}/{totalBattles}</span>
          </div>
          {scene.isBoss && (
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500 rounded-full">
              <span className="text-amber-400 text-xs font-bold" style={pixelText}>⚠️ BOSS</span>
            </div>
          )}
        </div>

        {/* Enemy Card */}
        <Card variant="danger" glow className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-rose-600 to-rose-800 rounded-2xl flex items-center justify-center text-5xl shadow-xl"
            >
              {scene.isBoss ? '👹' : '👺'}
            </motion.div>
            <div className="flex-1">
              <p className="text-rose-400 text-xs mb-1" style={pixelText}>ENEMY</p>
              <h3 className="text-white text-2xl font-bold" style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {scene.enemy}
              </h3>
              <div className="flex gap-1 mt-2">
                {[...Array(scene.isBoss ? 5 : 3)].map((_, i) => (
                  <div key={i} className="w-10 h-3 bg-rose-600 rounded-full" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-rose-200 text-center italic text-lg" style={pixelText}>
            "{scene.text}"
          </p>
        </Card>

        {/* Question Card */}
        <Card variant="default" className="mb-6">
          <p className="text-white text-lg leading-relaxed" style={{ ...pixelText, lineHeight: '1.8' }}>
            {question.text}
          </p>
        </Card>

        {/* Answer Choices */}
        <div className="space-y-3">
          {question.choices.map((choice, i) => {
            const letter = String.fromCharCode(65 + i);
            let btnClass = 'bg-slate-800 border-slate-600 hover:border-blue-500 hover:bg-slate-700';
            
            if (showResult) {
              if (choice.correct) btnClass = 'bg-emerald-900/80 border-emerald-500';
              else if (selected === i) btnClass = 'bg-rose-900/80 border-rose-500';
              else btnClass = 'bg-slate-800 border-slate-700 opacity-50';
            }

            return (
              <motion.button
                key={i}
                onClick={() => handleSelect(choice, i)}
                disabled={showResult}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={!showResult ? { scale: 1.02, x: 5 } : {}}
                className={`w-full p-5 border-2 rounded-xl text-left transition-all ${btnClass}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-lg ${
                    showResult && choice.correct ? 'bg-emerald-500 text-white' :
                    showResult && selected === i ? 'bg-rose-500 text-white' :
                    'bg-slate-700 text-slate-300'
                  }`} style={pixelText}>{letter}</span>
                  <span className="text-slate-200 text-base flex-1" style={pixelText}>{choice.text}</span>
                  {showResult && choice.correct && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-6 rounded-xl border-2 ${isCorrect ? 'bg-emerald-900/80 border-emerald-500' : 'bg-rose-900/80 border-rose-500'}`}
            >
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}
                >
                  {isCorrect ? '⚔️' : '🛡️'}
                </motion.div>
                <p className={`text-2xl font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`} style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                  {isCorrect ? 'DIRECT HIT!' : 'ATTACK BLOCKED!'}
                </p>
              </div>
              
              <p className="text-slate-300 text-center mb-6" style={{ ...pixelText, lineHeight: '1.6' }}>
                {question.explanation}
              </p>
              
              <PixelButton 
                onClick={handleContinue} 
                variant={isCorrect ? 'success' : 'danger'} 
                className="w-full"
                icon={isCorrect ? ChevronRight : RotateCcw}
              >
                {isCorrect ? 'CONTINUE' : 'TRY AGAIN'}
              </PixelButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ============================================
// CHAPTER MAP
// ============================================
const ChapterMap = ({ chapters, currentChapter, onSelectChapter, theme, onBack, stats, completedChapters }) => {
  // Debug logging
  console.log('🗺️ ChapterMap render - completedChapters:', completedChapters);
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} p-6`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              QUEST MAP
            </h1>
            <p className="text-slate-300 text-sm" style={pixelText}>{theme.world}</p>
          </div>
        </div>

        {/* Stats Bar */}
        <Card className="mb-8" variant="default">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <Zap className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-400" style={pixelText}>{stats.xp}</p>
              <p className="text-slate-500 text-xs" style={pixelText}>XP</p>
            </div>
            <div className="text-center">
              <Swords className="w-6 h-6 text-rose-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-rose-400" style={pixelText}>{stats.battlesWon}</p>
              <p className="text-slate-500 text-xs" style={pixelText}>WINS</p>
            </div>
            <div className="text-center">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-400" style={pixelText}>{currentChapter + 1}/{chapters.length}</p>
              <p className="text-slate-500 text-xs" style={pixelText}>CHAPTER</p>
            </div>
          </div>
        </Card>

        {/* Chapter Path */}
        <div className="space-y-4">
          {chapters.map((chapter, index) => {
            const isCompleted = completedChapters.includes(chapter.id);
            const isCurrent = index === currentChapter;
            // Chapter is unlocked if: it's chapter 1 (id=1), OR previous chapter is completed
            const isUnlocked = chapter.id === 1 || completedChapters.includes(chapter.id - 1);
            const isLocked = !isUnlocked;

            console.log(`📍 Chapter ${chapter.id}: completed=${isCompleted}, unlocked=${isUnlocked}, locked=${isLocked}`);

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !isLocked && onSelectChapter(index)}
                className={`
                  relative p-5 rounded-xl border-2 cursor-pointer transition-all
                  ${isCompleted ? 'bg-emerald-900/40 border-emerald-500/50' : ''}
                  ${isCurrent ? 'bg-amber-900/40 border-amber-500 shadow-lg shadow-amber-500/20' : ''}
                  ${isUnlocked && !isCurrent && !isCompleted ? 'bg-slate-800/40 border-slate-600 hover:border-blue-500' : ''}
                  ${isLocked ? 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                    ${isCompleted ? 'bg-emerald-600 shadow-lg shadow-emerald-500/50' : 
                      isCurrent ? 'bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse' : 
                      isLocked ? 'bg-slate-800' : 'bg-blue-900 shadow-lg shadow-blue-500/30'}
                  `}>
                    {isCompleted ? '✓' : isLocked ? '🔒' : chapter.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold ${isCurrent ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-white'}`} style={pixelText}>
                        {chapter.title}
                      </h3>
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-emerald-100 text-[10px] rounded font-bold" style={pixelText}>
                          COMPLETE
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm" style={pixelText}>{chapter.subtitle}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span style={pixelText}>{chapter.scenes.filter(s => s.type === 'battle').length} battles</span>
                      <span style={pixelText}>•</span>
                      <span style={pixelText}>{chapter.scenes.filter(s => s.type === 'learn').length} lessons</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-6 h-6 ${isUnlocked ? 'text-slate-400' : 'text-slate-700'}`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================
// VICTORY SCREEN
// ============================================
const VictoryScreen = ({ stats, theme, topic, onReset, onContinue }) => (
  <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} flex items-center justify-center p-6`}>
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-lg text-center"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-8xl mb-6"
      >
        👑
      </motion.div>
      
      <h1 className="text-4xl font-bold text-amber-400 mb-4" style={{ ...pixelText, textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
        LEGENDARY HERO!
      </h1>
      
      <p className="text-slate-300 text-lg mb-8" style={pixelText}>
        You have defeated the {theme.enemy} and mastered {topic}!
      </p>

      <Card variant="gold" glow className="mb-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-400" style={pixelText}>{stats.xp}</p>
            <p className="text-slate-500 text-sm" style={pixelText}>XP EARNED</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-400" style={pixelText}>{stats.battlesWon}</p>
            <p className="text-slate-500 text-sm" style={pixelText}>BATTLES WON</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <PixelButton onClick={onContinue} variant="primary" className="w-full" icon={ChevronRight}>
          CONTINUE QUEST →
        </PixelButton>
        <PixelButton onClick={onReset} variant="ghost" className="w-full">
          NEW ADVENTURE
        </PixelButton>
      </div>
    </motion.div>
  </div>
);

// ============================================
// MAIN APP
// ============================================
export default function StoryQuestAI() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('title');
  const [topic, setTopic] = useState('');
  const [theme, setTheme] = useState(TOPIC_THEMES.default);
  const [schedule, setSchedule] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ xp: 0, battlesWon: 0 });
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0); // Track battle within current chapter
  const [completedChapters, setCompletedChapters] = useState([]); // Track completed chapter IDs

  const topicRef = useRef(null);

  // Generate chapters structure
  const generateChapters = (topic, theme) => [
    {
      id: 1,
      title: 'The Beginning',
      subtitle: 'Awakening Your Power',
      scenes: [
        { type: 'story', text: `You stand at the gates of the ${theme.world}. The wind carries whispers of forgotten ${topic} knowledge. Your journey as a ${theme.heroTitle} begins here.` },
        { type: 'story', text: `A wise mentor appears: "Welcome, ${theme.heroTitle}. The ${theme.enemy} has corrupted this realm. Only by mastering ${topic} can you defeat it and restore peace."` },
        { type: 'learn', title: 'Foundation', text: `Every hero needs a strong foundation. In ${topic}, understanding the basics is your first weapon against the darkness.` },
        { type: 'battle', enemy: 'Minion of Confusion', text: 'A shadowy creature blocks your path! Answer correctly to strike it down!', isBoss: false }
      ]
    },
    {
      id: 2,
      title: 'First Trials',
      subtitle: 'Testing Your Skills',
      scenes: [
        { type: 'story', text: 'You venture deeper into the realm. The air grows thick with mystery and the shadows lengthen.' },
        { type: 'learn', title: 'Core Concepts', text: 'Mastering the core principles will make you stronger. These are the building blocks of true understanding.' },
        { type: 'story', text: 'Suddenly, enemies surround you! This is a test of your knowledge and courage!' },
        { type: 'battle', enemy: 'Doubt Guardian', text: 'The guardian questions your abilities! Prove your mastery!', isBoss: false },
        { type: 'battle', enemy: 'Mist of Uncertainty', text: 'Another enemy approaches from the shadows!', isBoss: false }
      ]
    },
    {
      id: 3,
      title: 'The Challenge',
      subtitle: 'Face Your Fears',
      scenes: [
        { type: 'story', text: `Darkness gathers. You feel the presence of something powerful - the ${theme.enemy}'s lieutenant approaches.` },
        { type: 'learn', title: 'Advanced Techniques', text: 'These advanced concepts will prepare you for the challenges that await. Focus and learn well.' },
        { type: 'story', text: `The ground shakes! The ${theme.enemy}'s lieutenant appears before you, eyes burning with malice!` },
        { type: 'battle', enemy: `${theme.enemy}'s Lieutenant`, text: 'The lieutenant attacks with complex problems! This will be your toughest battle yet!', isBoss: true }
      ]
    },
    {
      id: 4,
      title: 'Final Confrontation',
      subtitle: 'Destiny Awaits',
      scenes: [
        { type: 'story', text: `You stand before the dark fortress of the ${theme.enemy}. Lightning cracks across the sky. The final battle approaches.` },
        { type: 'learn', title: 'Mastery', text: 'True mastery comes from deep understanding, not just memorization. You are ready for this final test.' },
        { type: 'story', text: `The ${theme.enemy} emerges from the shadows! Its roar shakes the very foundations of the ${theme.world}!` },
        { type: 'battle', enemy: theme.enemy, text: 'The ultimate battle begins! Use everything you have learned to defeat this evil!', isBoss: true, isFinal: true }
      ]
    }
  ];

  const startAdventure = async () => {
    const value = topicRef.current?.value?.trim();
    if (!value) return;

    const selectedTheme = getTopicTheme(value);
    setTopic(value);
    setTheme(selectedTheme);
    setLoading(true);

    try {
      // Get AI-generated schedule
      const scheduleData = await AIService.generateChapterSchedule(value);
      setSchedule(scheduleData);
      
      // Generate chapters
      setChapters(generateChapters(value, selectedTheme));
      setCurrentChapter(0);
      setCurrentScene(0);
      setStats({ xp: 0, battlesWon: 0 });
      
      setScreen('schedule');
    } catch (error) {
      console.error('Error starting adventure:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChapter = (chapterIndex) => {
    console.log(`🗺️ Starting chapter ${chapterIndex + 1}`);
    setCurrentChapter(chapterIndex);
    setCurrentScene(0);
    setCurrentQuestion(null);
    setCurrentBattleIndex(0); // Reset battle counter for new chapter
    setScreen('adventure');
  };

  const handleSceneComplete = async (result = null) => {
    // Log if user skipped learning
    if (result && result.skipped) {
      console.log('📜 User skipped learning scene');
    }
    
    const chapter = chapters[currentChapter];
    
    if (!chapter) return;
    
    // Move to next scene first
    const nextSceneIndex = currentScene + 1;
    
    // Check if we've completed all scenes in this chapter
    if (nextSceneIndex >= chapter.scenes.length) {
      // Chapter complete
      if (currentChapter < chapters.length - 1) {
        setScreen('map');
      } else {
        setScreen('victory');
      }
      return;
    }
    
    // Get the next scene
    const nextScene = chapter.scenes[nextSceneIndex];
    
    // If next scene is a battle, generate question first
    if (nextScene.type === 'battle') {
      setLoading(true);
      
      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Question generation timeout - using fallback');
        setCurrentQuestion({
          text: `What is a key concept in ${topic}?`,
          choices: [
            { text: 'Understanding the fundamentals', correct: true },
            { text: 'Guessing randomly', correct: false },
            { text: 'Ignoring the basics', correct: false },
            { text: 'Skipping practice', correct: false }
          ],
          explanation: 'Mastering fundamentals is essential for success.',
          xp: 25
        });
        setCurrentScene(nextSceneIndex);
        setLoading(false);
      }, 15000); // 15 second timeout
      
      try {
        const question = await AIService.generateQuestion(
          topic, 
          currentChapter + 1,
          nextScene.title || `${topic} concept`
        );
        clearTimeout(timeoutId);
        setCurrentQuestion(question);
        setCurrentScene(nextSceneIndex); // Now advance to battle scene
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error generating question:', error);
        // Use fallback question
        setCurrentQuestion({
          text: `What is a key concept in ${topic}?`,
          choices: [
            { text: 'Understanding the fundamentals', correct: true },
            { text: 'Guessing randomly', correct: false },
            { text: 'Ignoring the basics', correct: false },
            { text: 'Skipping practice', correct: false }
          ],
          explanation: 'Mastering fundamentals is essential for success.',
          xp: 25
        });
        setCurrentScene(nextSceneIndex);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    } else {
      // For story/learn scenes, just move to next
      setCurrentScene(nextSceneIndex);
    }
  };

  const handleBattleAnswer = async (choice, correct) => {
    const chapter = chapters[currentChapter];
    const totalBattlesInChapter = chapter.scenes.filter(s => s.type === 'battle').length;
    
    if (correct) {
      console.log(`⚔️ Battle ${currentBattleIndex + 1}/${totalBattlesInChapter} WON!`);
      
      setStats(s => ({ 
        xp: s.xp + (currentQuestion?.xp || 25), 
        battlesWon: s.battlesWon + 1 
      }));
      
      // Check if there are more battles in this chapter
      if (currentBattleIndex < totalBattlesInChapter - 1) {
        // More battles remaining - stay in battle mode, increment battle index
        console.log(`⚔️ Advancing to battle ${currentBattleIndex + 2}/${totalBattlesInChapter}`);
        setCurrentBattleIndex(prev => prev + 1);
        setCurrentScene(s => s + 1);
        setCurrentQuestion(null);
      } else {
        // All battles in this chapter complete
        console.log(`✅ All ${totalBattlesInChapter} battles complete! Chapter finished.`);
        if (currentChapter < chapters.length - 1) {
          setScreen('map');
        } else {
          setScreen('victory');
        }
      }
    } else {
      // Wrong answer - regenerate question for same battle
      setLoading(true);
      
      // Safety timeout
      const timeoutId = setTimeout(() => {
        console.warn('Question regeneration timeout - keeping current question');
        setLoading(false);
      }, 10000);
      
      try {
        const question = await AIService.generateQuestion(
          topic,
          currentChapter + 1,
          'Retry'
        );
        clearTimeout(timeoutId);
        setCurrentQuestion(question);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error regenerating question:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
  };

  const resetGame = () => {
    setScreen('title');
    setTopic('');
    setCurrentChapter(0);
    setCurrentScene(0);
    setCurrentQuestion(null);
    setStats({ xp: 0, battlesWon: 0 });
  };

  const backToMap = () => {
    // Mark current chapter as completed when returning from victory
    const currentChapterId = chapters[currentChapter]?.id;
    if (currentChapterId && !completedChapters.includes(currentChapterId)) {
      console.log(`🏆 Marking Chapter ${currentChapterId} as COMPLETED`);
      setCompletedChapters(prev => [...prev, currentChapterId]);
    }
    
    setScreen('map');
    setCurrentScene(0);
    setCurrentQuestion(null);
    setCurrentBattleIndex(0);
    // Keep topic, chapter, and stats so user can continue
  };

  // RENDER SCREENS
  if (screen === 'title') {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} flex flex-col items-center justify-center p-6`}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            ⚔️
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-2" style={{ ...pixelText, textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
            EPIC QUEST
          </h1>
          <p className="text-slate-300 text-lg mb-10" style={pixelText}>
            An RPG Learning Adventure
          </p>

          <Card variant="gold" glow className="mb-6">
            <label className="block text-amber-400 text-sm font-bold mb-3" style={pixelText}>
              CHOOSE YOUR PATH
            </label>
            <input
              ref={topicRef}
              type="text"
              placeholder="Mathematics, Science, History..."
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg px-4 py-4 text-white text-lg mb-4 focus:outline-none focus:border-amber-500 transition-colors"
              style={pixelText}
            />
            <PixelButton 
              onClick={startAdventure} 
              variant="gold" 
              className="w-full"
              icon={Compass}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'BEGIN ADVENTURE'}
            </PixelButton>
          </Card>

          <PixelButton onClick={() => navigate('/dashboard')} variant="ghost" icon={ArrowLeft}>
            BACK TO HOME
          </PixelButton>
        </motion.div>
      </div>
    );
  }

  if (screen === 'schedule' && schedule) {
    return (
      <ScheduleScreen 
        topic={topic}
        theme={theme}
        schedule={schedule}
        onStart={() => setScreen('map')}
        onBack={() => setScreen('title')}
      />
    );
  }

  if (screen === 'map') {
    return (
      <ChapterMap
        chapters={chapters}
        currentChapter={currentChapter}
        onSelectChapter={startChapter}
        theme={theme}
        onBack={() => setScreen('title')}
        stats={stats}
        completedChapters={completedChapters}
      />
    );
  }

  if (screen === 'adventure' && chapters[currentChapter]) {
    const chapter = chapters[currentChapter];
    const scene = chapter.scenes[currentScene];

    if (!scene) {
      // No more scenes in this chapter
      if (currentChapter < chapters.length - 1) {
        setScreen('map');
        return null;
      } else {
        setScreen('victory');
        return null;
      }
    }

    // Show loading only when transitioning to battle and question not ready
    if (loading && scene.type === 'battle') {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Card variant="primary" className="text-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white" style={pixelText}>Summoning enemy...</p>
            <p className="text-slate-500 text-xs mt-2" style={pixelText}>Preparing battle question</p>
          </Card>
        </div>
      );
    }

    if (scene.type === 'story') {
      return <StoryScene scene={scene} theme={theme} onContinue={handleSceneComplete} />;
    }

    if (scene.type === 'learn') {
      return <LearnScene topic={topic} onComplete={handleSceneComplete} />;
    }

    if (scene.type === 'battle') {
      // Ensure we have a question before rendering BattleScene
      const question = currentQuestion || {
        text: `What is a key concept in ${topic}?`,
        choices: [
          { text: 'Understanding the fundamentals', correct: true },
          { text: 'Guessing randomly', correct: false },
          { text: 'Ignoring the basics', correct: false },
          { text: 'Skipping practice', correct: false }
        ],
        explanation: 'Mastering fundamentals is essential for success.',
        xp: 25
      };
      
      // Calculate battles in current chapter only
      const chapter = chapters[currentChapter];
      const battlesInChapter = chapter.scenes.filter(s => s.type === 'battle').length;
      
      console.log(`⚔️ Rendering Battle ${currentBattleIndex + 1}/${battlesInChapter}`);
      
      return (
        <BattleScene
          scene={scene}
          question={question}
          onAnswer={handleBattleAnswer}
          battleNumber={currentBattleIndex + 1}
          totalBattles={battlesInChapter}
        />
      );
    }
  }

  if (screen === 'victory') {
    return (
      <VictoryScreen
        stats={stats}
        theme={theme}
        topic={topic}
        onReset={resetGame}
        onContinue={backToMap}
      />
    );
  }

  return null;
}
