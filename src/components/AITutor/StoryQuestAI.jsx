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
  Scroll,
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
  LogIn
} from 'lucide-react';

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
      text: `You venture deeper into the Library of ${topic}. Chapter ${chapter} of your journey continues...`
    },
    dialogue: {
      type: 'dialogue',
      text: `"You're making progress, young scholar. The secrets of ${topic} await."`,
      speaker: 'Archimedes'
    },
    choice: {
      type: 'choice',
      text: `"How do you wish to proceed through ${topic}?"`,
      speaker: 'Archimedes',
      choices: [
        { text: 'Take the challenging path', reward: 'courage', xp: 25 },
        { text: 'Seek more preparation', reward: 'wisdom', xp: 20 },
        { text: 'Trust my instincts', reward: 'flexibility', xp: 20 }
      ]
    },
    reward: {
      type: 'reward',
      text: `Your dedication to ${topic} has been noticed!`,
      item: { name: 'Tome of Understanding', bonus: '+10% XP' }
    },
    finale: {
      type: 'finale',
      text: `A final hush falls over the Library. Your ${topic} journey has reached a milestone.`
    }
  };
  return scenes[sceneType] || scenes.narrative;
}

function generateLocalFallbackLesson(topic, chapter) {
  return {
    type: 'lesson',
    title: `${topic} Fundamentals - Chapter ${chapter}`,
    text: `Welcome to this lesson about ${topic}! Understanding the basics will help you master more advanced topics later.\n\nThink of learning like building a tower - each block of knowledge supports the next. Take your time and make sure you understand each concept before moving on.`,
    keyPoint: 'Practice and patience are key to mastery.'
  };
}

function generateLocalFallbackQuestion(topic, difficulty, questionIndex = 0) {
  console.warn('⚠️ Using LOCAL FALLBACK question');
  const fallbackQuestions = [
    {
      text: `What is the most effective approach to learning ${topic}?`,
      choices: [
        { text: 'Active practice with real examples', correct: true },
        { text: 'Only reading without practicing', correct: false },
        { text: 'Memorizing without understanding', correct: false },
        { text: 'Skipping difficult concepts', correct: false }
      ],
      explanation: 'Active practice with real examples helps build deeper understanding.'
    },
    {
      text: `Why is understanding fundamentals important in ${topic}?`,
      choices: [
        { text: 'They form the foundation for advanced concepts', correct: true },
        { text: 'They are not really important', correct: false },
        { text: 'Only experts need fundamentals', correct: false },
        { text: 'Fundamentals slow down learning', correct: false }
      ],
      explanation: 'Fundamentals provide the foundation that all advanced knowledge builds upon.'
    },
    {
      text: `What helps retain knowledge about ${topic} longer?`,
      choices: [
        { text: 'Regular review and spaced repetition', correct: true },
        { text: 'Cramming everything at once', correct: false },
        { text: 'Never reviewing material', correct: false },
        { text: 'Only studying before tests', correct: false }
      ],
      explanation: 'Spaced repetition and regular review strengthen long-term memory.'
    },
    {
      text: `How can you test your understanding of ${topic}?`,
      choices: [
        { text: 'Try to explain it to someone else', correct: true },
        { text: 'Just re-read the material', correct: false },
        { text: 'Assume you understand it', correct: false },
        { text: 'Skip to the next topic', correct: false }
      ],
      explanation: 'Teaching or explaining concepts to others reveals gaps in understanding.'
    }
  ];
  const selected = fallbackQuestions[questionIndex % fallbackQuestions.length];
  return {
    type: 'question',
    text: selected.text,
    choices: selected.choices.sort(() => Math.random() - 0.5),
    explanation: selected.explanation,
    xp: 25 + (difficulty * 10),
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
      if (error.scheduleCode) {
        console.log('🚫 Re-throwing schedule error from generateStoryIntro');
        throw error;
      }
      console.error('❌ Story intro error:', error.message);
      return {
        title: `${topic} Adventure`,
        setting: `Welcome to the world of ${topic}!`,
        mentor_intro: "I am Archimedes, your guide through this learning journey."
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

      console.log('🎭 Scene response status:', response.status);
      return await processApiResponse(response);
    } catch (error) {
      console.log('🎭 Scene error caught:', error.message, 'scheduleCode:', error.scheduleCode);
      if (error.scheduleCode) {
        console.log('🚫 Re-throwing schedule error from generateScene');
        throw error;
      }
      console.error('❌ Scene error:', error.message);
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

      console.log('📚 Lesson response status:', response.status);
      return await processApiResponse(response);
    } catch (error) {
      console.log('📚 Lesson error caught:', error.message, 'scheduleCode:', error.scheduleCode);
      if (error.scheduleCode) {
        console.log('🚫 Re-throwing schedule error from generateLesson');
        throw error;
      }
      console.error('❌ Lesson error:', error.message);
      return generateLocalFallbackLesson(topic, chapter);
    }
  },

  generateQuestion: async (topic, difficulty, previousQuestions = [], conceptTitle = null) => {
    console.log('❓ AIService.generateQuestion called:', {
      topic, difficulty,
      previousQuestionsCount: previousQuestions.length,
      conceptTitle
    });
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

      console.log('❓ Question response status:', response.status);
      const data = await processApiResponse(response);

      if (!data.text || !data.choices || data.choices.length < 2) {
        throw new Error('Invalid question format');
      }
      return data;
    } catch (error) {
      console.log('❓ Question error caught:', error.message, 'scheduleCode:', error.scheduleCode);
      if (error.scheduleCode) {
        console.log('🚫 Re-throwing schedule error from generateQuestion');
        throw error;
      }
      console.error('❌ Question error:', error.message);
      return generateLocalFallbackQuestion(topic, difficulty, previousQuestions.length);
    }
  }
};

