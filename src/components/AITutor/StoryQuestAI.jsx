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

  generateQuestion: async (topic, difficulty, concept, subject = null, options = {}) => {
    const token = getAuthToken();
    const actualSubject = subject || topic;
    try {
      const response = await fetch(`${API_BASE}/api/ai/story/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          topic, 
          subject: actualSubject,
          chapterTitle: concept,
          difficulty, 
          conceptTitle: concept,
          ...options  // Supports: isBoss, lessonContent, gradeLevel
        })
      });
      if (!response.ok) throw new Error('Failed');
      return await response.json();
    } catch (error) {
      // Return appropriate fallback based on options
      if (options.isBoss) {
        return {
          questions: [
            { question: "What is 5 + 3?", choices: [{text:"7",correct:false},{text:"8",correct:true},{text:"9",correct:false},{text:"6",correct:false}], explanation: "5 + 3 = 8", difficulty: 1 },
            { question: "What is 12 - 4?", choices: [{text:"7",correct:false},{text:"8",correct:true},{text:"9",correct:false},{text:"6",correct:false}], explanation: "12 - 4 = 8", difficulty: 2 },
            { question: "What is 6 × 2?", choices: [{text:"11",correct:false},{text:"12",correct:true},{text:"14",correct:false},{text:"10",correct:false}], explanation: "6 × 2 = 12", difficulty: 3 }
          ],
          isBoss: true,
          count: 3
        };
      }
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
  },
  
  // Generate boss battle questions (3 questions from lesson content)
  generateBossQuestions: async (topic, concept, subject, lessonContent) => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE}/api/storyquest/boss-questions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          lessonContent,
          subject,
          chapterTitle: concept
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate boss questions');
      
      const data = await response.json();
      console.log(`👹 Received ${data.questions?.length || 0} boss questions`);
      return data.questions || [];
    } catch (error) {
      console.error('generateBossQuestions error:', error);
      // Return fallback questions
      return [
        { 
          question: "In the number 205, the zero shows there are no what?", 
          choices: [
            {text: "Tens", correct: true},
            {text: "Hundreds", correct: false},
            {text: "Ones", correct: false},
            {text: "Thousands", correct: false}
          ],
          explanation: "The lesson states: 'In 205, the zero shows there are no tens.'"
        },
        { 
          question: "Without zero, why would 205 look like 25?",
          choices: [
            {text: "You cannot tell there are no tens", correct: true},
            {text: "The 5 moves to hundreds", correct: false},
            {text: "It becomes a different number", correct: false},
            {text: "Zero makes it smaller", correct: false}
          ],
          explanation: "Without the zero placeholder, we lose the tens place information."
        },
        { 
          question: "Where did our digits 0-9 originally come from?",
          choices: [
            {text: "India", correct: true},
            {text: "China", correct: false},
            {text: "Europe", correct: false},
            {text: "Egypt", correct: false}
          ],
          explanation: "The lesson mentions Hindu-Arabic numerals came from India."
        }
      ];
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
// LEARN SCENE - Comprehensive Lesson with Structured Content
// ============================================
const LearnScene = ({ topic, chapterTitle, onComplete }) => {
  const [content, setContent] = useState('');
  const [parsedContent, setParsedContent] = useState({ keyPoints: [], fullLesson: '', whyItMatters: '' });
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(0);
  const [longLoading, setLongLoading] = useState(false);
  const [dots, setDots] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const maxRetries = 3;
  
  // Derive subject from topic (e.g., "Mathematics", "History", "Science")
  const subject = topic;

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
      setDots(prev => prev === '' ? '.' : prev === '.' ? '..' : prev === '..' ? '...' : '');
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

  // Parse structured content
  const parseContent = (rawContent) => {
    const lines = rawContent.split('\n');
    const result = { keyPoints: [], fullLesson: '', whyItMatters: '' };
    let currentSection = null;
    let fullLessonLines = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.includes('KEY POINTS:')) {
        currentSection = 'keypoints';
      } else if (trimmed.includes('FULL LESSON:')) {
        currentSection = 'lesson';
      } else if (trimmed.includes('WHY IT MATTERS:')) {
        currentSection = 'why';
      } else if (currentSection === 'keypoints' && trimmed.startsWith('•')) {
        result.keyPoints.push(trimmed.substring(1).trim());
      } else if (currentSection === 'lesson') {
        fullLessonLines.push(trimmed);
      } else if (currentSection === 'why') {
        result.whyItMatters += trimmed + ' ';
      }
    }

    result.fullLesson = fullLessonLines.join(' ');
    result.whyItMatters = result.whyItMatters.trim();

    // If parsing failed, treat everything as full lesson
    if (result.keyPoints.length === 0 && !result.fullLesson) {
      result.fullLesson = rawContent;
    }

    return result;
  };

  // Fetch explanation with retry logic
  const fetchExplanation = async (isRetry = false) => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLongLoading(false);
    
    try {
      const res = await api.post('/storyquest/learn', { 
        topic: chapterTitle || topic,
        subject,           // Pass subject context (e.g., "Mathematics")
        chapterTitle,      // Pass chapter name (e.g., "The Beginning")
        focus: chapterTitle, // Use chapter title as focus hint
        detailLevel: 'comprehensive'
      });
      const rawContent = res.data.content;
      setContent(rawContent);
      setParsedContent(parseContent(rawContent));
      setErrorCount(0);
    } catch (err) {
      console.error('LearnScene error:', err);
      const newErrorCount = errorCount + 1;
      setErrorCount(newErrorCount);
      if (newErrorCount >= 2) {
        setRetryDelay(newErrorCount === 2 ? 1000 : 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if ((topic || chapterTitle) && !content && errorCount === 0) {
      fetchExplanation();
    }
  }, [topic, chapterTitle]);

  const handleSkip = () => onComplete && onComplete({ skipped: true });
  const handleComplete = () => onComplete && onComplete({ skipped: false, content });

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
        <Card variant="danger" glow className="max-w-md text-center">
          <div className="text-5xl mb-4">📡</div>
          <h2 className="font-['Press_Start_2P'] text-sm text-rose-400 mb-4">NO INTERNET</h2>
          <div className="flex gap-2 justify-center">
            <PixelButton variant="danger" onClick={() => { setIsOnline(navigator.onLine); if (navigator.onLine) fetchExplanation(); }}>RETRY ↻</PixelButton>
            <PixelButton variant="secondary" onClick={handleSkip}>SKIP →</PixelButton>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
        <Card variant="blue" glow className="max-w-md text-center">
          <div className="py-8">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-6">📚</motion.div>
            <p className="font-['Press_Start_2P'] text-sm text-blue-400 animate-pulse">Preparing your lesson{dots}</p>
            {longLoading && <PixelButton variant="secondary" onClick={handleSkip} className="mt-4">SKIP →</PixelButton>}
          </div>
        </Card>
      </div>
    );
  }

  if (errorCount > 0 && !content) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
        <Card variant="danger" glow className="max-w-md text-center">
          <div className="text-5xl mb-4">💀</div>
          <p className="font-['Press_Start_2P'] text-xs text-rose-400 mb-6">Failed to load lesson</p>
          <div className="flex gap-2 justify-center">
            <PixelButton variant="danger" onClick={() => fetchExplanation(true)} disabled={retryDelay > 0}>
              {retryDelay > 0 ? `WAIT ${retryDelay/1000}s` : 'RETRY ↻'}
            </PixelButton>
            <PixelButton variant="secondary" onClick={handleSkip}>SKIP →</PixelButton>
          </div>
        </Card>
      </div>
    );
  }

  // Structured Content State
  return (
    <div className="min-h-screen bg-slate-950 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto py-8">
        {/* Header */}
        <Card variant="primary" glow className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📚</span>
            <div>
              <h2 className="font-['Press_Start_2P'] text-sm text-blue-400">LESSON</h2>
              <h1 className="font-['Press_Start_2P'] text-lg text-white mt-1">{chapterTitle || topic}</h1>
            </div>
          </div>
        </Card>

        {/* Key Points */}
        {parsedContent.keyPoints.length > 0 && (
          <Card variant="gold" glow className="mb-6">
            <h3 className="font-['Press_Start_2P'] text-xs text-amber-400 mb-4 flex items-center gap-2">
              <span>⭐</span> KEY POINTS TO REMEMBER
            </h3>
            <ul className="space-y-3">
              {parsedContent.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">▸</span>
                  <span className="font-['Press_Start_2P'] text-xs text-amber-100 leading-5">{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Full Lesson */}
        <Card variant="default" glow className="mb-6">
          <h3 className="font-['Press_Start_2P'] text-xs text-blue-400 mb-4 flex items-center gap-2">
            <span>📖</span> FULL LESSON
          </h3>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <p className="font-['Press_Start_2P'] text-xs text-slate-300 leading-6 whitespace-pre-wrap">
              {parsedContent.fullLesson || content}
            </p>
          </div>
        </Card>

        {/* Why It Matters */}
        {parsedContent.whyItMatters && (
          <Card variant="success" glow className="mb-6">
            <h3 className="font-['Press_Start_2P'] text-xs text-emerald-400 mb-2 flex items-center gap-2">
              <span>💡</span> WHY THIS MATTERS
            </h3>
            <p className="font-['Press_Start_2P'] text-xs text-emerald-100 leading-5">
              {parsedContent.whyItMatters}
            </p>
          </Card>
        )}

        {/* Action Button */}
        <div className="flex gap-4">
          <PixelButton variant="gold" onClick={handleComplete} className="flex-1">
            I UNDERSTOOD, LET'S PRACTICE →
          </PixelButton>
          <PixelButton variant="secondary" onClick={handleSkip}>
            SKIP →
          </PixelButton>
        </div>
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

  // CRITICAL: Reset state when battle number changes
  useEffect(() => {
    console.log(`⚔️ Battle changed to ${battleNumber}/${totalBattles}, resetting state`);
    setSelected(null);
    setShowResult(false);
    setIsCorrect(false);
  }, [battleNumber, totalBattles]);

  // Debug render
  console.log(`🎮 Rendering Battle ${battleNumber}: selected=${selected}, showResult=${showResult}, isCorrect=${isCorrect}`);

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
// BOSS BATTLE - Enhanced HP System with 3 Questions
// ============================================
const BossBattle = ({ questions, lessonContent, subject, onVictory, onDefeat, enemyName = 'Minion of Confusion' }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [bossHP, setBossHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [lives, setLives] = useState(3);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [shake, setShake] = useState(false);
  const [damageAnim, setDamageAnim] = useState(null);
  
  const currentQuestion = questions[currentQIndex];
  
  // FIXED DAMAGE VALUES: 3 hits to win/lose
  const BOSS_DAMAGE = 34;  // 34 × 3 = 102 (kills boss in 3 hits)
  const PLAYER_DAMAGE = 33; // 33 × 3 = 99 (kills player in 3 hits)
  const TOTAL_QUESTIONS = questions.length; // Should be 3
  
  console.log(`👹 BossBattle: ${TOTAL_QUESTIONS} questions total, current: ${currentQIndex + 1}/${TOTAL_QUESTIONS}`);
  
  const handleAnswer = (choiceIndex) => {
    if (showResult) return;
    
    const correct = currentQuestion.choices[choiceIndex].correct;
    setSelectedChoice(choiceIndex);
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      // HIT BOSS - 34 damage
      console.log(`⚔️ Q${currentQIndex + 1}: Correct! Dealing ${BOSS_DAMAGE} damage`);
      setBossHP(prev => {
        const newHP = Math.max(0, prev - BOSS_DAMAGE);
        console.log(`👹 Boss HP: ${prev} → ${newHP}`);
        
        // Show damage animation
        setDamageAnim({ target: 'boss', amount: BOSS_DAMAGE });
        setTimeout(() => setDamageAnim(null), 800);
        
        // Check for victory: if this was the LAST question
        const isLastQuestion = currentQIndex >= TOTAL_QUESTIONS - 1;
        if (isLastQuestion && newHP > 0) {
          // Last question answered correctly - VICTORY!
          console.log(`🏆 Last question correct! Victory!`);
          setTimeout(() => onVictory(), 1500);
        }
        
        return newHP;
      });
    } else {
      // PLAYER HIT - 33 damage + shake effect
      console.log(`🛡️ Q${currentQIndex + 1}: Wrong! Taking ${PLAYER_DAMAGE} damage`);
      setPlayerHP(prev => {
        const newHP = Math.max(0, prev - PLAYER_DAMAGE);
        const newLives = Math.ceil(newHP / 33);
        setLives(newLives);
        console.log(`❤️ Player HP: ${prev} → ${newHP}, Lives: ${newLives}`);
        
        // Show damage animation
        setDamageAnim({ target: 'player', amount: PLAYER_DAMAGE });
        setShake(true);
        setTimeout(() => {
          setDamageAnim(null);
          setShake(false);
        }, 500);
        
        return newHP;
      });
    }
  };
  
  const handleContinue = () => {
    console.log(`🔄 Continue clicked. Correct: ${isCorrect}, Current Q: ${currentQIndex + 1}/${TOTAL_QUESTIONS}`);
    
    if (isCorrect) {
      // Check if there are MORE questions
      if (currentQIndex < TOTAL_QUESTIONS - 1) {
        // Move to NEXT question (Q1→Q2, Q2→Q3)
        console.log(`➡️ Moving to question ${currentQIndex + 2}/${TOTAL_QUESTIONS}`);
        setCurrentQIndex(prev => prev + 1);
        setShowResult(false);
        setIsCorrect(null);
        setSelectedChoice(null);
      } else {
        // This was the LAST question - victory handled in handleAnswer
        console.log(`✅ All ${TOTAL_QUESTIONS} questions answered!`);
      }
    } else {
      // Wrong answer - stay on SAME question, reset to try again
      console.log(`🔄 Wrong answer - retrying question ${currentQIndex + 1}`);
      setShowResult(false);
      setIsCorrect(null);
      setSelectedChoice(null);
    }
  };
  
  // Check for defeat when playerHP hits 0
  useEffect(() => {
    if (playerHP <= 0) {
      console.log(`💀 Player defeated!`);
      setTimeout(() => onDefeat(), 1000);
    }
  }, [playerHP, onDefeat]);
  
  // Check for victory when bossHP hits 0 (from damage, not last question)
  useEffect(() => {
    if (bossHP <= 0 && currentQIndex < TOTAL_QUESTIONS - 1) {
      console.log(`🏆 Boss HP 0! Victory!`);
      setTimeout(() => onVictory(), 500);
    }
  }, [bossHP, currentQIndex, TOTAL_QUESTIONS, onVictory]);
  
  // Get boss emoji based on HP
  const getBossEmoji = () => {
    if (bossHP > 66) return '👹';
    if (bossHP > 33) return '👺';
    return '💀';
  };
  
  // Get heart display for player
  const getHearts = () => {
    const hearts = [];
    const fullHearts = Math.ceil(playerHP / 33);
    for (let i = 0; i < 3; i++) {
      hearts.push(i < fullHearts ? '❤️' : '🖤');
    }
    return hearts;
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 p-4 pt-6 relative overflow-hidden ${shake ? 'animate-pulse' : ''}`}>
      {/* Floating Damage Numbers */}
      <AnimatePresence>
        {damageAnim && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -80, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`fixed left-1/2 top-1/3 text-4xl font-bold z-50 pointer-events-none transform -translate-x-1/2 ${
              damageAnim.target === 'boss' ? 'text-yellow-400' : 'text-red-600'
            }`}
          >
            {damageAnim.target === 'boss' ? '-' : '+'}{damageAnim.amount}!
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-2xl mx-auto">
        {/* Boss Section */}
        <Card variant="danger" glow className={`mb-4 ${damageAnim?.target === 'boss' ? 'animate-pulse' : ''}`}>
          {/* Boss Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-rose-400 text-xs font-bold" style={pixelText}>BOSS</span>
              {bossHP < 50 && (
                <span className="text-rose-300 text-[10px] font-bold animate-pulse" style={pixelText}>⚠️ CRITICAL!</span>
              )}
            </div>
            <span className="text-rose-400 text-xs" style={pixelText}>{bossHP}/100 HP</span>
          </div>
          
          {/* Boss HP Bar */}
          <div className="h-6 bg-slate-900 border-2 border-rose-700 rounded-lg overflow-hidden mb-4">
            <motion.div 
              className={`h-full ${bossHP < 50 ? 'bg-gradient-to-r from-red-600 to-rose-500' : 'bg-gradient-to-r from-rose-600 to-red-500'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${bossHP}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          {/* Boss Avatar & Name */}
          <div className="flex items-center gap-4">
            <motion.div 
              animate={bossHP < 50 ? { x: [-5, 5, -5, 5, 0] } : { scale: [1, 1.05, 1] }}
              transition={{ duration: bossHP < 50 ? 0.4 : 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-rose-600 to-slate-800 rounded-2xl flex items-center justify-center text-5xl shadow-xl"
            >
              {getBossEmoji()}
            </motion.div>
            <div>
              <h3 className="text-white text-xl font-bold" style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {enemyName}
              </h3>
              <p className="text-rose-400 text-xs" style={pixelText}>
                {bossHP > 66 ? 'The enemy looks confident...' : 
                 bossHP > 33 ? 'The enemy is weakening!' : 
                 'The enemy is nearly defeated!'}
              </p>
            </div>
          </div>
        </Card>
        
        {/* Player HP & Hearts */}
        <div className="mb-4">
          {/* Player HP Bar */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-blue-400 text-xs font-bold" style={pixelText}>YOU</span>
                <span className="text-blue-400 text-xs" style={pixelText}>{playerHP}/100</span>
              </div>
              <div className={`h-4 bg-slate-900 border-2 border-blue-700 rounded overflow-hidden ${shake ? 'animate-pulse' : ''}`}>
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${playerHP}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            
            {/* Question Counter */}
            <div className="text-center px-4">
              <span className="text-yellow-400 text-xs font-bold block" style={pixelText}>
                BATTLE {currentQIndex + 1}/{TOTAL_QUESTIONS}
              </span>
              <span className="text-rose-400 text-[10px] block" style={pixelText}>
                BOSS HP: {bossHP}
              </span>
            </div>
          </div>
          
          {/* Hearts Display */}
          <div className="flex gap-1 justify-center">
            {getHearts().map((heart, i) => (
              <span key={i} className="text-2xl">{heart}</span>
            ))}
          </div>
        </div>
        
        {/* Question Card */}
        <Card variant="default" className="mb-4">
          <p className="text-white text-base leading-relaxed" style={{ ...pixelText, lineHeight: '1.8' }}>
            {currentQuestion?.question}
          </p>
        </Card>
        
        {/* Answer Choices */}
        {!showResult ? (
          <div className="space-y-3">
            {currentQuestion?.choices.map((choice, i) => (
              <motion.button
                key={i}
                onClick={() => handleAnswer(i)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="w-full p-4 border-2 border-slate-600 bg-slate-800 hover:border-blue-500 hover:bg-slate-700 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg bg-slate-700 text-slate-300" style={pixelText}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-slate-200 text-sm flex-1" style={pixelText}>{choice.text}</span>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-xl border-2 ${isCorrect ? 'bg-emerald-900/60 border-emerald-500' : 'bg-rose-900/60 border-rose-500'}`}
          >
            <div className="text-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}
              >
                {isCorrect ? '⚔️' : '🛡️'}
              </motion.div>
              <p className={`text-xl font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`} style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {isCorrect ? `DIRECT HIT! -${BOSS_DAMAGE} HP` : `ATTACK BLOCKED! +${PLAYER_DAMAGE} DMG TAKEN`}
              </p>
            </div>
            
            <p className="text-slate-300 text-sm text-center mb-4" style={{ ...pixelText, lineHeight: '1.6' }}>
              {currentQuestion.explanation}
            </p>
            
            {isCorrect ? (
              <PixelButton 
                onClick={handleContinue}
                variant={bossHP <= 0 || currentQIndex >= questions.length - 1 ? 'gold' : 'success'}
                className="w-full"
                icon={bossHP <= 0 || currentQIndex >= questions.length - 1 ? Trophy : ChevronRight}
              >
                {bossHP <= 0 || currentQIndex >= questions.length - 1 ? 'VICTORY!' : 'NEXT ATTACK →'}
              </PixelButton>
            ) : (
              <div className="space-y-2">
                <p className="text-rose-400 text-xs text-center" style={pixelText}>
                  You took {PLAYER_DAMAGE} damage! {getHearts().filter(h => h === '❤️').length} lives remaining!
                </p>
                <PixelButton 
                  onClick={handleContinue}
                  variant="danger"
                  className="w-full"
                  icon={RotateCcw}
                >
                  TRY AGAIN ↻
                </PixelButton>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ============================================
// PRACTICE SCENE - Guided questions with hints
// ============================================
const PracticeScene = ({ topic, chapterTitle, lessonContent, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  
  // Derive subject from topic (e.g., "Mathematics", "History", "Science")
  const subject = topic;

  // Load 3 practice questions
  useEffect(() => {
    loadQuestions();
  }, [topic, chapterTitle, lessonContent]);

  const loadQuestions = async () => {
    setLoading(true);
    const loadedQuestions = [];
    
    // Get lesson content from props or localStorage
    const contentToUse = lessonContent || localStorage.getItem('studyquest_last_lesson') || '';
    
    for (let i = 0; i < 3; i++) {
      try {
        const res = await api.post('/storyquest/practice', {
          topic: chapterTitle || topic,
          subject,           // Pass subject context
          chapterTitle,      // Pass chapter name
          lessonContent: contentToUse, // Pass full lesson content
          questionNumber: i, // 0, 1, 2 for different facts
          difficulty: i + 1
        });
        loadedQuestions.push(res.data);
      } catch (err) {
        console.error('Failed to load practice question:', err);
        // Add fallback based on lesson content if available
        if (contentToUse) {
          loadedQuestions.push({
            question: `According to the lesson, which statement is correct?`,
            choices: [
              { text: 'The lesson explained this topic', correct: true },
              { text: 'This was not mentioned', correct: false },
              { text: 'The opposite is true', correct: false },
              { text: 'It is unrelated', correct: false }
            ],
            hint: 'Think about what you just read in the lesson.',
            explanation: 'Review the lesson content to find the correct answer.'
          });
        } else {
          loadedQuestions.push({
            question: 'What was the main purpose of the pyramids in Ancient Egypt?',
            choices: [
              { text: 'Shopping centers', correct: false },
              { text: 'Tombs for pharaohs', correct: true },
              { text: 'Schools', correct: false },
              { text: 'Grain storage', correct: false }
            ],
            hint: 'Think about where Egyptian kings were buried.',
            explanation: 'The pyramids were built as elaborate tombs for pharaohs to help them reach the afterlife.'
          });
        }
      }
    }
    
    setQuestions(loadedQuestions);
    setLoading(false);
  };

  const handleSelect = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = questions[currentQuestionIndex].choices[selectedAnswer].correct;
    setShowResult(true);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      // Practice complete
      onComplete && onComplete({ correctCount: correctCount + (questions[currentQuestionIndex].choices[selectedAnswer]?.correct ? 1 : 0), total: questions.length });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
        <Card variant="success" glow className="max-w-md text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">🧙‍♂️</motion.div>
          <p className="font-['Press_Start_2P'] text-sm text-emerald-400">Preparing practice questions...</p>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer !== null && currentQ.choices[selectedAnswer].correct;

  return (
    <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-4 flex items-center justify-between">
          <span className="font-['Press_Start_2P'] text-xs text-emerald-400">
            PRACTICE {currentQuestionIndex + 1}/3
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < currentQuestionIndex ? 'bg-emerald-500' : i === currentQuestionIndex ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        <Card variant="success" glow>
          {/* Mentor Header */}
          <div className="flex items-center gap-3 mb-6">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl">🧙‍♂️</motion.div>
            <div>
              <h2 className="font-['Press_Start_2P'] text-sm text-emerald-400">PRACTICE TIME</h2>
              <p className="font-['Press_Start_2P'] text-[10px] text-emerald-600">Learn from your mistakes</p>
            </div>
          </div>

          {/* Question */}
          <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-lg p-4 mb-6">
            <p className="font-['Press_Start_2P'] text-sm text-emerald-100 leading-6">
              {currentQ.question}
            </p>
          </div>

          {/* Hint Toggle */}
          {!showResult && (
            <button 
              onClick={() => setShowHint(!showHint)}
              className="mb-4 text-emerald-500 text-xs font-bold hover:text-emerald-400 flex items-center gap-1"
            >
              <span>💡</span> {showHint ? 'Hide Hint' : 'Need a hint?'}
            </button>
          )}

          {/* Hint Box */}
          <AnimatePresence>
            {showHint && !showResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-3 mb-4"
              >
                <p className="font-['Press_Start_2P'] text-xs text-amber-300">
                  💡 Hint: {currentQ.hint}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer Choices */}
          <div className="space-y-3 mb-6">
            {currentQ.choices.map((choice, i) => {
              let btnClass = 'bg-slate-800 border-slate-600 hover:border-emerald-500 hover:bg-slate-700';
              
              if (showResult) {
                if (choice.correct) {
                  btnClass = 'bg-emerald-900/80 border-emerald-500';
                } else if (selectedAnswer === i) {
                  btnClass = 'bg-rose-900/80 border-rose-500';
                } else {
                  btnClass = 'bg-slate-800 border-slate-700 opacity-50';
                }
              } else if (selectedAnswer === i) {
                btnClass = 'bg-emerald-800 border-emerald-500';
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showResult}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${btnClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${showResult && choice.correct ? 'bg-emerald-500 text-white' : selectedAnswer === i ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-['Press_Start_2P'] text-xs text-slate-200 flex-1">{choice.text}</span>
                    {showResult && choice.correct && <span className="text-emerald-400">✓</span>}
                    {showResult && selectedAnswer === i && !choice.correct && <span className="text-rose-400">✗</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Result Panel */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border-2 p-4 mb-4 ${isCorrect ? 'bg-emerald-900/50 border-emerald-500' : 'bg-amber-900/50 border-amber-500'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{isCorrect ? '🎉' : '🤔'}</span>
                  <span className={`font-['Press_Start_2P'] text-sm ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isCorrect ? 'Correct! Well done!' : 'Not quite, but you learned something!'}
                  </span>
                </div>
                <p className="font-['Press_Start_2P'] text-xs text-slate-300 leading-5">
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          {!showResult ? (
            <PixelButton 
              variant="success" 
              onClick={handleSubmit} 
              disabled={selectedAnswer === null}
              className="w-full"
            >
              SUBMIT ANSWER
            </PixelButton>
          ) : (
            <PixelButton 
              variant={isCorrect ? 'success' : 'gold'} 
              onClick={handleContinue}
              className="w-full"
            >
              {currentQuestionIndex < questions.length - 1 ? 'NEXT QUESTION →' : 'READY FOR BOSS →'}
            </PixelButton>
          )}
        </Card>
      </div>
    </div>
  );
};

// ============================================
// CHAPTER MAP
// ============================================
const ChapterMap = ({ chapters, currentChapter, onSelectChapter, theme, onBack, stats, completedChapters, unlockedChapters, setCompletedChapters, setUnlockedChapters }) => {
  // Debug logging
  console.log('🗺️ ChapterMap render - completed:', completedChapters, 'unlocked:', unlockedChapters);
  
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

        {/* DEBUG BUTTON - Remove after testing */}
        <div className="mb-4 p-3 bg-red-900/50 border-2 border-red-500 rounded-lg">
          <p className="text-red-300 text-xs mb-2 font-bold">DEBUG CONTROLS</p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                console.log("🚨 FORCE UNLOCK CHAPTER 2");
                setUnlockedChapters([1, 2]);
                setCompletedChapters([1]);
                localStorage.setItem('studyquest_progress', JSON.stringify({
                  completed: [1],
                  unlocked: [1, 2],
                  lastPlayed: new Date().toISOString()
                }));
              }}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
            >
              Unlock Ch.2
            </button>
            <button 
              onClick={() => {
                console.log("🚨 UNLOCK ALL CHAPTERS");
                setUnlockedChapters([1, 2, 3, 4]);
                setCompletedChapters([1, 2, 3]);
                localStorage.setItem('studyquest_progress', JSON.stringify({
                  completed: [1, 2, 3],
                  unlocked: [1, 2, 3, 4],
                  lastPlayed: new Date().toISOString()
                }));
              }}
              className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-500"
            >
              Unlock All
            </button>
            <button 
              onClick={() => {
                console.log("🗑️ CLEAR PROGRESS");
                setUnlockedChapters([1]);
                setCompletedChapters([]);
                localStorage.removeItem('studyquest_progress');
              }}
              className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
          <p className="text-red-400 text-[10px] mt-2">
            completed: {JSON.stringify(completedChapters)} | unlocked: {JSON.stringify(unlockedChapters)}
          </p>
        </div>

        {/* Chapter Path */}
        <div className="space-y-4">
          {chapters.map((chapter, index) => {
            const isCompleted = completedChapters.includes(chapter.id);
            const isCurrent = index === currentChapter;
            // Chapter is unlocked if it's in the unlockedChapters array
            const isUnlocked = unlockedChapters.includes(chapter.id);
            const isLocked = !isUnlocked;

            // Brute force unlock check
            const isChapterUnlocked = (id) => {
              if (id === 1) return true;
              const prevId = id - 1;
              const result = completedChapters.includes(prevId);
              console.log(`  🔓 Check Ch ${id}: prev=${prevId} in completed? ${result}`);
              return result;
            };
            const bruteForceUnlocked = isChapterUnlocked(chapter.id);
            
            console.log(`📍 Chapter ${chapter.id}: completed=${isCompleted}, unlocked=${isUnlocked}, locked=${isLocked}, bruteForce=${bruteForceUnlocked}`);
            console.log(`   unlockedChapters array:`, unlockedChapters);
            console.log(`   completedChapters array:`, completedChapters);

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
  const [bossQuestions, setBossQuestions] = useState(null); // For boss battle: array of 3 questions
  const [lessonContent, setLessonContent] = useState(''); // Store lesson content for question generation
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ xp: 0, battlesWon: 0 });
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0); // Track battle within current chapter
  const [completedChapters, setCompletedChapters] = useState([]); // Chapters fully completed
  const [unlockedChapters, setUnlockedChapters] = useState([1]); // Chapters available to play (starts with 1)

  const topicRef = useRef(null);

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('studyquest_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        console.log('📂 Loaded saved progress:', data);
        if (data.completed && Array.isArray(data.completed)) {
          setCompletedChapters(data.completed);
        }
        if (data.unlocked && Array.isArray(data.unlocked)) {
          setUnlockedChapters(data.unlocked);
        }
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  // Save progress whenever states change
  useEffect(() => {
    localStorage.setItem('studyquest_progress', JSON.stringify({
      completed: completedChapters,
      unlocked: unlockedChapters,
      lastPlayed: new Date().toISOString()
    }));
    console.log('💾 Saved progress - completed:', completedChapters, 'unlocked:', unlockedChapters);
  }, [completedChapters, unlockedChapters]);

  // RELOAD progress when returning to map screen
  useEffect(() => {
    if (screen === 'map') {
      console.log("🗺️ Map screen active, reloading progress from storage");
      const saved = localStorage.getItem('studyquest_progress');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          console.log('📂 Reloaded from storage:', data);
          if (data.completed && Array.isArray(data.completed)) {
            setCompletedChapters(data.completed);
          }
          if (data.unlocked && Array.isArray(data.unlocked)) {
            setUnlockedChapters(data.unlocked);
          }
        } catch (e) {
          console.error('Failed to reload progress:', e);
        }
      }
    }
  }, [screen]);

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
    // NEW FLOW: Start with Learn scene
    setScreen('learn');
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
      // Chapter complete - unlock next chapter
      console.log(`📜 All scenes in chapter ${chapter.id} complete`);
      completeChapterAndUnlock(currentChapter);
      
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
          nextScene.title || `${topic} concept`,
          topic // Pass subject context
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

  const completeChapterAndUnlock = (chapterIndex) => {
    const chapterId = chapters[chapterIndex]?.id;
    if (!chapterId) return;
    
    const nextChapterId = chapterId + 1;
    console.log(`🏆 COMPLETING CHAPTER ${chapterId}, unlocking ${nextChapterId}`);
    
    // Mark current as completed
    setCompletedChapters(prev => {
      if (prev.includes(chapterId)) {
        console.log(`  Chapter ${chapterId} already in completed list`);
        return prev;
      }
      const newCompleted = [...prev, chapterId];
      console.log(`  New completed chapters:`, newCompleted);
      return newCompleted;
    });
    
    // Unlock next chapter
    if (nextChapterId <= chapters.length) {
      setUnlockedChapters(prev => {
        if (prev.includes(nextChapterId)) {
          console.log(`  Chapter ${nextChapterId} already unlocked`);
          return prev;
        }
        const newUnlocked = [...prev, nextChapterId];
        console.log(`  New unlocked chapters:`, newUnlocked);
        return newUnlocked;
      });
    }
    
    // Save to localStorage immediately
    const saved = {
      completed: [...completedChapters, chapterId],
      unlocked: [...unlockedChapters, nextChapterId].filter((v, i, a) => a.indexOf(v) === i),
      lastChapter: chapterId,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('studyquest_progress', JSON.stringify(saved));
    console.log(`  💾 Saved to localStorage:`, saved);
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
        // All battles in this chapter complete - UNLOCK NEXT CHAPTER
        console.log(`✅ All ${totalBattlesInChapter} battles complete! Chapter finished.`);
        completeChapterAndUnlock(currentChapter);
        
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
          'Retry',
          topic // Pass subject context
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
    console.log("🔄 NEW ADVENTURE - Resetting all progress");
    
    // Clear localStorage first
    localStorage.removeItem('studyquest_progress');
    console.log("  🗑️ Cleared localStorage");
    
    // Reset all state
    setScreen('title');
    setTopic('');
    setCurrentChapter(0);
    setCurrentScene(0);
    setCurrentQuestion(null);
    setStats({ xp: 0, battlesWon: 0 });
    setCurrentBattleIndex(0);
    
    // Reset progress to ONLY chapter 1 unlocked
    setCompletedChapters([]);
    setUnlockedChapters([1]);
    
    console.log("  ✅ Reset complete - only Chapter 1 unlocked");
  };

  const backToMap = () => {
    console.log("🏠 Returning to map from victory");
    // Chapter unlock is now handled in completeChapterAndUnlock
    setScreen('map');
    setCurrentScene(0);
    setCurrentQuestion(null);
    setCurrentBattleIndex(0);
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
        unlockedChapters={unlockedChapters}
        setCompletedChapters={setCompletedChapters}
        setUnlockedChapters={setUnlockedChapters}
      />
    );
  }

  // NEW FLOW: Learn → Practice → Battle
  if (screen === 'learn' && chapters[currentChapter]) {
    const chapter = chapters[currentChapter];
    return (
      <LearnScene 
        topic={topic} 
        chapterTitle={chapter.title}
        onComplete={(result) => {
          if (result.skipped) {
            console.log('📜 Learn scene skipped, going to practice');
          } else if (result.content) {
            // Store lesson content for boss question generation
            setLessonContent(result.content);
            localStorage.setItem('studyquest_last_lesson', result.content);
            console.log('📚 Lesson content stored for boss battle');
          }
          setScreen('practice');
        }} 
      />
    );
  }

  if (screen === 'practice' && chapters[currentChapter]) {
    const chapter = chapters[currentChapter];
    return (
      <PracticeScene
        topic={topic}
        chapterTitle={chapter.title}
        lessonContent={lessonContent}
        onComplete={async (result) => {
          console.log(`🎓 Practice complete! ${result.correctCount}/${result.total} correct`);
          
          // Check if upcoming battle is a boss battle
          const battleScenes = chapter.scenes.filter(s => s.type === 'battle');
          const nextBattleScene = battleScenes[0]; // First battle in chapter
          
          if (nextBattleScene?.isBoss) {
            console.log(`👹 Boss battle detected! Generating boss questions...`);
            setLoading(true);
            
            try {
              // Get lesson content from state or localStorage
              const lessonData = lessonContent || localStorage.getItem('studyquest_last_lesson');
              const contentToUse = lessonData || `${topic} - ${chapter.title}`;
              
              console.log(`📚 Boss battle using lesson (${contentToUse.length} chars): ${contentToUse.substring(0, 100)}...`);
              
              // Generate 3 boss questions using lesson content
              const questions = await AIService.generateBossQuestions(
                topic,
                chapter.title,
                topic,
                contentToUse
              );
              
              console.log(`✅ Received ${questions.length} boss questions from API`);
              
              // Ensure we have exactly 3 questions
              let finalQuestions = questions;
              if (questions.length < 3) {
                console.log(`⚠️ Only ${questions.length} questions received, adding fallback`);
                const fallback = generateLessonFallbackQuestions(contentToUse, topic);
                finalQuestions = [...questions, ...fallback].slice(0, 3);
              }
              
              // Validate questions match lesson (log warnings but still use them)
              const lessonLower = contentToUse.toLowerCase();
              finalQuestions.forEach((q, i) => {
                const qLower = (q.question || '').toLowerCase();
                const matchesLesson = lessonLower.includes('zero') && qLower.includes('zero') ||
                                     lessonLower.includes('place') && qLower.includes('place') ||
                                     lessonLower.includes('205') && qLower.includes('205') ||
                                     lessonLower.includes('digit') && qLower.includes('digit') ||
                                     qLower.includes(topic.toLowerCase());
                if (!matchesLesson) {
                  console.warn(`⚠️ Q${i+1} may not match lesson: ${q.question?.substring(0, 50)}...`);
                }
              });
              
              console.log(`📋 Setting ${finalQuestions.length} boss questions`);
              setBossQuestions(finalQuestions);
            } catch (error) {
              console.error('Failed to generate boss questions:', error);
              // Use lesson-specific fallback
              const contentToUse = lessonContent || localStorage.getItem('studyquest_last_lesson') || `${topic} - ${chapter.title}`;
              setBossQuestions(generateLessonFallbackQuestions(contentToUse, topic));
            } finally {
              setLoading(false);
            }
          }
          
          setScreen('battle');
        }}
      />
    );
  }
  
  // Helper function for lesson-specific fallback questions
  function generateLessonFallbackQuestions(lesson, subject) {
    const lessonLower = lesson.toLowerCase();
    
    // Math - Zero/Place Value
    if (lessonLower.includes('zero') && lessonLower.includes('205')) {
      return [
        { 
          question: "In the number 205, what does the zero represent?",
          choices: [
            {text: "No tens", correct: true},
            {text: "No hundreds", correct: false},
            {text: "Five ones", correct: false},
            {text: "Two thousands", correct: false}
          ],
          explanation: "The lesson states: 'In 205, the zero shows there are no tens.'"
        },
        { 
          question: "Why would 205 look like 25 without the zero?",
          choices: [
            {text: "You cannot tell there are no tens", correct: true},
            {text: "The 5 moves to hundreds place", correct: false},
            {text: "It becomes a different number", correct: false},
            {text: "Zero makes it smaller", correct: false}
          ],
          explanation: "Without the zero placeholder, we lose the tens place information."
        },
        { 
          question: "Where did our digits 0-9 originally come from?",
          choices: [
            {text: "India", correct: true},
            {text: "China", correct: false},
            {text: "Europe", correct: false},
            {text: "Egypt", correct: false}
          ],
          explanation: "The lesson mentions Hindu-Arabic numerals came from India."
        }
      ];
    }
    
    // Math - General
    if (subject.toLowerCase().includes('math')) {
      return [
        { 
          question: "What important math concept did the lesson teach?",
          choices: [
            {text: "The main concept from the lesson", correct: true},
            {text: "Something not covered", correct: false},
            {text: "Advanced calculus", correct: false},
            {text: "Ancient history", correct: false}
          ],
          explanation: "The lesson covered the key math concept."
        },
        { 
          question: "According to the lesson, which statement is true?",
          choices: [
            {text: "The lesson fact", correct: true},
            {text: "An incorrect statement", correct: false},
            {text: "Something unrelated", correct: false},
            {text: "The opposite", correct: false}
          ],
          explanation: "The lesson taught this fact."
        },
        { 
          question: "Apply what you learned. What is correct?",
          choices: [
            {text: "The correct application", correct: true},
            {text: "A wrong answer", correct: false},
            {text: "An unrelated idea", correct: false},
            {text: "A mistake", correct: false}
          ],
          explanation: "This is how you apply the lesson concept."
        }
      ];
    }
    
    // History
    if (subject.toLowerCase().includes('history')) {
      return [
        { 
          question: "What important historical fact did the lesson teach?",
          choices: [
            {text: "The main historical fact", correct: true},
            {text: "A made-up event", correct: false},
            {text: "Modern technology", correct: false},
            {text: "Math formulas", correct: false}
          ],
          explanation: "The lesson covered this historical fact."
        },
        { 
          question: "According to the lesson, what happened?",
          choices: [
            {text: "The historical event", correct: true},
            {text: "Something else", correct: false},
            {text: "Nothing important", correct: false},
            {text: "The opposite", correct: false}
          ],
          explanation: "The lesson describes this event."
        },
        { 
          question: "Why is this history important?",
          choices: [
            {text: "It affects us today", correct: true},
            {text: "It is not important", correct: false},
            {text: "Nobody remembers it", correct: false},
            {text: "It is fiction", correct: false}
          ],
          explanation: "The lesson explains the importance of this history."
        }
      ];
    }
    
    // Generic fallback
    return [
      { 
        question: `What is the main topic of this ${subject} lesson?`,
        choices: [
          {text: "The key concept", correct: true},
          {text: "Something else", correct: false},
          {text: "Nothing", correct: false},
          {text: "Everything", correct: false}
        ],
        explanation: "The lesson was about the subject matter."
      },
      { 
        question: `Why is ${subject} important?`,
        choices: [
          {text: "It helps us understand", correct: true},
          {text: "It is not", correct: false},
          {text: "Unknown", correct: false},
          {text: "Random", correct: false}
        ],
        explanation: `Learning ${subject} helps us understand the world.`
      },
      { 
        question: "What did we learn in this chapter?",
        choices: [
          {text: "Key concepts", correct: true},
          {text: "Nothing", correct: false},
          {text: "Everything", correct: false},
          {text: "Random facts", correct: false}
        ],
        explanation: "We learned key concepts in this chapter."
      }
    ];
  }

  if (screen === 'battle' && chapters[currentChapter]) {
    const chapter = chapters[currentChapter];
    
    // Get battle scene from chapter
    const battleScenes = chapter.scenes.filter(s => s.type === 'battle');
    const currentBattleScene = battleScenes[currentBattleIndex] || battleScenes[0];
    
    // Check if this is a boss battle
    const isBossBattle = currentBattleScene?.isBoss || false;
    
    // Use BossBattle component for boss fights
    if (isBossBattle && bossQuestions && bossQuestions.length >= 3) {
      console.log(`👹 Rendering Boss Battle with ${bossQuestions.length} questions:`);
      bossQuestions.forEach((q, i) => console.log(`  Q${i+1}: ${q.question?.substring(0, 40)}...`));
      
      return (
        <BossBattle
          questions={bossQuestions}
          lessonContent={lessonContent}
          subject={topic}
          enemyName={currentBattleScene?.enemy || 'Minion of Confusion'}
          onVictory={() => {
            console.log(`🏆 Boss Battle Victory! Completing chapter...`);
            // Clear boss questions and proceed
            setBossQuestions(null);
            handleBattleAnswer({ correct: true }, true);
          }}
          onDefeat={() => {
            console.log(`💀 Boss Battle Defeat! Returning to map...`);
            // Player lost - reset and allow retry
            setBossQuestions(null);
            setScreen('map');
            setCurrentBattleIndex(0);
          }}
        />
      );
    }
    
    // Ensure we have a question for regular battles (lesson-aligned fallback)
    const lessonText = lessonContent || localStorage.getItem('studyquest_last_lesson') || '';
    const lessonLower = lessonText.toLowerCase();
    
    // Generate lesson-aligned fallback question
    let fallbackQuestion;
    if (lessonLower.includes('zero') || lessonLower.includes('place')) {
      fallbackQuestion = {
        text: `In the number 205, what does the zero show?`,
        choices: [
          { text: 'No tens', correct: true },
          { text: 'No hundreds', correct: false },
          { text: 'Five ones', correct: false },
          { text: 'Two thousands', correct: false }
        ],
        explanation: 'The zero in 205 shows there are no tens.',
        xp: 25
      };
    } else if (lessonLower.includes('history') || topic.toLowerCase().includes('history')) {
      fallbackQuestion = {
        text: `What important historical event did the lesson describe?`,
        choices: [
          { text: 'The key historical event', correct: true },
          { text: 'A modern invention', correct: false },
          { text: 'A scientific discovery', correct: false },
          { text: 'A math formula', correct: false }
        ],
        explanation: 'The lesson covered the key historical event.',
        xp: 25
      };
    } else {
      fallbackQuestion = {
        text: `What was the main concept taught in the lesson?`,
        choices: [
          { text: 'The key concept', correct: true },
          { text: 'Something unrelated', correct: false },
          { text: 'An advanced topic', correct: false },
          { text: 'Nothing important', correct: false }
        ],
        explanation: 'The lesson taught the key concept.',
        xp: 25
      };
    }
    
    const question = currentQuestion || fallbackQuestion;
    
    console.log(`⚔️ Rendering Regular Battle ${currentBattleIndex + 1}/${battleScenes.length}`);
    
    return (
      <BattleScene
        scene={currentBattleScene || { enemy: 'Boss', text: 'Final test!', isBoss: false }}
        question={question}
        onAnswer={handleBattleAnswer}
        battleNumber={currentBattleIndex + 1}
        totalBattles={battleScenes.length}
      />
    );
  }

  // LEGACY ADVENTURE MODE (kept for compatibility)
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
      const battlesInChapter = chapter.scenes.filter(s => s.type === 'battle').length;
      
      return (
        <BattleScene
          scene={scene}
          question={currentQuestion}
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
