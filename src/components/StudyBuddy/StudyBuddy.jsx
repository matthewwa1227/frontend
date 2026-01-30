import React, { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../../utils/api';
import { getUser } from '../../utils/auth';

const StudyBuddy = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [tips, setTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = getUser();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await aiAPI.getHistory(20);
      if (response.data.success && response.data.conversations) {
        const formattedMessages = response.data.conversations.flatMap(conv => [
          { role: 'user', content: conv.user_message, timestamp: conv.created_at },
          { role: 'assistant', content: conv.ai_response, timestamp: conv.created_at }
        ]);
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      // Add welcome message if no history
      setMessages([{
        role: 'assistant',
        content: `Hey there! 👋 I'm your Study Buddy. I'm here to help you learn, stay motivated, and crush your goals. What would you like to work on today?`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await aiAPI.chat(userMessage, conversationHistory);
      
      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTips = async (subject = null, difficulty = null) => {
    try {
      setTipsLoading(true);
      setShowTips(true);
      const response = await aiAPI.getTips(subject, difficulty);
      if (response.data.success) {
        setTips(response.data.tips);
      }
    } catch (error) {
      console.error('Failed to load tips:', error);
      setTips(['Take regular breaks', 'Stay hydrated', 'Review notes daily']);
    } finally {
      setTipsLoading(false);
    }
  };

  const quickPrompts = [
    { text: "Help me focus", emoji: "🎯" },
    { text: "Explain a concept", emoji: "💡" },
    { text: "Quiz me", emoji: "📝" },
    { text: "Motivate me", emoji: "🔥" }
  ];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-pixel-dark p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 border-4 border-white p-4 mb-4 shadow-pixel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-bounce">🤖</div>
              <div>
                <h1 className="text-xl md:text-2xl font-pixel text-white">Study Buddy</h1>
                <p className="text-purple-200 text-sm">Your AI Learning Companion</p>
              </div>
            </div>
            <button
              onClick={() => loadTips()}
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 font-pixel text-sm border-2 border-white transition-all hover:scale-105"
            >
              💡 Tips
            </button>
          </div>
        </div>

        {/* Tips Panel */}
        {showTips && (
          <div className="bg-pixel-primary border-4 border-pixel-accent p-4 mb-4 shadow-pixel">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-pixel text-yellow-400">📚 Study Tips</h3>
              <button 
                onClick={() => setShowTips(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {tipsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin text-2xl">⏳</div>
              </div>
            ) : (
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <span className="text-green-400">▸</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => loadTips('Math', 'hard')}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1 text-sm rounded border border-blue-400"
              >
                Math Tips
              </button>
              <button 
                onClick={() => loadTips('Science', 'medium')}
                className="bg-green-600 hover:bg-green-500 px-3 py-1 text-sm rounded border border-green-400"
              >
                Science Tips
              </button>
              <button 
                onClick={() => loadTips('Language', 'easy')}
                className="bg-purple-600 hover:bg-purple-500 px-3 py-1 text-sm rounded border border-purple-400"
              >
                Language Tips
              </button>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-pixel-primary border-4 border-pixel-accent shadow-pixel">
          {/* Messages Area */}
          <div className="h-96 md:h-[500px] overflow-y-auto p-4 space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin text-4xl mb-2">⏳</div>
                  <p className="text-gray-400">Loading conversation...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-gray-400 mb-2">Start a conversation!</p>
                  <p className="text-gray-500 text-sm">Ask me anything about studying, get motivated, or let me help you understand difficult concepts.</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white border-2 border-blue-400'
                        : message.isError
                        ? 'bg-red-900 text-red-200 border-2 border-red-600'
                        : 'bg-gray-700 text-gray-100 border-2 border-gray-500'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">🤖</span>
                        <span className="text-xs text-gray-400">Study Buddy</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 p-3 rounded-lg border-2 border-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🤖</span>
                    <div className="flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="border-t-2 border-gray-600 p-3 flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(prompt.text)}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-sm rounded-full border border-gray-500 transition-colors flex items-center gap-1"
              >
                <span>{prompt.emoji}</span>
                <span>{prompt.text}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="border-t-4 border-pixel-accent p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-800 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className={`px-6 py-3 font-pixel text-sm rounded-lg border-2 transition-all ${
                  isLoading || !inputMessage.trim()
                    ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 border-purple-400 text-white hover:bg-purple-500 hover:scale-105'
                }`}
              >
                {isLoading ? '⏳' : '📤 Send'}
              </button>
            </div>
          </form>
        </div>

        {/* User Stats Footer */}
        <div className="mt-4 bg-pixel-primary border-4 border-pixel-accent p-4 shadow-pixel">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">👤 {user?.username || 'Student'}</span>
              <span className="text-yellow-400">⭐ Level {user?.level || 1}</span>
            </div>
            <div className="text-gray-500">
              Powered by Kimi K2.5 AI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;