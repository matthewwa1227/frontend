import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  MessageCircle, 
  Gamepad2, 
  Map,
  Sparkles,
  ChevronRight,
  Star,
  Zap,
  Home,
  X,
  Send,
  RotateCcw,
  Trophy,
  Target,
  Lightbulb,
  Clock,
  CheckCircle2,
  Brain,
  Rocket
} from 'lucide-react';

// Pixel font style
const pixelText = { fontFamily: '"Press Start 2P", monospace, system-ui' };

// ============================================
// PIXEL OWL MASCOT
// ============================================
const PixelOwl = ({ size = 64, mood = 'happy', className = '' }) => {
  const colors = {
    happy: { primary: '#F59E0B', secondary: '#FCD34D', blush: '#FB7185' },
    thinking: { primary: '#8B5CF6', secondary: '#A78BFA', blush: '#F472B6' },
    excited: { primary: '#10B981', secondary: '#34D399', blush: '#FB923C' },
    curious: { primary: '#3B82F6', secondary: '#60A5FA', blush: '#F472B6' }
  };
  const c = colors[mood] || colors.happy;

  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={className}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Body */}
      <rect x="8" y="10" width="16" height="18" fill={c.primary}/>
      <rect x="6" y="12" width="2" height="14" fill={c.primary}/>
      <rect x="24" y="12" width="2" height="14" fill={c.primary}/>
      
      {/* Belly */}
      <rect x="11" y="16" width="10" height="10" fill={c.secondary}/>
      
      {/* Eyes */}
      <rect x="9" y="12" width="5" height="5" fill="white"/>
      <rect x="18" y="12" width="5" height="5" fill="white"/>
      <rect x="11" y="14" width="2" height="2" fill="#1F2937"/>
      <rect x="20" y="14" width="2" height="2" fill="#1F2937"/>
      
      {/* Beak */}
      <rect x="14" y="18" width="4" height="2" fill="#F97316"/>
      <rect x="15" y="20" width="2" height="1" fill="#F97316"/>
      
      {/* Blush */}
      <rect x="7" y="16" width="2" height="2" fill={c.blush} opacity="0.7"/>
      <rect x="23" y="16" width="2" height="2" fill={c.blush} opacity="0.7"/>
      
      {/* Graduation cap */}
      <rect x="6" y="6" width="20" height="2" fill="#374151"/>
      <rect x="10" y="8" width="12" height="2" fill="#374151"/>
      <rect x="14" y="4" width="4" height="2" fill="#374151"/>
      <rect x="22" y="2" width="2" height="4" fill="#374151"/>
      <rect x="24" y="2" width="3" height="3" fill="#FBBF24"/>
      
      {/* Feet */}
      <rect x="10" y="28" width="4" height="2" fill="#F97316"/>
      <rect x="18" y="28" width="4" height="2" fill="#F97316"/>
    </motion.svg>
  );
};

// ============================================
// PIXEL BUTTON COMPONENT
// ============================================
const PixelButton = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) => {
  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-700 text-white',
    secondary: 'bg-violet-500 hover:bg-violet-400 border-violet-700 text-white',
    ghost: 'bg-slate-700 hover:bg-slate-600 border-slate-800 text-slate-200',
    danger: 'bg-rose-500 hover:bg-rose-400 border-rose-700 text-white',
    gold: 'bg-amber-500 hover:bg-amber-400 border-amber-700 text-amber-950'
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95, y: 2 }}
      className={`
        ${variants[variant]} ${sizes[size]}
        border-b-4 border-r-4 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors font-bold uppercase tracking-wider
        ${className}
      `}
      style={pixelText}
    >
      {children}
    </motion.button>
  );
};

// ============================================
// PIXEL CARD COMPONENT
// ============================================
const PixelCard = ({ children, className = '', gradient = false }) => (
  <div className={`
    ${gradient 
      ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
      : 'bg-slate-800'
    }
    border-4 border-slate-600 border-b-slate-900 border-r-slate-900
    ${className}
  `}>
    {children}
  </div>
);

