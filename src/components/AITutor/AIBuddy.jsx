import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react';
import api from '../../utils/api';

const pixelText = { fontFamily: 'monospace' };

const PixelButton = ({ children, onClick, variant = 'primary', disabled = false, className = '', icon: Icon }) => {
  const baseStyles = "px-4 py-2 text-xs border-b-4 border-r-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold uppercase tracking-wider flex items-center justify-center gap-2";
  
  const variants = {
    primary: `${baseStyles} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border-blue-800 text-white shadow-lg`,
    secondary: `${baseStyles} bg-slate-700/80 hover:bg-slate-600 border-slate-900 text-slate-200`,
    danger: `${baseStyles} bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 border-rose-800 text-white shadow-lg`,
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
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
};

const AIBuddy = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Buddy! 🎓\n\nI can help you with:\n• Explaining concepts\n• Answering questions\n• Study tips\n• Homework help\n\nWhat would you like to learn about today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Call the AI chat endpoint
      const res = await api.post('/ai/chat', {
        message: userMessage,
        context: messages.slice(-5) // Send last 5 messages for context
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response || res.data.content || "I'm thinking... let me get back to you!"
      }]);
    } catch (error) {
      console.error('AI Buddy error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you today?"
    }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-3xl mx-auto h-[calc(100vh-2rem)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/90 border-2 border-slate-600 rounded-t-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🤖
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={pixelText}>
                AI Buddy
              </h1>
              <p className="text-emerald-400 text-xs" style={pixelText}>
                Your personal study assistant
              </p>
            </div>
          </div>
          <PixelButton variant="secondary" onClick={clearChat} icon={Trash2}>
            Clear
          </PixelButton>
        </motion.div>

        {/* Messages Area */}
        <div className="bg-slate-900/50 border-x-2 border-slate-600 flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-180px)]">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-700 text-white rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap" style={pixelText}>
                    {msg.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-slate-700 p-4 rounded-2xl rounded-tl-sm">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex gap-1"
                >
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                </motion.div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-slate-800/90 border-2 border-slate-600 rounded-b-xl p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              className="flex-1 bg-slate-900 border-2 border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
              style={{ ...pixelText, minHeight: '60px', maxHeight: '120px' }}
              rows={2}
            />
            <PixelButton
              variant="primary"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              icon={Send}
              className="self-end"
            >
              Send
            </PixelButton>
          </div>
          <p className="text-slate-500 text-xs mt-2 text-center" style={pixelText}>
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIBuddy;
