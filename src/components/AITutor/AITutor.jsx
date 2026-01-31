import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  HelpCircle,
  Trophy,
  Clock,
  MessageCircle,
  X,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import api from '../../utils/api';

// Subject data
const SUBJECTS = [
  { id: 'math', name: 'Mathematics', icon: '🔢', color: 'from-blue-500 to-blue-700', topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'] },
  { id: 'science', name: 'Science', icon: '🔬', color: 'from-green-500 to-green-700', topics: ['Physics', 'Chemistry', 'Biology', 'Earth Science'] },
  { id: 'english', name: 'English', icon: '📚', color: 'from-purple-500 to-purple-700', topics: ['Grammar', 'Writing', 'Literature', 'Vocabulary'] },
  { id: 'history', name: 'History', icon: '🏛️', color: 'from-amber-500 to-amber-700', topics: ['World History', 'Ancient Civilizations', 'Modern History'] },
  { id: 'cs', name: 'Computer Science', icon: '💻', color: 'from-cyan-500 to-cyan-700', topics: ['Programming', 'Algorithms', 'Data Structures', 'Web Development'] },
  { id: 'other', name: 'Other Subject', icon: '📖', color: 'from-pink-500 to-pink-700', topics: ['Custom Topic'] }
];

// Learning modes
const MODES = [
  { 
    id: 'learn', 
    name: 'Learn Mode', 
    icon: Brain, 
    description: 'Socratic method - guided discovery through questions',
    color: 'bg-emerald-600 hover:bg-emerald-500'
  },
  { 
    id: 'quiz', 
    name: 'Quiz Mode', 
    icon: Trophy, 
    description: 'Test your knowledge with interactive questions',
    color: 'bg-amber-600 hover:bg-amber-500'
  },
  { 
    id: 'hint', 
    name: 'Hint Mode', 
    icon: Lightbulb, 
    description: 'Get helpful hints without spoiling the answer',
    color: 'bg-blue-600 hover:bg-blue-500'
  },
  { 
    id: 'explain', 
    name: 'Explain Mode', 
    icon: BookOpen, 
    description: 'Clear explanations with examples',
    color: 'bg-purple-600 hover:bg-purple-500'
  }
];

function AITutor() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Setup state
  const [step, setStep] = useState('subject'); // subject -> topic -> mode -> chat
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedMode, setSelectedMode] = useState(null);

  // Session state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    messageCount: 0,
    questionsAnswered: 0,
    duration: 0
  });

  // End session modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [endStats, setEndStats] = useState(null);

  // Timer for session duration
  useEffect(() => {
    let interval;
    if (sessionId) {
      interval = setInterval(() => {
        setSessionStats(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat starts
  useEffect(() => {
    if (step === 'chat') {
      inputRef.current?.focus();
    }
  }, [step]);

  // Select subject
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setStep('topic');
  };

  // Select topic
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setStep('mode');
  };

  // Select mode and start session
  const handleModeSelect = async (mode) => {
    setSelectedMode(mode);
    setIsLoading(true);

    try {
      const topic = selectedTopic === 'Custom Topic' ? customTopic : selectedTopic;
      
      // FIXED: Removed extra /api - baseURL already includes it
      const response = await api.post('/tutor/session/start', {
        subject: selectedSubject.name,
        topic: topic,
        mode: mode.id
      });

      setSessionId(response.data.sessionId);
      setMessages([{
        role: 'assistant',
        content: response.data.message
      }]);
      setStep('chat');

    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start tutoring session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // FIXED: Removed extra /api
      const response = await api.post('/tutor/session/message', {
        sessionId,
        message: userMessage
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
      setSessionStats(prev => ({
        ...prev,
        messageCount: response.data.stats.messageCount,
        questionsAnswered: response.data.stats.questionsAnswered
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I had trouble processing that. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // End session
  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      // FIXED: Removed extra /api
      const response = await api.post('/tutor/session/end', { sessionId });
      setEndStats(response.data.stats);
      setShowEndModal(true);
    } catch (error) {
      console.error('Error ending session:', error);
      navigate('/dashboard');
    }
  };

  // Reset and start new session
  const handleNewSession = () => {
    setStep('subject');
    setSelectedSubject(null);
    setSelectedTopic('');
    setCustomTopic('');
    setSelectedMode(null);
    setSessionId(null);
    setMessages([]);
    setSessionStats({ messageCount: 0, questionsAnswered: 0, duration: 0 });
    setShowEndModal(false);
    setEndStats(null);
  };

  // Render subject selection
  const renderSubjectSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎓</div>
        <h2 className="text-2xl font-pixel text-white mb-2">Choose Your Subject</h2>
        <p className="text-gray-400">What would you like to learn today?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {SUBJECTS.map((subject) => (
          <button
            key={subject.id}
            onClick={() => handleSubjectSelect(subject)}
            className={`bg-gradient-to-br ${subject.color} p-6 rounded-lg border-4 border-transparent hover:border-white transition-all transform hover:scale-105 group`}
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
              {subject.icon}
            </div>
            <h3 className="font-pixel text-white text-sm">{subject.name}</h3>
          </button>
        ))}
      </div>
    </div>
  );

  // Render topic selection
  const renderTopicSelection = () => (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setStep('subject')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to subjects</span>
      </button>

      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{selectedSubject?.icon}</div>
        <h2 className="text-2xl font-pixel text-white mb-2">{selectedSubject?.name}</h2>
        <p className="text-gray-400">Choose a topic or enter your own</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {selectedSubject?.topics.map((topic) => (
          <button
            key={topic}
            onClick={() => topic === 'Custom Topic' ? null : handleTopicSelect(topic)}
            className={`bg-pixel-primary border-4 ${
              selectedTopic === topic ? 'border-pixel-gold' : 'border-pixel-accent'
            } p-4 hover:border-pixel-gold transition-all`}
          >
            <span className="font-pixel text-sm text-white">{topic}</span>
          </button>
        ))}
      </div>

      {/* Custom topic input */}
      <div className="bg-pixel-primary border-4 border-pixel-accent p-4">
        <label className="block text-sm text-gray-400 mb-2">Or enter a custom topic:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g., Quadratic equations, World War II..."
            className="flex-1 bg-pixel-dark border-2 border-pixel-accent px-4 py-2 text-white focus:border-pixel-gold outline-none"
          />
          <button
            onClick={() => customTopic.trim() && handleTopicSelect(customTopic.trim())}
            disabled={!customTopic.trim()}
            className="bg-pixel-gold text-black px-6 py-2 font-pixel text-sm hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  // Render mode selection
  const renderModeSelection = () => (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setStep('topic')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to topics</span>
      </button>

      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🧠</div>
        <h2 className="text-2xl font-pixel text-white mb-2">Choose Learning Mode</h2>
        <p className="text-gray-400">
          Learning <span className="text-pixel-gold">{selectedTopic}</span> in {selectedSubject?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode)}
              disabled={isLoading}
              className={`${mode.color} p-6 rounded-lg border-4 border-transparent hover:border-white transition-all text-left group disabled:opacity-50`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon size={28} className="group-hover:scale-110 transition-transform" />
                <h3 className="font-pixel text-white">{mode.name}</h3>
              </div>
              <p className="text-sm text-white/80">{mode.description}</p>
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-3 bg-pixel-primary border-4 border-pixel-accent px-6 py-3">
            <div className="animate-spin w-5 h-5 border-2 border-pixel-gold border-t-transparent rounded-full" />
            <span className="text-white">Starting your session...</span>
          </div>
        </div>
      )}
    </div>
  );

  // Render chat interface
  const renderChat = () => (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Chat Header */}
      <div className="bg-pixel-primary border-b-4 border-pixel-accent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{selectedSubject?.icon}</div>
            <div>
              <h2 className="font-pixel text-white">{selectedTopic}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-pixel ${
                  selectedMode?.id === 'learn' ? 'bg-emerald-600' :
                  selectedMode?.id === 'quiz' ? 'bg-amber-600' :
                  selectedMode?.id === 'hint' ? 'bg-blue-600' :
                  'bg-purple-600'
                }`}>
                  {selectedMode?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <MessageCircle size={16} />
                <span>{sessionStats.messageCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy size={16} />
                <span>{sessionStats.questionsAnswered}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{sessionStats.duration}m</span>
              </div>
            </div>

            <button
              onClick={handleEndSession}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 font-pixel text-xs transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pixel-dark/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] md:max-w-[70%] p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-pixel-gold text-black'
                  : 'bg-pixel-primary border-2 border-pixel-accent text-white'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-pixel-accent">
                  <GraduationCap size={18} className="text-pixel-gold" />
                  <span className="font-pixel text-xs text-pixel-gold">AI Tutor</span>
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-pixel-primary border-2 border-pixel-accent p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-pixel-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-pixel-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-pixel-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-gray-400 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-pixel-primary border-t-4 border-pixel-accent">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your answer or question..."
            disabled={isLoading}
            className="flex-1 bg-pixel-dark border-4 border-pixel-accent px-4 py-3 text-white placeholder-gray-500 focus:border-pixel-gold outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-pixel-gold text-black px-6 py-3 font-pixel hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setInputMessage("I don't understand, can you explain differently?")}
            className="text-xs text-gray-400 hover:text-white bg-pixel-dark px-3 py-1 rounded transition-colors"
          >
            🤔 Don't understand
          </button>
          <button
            type="button"
            onClick={() => setInputMessage("Can you give me a hint?")}
            className="text-xs text-gray-400 hover:text-white bg-pixel-dark px-3 py-1 rounded transition-colors"
          >
            💡 Give me a hint
          </button>
          <button
            type="button"
            onClick={() => setInputMessage("Can we try a different example?")}
            className="text-xs text-gray-400 hover:text-white bg-pixel-dark px-3 py-1 rounded transition-colors"
          >
            🔄 Different example
          </button>
        </div>
      </form>
    </div>
  );

  // End session modal
  const renderEndModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-pixel-primary border-4 border-pixel-gold p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-pixel text-white mb-2">Session Complete!</h2>
        <p className="text-gray-400 mb-6">Great job on your study session!</p>

        {endStats && (
          <div className="bg-pixel-dark border-2 border-pixel-accent p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Duration</span>
              <span className="text-white font-pixel">{endStats.duration} minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Messages</span>
              <span className="text-white font-pixel">{endStats.messagesExchanged}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Questions Answered</span>
              <span className="text-white font-pixel">{endStats.questionsAnswered}</span>
            </div>
            <div className="flex justify-between items-center border-t border-pixel-accent pt-3">
              <span className="text-pixel-gold font-pixel">XP Earned</span>
              <span className="text-pixel-gold font-pixel text-xl">+{endStats.xpEarned} XP</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleNewSession}
            className="flex-1 bg-pixel-gold text-black py-3 font-pixel hover:bg-yellow-400 transition-colors"
          >
            New Session
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-pixel-accent text-white py-3 font-pixel hover:bg-pixel-secondary transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-pixel-dark p-4">
      {/* Header */}
      {step !== 'chat' && (
        <div className="max-w-4xl mx-auto mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      {step === 'subject' && renderSubjectSelection()}
      {step === 'topic' && renderTopicSelection()}
      {step === 'mode' && renderModeSelection()}
      {step === 'chat' && renderChat()}

      {/* End Session Modal */}
      {showEndModal && renderEndModal()}
    </div>
  );
}

export default AITutor;