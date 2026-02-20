import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  X,
  ChevronRight,
  Star,
  Zap,
  Heart,
  Sword,
  Shield,
  BookOpen,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  Loader2,
  Moon,
  Clock,
  Map,
  Flame,
  Skull,
  Sun
} from 'lucide-react';
import StudyJourney from './StudyJourney';

const pixelText = { fontFamily: 'monospace' };

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) {
    console.warn('⚠️ No auth token found in localStorage');
  }
  return token;
};

// ============================================
// SCHEDULE ERROR DETECTION
// ============================================
const SCHEDULE_ERROR_CODES = ['REST_DAY', 'TIME_LIMIT_REACHED', 'ONBOARDING_REQUIRED'];

const processApiResponse = async (response) => {
  console.log('🔍 Response status:', response.status, response.statusText);
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Response OK, data:', data);
    return data;
  }

  console.log('❌ Response not OK, checking for schedule error...');
  
  let errorData = {};
  const responseText = await response.text();
  console.log('🔍 Error response raw text:', responseText);
  
  try {
    errorData = JSON.parse(responseText);
    console.log('🔍 Parsed error JSON:', errorData);
  } catch (e) {
    console.log('🔍 Could not parse as JSON, using text:', responseText);
    errorData = { message: responseText };
  }
  
  const errorCode = errorData.code || errorData.error || errorData.type;
  console.log('🔍 Extracted error code:', errorCode);

  if (SCHEDULE_ERROR_CODES.includes(errorCode)) {
    const error = new Error(errorData.message || errorCode);
    error.scheduleCode = errorCode;
    error.scheduleMessage = errorData.message || errorData.details;
    error.remainingMinutes = errorData.remaining || errorData.remainingMinutes;
    error.fullErrorData = errorData;
    console.log('🚫 Schedule error DETECTED:', errorCode, error);
    throw error;
  }

  const error = new Error(errorData.message || errorData.error || `API error: ${response.status}`);
  error.status = response.status;
  error.data = errorData;
  throw error;
};

// ============================================
// LOCAL FALLBACK GENERATORS
// ============================================
function generateLocalFallbackScene(topic, chapter, sceneType) {
  const scenes = {
    narrative: {
      type: 'narrative',
      text: `You study ${topic}. Your power grows!`
    },
    dialogue: {
      type: 'dialogue',
      text: `"Every lesson makes you stronger against the Shadow!"`,
      speaker: 'Guide'
    },
    choice: {
      type: 'choice',
      text: '"How will you study?"',
      speaker: 'Guide',
      choices: [
        { text: 'Read carefully', reward: 'wisdom', xp: 20 },
        { text: 'Practice problems', reward: 'skill', xp: 25 },
        { text: 'Watch and learn', reward: 'insight', xp: 20 }
      ]
    },
    reward: {
      type: 'reward',
      text: `You got stronger at ${topic}!`,
      item: { name: 'Power Crystal', bonus: '+10% XP' }
    },
    finale: {
      type: 'finale',
      text: `Great job! You mastered this part of ${topic}. The Shadow retreats!`
    }
  };
  return scenes[sceneType] || scenes.narrative;
}

function generateLocalFallbackLesson(topic, chapter) {
  return {
    type: 'lesson',
    title: `${topic} Basics - Part ${chapter}`,
    text: `Welcome! Today you will learn something important.\n\nTake your time. Understanding is more important than speed.`,
    keyPoint: 'Practice makes you stronger.'
  };
}

function generateLocalFallbackQuestion(topic, difficulty, questionIndex = 0) {
  const fallbackQuestions = [
    {
      text: `What is the best way to learn ${topic}?`,
      choices: [
        { text: 'Practice every day', correct: true },
        { text: 'Study only before tests', correct: false },
        { text: 'Never review', correct: false },
        { text: 'Skip hard parts', correct: false }
      ],
      explanation: 'Daily practice helps you remember better.'
    },
    {
      text: `Why is it important to understand ${topic}?`,
      choices: [
        { text: 'It helps you solve problems', correct: true },
        { text: 'It is not important', correct: false },
        { text: 'Only teachers need to know', correct: false },
        { text: 'It slows you down', correct: false }
      ],
      explanation: 'Understanding helps you use knowledge in new ways.'
    }
  ];
  const selected = fallbackQuestions[questionIndex % fallbackQuestions.length];
  return {
    type: 'question',
    text: selected.text,
    choices: selected.choices.sort(() => Math.random() - 0.5),
    explanation: selected.explanation,
    xp: 20 + (difficulty * 10),
    isFallback: true
  };
}

