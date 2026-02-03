import React, { useState, useRef, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';

const pixelText = { fontFamily: 'monospace' };

// ============================================
// API BASE URL - Adjust if needed
// ============================================
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ============================================
// AUTH TOKEN HELPER
// ============================================
const getAuthToken = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) {
    console.warn('⚠️ No auth token found in localStorage');
  }
  return token;
};

// ============================================
// LOCAL FALLBACK GENERATORS (only used if API fails)
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

// Improved fallback with more variety
function generateLocalFallbackQuestion(topic, difficulty, questionIndex = 0) {
  console.warn('⚠️ Using LOCAL FALLBACK question - API may have failed');
  
  // Create varied fallback questions based on index
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
    isFallback: true // Flag to identify fallback questions
  };
}

// ============================================
// AI SERVICE - Connect to backend
// ============================================
const AIService = {
  // Generate the initial story setup
  generateStoryIntro: async (topic) => {
    console.log('📖 AIService.generateStoryIntro called:', topic);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE}/api/ai/story/intro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });

      console.log('📡 Intro response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Intro API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Intro received:', data.title);
      return data;
      
    } catch (error) {
      console.error('❌ Story intro error:', error.message);
      return {
        title: `The ${topic} Chronicles`,
        setting: `In the mystical Library of Infinite Knowledge, ancient tomes containing the secrets of ${topic} await those brave enough to seek them.`,
        mentor_intro: `"Welcome, young scholar. I am Archimedes, keeper of ${topic} wisdom. Let us begin your journey..."`
      };
    }
  },

  // Generate a story scene
  generateScene: async (topic, chapter, sceneType, context) => {
    console.log('🎭 AIService.generateScene called:', { topic, chapter, sceneType });
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE}/api/ai/story/scene`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, chapter, sceneType, context })
      });

      console.log('📡 Scene response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Scene API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Scene received:', data.type);
      return data;
      
    } catch (error) {
      console.error('❌ Scene generation error:', error.message);
      return generateLocalFallbackScene(topic, chapter, sceneType);
    }
  },

  // Generate a teaching lesson
  generateLesson: async (topic, chapter, conceptNumber) => {
    console.log('📚 AIService.generateLesson called:', { topic, chapter, conceptNumber });
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE}/api/ai/story/lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, chapter, conceptNumber })
      });

      console.log('📡 Lesson response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Lesson API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Lesson received:', data.title);
      return data;
      
    } catch (error) {
      console.error('❌ Lesson generation error:', error.message);
      return generateLocalFallbackLesson(topic, chapter);
    }
  },

  // Generate a knowledge question
  generateQuestion: async (topic, difficulty, previousQuestions = [], conceptTitle = null) => {
    console.log('❓ AIService.generateQuestion called:', { 
      topic, 
      difficulty, 
      previousQuestionsCount: previousQuestions.length,
      conceptTitle 
    });
    
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('❌ No auth token available');
        throw new Error('No authentication token');
      }
      
      console.log('🔑 Token found, making API call...');

      const response = await fetch(`${API_BASE}/api/ai/story/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic,
          difficulty,
          questionType: 'multiple_choice',
          previousQuestions,
          conceptTitle
        })
      });

      console.log('📡 Question response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Question API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ AI Question received:', data.text?.substring(0, 60) + '...');
      
      // Validate the response has required fields
      if (!data.text || !data.choices || data.choices.length < 2) {
        console.error('❌ Invalid question format from API');
        throw new Error('Invalid question format');
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ Question generation error:', error.message);
      console.warn('⚠️ Falling back to local question');
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
// MAIN APP
// ============================================
export default function StoryQuestAI() {
  const [screen, setScreen] = useState('title');
  const [topic, setTopic] = useState('');
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

  // Lesson tracking state
  const [currentConcept, setCurrentConcept] = useState(null);
  const [lessonCount, setLessonCount] = useState(0);

  const topicRef = useRef(null);

  // Scene types per chapter - includes lessons before questions!
  const chapterStructure = {
    1: ['narrative', 'dialogue', 'lesson', 'question', 'lesson', 'question', 'reward'],
    2: ['narrative', 'lesson', 'question', 'dialogue', 'lesson', 'battle', 'reward'],
    3: ['narrative', 'dialogue', 'lesson', 'battle', 'lesson', 'question', 'choice'],
    4: ['narrative', 'lesson', 'question', 'lesson', 'battle', 'narrative', 'finale']
  };

  // Log when component mounts
  useEffect(() => {
    console.log('🎮 StoryQuestAI mounted');
    console.log('🔑 Auth token exists:', !!getAuthToken());
    console.log('🌐 API Base URL:', API_BASE);
  }, []);

  // Keep a simple log of scenes for context
  useEffect(() => {
    if (screen !== 'game') return;
    if (!currentScene) return;
    setChapterScenes(prev => [...prev, currentScene]);
  }, [currentScene, screen]);

  // Start the game
  const startGame = async () => {
    const value = topicRef.current?.value?.trim();
    if (!value) return;

    console.log('🎮 Starting game with topic:', value);
    setTopic(value);
    setLoading(true);

    try {
      const intro = await AIService.generateStoryIntro(value);
      setStoryData(intro);
      setScreen('intro');
    } catch (error) {
      console.error('Failed to generate story:', error);
    } finally {
      setLoading(false);
    }
  };

  // Begin adventure
  const beginAdventure = async () => {
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
  };

  // Load a scene
  const loadScene = async (chapterNum, sceneIdx) => {
    console.log(`🎬 Loading scene: Chapter ${chapterNum}, Scene ${sceneIdx}`);
    setLoading(true);
    const structure = chapterStructure[chapterNum] || chapterStructure[1];
    const sceneType = structure[sceneIdx];
    console.log(`🎬 Scene type: ${sceneType}`);

    try {
      let scene;

      if (sceneType === 'lesson') {
        // Generate a teaching lesson
        const newLessonCount = lessonCount + 1;
        setLessonCount(newLessonCount);

        scene = await AIService.generateLesson(topic, chapterNum, newLessonCount);
        setCurrentConcept(scene.title);
        console.log('📚 Lesson loaded:', scene.title);
        
      } else if (sceneType === 'question') {
        // Generate a question about what was just taught
        console.log('❓ Generating question...');
        console.log('📋 Previous questions:', askedQuestions.length, askedQuestions);
        
        scene = await AIService.generateQuestion(
          topic,
          chapterNum,
          askedQuestions,
          currentConcept
        );
        
        setQuestionCount(prev => prev + 1);
        console.log('❓ Question loaded:', scene.text?.substring(0, 50) + '...');
        
        // Check if it's a fallback question
        if (scene.isFallback) {
          console.warn('⚠️ This is a FALLBACK question, not from AI');
        }
        
      } else if (sceneType === 'battle') {
        // Generate battle with question
        console.log('⚔️ Generating battle question...');
        
        const question = await AIService.generateQuestion(
          topic,
          chapterNum,
          askedQuestions,
          currentConcept
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
        console.log('⚔️ Battle loaded against:', enemy.name);
        
      } else {
        // Other scene types (narrative, dialogue, choice, reward, finale)
        scene = await AIService.generateScene(topic, chapterNum, sceneType, {
          previousScenes: chapterScenes,
          askedQuestions
        });
        console.log('🎭 Scene loaded:', sceneType);
      }

      setCurrentScene(scene);

      if (scene.type === 'battle') {
        setEnemyHp(100);
      }
    } catch (error) {
      console.error('❌ Failed to load scene:', error);
    } finally {
      setLoading(false);
    }
  };

  // Advance to next scene
  const advanceScene = async () => {
    const structure = chapterStructure[chapter] || chapterStructure[1];
    const nextIndex = sceneIndex + 1;

    console.log(`⏭️ Advancing scene: ${sceneIndex} -> ${nextIndex} (max: ${structure.length})`);

    if (nextIndex < structure.length) {
      setSceneIndex(nextIndex);
      await loadScene(chapter, nextIndex);
    } else if (chapter < 4) {
      console.log('🏆 Chapter complete!');
      setScreen('chapter_complete');
    } else {
      console.log('🎉 Victory!');
      setScreen('victory');
    }
  };

  // Start next chapter
  const startNextChapter = async () => {
    const nextChapter = chapter + 1;
    console.log(`📖 Starting chapter ${nextChapter}`);
    setChapter(nextChapter);
    setSceneIndex(0);
    setChapterScenes([]);
    setLessonCount(0);
    setCurrentConcept(null);
    // Don't reset askedQuestions - keep tracking across chapters!
    setScreen('game');
    await loadScene(nextChapter, 0);
  };

  // Handle choice selection
  const handleChoice = (choice) => {
    console.log('🎯 Choice selected:', choice.text);
    setXp(x => x + (choice.xp || 15));
    setShowResult({ type: 'choice', text: choice.text, reward: choice.reward });

    setTimeout(() => {
      setShowResult(null);
      advanceScene();
    }, 1500);
  };

  // Handle question answer
  const handleQuestion = async (choice, isCorrect) => {
    console.log('📝 Question answered:', isCorrect ? 'CORRECT' : 'WRONG');
    
    if (isCorrect) {
      setXp(x => x + (currentScene.xp || 25));
      setShowResult({ type: 'correct', text: currentScene.explanation });
    } else {
      setHp(h => Math.max(0, h - 15));
      setShowResult({ type: 'wrong', text: currentScene.explanation });
    }

    // Track asked questions to prevent repeats
    const questionText = currentScene.text || currentScene.question;
    if (questionText) {
      console.log('📋 Adding to asked questions:', questionText.substring(0, 50) + '...');
      setAskedQuestions(prev => {
        const newList = [...prev, questionText];
        console.log('📋 Total asked questions:', newList.length);
        return newList;
      });
    }

    setTimeout(() => {
      setShowResult(null);
      advanceScene();
    }, 2500);
  };

  // Handle battle answer
  const handleBattle = (choice) => {
    console.log('⚔️ Battle answer:', choice.correct ? 'HIT!' : 'MISS!');
    
    if (choice.correct) {
      setEnemyHp(0);
      setXp(x => x + (currentScene.xp || 35));
      setShowResult({ type: 'hit', damage: 100 });
    } else {
      setHp(h => Math.max(0, h - 20));
      setShowResult({ type: 'miss' });
    }

    // Track asked questions
    const questionText = currentScene.question;
    if (questionText) {
      console.log('📋 Adding battle question to asked:', questionText.substring(0, 50) + '...');
      setAskedQuestions(prev => [...prev, questionText]);
    }

    setTimeout(() => {
      setShowResult(null);
      advanceScene();
    }, 2000);
  };

  // Collect reward
  const collectReward = () => {
    console.log('🎁 Collecting reward');
    if (currentScene?.item) {
      setInventory(prev => [...prev, currentScene.item]);
    }
    setXp(x => x + 20);
    advanceScene();
  };

  // Reset game
  const resetGame = () => {
    console.log('🔄 Resetting game');
    setScreen('title');
    setTopic('');
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
  };

  // ============================================
  // TITLE SCREEN
  // ============================================
  if (screen === 'title') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6">
        {/* Stars */}
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
            Questions answered: {questionCount} | Unique questions asked: {askedQuestions.length}
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
          <button onClick={resetGame} className="p-2 hover:bg-slate-800 transition-colors rounded">
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
        
        {/* Debug info */}
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
              // Result Display
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
              // Scene Display
              <motion.div
                key={`${chapter}-${sceneIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Lesson Scene */}
                {currentScene.type === 'lesson' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
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
                    {/* Scene Text */}
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
                      
                      {/* Show if this is a fallback question */}
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
                      {/* Narrative/Dialogue - Continue */}
                      {(currentScene.type === 'narrative' || currentScene.type === 'dialogue') && (
                        <PixelButton onClick={advanceScene} variant="ghost" className="w-full">
                          Continue
                          <ChevronRight className="w-4 h-4" />
                        </PixelButton>
                      )}

                      {/* Choice */}
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

                      {/* Question */}
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

                      {/* Battle */}
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

                      {/* Reward */}
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

                      {/* Finale */}
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