// ============================================
// STAT DISPLAY
// ============================================
const StatBadge = ({ icon: Icon, value, label, color = 'amber' }) => {
  const colors = {
    amber: 'from-amber-500 to-amber-600 text-amber-100',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-100',
    violet: 'from-violet-500 to-violet-600 text-violet-100',
    rose: 'from-rose-500 to-rose-600 text-rose-100'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} px-3 py-2 border-2 border-white/20 flex items-center gap-2`}>
      <Icon className="w-4 h-4" />
      <span className="font-bold" style={{ ...pixelText, fontSize: '10px' }}>{value}</span>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function PixelTutor() {
  const [screen, setScreen] = useState('home');
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState(null);
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(7);
  
  // Use refs to prevent re-renders on typing
  const topicRef = useRef(null);
  const answerRef = useRef(null);
  const chatRef = useRef(null);

  // ============================================
  // HOME SCREEN
  // ============================================
  const HomeScreen = () => {
    const handleStart = () => {
      const value = topicRef.current?.value?.trim();
      if (value) {
        setTopic(value);
        setScreen('modes');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleStart();
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 flex items-center justify-center">
              <span style={{ ...pixelText, fontSize: '12px' }}>{level}</span>
            </div>
            <div className="h-3 w-24 bg-slate-700 border-2 border-slate-600">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: '65%' }}/>
            </div>
          </div>
          <div className="flex gap-2">
            <StatBadge icon={Zap} value={xp} color="amber" />
            <StatBadge icon={Star} value="12" color="violet" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-96">
          <PixelOwl size={96} mood="happy" />
          
          <h1 
            className="text-amber-400 text-center mt-6 mb-2 drop-shadow-lg"
            style={{ ...pixelText, fontSize: '18px', textShadow: '2px 2px 0 #000' }}
          >
            PIXEL SCHOLAR
          </h1>
          <p 
            className="text-slate-400 text-center mb-8"
            style={{ ...pixelText, fontSize: '10px' }}
          >
            Your AI Learning Companion
          </p>

          {/* Input Area */}
          <PixelCard className="w-full max-w-md p-6" gradient>
            <label 
              className="block text-slate-400 mb-3"
              style={{ ...pixelText, fontSize: '10px' }}
            >
              WHAT DO YOU WANT TO LEARN?
            </label>
            <input
              ref={topicRef}
              type="text"
              defaultValue=""
              onKeyDown={handleKeyDown}
              placeholder="e.g. Quantum Physics, Guitar..."
              className="w-full bg-slate-900 border-4 border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              style={{ ...pixelText, fontSize: '11px' }}
            />
            
            {/* Quick Picks */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['Math', 'Coding', 'Science', 'Language'].map((t) => (
                <button
                  key={t}
                  onClick={() => { if(topicRef.current) topicRef.current.value = t; }}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 text-slate-300 transition-colors"
                  style={{ ...pixelText, fontSize: '9px' }}
                >
                  {t}
                </button>
              ))}
            </div>

            <PixelButton 
              onClick={handleStart} 
              variant="primary" 
              className="w-full mt-6"
            >
              Begin Journey →
            </PixelButton>
          </PixelCard>
        </div>

        {/* Footer Stats */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 border-t-4 border-slate-700 p-4">
          <div className="flex justify-around max-w-md mx-auto">
            <div className="text-center">
              <p className="text-emerald-400" style={{ ...pixelText, fontSize: '14px' }}>23</p>
              <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-amber-400" style={{ ...pixelText, fontSize: '14px' }}>7</p>
              <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-violet-400" style={{ ...pixelText, fontSize: '14px' }}>89%</p>
              <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>Mastery</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // MODE SELECTION SCREEN
  // ============================================
  const ModesScreen = () => {
    const modes = [
      {
        id: 'adventure',
        name: 'Story Quest',
        desc: 'Learn through an epic narrative adventure',
        icon: Map,
        color: 'from-violet-500 to-purple-600',
        borderColor: 'border-violet-400'
      },
      {
        id: 'chat',
        name: 'Wise Mentor',
        desc: 'Chat freely with your AI tutor',
        icon: MessageCircle,
        color: 'from-cyan-500 to-blue-600',
        borderColor: 'border-cyan-400'
      },
      {
        id: 'challenge',
        name: 'Boss Battle',
        desc: 'Test your skills against timed challenges',
        icon: Gamepad2,
        color: 'from-rose-500 to-red-600',
        borderColor: 'border-rose-400'
      },
      {
        id: 'build',
        name: 'Craft Lab',
        desc: 'Build projects and apply knowledge',
        icon: Rocket,
        color: 'from-amber-500 to-orange-600',
        borderColor: 'border-amber-400'
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setScreen('home')}
            className="p-2 bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <Home className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>LEARNING</p>
            <p className="text-white" style={{ ...pixelText, fontSize: '12px' }}>{topic}</p>
          </div>
        </div>

        {/* Mascot */}
        <div className="flex justify-center mb-6">
          <PixelOwl size={64} mood="curious" />
        </div>

        <h2 
          className="text-center text-amber-400 mb-6"
          style={{ ...pixelText, fontSize: '14px' }}
        >
          CHOOSE YOUR PATH
        </h2>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {modes.map((m) => (
            <motion.button
              key={m.id}
              onClick={() => { setMode(m.id); setScreen(m.id); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                bg-gradient-to-r ${m.color}
                border-4 ${m.borderColor} border-b-8 border-r-8
                p-4 text-left transition-all hover:brightness-110
              `}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 border-2 border-white/30 flex items-center justify-center">
                  <m.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold" style={{ ...pixelText, fontSize: '11px' }}>{m.name}</p>
                  <p className="text-white/70 mt-1" style={{ ...pixelText, fontSize: '8px' }}>{m.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  // ============================================
  // ADVENTURE MODE - Story Quest
  // ============================================
  const AdventureMode = () => {
    const [chapter, setChapter] = useState(1);
    const [scene, setScene] = useState(0);
    const [choices, setChoices] = useState([]);
    const [storyText, setStoryText] = useState('');
    const [showQuestion, setShowQuestion] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
      // Simulated story content
      setStoryText(`Chapter ${chapter}: The ${topic} Realm\n\nYou stand at the entrance of the Ancient Library. The keeper asks you a question to prove your worth...`);
      setChoices([
        { text: 'Accept the challenge', correct: true },
        { text: 'Ask for a hint first', correct: false },
        { text: 'Search for another path', correct: false }
      ]);
      setTimeout(() => setShowQuestion(true), 2000);
    }, [chapter]);

    const handleChoice = (choice) => {
      if (choice.correct) {
        setScore(s => s + 100);
        setXp(x => x + 25);
      }
      setScene(s => s + 1);
      if (scene >= 2) {
        setChapter(c => c + 1);
        setScene(0);
      }
      setShowQuestion(false);
      setTimeout(() => setShowQuestion(true), 1500);
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-black/30 border-b-4 border-purple-800">
          <button onClick={() => setScreen('modes')} className="p-2">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-violet-800 border-2 border-violet-600">
              <span style={{ ...pixelText, fontSize: '10px' }} className="text-violet-200">CH.{chapter}</span>
            </div>
          </div>
          <StatBadge icon={Star} value={score} color="amber" />
        </div>

        {/* Story Area */}
        <div className="p-6">
          <PixelCard className="p-6 mb-6" gradient>
            <div className="flex items-start gap-4 mb-4">
              <PixelOwl size={48} mood="thinking" />
              <motion.p 
                className="text-slate-200 flex-1 leading-relaxed"
                style={{ ...pixelText, fontSize: '10px', lineHeight: '1.8' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {storyText}
              </motion.p>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-1 mt-4">
              {[1,2,3,4,5].map(i => (
                <div 
                  key={i}
                  className={`h-2 flex-1 border-2 ${
                    i <= scene + 1 
                      ? 'bg-violet-400 border-violet-300' 
                      : 'bg-slate-700 border-slate-600'
                  }`}
                />
              ))}
            </div>
          </PixelCard>

          {/* Choices */}
          <AnimatePresence>
            {showQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <p className="text-amber-400 text-center mb-4" style={{ ...pixelText, fontSize: '10px' }}>
                  WHAT DO YOU DO?
                </p>
                {choices.map((choice, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleChoice(choice)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-full p-4 bg-slate-800 border-4 border-slate-600 hover:border-violet-500 hover:bg-slate-700 text-left transition-all"
                  >
                    <span className="text-slate-200" style={{ ...pixelText, fontSize: '10px' }}>
                      {String.fromCharCode(65 + i)}. {choice.text}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // ============================================
  // CHAT MODE - Wise Mentor
  // ============================================
  const ChatMode = () => {
    const [messages, setMessages] = useState([
      { role: 'ai', text: `Greetings, young scholar! I am your guide to mastering ${topic}. What would you like to explore today?` }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = () => {
      const value = chatRef.current?.value?.trim();
      if (!value) return;
      
      setMessages(m => [...m, { role: 'user', text: value }]);
      chatRef.current.value = '';
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setMessages(m => [...m, { 
          role: 'ai', 
          text: `That's an excellent question about ${topic}! Let me explain...\n\nThe key concept here involves understanding the fundamentals first. Would you like me to break it down further?`
        }]);
        setXp(x => x + 10);
      }, 1500);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-cyan-950 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/30 border-b-4 border-cyan-800">
          <button onClick={() => setScreen('modes')} className="p-2">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-2">
            <PixelOwl size={32} mood="happy" />
            <span style={{ ...pixelText, fontSize: '10px' }} className="text-cyan-300">WISE MENTOR</span>
          </div>
          <StatBadge icon={Zap} value={xp} color="amber" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs p-4 border-4 ${
                msg.role === 'user'
                  ? 'bg-cyan-700 border-cyan-500 border-b-cyan-900 border-r-cyan-900'
                  : 'bg-slate-700 border-slate-500 border-b-slate-900 border-r-slate-900'
              }`}>
                <p className="text-white" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.6' }}>
                  {msg.text}
                </p>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400">
              <PixelOwl size={24} mood="thinking" />
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ ...pixelText, fontSize: '10px' }}
              >
                thinking...
              </motion.span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-900 border-t-4 border-slate-700">
          <div className="flex gap-2">
            <input
              ref={chatRef}
              type="text"
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-slate-800 border-4 border-slate-600 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              style={{ ...pixelText, fontSize: '10px' }}
            />
            <PixelButton onClick={sendMessage} variant="secondary" size="md">
              <Send className="w-4 h-4" />
            </PixelButton>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // CHALLENGE MODE - Boss Battle
  // ============================================
  const ChallengeMode = () => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [question, setQuestion] = useState(1);
    const [totalQuestions] = useState(5);
    const [bossHealth, setBossHealth] = useState(100);
    const [playerHealth, setPlayerHealth] = useState(100);
    const [showResult, setShowResult] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
      if (timeLeft > 0 && !gameOver) {
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0) {
        setPlayerHealth(h => h - 20);
      }
    }, [timeLeft, gameOver]);

    const handleAnswer = (correct) => {
      if (correct) {
        setBossHealth(h => Math.max(0, h - 25));
        setShowResult('hit');
        setXp(x => x + 30);
      } else {
        setPlayerHealth(h => Math.max(0, h - 20));
        setShowResult('miss');
      }

      setTimeout(() => {
        setShowResult(null);
        if (bossHealth <= 25 || playerHealth <= 20) {
          setGameOver(true);
        } else {
          setQuestion(q => q + 1);
          setTimeLeft(60);
        }
      }, 1000);
    };

    if (gameOver) {
      const won = bossHealth <= 0;
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-rose-950 flex flex-col items-center justify-center p-6">
          <PixelOwl size={96} mood={won ? 'excited' : 'thinking'} />
          <h2 
            className={`mt-6 ${won ? 'text-amber-400' : 'text-rose-400'}`}
            style={{ ...pixelText, fontSize: '18px' }}
          >
            {won ? 'VICTORY!' : 'DEFEATED'}
          </h2>
          <p className="text-slate-400 mt-2" style={{ ...pixelText, fontSize: '10px' }}>
            {won ? 'The boss has fallen!' : 'Better luck next time...'}
          </p>
          <PixelButton onClick={() => setScreen('modes')} variant="gold" className="mt-6">
            Continue
          </PixelButton>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-rose-950 to-slate-900">
        {/* Header */}
        <div className="p-4 bg-black/40 border-b-4 border-rose-800">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setScreen('modes')} className="p-2">
              <X className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-2 bg-rose-900 px-3 py-1 border-2 border-rose-700">
              <Clock className="w-4 h-4 text-rose-300" />
              <span className={`${timeLeft <= 10 ? 'text-rose-300' : 'text-white'}`} style={{ ...pixelText, fontSize: '12px' }}>
                {timeLeft}s
              </span>
            </div>
          </div>
          
          {/* Health Bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-rose-400 w-16" style={{ ...pixelText, fontSize: '8px' }}>BOSS</span>
              <div className="flex-1 h-4 bg-slate-800 border-2 border-slate-600">
                <motion.div 
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600"
                  initial={{ width: '100%' }}
                  animate={{ width: `${bossHealth}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 w-16" style={{ ...pixelText, fontSize: '8px' }}>YOU</span>
              <div className="flex-1 h-4 bg-slate-800 border-2 border-slate-600">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-600"
                  initial={{ width: '100%' }}
                  animate={{ width: `${playerHealth}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="p-6">
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div className={`text-6xl ${showResult === 'hit' ? 'text-amber-400' : 'text-rose-500'}`}
                  style={{ ...pixelText, textShadow: '4px 4px 0 #000' }}>
                  {showResult === 'hit' ? 'HIT!' : 'MISS!'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <PixelCard className="p-6 mb-6" gradient>
            <p className="text-amber-400 mb-2" style={{ ...pixelText, fontSize: '10px' }}>
              QUESTION {question}/{totalQuestions}
            </p>
            <p className="text-white" style={{ ...pixelText, fontSize: '11px', lineHeight: '1.8' }}>
              Regarding {topic}: What is the most fundamental principle you should understand first?
            </p>
          </PixelCard>

          {/* Answer Options */}
          <div className="space-y-3">
            {[
              { text: 'Start with the basics', correct: true },
              { text: 'Jump to advanced topics', correct: false },
              { text: 'Skip the theory', correct: false },
              { text: 'Memorize everything', correct: false }
            ].map((opt, i) => (
              <motion.button
                key={i}
                onClick={() => handleAnswer(opt.correct)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-slate-800 border-4 border-slate-600 hover:border-amber-500 text-left transition-all"
              >
                <span className="text-slate-200" style={{ ...pixelText, fontSize: '10px' }}>
                  {String.fromCharCode(65 + i)}. {opt.text}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // BUILD MODE - Craft Lab
  // ============================================
  const BuildMode = () => {
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const steps = [
      { title: 'Foundation', desc: 'Set up your project basics' },
      { title: 'Structure', desc: 'Build the core framework' },
      { title: 'Details', desc: 'Add important features' },
      { title: 'Polish', desc: 'Refine and complete' }
    ];

    const handleComplete = () => {
      setProgress(p => Math.min(100, p + 25));
      if (step < steps.length - 1) {
        setStep(s => s + 1);
        setXp(x => x + 40);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/30 border-b-4 border-amber-800">
          <button onClick={() => setScreen('modes')} className="p-2">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <span style={{ ...pixelText, fontSize: '10px' }} className="text-amber-300">CRAFT LAB</span>
          <StatBadge icon={Zap} value={xp} color="amber" />
        </div>

        <div className="p-6">
          {/* Project Progress */}
          <PixelCard className="p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400" style={{ ...pixelText, fontSize: '8px' }}>PROJECT PROGRESS</span>
              <span className="text-amber-400" style={{ ...pixelText, fontSize: '10px' }}>{progress}%</span>
            </div>
            <div className="h-4 bg-slate-900 border-2 border-slate-700">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </PixelCard>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((s, i) => (
              <div 
                key={i}
                className={`p-4 border-4 transition-all ${
                  i === step 
                    ? 'bg-amber-900/50 border-amber-500' 
                    : i < step 
                      ? 'bg-emerald-900/30 border-emerald-700' 
                      : 'bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center border-2 ${
                    i < step 
                      ? 'bg-emerald-600 border-emerald-400' 
                      : i === step 
                        ? 'bg-amber-600 border-amber-400' 
                        : 'bg-slate-700 border-slate-600'
                  }`}>
                    {i < step ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white" style={{ ...pixelText, fontSize: '10px' }}>{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`${i <= step ? 'text-white' : 'text-slate-500'}`} style={{ ...pixelText, fontSize: '10px' }}>
                      {s.title}
                    </p>
                    <p className="text-slate-500" style={{ ...pixelText, fontSize: '8px' }}>{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Task */}
          {step < steps.length && (
            <PixelCard className="p-6" gradient>
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400" style={{ ...pixelText, fontSize: '10px' }}>CURRENT TASK</span>
              </div>
              <p className="text-white mb-4" style={{ ...pixelText, fontSize: '10px', lineHeight: '1.8' }}>
                Apply your {topic} knowledge to complete the {steps[step].title.toLowerCase()} phase. 
                Think about what you've learned and how it connects.
              </p>
              <textarea
                ref={answerRef}
                placeholder="Describe your approach..."
                className="w-full h-24 bg-slate-900 border-4 border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none mb-4"
                style={{ ...pixelText, fontSize: '10px' }}
              />
              <PixelButton onClick={handleComplete} variant="gold" className="w-full">
                Complete Step →
              </PixelButton>
            </PixelCard>
          )}

          {step >= steps.length && (
            <PixelCard className="p-6 text-center" gradient>
              <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-amber-400 mb-2" style={{ ...pixelText, fontSize: '14px' }}>PROJECT COMPLETE!</h3>
              <p className="text-slate-400 mb-4" style={{ ...pixelText, fontSize: '10px' }}>
                You've built something amazing!
              </p>
              <PixelButton onClick={() => setScreen('modes')} variant="primary">
                Continue Learning
              </PixelButton>
            </PixelCard>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="font-mono">
      {screen === 'home' && <HomeScreen />}
      {screen === 'modes' && <ModesScreen />}
      {screen === 'adventure' && <AdventureMode />}
      {screen === 'chat' && <ChatMode />}
      {screen === 'challenge' && <ChallengeMode />}
      {screen === 'build' && <BuildMode />}
    </div>
  );
}