// ============================================
// AI SERVICE
// ============================================
const AIService = {
  generateStoryIntro: async (topic) => {
    console.log('📖 AIService.generateStoryIntro called:', topic);
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    try {
      const response = await fetch(`${API_BASE}/api/ai/story/intro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });

      console.log('📖 Story intro response status:', response.status);
      return await processApiResponse(response);
    } catch (error) {
      console.log('📖 Story intro error caught:', error.message, 'scheduleCode:', error.scheduleCode);
      if (error.scheduleCode) throw error;
      return {
        title: `${topic} Quest`,
        setting: `The world needs heroes who know ${topic}. The Shadow of Doom spreads ignorance. You must learn to fight back!`,
        mentor_intro: `"Welcome, Hero! Learning ${topic} will make you stronger. Let's push back the Shadow together!"`,
        hero_message: 'Every lesson makes you stronger!',
        shadow_status: ''
      };
    }
  },

  generateScene: async (topic, chapter, sceneType, context) => {
    console.log('🎭 AIService.generateScene called:', { topic, chapter, sceneType });
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE}/api/ai/story/scene`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, chapter, sceneType, context })
      });

      return await processApiResponse(response);
    } catch (error) {
      if (error.scheduleCode) throw error;
      return generateLocalFallbackScene(topic, chapter, sceneType);
    }
  },

  generateLesson: async (topic, chapter, conceptNumber) => {
    console.log('📚 AIService.generateLesson called:', { topic, chapter, conceptNumber });
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE}/api/ai/story/lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, chapter, conceptNumber })
      });

      return await processApiResponse(response);
    } catch (error) {
      if (error.scheduleCode) throw error;
      return generateLocalFallbackLesson(topic, chapter);
    }
  },

  generateQuestion: async (topic, difficulty, previousQuestions = [], conceptTitle = null) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE}/api/ai/story/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic, difficulty,
          questionType: 'multiple_choice',
          previousQuestions,
          conceptTitle
        })
      });

      const data = await processApiResponse(response);
      if (!data.text || !data.choices || data.choices.length < 2) {
        throw new Error('Invalid question format');
      }
      return data;
    } catch (error) {
      if (error.scheduleCode) throw error;
      return generateLocalFallbackQuestion(topic, difficulty, previousQuestions.length);
    }
  },

  getHeroStatus: async () => {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const response = await fetch(`${API_BASE}/api/ai/story/hero-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching hero status:', error);
      return null;
    }
  }
};

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
        px-5 py-3 text-sm border-b-4 border-r-4
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

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Loader2 className="w-8 h-8 text-amber-400" />
    </motion.div>
    <p className="text-slate-400 mt-4" style={{ ...pixelText, fontSize: '10px' }}>{text}</p>
  </div>
);

// ============================================
// HERO STATUS DISPLAY
// ============================================
const HeroStatusBar = ({ heroStatus }) => {
  if (!heroStatus) return null;

  const { hero, shadow } = heroStatus;

  return (
    <PixelCard className="p-3 mb-4">
      <div className="flex items-center justify-between">
        {/* Hero Power */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-800 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-950" />
          </div>
          <div>
            <p className="text-amber-400 text-xs" style={pixelText}>POWER</p>
            <p className="text-white font-bold" style={{ ...pixelText, fontSize: '14px' }}>
              {hero.power}
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-orange-400" style={{ ...pixelText, fontSize: '12px' }}>
            {hero.streakDays}d
          </span>
        </div>

        {/* Shadow Doom */}
        {shadow.level > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-900 to-purple-700 border-2 border-purple-800 flex items-center justify-center">
              <Skull className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <p className="text-purple-400 text-xs" style={pixelText}>SHADOW</p>
              <p className="text-white font-bold" style={{ ...pixelText, fontSize: '14px' }}>
                {shadow.level}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Shadow Warning */}
      {shadow.active && shadow.message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-purple-950/50 border-2 border-purple-800"
        >
          <p className="text-purple-300 text-xs text-center" style={{ ...pixelText, fontSize: '9px' }}>
            ⚠️ {shadow.message}
          </p>
        </motion.div>
      )}
    </PixelCard>
  );
};

// ============================================
// BLOCKED SCREENS
// ============================================
const RestDayScreen = ({ onGoHome }) => (
  <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <Moon className="w-20 h-20 text-indigo-400 mx-auto mb-6" />
      </motion.div>
      <h1 className="text-indigo-300 mb-3" style={{ ...pixelText, fontSize: '18px', textShadow: '2px 2px 0 #000' }}>
        REST DAY
      </h1>
      <PixelCard className="p-6 mb-6">
        <p className="text-slate-300 mb-3" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
          "Even heroes need rest. The Shadow cannot win if you recharge!"
        </p>
      </PixelCard>
      <PixelButton onClick={onGoHome} variant="ghost" className="w-full">
        <Home className="w-4 h-4" />
        Back to Home
      </PixelButton>
    </motion.div>
  </div>
);

const TimeLimitScreen = ({ onGoHome }) => (
  <div className="min-h-screen bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <Clock className="w-20 h-20 text-amber-400 mx-auto mb-6" />
      </motion.div>
      <h1 className="text-amber-300 mb-3" style={{ ...pixelText, fontSize: '18px', textShadow: '2px 2px 0 #000' }}>
        TIME'S UP!
      </h1>
      <PixelCard className="p-6 mb-6">
        <p className="text-slate-300 mb-3" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
          "You've reached your daily limit. Great work, Hero! Your power grows while you rest."
        </p>
      </PixelCard>
      <PixelButton onClick={onGoHome} variant="ghost" className="w-full">
        <Home className="w-4 h-4" />
        Back to Home
      </PixelButton>
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
  const [pendingTopic, setPendingTopic] = useState('');
  const [storyData, setStoryData] = useState(null);
  const [chapter, setChapter] = useState(1);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [currentScene, setCurrentScene] = useState(null);
  const [xp, setXp] = useState(0);
  const [hp, setHp] = useState(100);
  const [inventory, setInventory] = useState([]);
  const [showResult, setShowResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enemyHp, setEnemyHp] = useState(100);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [chapterScenes, setChapterScenes] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentConcept, setCurrentConcept] = useState(null);
  const [lessonCount, setLessonCount] = useState(0);
  const [blockedReason, setBlockedReason] = useState(null);
  const [showJourney, setShowJourney] = useState(false);
  const [heroStatus, setHeroStatus] = useState(null);

  const topicRef = useRef(null);

  const chapterStructure = {
    1: ['narrative', 'dialogue', 'lesson', 'question', 'lesson', 'question', 'reward'],
    2: ['narrative', 'lesson', 'question', 'dialogue', 'lesson', 'battle', 'reward'],
    3: ['narrative', 'dialogue', 'lesson', 'battle', 'lesson', 'question', 'choice'],
    4: ['narrative', 'lesson', 'question', 'lesson', 'battle', 'narrative', 'finale']
  };

  // Load hero status on mount
  useEffect(() => {
    loadHeroStatus();
  }, []);

  const loadHeroStatus = async () => {
    const status = await AIService.getHeroStatus();
    if (status) {
      setHeroStatus(status);
    }
  };

  useEffect(() => {
    if (screen !== 'game') return;
    if (!currentScene) return;
    setChapterScenes(prev => [...prev, currentScene]);
  }, [currentScene, screen]);

  const handleScheduleError = useCallback((error) => {
    if (error.scheduleCode) {
      setBlockedReason(error.scheduleCode);
      setLoading(false);
      return true;
    }
    return false;
  }, []);

  const goHome = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const startGame = useCallback(async () => {
    const value = topicRef.current?.value?.trim();
    if (!value) return;

    setPendingTopic(value);
    setTopic(value);
    setLoading(true);
    setBlockedReason(null);

    try {
      const intro = await AIService.generateStoryIntro(value);
      setStoryData(intro);
      setScreen('intro');
    } catch (error) {
      if (handleScheduleError(error)) return;
      alert('Failed to start: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [handleScheduleError]);

  const beginAdventure = useCallback(async () => {
    setChapter(1);
    setSceneIndex(0);
    setLessonCount(0);
    setCurrentConcept(null);
    setChapterScenes([]);
    setAskedQuestions([]);
    setQuestionCount(0);
    setScreen('game');
    await loadScene(1, 0);
  }, []);

  const loadScene = useCallback(async (chapterNum, sceneIdx) => {
    setLoading(true);
    const structure = chapterStructure[chapterNum] || chapterStructure[1];
    const sceneType = structure[sceneIdx];

    try {
      let scene;

      if (sceneType === 'lesson') {
        const newLessonCount = lessonCount + 1;
        setLessonCount(newLessonCount);
        scene = await AIService.generateLesson(topic, chapterNum, newLessonCount);
        setCurrentConcept(scene.title);
      } else if (sceneType === 'question') {
        scene = await AIService.generateQuestion(
          topic, chapterNum, askedQuestions, currentConcept
        );
        setQuestionCount(prev => prev + 1);
      } else if (sceneType === 'battle') {
        const question = await AIService.generateQuestion(
          topic, chapterNum, askedQuestions, currentConcept
        );
        const enemies = [
          { name: 'Procrastination Imp', desc: 'It whispers "do it later..."' },
          { name: 'Distraction Demon', desc: 'It steals your attention!' },
          { name: 'Doubt Shadow', desc: 'It makes you question yourself' },
          { name: 'The Shadow of Doom', desc: 'The final enemy of learning!' }
        ];
        const enemy = enemies[Math.min(chapterNum - 1, enemies.length - 1)];
        scene = {
          type: 'battle',
          enemy: enemy,
          question: question.text,
          choices: question.choices,
          explanation: question.explanation,
          xp: 35 + (chapterNum * 10)
        };
        setQuestionCount(prev => prev + 1);
      } else {
        scene = await AIService.generateScene(topic, chapterNum, sceneType, {
          previousScenes: chapterScenes,
          askedQuestions
        });
      }

      setCurrentScene(scene);
      if (scene.type === 'battle') {
        setEnemyHp(100);
      }
    } catch (error) {
      if (handleScheduleError(error)) return;
      alert('Failed to load scene: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [topic, lessonCount, askedQuestions, currentConcept, chapterScenes, handleScheduleError]);

  const advanceScene = useCallback(async () => {
    const structure = chapterStructure[chapter] || chapterStructure[1];
    const nextIndex = sceneIndex + 1;

    if (nextIndex < structure.length) {
      setSceneIndex(nextIndex);
      await loadScene(chapter, nextIndex);
    } else if (chapter < 4) {
      setScreen('chapter_complete');
    } else {
      setScreen('victory');
    }
  }, [chapter, sceneIndex, loadScene]);

  const startNextChapter = useCallback(async () => {
    const nextChapter = chapter + 1;
    setChapter(nextChapter);
    setSceneIndex(0);
    setChapterScenes([]);
    setLessonCount(0);
    setCurrentConcept(null);
    setScreen('game');
    await loadScene(nextChapter, 0);
  }, [chapter, loadScene]);

  const handleChoice = useCallback((choice) => {
    setXp(x => x + (choice.xp || 15));
    setShowResult({ type: 'choice', text: choice.text, reward: choice.reward });
  }, []);

  const handleQuestion = useCallback((choice, isCorrect) => {
    if (isCorrect) {
      setXp(x => x + (currentScene?.xp || 25));
      setShowResult({ type: 'correct', text: currentScene?.explanation });
    } else {
      setHp(h => Math.max(0, h - 15));
      setShowResult({ type: 'wrong', text: currentScene?.explanation });
    }
    const questionText = currentScene?.text || currentScene?.question;
    if (questionText) {
      setAskedQuestions(prev => [...prev, questionText]);
    }
  }, [currentScene]);

  const handleBattle = useCallback((choice) => {
    if (choice.correct) {
      setEnemyHp(0);
      setXp(x => x + (currentScene?.xp || 35));
      setShowResult({ type: 'hit', damage: 100 });
    } else {
      setHp(h => Math.max(0, h - 20));
      setShowResult({ type: 'miss' });
    }
    const questionText = currentScene?.question;
    if (questionText) {
      setAskedQuestions(prev => [...prev, questionText]);
    }
  }, [currentScene]);

  const collectReward = useCallback(() => {
    if (currentScene?.item) {
      setInventory(prev => [...prev, currentScene.item]);
    }
    setXp(x => x + 20);
    advanceScene();
  }, [currentScene, advanceScene]);

  const resetGame = useCallback(() => {
    setScreen('title');
    setTopic('');
    setPendingTopic('');
    setStoryData(null);
    setChapter(1);
    setSceneIndex(0);
    setCurrentScene(null);
    setXp(0);
    setHp(100);
    setInventory([]);
    setAskedQuestions([]);
    setChapterScenes([]);
    setLessonCount(0);
    setCurrentConcept(null);
    setQuestionCount(0);
    setBlockedReason(null);
  }, []);

  useEffect(() => {
    if (!showResult) return;
    const delay = showResult.type === 'correct' || showResult.type === 'wrong' ? 2500 : 2000;
    const timer = setTimeout(() => {
      setShowResult(null);
      advanceScene();
    }, delay);
    return () => clearTimeout(timer);
  }, [showResult, advanceScene]);

  // Handle starting a topic from journey
  const handleJourneyTopic = (selectedTopic) => {
    setTopic(selectedTopic);
    if (topicRef.current) {
      topicRef.current.value = selectedTopic;
    }
  };

  // ============================================
  // JOURNEY SCREEN
  // ============================================
  if (showJourney) {
    return (
      <StudyJourney 
        onClose={() => setShowJourney(false)}
        onStartTopic={handleJourneyTopic}
      />
    );
  }

  // ============================================
  // BLOCKED SCREENS
  // ============================================
  if (blockedReason === 'REST_DAY') {
    return <RestDayScreen onGoHome={goHome} />;
  }

  if (blockedReason === 'TIME_LIMIT_REACHED') {
    return <TimeLimitScreen onGoHome={goHome} />;
  }

  // ============================================
  // TITLE SCREEN
  // ============================================
  if (screen === 'title') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 text-center w-full max-w-sm"
        >
          {/* Hero Status */}
          <HeroStatusBar heroStatus={heroStatus} />

          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-4"
          >
            <Sun className="w-16 h-16 text-amber-400 mx-auto" />
          </motion.div>

          <h1
            className="text-amber-400 mb-2"
            style={{ ...pixelText, fontSize: '20px', textShadow: '3px 3px 0 #000' }}
          >
            STORY QUEST
          </h1>
          <p className="text-purple-300 mb-6" style={{ ...pixelText, fontSize: '10px' }}>
            Defeat the Shadow of Doom through learning!
          </p>

          {loading ? (
            <PixelCard className="p-6">
              <LoadingSpinner text="Preparing your quest..." />
            </PixelCard>
          ) : (
            <PixelCard className="p-6">
              <label className="block text-slate-400 mb-3 text-left" style={{ ...pixelText, fontSize: '10px' }}>
                WHAT DO YOU WANT TO LEARN?
              </label>
              <input
                ref={topicRef}
                type="text"
                placeholder="e.g. Math, Science, History..."
                className="w-full bg-slate-900 border-4 border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors mb-4"
                style={{ ...pixelText, fontSize: '12px' }}
                onKeyDown={(e) => e.key === 'Enter' && startGame()}
              />

              <div className="flex flex-wrap gap-2 mb-4">
                {['Mathematics', 'Science', 'History', 'English'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { if (topicRef.current) topicRef.current.value = t; }}
                    className="px-3 py-1 bg-slate-700 hover:bg-purple-700 border-2 border-slate-600 text-slate-300 transition-colors"
                    style={{ ...pixelText, fontSize: '9px' }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <PixelButton onClick={startGame} variant="gold" className="w-full mb-3">
                <Sparkles className="w-4 h-4" />
                Start Quest
              </PixelButton>

              <PixelButton onClick={() => setShowJourney(true)} variant="secondary" className="w-full">
                <Map className="w-4 h-4" />
                View Journey
              </PixelButton>
            </PixelCard>
          )}
        </motion.div>
      </div>
    );
  }

  // ============================================
  // INTRO SCREEN
  // ============================================
  if (screen === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center max-w-md w-full"
        >
          {/* Shadow Warning */}
          {storyData?.shadow_status && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-purple-950/50 border-2 border-purple-800"
            >
              <div className="flex items-center justify-center gap-2">
                <Skull className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300" style={{ ...pixelText, fontSize: '10px' }}>
                  {storyData.shadow_status}
                </span>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-amber-400 mb-4"
            style={{ ...pixelText, fontSize: '18px' }}
          >
            {storyData?.title}
          </motion.h2>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <PixelCard className="p-5 mb-4 text-left">
              <p className="text-slate-300 leading-relaxed" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
                {storyData?.setting}
              </p>
            </PixelCard>

            <PixelCard className="p-5 mb-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sun className="w-6 h-6 text-amber-950" />
                </div>
                <p className="text-slate-300 leading-relaxed flex-1" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
                  {storyData?.mentor_intro}
                </p>
              </div>
            </PixelCard>

            {storyData?.hero_message && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mb-6 p-4 bg-emerald-950/50 border-2 border-emerald-700"
              >
                <p className="text-emerald-400 text-center" style={{ ...pixelText, fontSize: '11px' }}>
                  ✨ {storyData.hero_message}
                </p>
              </motion.div>
            )}

            <PixelButton onClick={beginAdventure} variant="primary" className="w-full">
              Begin Adventure
              <ChevronRight className="w-4 h-4" />
            </PixelButton>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // CHAPTER COMPLETE SCREEN
  // ============================================
  if (screen === 'chapter_complete') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: 2 }}
          >
            <Star className="w-20 h-20 text-amber-400 mx-auto mb-4" />
          </motion.div>

          <h2 className="text-amber-400 mb-2" style={{ ...pixelText, fontSize: '18px' }}>
            CHAPTER {chapter} COMPLETE!
          </h2>

          <PixelCard className="p-6 mb-6 max-w-xs">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-amber-400" style={{ ...pixelText, fontSize: '18px' }}>{xp}</p>
                <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>XP</p>
              </div>
              <div className="text-center">
                <p className="text-rose-400" style={{ ...pixelText, fontSize: '18px' }}>{hp}%</p>
                <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>Health</p>
              </div>
              <div className="text-center">
                <p className="text-violet-400" style={{ ...pixelText, fontSize: '18px' }}>{inventory.length}</p>
                <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>Items</p>
              </div>
            </div>
          </PixelCard>

          <p className="text-emerald-400 mb-4" style={{ ...pixelText, fontSize: '10px' }}>
            The Shadow retreats! Your Hero Power grows!
          </p>

          <PixelButton onClick={startNextChapter} variant="gold" className="w-full max-w-xs">
            Chapter {chapter + 1}
            <ArrowRight className="w-4 h-4" />
          </PixelButton>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // VICTORY SCREEN
  // ============================================
  if (screen === 'victory') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-950 to-slate-950 flex flex-col items-center justify-center p-6">
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-24 h-24 text-amber-400 mx-auto mb-4" />
          </motion.div>

          <h1 className="text-amber-400 mb-2" style={{ ...pixelText, fontSize: '22px' }}>
            QUEST COMPLETE!
          </h1>
          <p className="text-amber-200 mb-6" style={{ ...pixelText, fontSize: '10px' }}>
            You have mastered {topic}!
          </p>

          <PixelCard className="p-6 mb-6 max-w-sm">
            <p className="text-slate-300 mb-2" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.8' }}>
              "Magnificent! You pushed back the Shadow and grew stronger!"
            </p>
            <p className="text-emerald-400" style={{ ...pixelText, fontSize: '11px' }}>
              The Shadow of Doom retreats before your power!
            </p>
          </PixelCard>

          <div className="flex justify-center gap-3 mb-6">
            <div className="bg-slate-800 border-4 border-slate-700 px-4 py-3 text-center">
              <p className="text-amber-400" style={{ ...pixelText, fontSize: '16px' }}>{xp}</p>
              <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>XP</p>
            </div>
            <div className="bg-slate-800 border-4 border-slate-700 px-4 py-3 text-center">
              <p className="text-emerald-400" style={{ ...pixelText, fontSize: '16px' }}>4</p>
              <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>Chapters</p>
            </div>
            <div className="bg-slate-800 border-4 border-slate-700 px-4 py-3 text-center">
              <p className="text-violet-400" style={{ ...pixelText, fontSize: '16px' }}>{askedQuestions.length}</p>
              <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>Questions</p>
            </div>
          </div>

          <PixelButton onClick={resetGame} variant="primary">
            <RotateCcw className="w-4 h-4" />
            New Adventure
          </PixelButton>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // MAIN GAME SCREEN
  // ============================================
  const structure = chapterStructure[chapter] || chapterStructure[1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      {/* HUD */}
      <div className="bg-black/50 border-b-4 border-purple-900 p-3">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={resetGame} 
            className="p-2 hover:bg-slate-800 transition-colors rounded"
          >
            <Home className="w-5 h-5 text-slate-400" />
          </button>
          <div className="text-center">
            <p className="text-purple-400" style={{ ...pixelText, fontSize: '8px' }}>CHAPTER {chapter}</p>
            <p className="text-white" style={{ ...pixelText, fontSize: '10px' }}>{storyData?.title}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-900/50 px-2 py-1 border-2 border-amber-700">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300" style={{ ...pixelText, fontSize: '10px' }}>{xp}</span>
          </div>
        </div>

        {/* Health */}
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          <div className="flex-1 h-3 bg-slate-800 border-2 border-slate-700">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-400"
              animate={{ width: `${hp}%` }}
            />
          </div>
          <span className="text-rose-400 w-8 text-right" style={{ ...pixelText, fontSize: '9px' }}>{hp}%</span>
        </div>

        <div className="text-slate-500 mt-1" style={{ ...pixelText, fontSize: '8px' }}>
          Scene {sceneIndex + 1}/{structure.length} | Questions: {askedQuestions.length}
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-4 pt-3">
        {structure.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded ${i <= sceneIndex ? 'bg-purple-500' : 'bg-slate-700'}`} />
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <PixelCard className="p-6">
            <LoadingSpinner text="The story unfolds..." />
          </PixelCard>
        ) : (
          <AnimatePresence mode="wait">
            {showResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <PixelCard className="p-6 text-center">
                  {showResult.type === 'correct' && (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                        <Star className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-emerald-400 mb-3" style={{ ...pixelText, fontSize: '14px' }}>CORRECT!</p>
                      <p className="text-slate-300" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.7' }}>
                        {showResult.text}
                      </p>
                      <p className="text-amber-400 mt-3" style={{ ...pixelText, fontSize: '10px' }}>
                        Your Hero Power grows!
                      </p>
                    </>
                  )}
                  {showResult.type === 'wrong' && (
                    <>
                      <X className="w-12 h-12 text-rose-400 mx-auto mb-3" />
                      <p className="text-rose-400 mb-3" style={{ ...pixelText, fontSize: '14px' }}>NOT QUITE...</p>
                      <p className="text-slate-300" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.7' }}>
                        {showResult.text}
                      </p>
                    </>
                  )}
                  {showResult.type === 'hit' && (
                    <>
                      <Sword className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                      <p className="text-amber-400" style={{ ...pixelText, fontSize: '18px' }}>CRITICAL HIT!</p>
                      <p className="text-slate-400 mt-2" style={{ ...pixelText, fontSize: '10px' }}>The Shadow retreats!</p>
                    </>
                  )}
                  {showResult.type === 'miss' && (
                    <>
                      <Shield className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-rose-400" style={{ ...pixelText, fontSize: '14px' }}>BLOCKED!</p>
                      <p className="text-slate-400 mt-2" style={{ ...pixelText, fontSize: '10px' }}>The Shadow struck!</p>
                    </>
                  )}
                  {showResult.type === 'choice' && (
                    <>
                      <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-purple-300" style={{ ...pixelText, fontSize: '10px' }}>
                        You chose: "{showResult.text}"
                      </p>
                      {showResult.reward && (
                        <p className="text-amber-400 mt-2" style={{ ...pixelText, fontSize: '9px' }}>
                          +{showResult.reward} gained!
                        </p>
                      )}
                    </>
                  )}
                </PixelCard>
              </motion.div>
            ) : currentScene ? (
              <motion.div
                key={`${chapter}-${sceneIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Lesson Scene */}
                {currentScene.type === 'lesson' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <PixelCard className="p-5 bg-gradient-to-br from-blue-950 to-slate-900 border-blue-700">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-blue-800">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400" style={{ ...pixelText, fontSize: '11px' }}>
                          📚 LESSON: {currentScene.title}
                        </span>
                      </div>
                      <p className="text-slate-200 mb-4 whitespace-pre-line" style={{ ...pixelText, fontSize: '10px', lineHeight: '2' }}>
                        {currentScene.text}
                      </p>
                      <div className="bg-amber-950/50 border-2 border-amber-700 p-3 mt-4">
                        <p className="text-amber-400" style={{ ...pixelText, fontSize: '9px' }}>
                          💡 KEY POINT: {currentScene.keyPoint}
                        </p>
                      </div>
                    </PixelCard>
                    <PixelButton onClick={advanceScene} variant="secondary" className="w-full">
                      I understand! Continue
                      <ChevronRight className="w-4 h-4" />
                    </PixelButton>
                  </motion.div>
                )}

                {/* Non-Lesson Scenes */}
                {currentScene.type !== 'lesson' && (
                  <>
                    <PixelCard className="p-5 mb-4">
                      {currentScene.speaker && (
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-slate-700">
                          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                            <Sun className="w-6 h-6 text-amber-950" />
                          </div>
                          <span className="text-amber-400" style={{ ...pixelText, fontSize: '10px' }}>
                            {currentScene.speaker}
                          </span>
                        </div>
                      )}
                      <p className="text-slate-200" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
                        {currentScene.text || currentScene.question}
                      </p>
                    </PixelCard>

                    {/* Enemy HP for battles */}
                    {currentScene.type === 'battle' && (
                      <div className="mb-4 p-3 bg-purple-950/50 border-4 border-purple-900">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-purple-400" style={{ ...pixelText, fontSize: '9px' }}>
                            <Skull className="w-4 h-4 inline mr-1" />
                            {currentScene.enemy?.name}
                          </span>
                          <span className="text-purple-300" style={{ ...pixelText, fontSize: '9px' }}>{enemyHp}/100</span>
                        </div>
                        <div className="h-3 bg-slate-900 border-2 border-slate-700">
                          <div className="h-full bg-gradient-to-r from-purple-900 to-purple-600" style={{ width: `${enemyHp}%` }} />
                        </div>
                        <p className="text-purple-300/70 mt-2" style={{ ...pixelText, fontSize: '8px' }}>
                          {currentScene.enemy?.desc}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                      {(currentScene.type === 'narrative' || currentScene.type === 'dialogue') && (
                        <PixelButton onClick={advanceScene} variant="ghost" className="w-full">
                          Continue
                          <ChevronRight className="w-4 h-4" />
                        </PixelButton>
                      )}

                      {currentScene.type === 'choice' && currentScene.choices?.map((choice, i) => (
                        <motion.button
                          key={i}
                          onClick={() => handleChoice(choice)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="w-full p-4 bg-slate-800 border-4 border-slate-600 hover:border-purple-500 hover:bg-slate-700 text-left transition-all"
                        >
                          <span className="text-slate-200" style={{ ...pixelText, fontSize: '10px' }}>
                            {choice.text}
                          </span>
                        </motion.button>
                      ))}

                      {currentScene.type === 'question' && currentScene.choices?.map((choice, i) => (
                        <motion.button
                          key={i}
                          onClick={() => handleQuestion(choice, choice.correct)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="w-full p-4 bg-slate-800 border-4 border-slate-600 hover:border-amber-500 hover:bg-slate-700 text-left transition-all"
                        >
                          <span className="text-slate-200" style={{ ...pixelText, fontSize: '10px' }}>
                            {String.fromCharCode(65 + i)}. {choice.text}
                          </span>
                        </motion.button>
                      ))}

                      {currentScene.type === 'battle' && currentScene.choices?.map((choice, i) => (
                        <motion.button
                          key={i}
                          onClick={() => handleBattle(choice)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="w-full p-4 bg-purple-950/30 border-4 border-purple-800 hover:border-purple-500 hover:bg-purple-900/40 text-left transition-all"
                        >
                          <span className="text-purple-100" style={{ ...pixelText, fontSize: '10px' }}>
                            ⚔️ {choice.text}
                          </span>
                        </motion.button>
                      ))}

                      {currentScene.type === 'reward' && (
                        <PixelCard className="p-4 bg-amber-950/30 border-amber-700">
                          <div className="flex items-center gap-3 mb-4">
                            <Star className="w-8 h-8 text-amber-400" />
                            <div>
                              <p className="text-amber-400" style={{ ...pixelText, fontSize: '10px' }}>{currentScene.item?.name}</p>
                              <p className="text-amber-200/70" style={{ ...pixelText, fontSize: '8px' }}>{currentScene.item?.bonus}</p>
                            </div>
                          </div>
                          <PixelButton onClick={collectReward} variant="gold" className="w-full">
                            Collect
                          </PixelButton>
                        </PixelCard>
                      )}

                      {currentScene.type === 'finale' && (
                        <PixelButton onClick={advanceScene} variant="gold" className="w-full">
                          Complete Chapter
                          <Trophy className="w-4 h-4" />
                        </PixelButton>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