// ============================================
// PIXEL OWL MASCOT
// ============================================
const PixelOwl = ({ size = 64, mood = 'happy', className = '' }) => {
  const colors = {
    happy: { primary: '#F59E0B', secondary: '#FCD34D', blush: '#FB7185' },
    thinking: { primary: '#8B5CF6', secondary: '#A78BFA', blush: '#F472B6' },
    excited: { primary: '#10B981', secondary: '#34D399', blush: '#FB923C' },
    sad: { primary: '#64748B', secondary: '#94A3B8', blush: '#F472B6' }
  };
  const c = colors[mood] || colors.happy;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="8" y="10" width="16" height="18" fill={c.primary} />
      <rect x="6" y="12" width="2" height="14" fill={c.primary} />
      <rect x="24" y="12" width="2" height="14" fill={c.primary} />
      <rect x="11" y="16" width="10" height="10" fill={c.secondary} />
      <rect x="9" y="12" width="5" height="5" fill="white" />
      <rect x="18" y="12" width="5" height="5" fill="white" />
      <rect x="11" y="14" width="2" height="2" fill="#1F2937" />
      <rect x="20" y="14" width="2" height="2" fill="#1F2937" />
      <rect x="14" y="18" width="4" height="2" fill="#F97316" />
      <rect x="15" y="20" width="2" height="1" fill="#F97316" />
      <rect x="7" y="16" width="2" height="2" fill={c.blush} opacity="0.7" />
      <rect x="23" y="16" width="2" height="2" fill={c.blush} opacity="0.7" />
      <rect x="6" y="6" width="20" height="2" fill="#374151" />
      <rect x="10" y="8" width="12" height="2" fill="#374151" />
      <rect x="14" y="4" width="4" height="2" fill="#374151" />
      <rect x="22" y="2" width="2" height="4" fill="#374151" />
      <rect x="24" y="2" width="3" height="3" fill="#FBBF24" />
      <rect x="10" y="28" width="4" height="2" fill="#F97316" />
      <rect x="18" y="28" width="4" height="2" fill="#F97316" />
    </motion.svg>
  );
};

// ============================================
// PIXEL BUTTON
// ============================================
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

