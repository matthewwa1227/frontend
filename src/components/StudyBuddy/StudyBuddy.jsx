import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aiAPI } from '../../utils/api';
import { getUser } from '../../utils/auth';

// Layout Components
import TopAppBar from '../layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../layout/SideNavBar';

const StudyBuddy = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [user, setUser] = useState(currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Navigation items
  const navItems = useMemo(() => [
    // Main Navigation
    { id: 'dashboard', label: 'DASHBOARD', icon: 'target', href: '/dashboard', category: 'main' },
    { id: 'tasks', label: 'QUEST LOG', icon: 'checklist', href: '/tasks', category: 'main' },
    { id: 'timer', label: 'CHAMBER OF FOCUS', icon: 'timer', href: '/timer', category: 'main' },
    { id: 'progress', label: 'PROGRESS', icon: 'trending_up', href: '/progress', category: 'main' },
    { id: 'social', label: 'SOCIAL', icon: 'groups', href: '/social', category: 'main' },
    { id: 'leaderboard', label: 'LEADERBOARD', icon: 'trophy', href: '/leaderboard', category: 'main' },
    
    // Study Tools
    { id: 'study-buddy', label: 'STUDY BUDDY', icon: 'chat', href: '/study-buddy', category: 'study' },
    { id: 'newquest', label: 'NEWQUEST', icon: 'smart_toy', href: '/newquest', category: 'study' },
    { id: 'archive', label: 'ARCHIVE', icon: 'book-open', href: '/archive-alchemist', category: 'study' },
    { id: 'schedule', label: 'SCHEDULE', icon: 'calendar_month', href: '/schedule', category: 'study' },
    { id: 'exercise-gen', label: 'EXERCISE GEN', icon: 'edit_document', href: '/exercise-generator', category: 'study' },
    
    // More
    { id: 'portal', label: 'PARENTS', icon: 'family_restroom', href: '/portal', category: 'more' },
    { id: 'profile', label: 'PROFILE', icon: 'person', href: '/profile', category: 'more' },
  ], []);

  // Quick action buttons
  const quickActions = [
    { text: 'REVEAL TRUTH', icon: 'visibility', color: 'tertiary' },
    { text: 'SUMMON PRACTICE', icon: 'quiz', color: 'secondary' },
    { text: 'SIMPLIFY MAGIC', icon: 'auto_fix_high', color: 'primary' },
    { text: 'STUDY TIPS', icon: 'lightbulb', color: 'outline' },
  ];

  // Load chat history
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
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputMessage.trim() && attachedFiles.length === 0) || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Build display content with attachment names
    let displayContent = userMessage;
    if (attachedFiles.length > 0) {
      const attachmentNames = attachedFiles.map(f => `[${f.type}: ${f.name}]`).join(' ');
      displayContent = userMessage ? `${userMessage}\n${attachmentNames}` : attachmentNames;
    }

    const newUserMessage = {
      role: 'user',
      content: displayContent,
      timestamp: new Date().toISOString(),
      attachments: attachedFiles.map(f => ({ name: f.name, type: f.type }))
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Build media array for API
      const media = [];
      for (const attachment of attachedFiles) {
        if (attachment.type === 'image') {
          const base64 = await fileToBase64(attachment.file);
          media.push({ type: 'image_url', image_url: { url: base64 } });
        } else if (attachment.type === 'video') {
          const base64 = await fileToBase64(attachment.file);
          media.push({ type: 'video_url', video_url: { url: base64 } });
        } else if (attachment.type === 'document') {
          // For documents, read text and append to message
          const text = await attachment.file.text();
          const docNote = `\n\n[Document: ${attachment.name}]\n${text.substring(0, 3000)}`;
          media.push({ type: 'text', text: docNote });
        }
      }

      const response = await aiAPI.chatWithMedia(userMessage, conversationHistory, media);

      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "The aether is unstable. Please try again, Archmage! 🔮",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Clear attachments after sending
      attachedFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
      setAttachedFiles([]);
    }
  };

  // Handle quick action click
  const handleQuickAction = (text) => {
    setInputMessage(text);
  };

  // Handle file attachment
  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      type: type, // 'document' | 'image' | 'video'
      preview: URL.createObjectURL(file)
    }));

    setAttachedFiles(prev => [...prev, ...newAttachments]);
    e.target.value = ''; // Reset input
  };

  // Remove attached file
  const removeAttachedFile = (index) => {
    setAttachedFiles(prev => {
      const updated = [...prev];
      if (updated[index]?.preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Convert file to base64 for API
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sample messages for initial display
  const sampleMessages = [
    {
      role: 'assistant',
      content: "Greetings, Archmage. The ancient scrolls of Quantum Physics have been decoded. Would you like to analyze the Uncertainty Principle or perform a knowledge ritual to solidify your skills?",
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      role: 'user',
      content: "Explain the Uncertainty Principle like it's a dungeon mechanic. How does it affect my 'observation' roll?",
      timestamp: new Date(Date.now() - 30000).toISOString()
    },
    {
      role: 'assistant',
      content: "Consulting the digital grimoire...",
      timestamp: new Date().toISOString(),
      isTyping: true
    }
  ];

  const displayMessages = messages.length > 0 ? messages : sampleMessages;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopAppBar 
        title="NEON SCHOLAR" 
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation */}
      <SideNavBar 
        items={navItems} 
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeItem="study-buddy"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item && item.href) navigate(item.href);
        }}
      />

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 pb-20 lg:pb-0 min-h-screen flex flex-col">
        {/* Hero Stats Header */}
        <div className="w-full p-4 border-b-4 border-surface-container flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-tertiary text-on-tertiary font-retro text-[10px]">
              LVL {user?.level || 182}
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-retro text-secondary uppercase">TOTAL CHATS: {messages.length || 1240}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-retro text-primary uppercase">MANA</span>
            <div className="flex">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-4 mr-0.5 ${i < 5 ? 'bg-secondary' : 'bg-surface-container-highest'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Chat Terminal */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-2">⚡</div>
                <p className="text-on-surface-variant font-retro text-[10px]">CONNECTING TO AETHER...</p>
              </div>
            </div>
          ) : (
            displayMessages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 items-start max-w-3xl ${message.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-12 h-12 bg-surface-container-highest border-2 flex-shrink-0 flex items-center justify-center ${
                  message.role === 'user' ? 'border-secondary' : 'border-primary'
                }`}>
                  {message.role === 'user' ? (
                    <span className="material-symbols-outlined text-secondary">person</span>
                  ) : (
                    <span className="material-symbols-outlined text-primary">smart_toy</span>
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <p className={`text-[10px] font-retro mb-2 uppercase ${
                    message.role === 'user' ? 'text-secondary' : 'text-primary'
                  }`}>
                    {message.role === 'user' ? 'STUDENT_404 (YOU)' : 'KIMI: LEARNING COMPANION'}
                  </p>
                  <div className={`bg-surface-container p-6 relative ${
                    message.role === 'user' 
                      ? 'border-r-4 border-secondary' 
                      : 'border-l-4 border-primary'
                  } ${message.isTyping ? 'neon-glow-pink' : ''}`}>
                    {message.role === 'assistant' ? (
                      <div className="text-on-background leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-on-background leading-relaxed">{message.content}</p>
                    )}
                    
                    {/* Typing indicator */}
                    {message.isTyping && (
                      <div className="mt-4 flex gap-1">
                        <div className="w-2 h-2 bg-primary animate-pulse"></div>
                        <div className="w-2 h-2 bg-primary animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-primary animate-pulse delay-150"></div>
                      </div>
                    )}

                    {/* AI watermark */}
                    {message.role === 'assistant' && !message.isTyping && (
                      <div className="absolute bottom-2 right-2 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-6xl">auto_awesome</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[8px] font-retro text-on-surface-variant mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-4 items-start max-w-3xl">
              <div className="w-12 h-12 bg-surface-container-highest border-2 border-primary flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">smart_toy</span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-retro text-primary mb-2 uppercase">KIMI: LEARNING COMPANION</p>
                <div className="bg-surface-container p-6 border-l-4 border-primary-container neon-glow-pink">
                  <p className="text-on-background leading-relaxed italic">Consulting the digital grimoire...</p>
                  <div className="mt-4 flex gap-1">
                    <div className="w-2 h-2 bg-primary animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-primary animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Chat Input Area */}
        <div className="p-4 border-t-4 border-surface-container bg-surface-container-lowest">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.text)}
                className={`flex items-center justify-center gap-2 py-2 bg-surface-container-high text-${action.color} font-retro text-[8px] border-b-2 border-${action.color}-container active:translate-y-1 active:border-b-0 transition-all`}
              >
                <span className="material-symbols-outlined text-sm">{action.icon}</span>
                {action.text}
              </button>
            ))}
          </div>

          {/* Attached Files Chips */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-surface-container-high px-2 py-1 border border-outline-variant text-[10px]">
                  <span className="material-symbols-outlined text-xs">
                    {file.type === 'document' ? 'description' : file.type === 'video' ? 'videocam' : 'image'}
                  </span>
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    onClick={() => removeAttachedFile(idx)}
                    className="text-on-surface-variant hover:text-error ml-1"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md,.pptx"
            onChange={(e) => handleFileSelect(e, 'document')}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*,image/*"
            onChange={(e) => handleFileSelect(e, 'video')}
            className="hidden"
          />

          {/* Input Field */}
          <form onSubmit={sendMessage} className="flex gap-2 items-center bg-surface-container-highest p-1 border-4 border-surface-container">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-10 h-10 flex items-center justify-center bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-tertiary transition-colors"
              title="Attach document"
            >
              <span className="material-symbols-outlined text-lg">description</span>
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={isLoading}
              className="w-10 h-10 flex items-center justify-center bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-secondary transition-colors"
              title="Attach video or image"
            >
              <span className="material-symbols-outlined text-lg">videocam</span>
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your inquiry to Kimi..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface p-3 font-body placeholder:text-outline-variant"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || (!inputMessage.trim() && attachedFiles.length === 0)}
              className={`w-12 h-12 flex items-center justify-center transition-all ${
                isLoading || (!inputMessage.trim() && attachedFiles.length === 0)
                  ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                  : 'bg-primary-container text-on-primary-container hover:bg-primary'
              }`}
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>

          <div className="mt-2 flex justify-end">
            <p className="text-[8px] font-retro text-outline-variant uppercase">Mana Cost Per Query: 2 Segments</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavBar 
        items={navItems.filter(i => ['dashboard', 'tasks', 'timer', 'social'].includes(i.id))} 
        activeItem="study-buddy"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />

      {/* Additional CSS */}
      <style>{`
        .neon-glow-pink {
          box-shadow: 0 0 20px rgba(255, 74, 141, 0.2);
        }
        .delay-75 {
          animation-delay: 75ms;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
};

export default StudyBuddy;