// ============================================
// PIXEL CARD
// ============================================
const PixelCard = ({ children, className = '' }) => (
  <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-600 border-b-slate-900 border-r-slate-900 ${className}`}>
    {children}
  </div>
);

// ============================================
// LOADING SPINNER
// ============================================
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
// BLOCKED SCREENS
// ============================================
const RestDayScreen = ({ onGoHome }) => (
  <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-sm"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Moon className="w-20 h-20 text-indigo-400 mx-auto mb-6" />
      </motion.div>

      <h1 className="text-indigo-300 mb-3" style={{ ...pixelText, fontSize: '18px', textShadow: '2px 2px 0 #000' }}>
        REST DAY
      </h1>

      <PixelCard className="p-6 mb-6">
        <PixelOwl size={48} mood="happy" className="mx-auto mb-4" />
        <p className="text-slate-300 mb-3" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
          "Your guardian has set today as a rest day. Even the greatest scholars need to recharge!"
        </p>
        <p className="text-indigo-400" style={{ ...pixelText, fontSize: '9px' }}>— Archimedes</p>
      </PixelCard>

      <p className="text-slate-500 mb-6" style={{ ...pixelText, fontSize: '9px' }}>
        Take a break, have fun, and come back tomorrow refreshed! 🌙
      </p>

      <PixelButton onClick={onGoHome} variant="ghost" className="w-full">
        <Home className="w-4 h-4" />
        Back to Home
      </PixelButton>
    </motion.div>
  </div>
);

const TimeLimitScreen = ({ onGoHome }) => (
  <div className="min-h-screen bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-sm"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Clock className="w-20 h-20 text-amber-400 mx-auto mb-6" />
      </motion.div>

      <h1 className="text-amber-300 mb-3" style={{ ...pixelText, fontSize: '18px', textShadow: '2px 2px 0 #000' }}>
        TIME'S UP!
      </h1>

      <PixelCard className="p-6 mb-6">
        <PixelOwl size={48} mood="thinking" className="mx-auto mb-4" />
        <p className="text-slate-300 mb-3" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
          "You've reached your daily study limit. Great work today! Your brain needs time to absorb what you've learned."
        </p>
        <p className="text-amber-400" style={{ ...pixelText, fontSize: '9px' }}>— Archimedes</p>
      </PixelCard>

      <p className="text-slate-500 mb-6" style={{ ...pixelText, fontSize: '9px' }}>
        Your progress has been saved. Come back tomorrow to continue! ⏰
      </p>

      <PixelButton onClick={onGoHome} variant="ghost" className="w-full">
        <Home className="w-4 h-4" />
        Back to Home
      </PixelButton>
    </motion.div>
  </div>
);

// ============================================
// FORM LEVEL SETUP (Built-in Onboarding)
// ============================================
const FormLevelSetup = ({ onComplete, onGoHome }) => {
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formLevels = [
    { value: 'P1', label: 'Primary 1', tier: 'P1-P3', minutes: 15 },
    { value: 'P2', label: 'Primary 2', tier: 'P1-P3', minutes: 15 },
    { value: 'P3', label: 'Primary 3', tier: 'P1-P3', minutes: 15 },
    { value: 'P4', label: 'Primary 4', tier: 'P4-P6', minutes: 25 },
    { value: 'P5', label: 'Primary 5', tier: 'P4-P6', minutes: 25 },
    { value: 'P6', label: 'Primary 6', tier: 'P4-P6', minutes: 25 },
    { value: 'S1', label: 'Secondary 1', tier: 'S1-S3', minutes: 40 },
    { value: 'S2', label: 'Secondary 2', tier: 'S1-S3', minutes: 40 },
    { value: 'S3', label: 'Secondary 3', tier: 'S1-S3', minutes: 40 },
    { value: 'S4', label: 'Secondary 4', tier: 'S4-S6', minutes: 60 },
    { value: 'S5', label: 'Secondary 5', tier: 'S4-S6', minutes: 60 },
    { value: 'S6', label: 'Secondary 6', tier: 'S4-S6', minutes: 60 },
  ];

  const selectedInfo = formLevels.find(l => l.value === selectedLevel);

 // In the FormLevelSetup component, find the handleSubmit function and change:

const handleSubmit = async () => {
  if (!selectedLevel) return;
  
  setLoading(true);
  setError('');
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    // CHANGE THIS LINE - use singular "student" not "students"
    const response = await fetch(`${API_BASE}/api/student/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        form_level: selectedLevel,
        onboarding_completed: true
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Onboarding completed successfully');
      onComplete();
    } else {
      throw new Error(data.message || 'Failed to save profile');
    }
  } catch (err) {
    console.error('Setup error:', err);
    setError(err.message || 'Failed to save. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm w-full"
      >
        <PixelOwl size={64} mood="excited" className="mx-auto mb-4" />

        <h1 className="text-purple-300 mb-2" style={{ ...pixelText, fontSize: '18px', textShadow: '2px 2px 0 #000' }}>
          WELCOME, SCHOLAR!
        </h1>

        <PixelCard className="p-6 mb-6">
          <p className="text-slate-300 mb-4" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.8' }}>
            "Before we begin your adventure, tell me your current school level so I can prepare the right challenges for you!"
          </p>
          <p className="text-purple-400 mb-4" style={{ ...pixelText, fontSize: '9px' }}>— Archimedes</p>

          <label className="block text-slate-400 mb-2 text-left" style={{ ...pixelText, fontSize: '9px' }}>
            SELECT YOUR LEVEL:
          </label>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full bg-slate-900 border-4 border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors mb-4 appearance-none cursor-pointer"
            style={{ ...pixelText, fontSize: '11px' }}
          >
            <option value="">-- Choose Your Level --</option>
            <optgroup label="🏫 Primary School">
              {formLevels.filter(l => l.value.startsWith('P')).map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </optgroup>
            <optgroup label="🎓 Secondary School">
              {formLevels.filter(l => l.value.startsWith('S')).map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </optgroup>
          </select>

          {selectedInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-purple-950/50 border-2 border-purple-700 p-3 mb-4"
            >
              <p className="text-purple-300 mb-1" style={{ ...pixelText, fontSize: '9px' }}>
                ✨ Daily study time: <span className="text-amber-400">{selectedInfo.minutes} minutes</span>
              </p>
              <p className="text-purple-300/70" style={{ ...pixelText, fontSize: '8px' }}>
                Questions and lessons will be tailored for {selectedInfo.label} level
              </p>
            </motion.div>
          )}

          {error && (
            <div className="bg-rose-950/50 border-2 border-rose-700 p-3 mb-4">
              <p className="text-rose-400" style={{ ...pixelText, fontSize: '9px' }}>
                ❌ {error}
              </p>
            </div>
          )}
        </PixelCard>

        <div className="space-y-3">
          <PixelButton 
            onClick={handleSubmit} 
            variant="secondary" 
            className="w-full"
            disabled={!selectedLevel || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Begin My Journey
              </>
            )}
          </PixelButton>

          <PixelButton onClick={onGoHome} variant="ghost" className="w-full">
            <Home className="w-4 h-4" />
            Back to Home
          </PixelButton>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function StoryQuestAI() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState('title');
  const [topic, setTopic] = useState('');
  const [pendingTopic, setPendingTopic] = useState(''); // Store topic when onboarding interrupts
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

  // Schedule blocking state
  const [blockedReason, setBlockedReason] = useState(null);

  const topicRef = useRef(null);

  const chapterStructure = {
    1: ['narrative', 'dialogue', 'lesson', 'question', 'lesson', 'question', 'reward'],
    2: ['narrative', 'lesson', 'question', 'dialogue', 'lesson', 'battle', 'reward'],
    3: ['narrative', 'dialogue', 'lesson', 'battle', 'lesson', 'question', 'choice'],
    4: ['narrative', 'lesson', 'question', 'lesson', 'battle', 'narrative', 'finale']
  };

  useEffect(() => {
    console.log('🎮 StoryQuestAI mounted');
    console.log('🔑 Auth token exists:', !!getAuthToken());
    console.log('🌐 API Base URL:', API_BASE);
  }, []);

  useEffect(() => {
    if (screen !== 'game') return;
    if (!currentScene) return;
    setChapterScenes(prev => [...prev, currentScene]);
  }, [currentScene, screen]);

  const handleScheduleError = useCallback((error) => {
    console.log('🔍 handleScheduleError called with:', error.message, 'scheduleCode:', error.scheduleCode);
    if (error.scheduleCode) {
      console.log('🚫 Schedule blocked DETECTED:', error.scheduleCode, error.scheduleMessage);
      setBlockedReason(error.scheduleCode);
      setLoading(false);
      return true;
    }
    console.log('✅ Not a schedule error');
    return false;
  }, []);

  const goHome = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  // Called after onboarding completes - retry starting the game
  const handleOnboardingComplete = useCallback(async () => {
    console.log('✅ Onboarding complete, retrying game start...');
    setBlockedReason(null);
    
    // Use the pending topic that was stored when onboarding was triggered
    const topicToUse = pendingTopic || topicRef.current?.value?.trim();
    if (!topicToUse) {
      console.log('No topic available, returning to title screen');
      setScreen('title');
      return;
    }

    setTopic(topicToUse);
    setLoading(true);

    try {
      const intro = await AIService.generateStoryIntro(topicToUse);
      console.log('✅ Got intro after onboarding:', intro);
      setStoryData(intro);
      setPendingTopic(''); // Clear pending topic
      setScreen('intro');
    } catch (error) {
      console.log('❌ Error after onboarding:', error);
      if (handleScheduleError(error)) {
        return;
      }
      console.error('Failed to generate story:', error);
      alert('Failed to start game: ' + error.message);
      setScreen('title');
    } finally {
      setLoading(false);
    }
  }, [pendingTopic, handleScheduleError]);

  const startGame = useCallback(async () => {
    const value = topicRef.current?.value?.trim();
    if (!value) return;

    console.log('🎮 Starting game with topic:', value);
    setPendingTopic(value); // Store topic in case onboarding is needed
    setTopic(value);
    setLoading(true);
    setBlockedReason(null);

    try {
      console.log('📖 Calling AIService.generateStoryIntro...');
      const intro = await AIService.generateStoryIntro(value);
      console.log('✅ Got intro:', intro);
      setStoryData(intro);
      setScreen('intro');
    } catch (error) {
      console.log('❌ Caught error in startGame:', error);
      console.log('   error.scheduleCode:', error.scheduleCode);
      console.log('   error.message:', error.message);
      
      if (handleScheduleError(error)) {
        console.log('🚫 Schedule error handled, returning early');
        return;
      }
      console.error('Failed to generate story:', error);
      alert('Failed to start game: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [handleScheduleError]);

  const beginAdventure = useCallback(async () => {
    console.log('🎮 Beginning adventure');
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
    console.log(`🎬 Loading scene: Chapter ${chapterNum}, Scene ${sceneIdx}`);
    setLoading(true);
    const structure = chapterStructure[chapterNum] || chapterStructure[1];
    const sceneType = structure[sceneIdx];
    console.log(`🎬 Scene type: ${sceneType}`);

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
          { name: 'Doubt Specter', desc: 'A shadow creature born from uncertainty' },
          { name: 'Confusion Wraith', desc: 'It feeds on unclear thinking' },
          { name: 'Procrastination Demon', desc: 'It whispers "do it later..."' },
          { name: 'Fear of Failure', desc: 'The most dangerous enemy of all' }
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
      console.log('❌ Caught error in loadScene:', error);
      if (handleScheduleError(error)) {
        console.log('🚫 Schedule error handled in loadScene, returning early');
        return;
      }
      console.error('❌ Failed to load scene:', error);
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
      if (showResult.type === 'choice' || showResult.type === 'correct' || showResult.type === 'wrong') {
        advanceScene();
      } else if (showResult.type === 'hit' || showResult.type === 'miss') {
        advanceScene();
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [showResult, advanceScene]);

  // ============================================
  // BLOCKED SCREENS
  // ============================================
  if (blockedReason === 'REST_DAY') {
    console.log('🚫 Rendering REST_DAY screen');
    return <RestDayScreen onGoHome={goHome} />;
  }

  if (blockedReason === 'TIME_LIMIT_REACHED') {
    console.log('🚫 Rendering TIME_LIMIT_REACHED screen');
    return <TimeLimitScreen onGoHome={goHome} />;
  }

  if (blockedReason === 'ONBOARDING_REQUIRED') {
    console.log('🚫 Rendering ONBOARDING_REQUIRED screen');
    return (
      <FormLevelSetup 
        onComplete={handleOnboardingComplete}
        onGoHome={goHome}
      />
    );
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
          <PixelOwl size={80} mood="happy" className="mx-auto mb-6" />

          <h1
            className="text-amber-400 mb-2"
            style={{ ...pixelText, fontSize: '22px', textShadow: '3px 3px 0 #000' }}
          >
            STORY QUEST
          </h1>
          <p className="text-purple-300 mb-8" style={{ ...pixelText, fontSize: '10px' }}>
            AI-Powered Learning Adventure
          </p>

          {loading ? (
            <PixelCard className="p-6">
              <LoadingSpinner text="Preparing your adventure..." />
            </PixelCard>
          ) : (
            <PixelCard className="p-6">
              <label className="block text-slate-400 mb-3 text-left" style={{ ...pixelText, fontSize: '10px' }}>
                WHAT DO YOU WANT TO LEARN?
              </label>
              <input
                ref={topicRef}
                type="text"
                placeholder="e.g. Physics, History..."
                className="w-full bg-slate-900 border-4 border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors mb-4"
                style={{ ...pixelText, fontSize: '12px' }}
                onKeyDown={(e) => e.key === 'Enter' && startGame()}
              />

              <div className="flex flex-wrap gap-2 mb-6">
                {['Mathematics', 'Science', 'History', 'Coding'].map((t) => (
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

              <PixelButton onClick={startGame} variant="gold" className="w-full">
                <Sparkles className="w-4 h-4" />
                Begin Quest
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
          className="text-center max-w-md"
        >
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
            style={{ ...pixelText, fontSize: '16px' }}
          >
            {storyData?.title}
          </motion.h2>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <PixelCard className="p-5 mb-4 text-left">
              <p className="text-slate-300 leading-relaxed" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
                {storyData?.setting}
              </p>
            </PixelCard>

            <PixelCard className="p-5 mb-6 text-left">
              <div className="flex items-start gap-3">
                <PixelOwl size={40} mood="thinking" />
                <p className="text-slate-300 leading-relaxed flex-1" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
                  {storyData?.mentor_intro}
                </p>
              </div>
            </PixelCard>

            <PixelButton onClick={beginAdventure} variant="primary" className="w-full">
              Enter the Library
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
                <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>Total XP</p>
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

          <p className="text-slate-400 mb-4" style={{ ...pixelText, fontSize: '9px' }}>
            Questions answered: {questionCount} | Unique: {askedQuestions.length}
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
            You've mastered the basics of {topic}!
          </p>

          <PixelCard className="p-6 mb-6 max-w-sm">
            <PixelOwl size={56} mood="excited" className="mx-auto mb-4" />
            <p className="text-slate-300 mb-2" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.8' }}>
              "Magnificent! You have proven yourself a true scholar of {topic}. Your journey has only just begun."
            </p>
            <p className="text-amber-400" style={{ ...pixelText, fontSize: '9px' }}>— Archimedes</p>
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
            aria-label="Back to home"
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
                      <p className="text-slate-400 mt-2" style={{ ...pixelText, fontSize: '10px' }}>Enemy defeated!</p>
                    </>
                  )}
                  {showResult.type === 'miss' && (
                    <>
                      <Shield className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-rose-400" style={{ ...pixelText, fontSize: '14px' }}>BLOCKED!</p>
                      <p className="text-slate-400 mt-2" style={{ ...pixelText, fontSize: '10px' }}>You took damage!</p>
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
                          <PixelOwl size={36} mood="thinking" />
                          <span className="text-amber-400" style={{ ...pixelText, fontSize: '10px' }}>
                            {currentScene.speaker}
                          </span>
                        </div>
                      )}
                      <p className="text-slate-200" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.9' }}>
                        {currentScene.text || currentScene.question}
                      </p>
                      {currentScene.isFallback && (
                        <p className="text-orange-400 mt-2" style={{ ...pixelText, fontSize: '8px' }}>
                          ⚠️ (Fallback question - API may have failed)
                        </p>
                      )}
                    </PixelCard>

                    {/* Enemy HP for battles */}
                    {currentScene.type === 'battle' && (
                      <div className="mb-4 p-3 bg-rose-950/50 border-4 border-rose-900">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-rose-400" style={{ ...pixelText, fontSize: '9px' }}>
                            {currentScene.enemy?.name}
                          </span>
                          <span className="text-rose-300" style={{ ...pixelText, fontSize: '9px' }}>{enemyHp}/100</span>
                        </div>
                        <div className="h-3 bg-slate-900 border-2 border-slate-700">
                          <div className="h-full bg-gradient-to-r from-rose-600 to-rose-500" style={{ width: `${enemyHp}%` }} />
                        </div>
                        <p className="text-rose-300/70 mt-2" style={{ ...pixelText, fontSize: '8px' }}>
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
                          className="w-full p-4 bg-rose-950/30 border-4 border-rose-800 hover:border-rose-500 hover:bg-rose-900/40 text-left transition-all"
                        >
                          <span className="text-rose-100" style={{ ...pixelText, fontSize: '10px' }}>
                            ⚔️ {choice.text}
                          </span>
                        </motion.button>
                      ))}

                      {currentScene.type === 'reward' && (
                        <PixelCard className="p-4 bg-amber-950/30 border-amber-700">
                          <div className="flex items-center gap-3 mb-4">
                            <Scroll className="w-8 h-8 text-amber-400" />
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