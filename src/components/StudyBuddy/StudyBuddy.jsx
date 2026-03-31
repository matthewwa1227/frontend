import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { aiAPI } from '../../utils/api';
import { getUser } from '../../utils/auth';

// Pixel font style
const pixelFont = { fontFamily: "'Press Start 2P', monospace" };

// ============================================
// MARKDOWN RENDERER COMPONENT
// ============================================
const MarkdownRenderer = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderMarkdown = (text) => {
    const elements = [];
    let codeBlockIndex = 0;
    
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    
    const processInlineMarkdown = (str) => {
      return str
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-surface-container px-1.5 py-0.5 rounded text-secondary text-sm font-mono">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-secondary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    };

    const processTextBlock = (textBlock) => {
      const lines = textBlock.split('\n');
      const result = [];
      let listItems = [];
      let listType = 'ul';

      const flushList = () => {
        if (listItems.length > 0) {
          result.push(
            <ul key={`list-${result.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} list-inside space-y-1 my-2 text-on-surface-variant`}>
              {listItems.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineMarkdown(item) }} />
              ))}
            </ul>
          );
          listItems = [];
        }
      };

      lines.forEach((line, idx) => {
        if (line.startsWith('### ')) {
          flushList();
          result.push(
            <h3 key={`h3-${idx}`} className="text-lg font-bold text-primary mt-3 mb-1" 
                dangerouslySetInnerHTML={{ __html: processInlineMarkdown(line.slice(4)) }} />
          );
        } else if (line.startsWith('## ')) {
          flushList();
          result.push(
            <h2 key={`h2-${idx}`} className="text-xl font-bold text-tertiary mt-4 mb-2" 
                dangerouslySetInnerHTML={{ __html: processInlineMarkdown(line.slice(3)) }} />
          );
        } else if (line.startsWith('# ')) {
          flushList();
          result.push(
            <h1 key={`h1-${idx}`} className="text-2xl font-bold text-white mt-4 mb-2" 
                dangerouslySetInnerHTML={{ __html: processInlineMarkdown(line.slice(2)) }} />
          );
        } else if (/^\d+\.\s/.test(line)) {
          listType = 'ol';
          listItems.push(line.replace(/^\d+\.\s/, ''));
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          listType = 'ul';
          listItems.push(line.slice(2));
        } else if (line.trim()) {
          flushList();
          result.push(
            <p key={`p-${idx}`} className="text-on-surface-variant my-1" 
               dangerouslySetInnerHTML={{ __html: processInlineMarkdown(line) }} />
          );
        } else if (line === '') {
          flushList();
        }
      });
      
      flushList();
      return result;
    };

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        elements.push(...processTextBlock(textBefore));
      }

      const language = match[1] || 'code';
      const code = match[2].trim();
      const currentIndex = codeBlockIndex++;
      
      elements.push(
        <div key={`code-${currentIndex}`} className="my-3 rounded-lg overflow-hidden border-2 border-outline-variant">
          <div className="bg-surface-container-high px-4 py-2 flex justify-between items-center border-b-2 border-outline-variant">
            <span className="text-xs text-on-surface-variant font-mono" style={pixelFont}>{language}</span>
            <button
              onClick={() => copyToClipboard(code, currentIndex)}
              className="text-on-surface-variant hover:text-white transition-colors flex items-center gap-1 text-xs"
              style={pixelFont}
            >
              {copiedIndex === currentIndex ? (
                <span>✓ Copied!</span>
              ) : (
                <span>📋 Copy</span>
              )}
            </button>
          </div>
          <pre className="bg-surface-container-lowest p-4 overflow-x-auto">
            <code className="text-sm font-mono text-green-400 whitespace-pre">{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      elements.push(...processTextBlock(text.slice(lastIndex)));
    }

    return elements;
  };

  return <div className="markdown-content">{renderMarkdown(content)}</div>;
};

// ============================================
// MEDIA PREVIEW COMPONENT
// ============================================
const MediaPreview = ({ file, onRemove }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const isVideo = file?.type?.startsWith('video/');
  const isImage = file?.type?.startsWith('image/');

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <div className="relative inline-block">
      <div className="relative w-20 h-20 border-4 border-primary bg-surface-container overflow-hidden shadow-[4px_4px_0px_0px_#150136]">
        {isImage && preview && (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        )}
        {isVideo && preview && (
          <div className="relative w-full h-full">
            <video src={preview} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-2xl">🎥</span>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-error hover:bg-red-400 flex items-center justify-center text-white text-sm border-2 border-white shadow-[2px_2px_0px_0px_#000] transition-colors"
        style={pixelFont}
      >
        ✕
      </button>
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[8px] text-center py-1 text-white" style={pixelFont}>
        <div className="truncate px-1">{isVideo ? '🎥' : '📷'} {formatFileSize(file.size)}</div>
      </div>
    </div>
  );
};

// ============================================
// MESSAGE MEDIA COMPONENT
// ============================================
const MessageMedia = ({ media }) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {media.map((item, index) => (
        <div key={index} className="border-2 border-outline-variant overflow-hidden shadow-[4px_4px_0px_0px_#150136]">
          {item.type === 'image' && (
            <img 
              src={item.preview || item.url} 
              alt="Uploaded content" 
              className="max-w-xs max-h-48 object-contain"
            />
          )}
          {item.type === 'video' && (
            <video 
              src={item.preview || item.url} 
              controls 
              className="max-w-xs max-h-48"
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================
// FILE CONFIGURATION
// ============================================
const FILE_CONFIG = {
  image: {
    maxSize: 50 * 1024 * 1024,
    maxSizeLabel: '50MB',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'],
    acceptString: 'image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml',
    emoji: '📷',
    label: 'Images'
  },
  video: {
    maxSize: 200 * 1024 * 1024,
    maxSizeLabel: '200MB',
    acceptedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    acceptString: 'video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska',
    emoji: '🎥',
    label: 'Videos'
  },
  maxFiles: 10,
  maxTotalSize: 500 * 1024 * 1024
};

// ============================================
// CAPABILITY CATEGORIES
// ============================================
const CAPABILITY_CATEGORIES = [
  {
    id: 'knowledge',
    title: '📚 Knowledge',
    description: 'Science, History, Coding, Analysis, and more.',
    examples: ['Explain photosynthesis', 'What caused WWII?', 'How do I write a good essay?']
  },
  {
    id: 'images',
    title: '🖼️ Image Analysis',
    description: 'Worksheets, diagrams, charts, and problems.',
    examples: ['Solve this math problem', 'Explain this diagram', 'Read the text in this photo']
  },
  {
    id: 'coding',
    title: '💻 Coding',
    description: 'Python, JavaScript, HTML/CSS, and more.',
    examples: ['Write a factorial function', 'Debug this code', 'Explain what this does']
  },
  {
    id: 'writing',
    title: '✍️ Writing',
    description: 'Essays, reports, emails, creative writing.',
    examples: ['Help me write an email', 'Feedback on my essay', 'Start a creative story']
  },
  {
    id: 'language',
    title: '🌐 Language',
    description: 'Translation, grammar, vocabulary.',
    examples: ['Translate to Chinese', 'affect vs effect?', 'Formal thank you in English']
  },
  {
    id: 'study',
    title: '🧠 Study Skills',
    description: 'Memory tips, test prep, study plans.',
    examples: ['Best way to memorize?', 'Create a study schedule', 'DSE prep tips']
  }
];

// ============================================
// QUICK PROMPTS
// ============================================
const QUICK_PROMPTS = [
  { text: "Explain like I'm 12", emoji: "📚" },
  { text: "Give me a hint", emoji: "💡" },
  { text: "Step by step", emoji: "📝" },
  { text: "Motivate me!", emoji: "🔥" },
  { text: "Study tips", emoji: "🧠" },
  { text: "Practice problem", emoji: "✏️" }
];

// ============================================
// MAIN COMPONENT
// ============================================
const StudyBuddy = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [tips, setTips] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showFileLimits, setShowFileLimits] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tips' | 'help'
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const user = useMemo(() => getUser(), []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    loadHistory();
  }, []);

  const getTotalFileSize = () => attachedFiles.reduce((total, item) => total + item.file.size, 0);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await aiAPI.getHistory(20);
      if (response.data.success && response.data.conversations) {
        const formattedMessages = response.data.conversations.flatMap(conv => [
          { role: 'user', content: conv.user_message, timestamp: conv.created_at, media: conv.media || [] },
          { role: 'assistant', content: conv.ai_response, timestamp: conv.created_at }
        ]);
        setMessages(formattedMessages);
        if (formattedMessages.length > 0) {
          setShowCapabilities(false);
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleExampleClick = (example) => {
    setInputMessage(example);
    setActiveCategory(null);
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    const config = FILE_CONFIG[type];
    const validFiles = [];
    const errors = [];
    const currentTotalSize = getTotalFileSize();

    files.forEach(file => {
      if (file.size > config.maxSize) {
        errors.push(`❌ "${file.name}" is too large (${formatFileSize(file.size)}). Max: ${config.maxSizeLabel}`);
        return;
      }

      const newTotalSize = currentTotalSize + validFiles.reduce((sum, f) => sum + f.file.size, 0) + file.size;
      if (newTotalSize > FILE_CONFIG.maxTotalSize) {
        errors.push(`❌ Adding "${file.name}" would exceed total limit of ${formatFileSize(FILE_CONFIG.maxTotalSize)}`);
        return;
      }

      const fileType = file.type.toLowerCase();
      if (!config.acceptedTypes.some(accepted => fileType.startsWith(accepted.split('/')[0]))) {
        errors.push(`❌ "${file.name}" is not a valid ${type} file`);
        return;
      }

      if (attachedFiles.length + validFiles.length >= FILE_CONFIG.maxFiles) {
        errors.push(`❌ Maximum ${FILE_CONFIG.maxFiles} files allowed`);
        return;
      }

      validFiles.push({ file, type, id: Date.now() + Math.random() });
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
    }
    
    e.target.value = '';
  };

  const removeFile = (id) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => setAttachedFiles([]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && attachedFiles.length === 0) || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    const mediaForDisplay = await Promise.all(
      attachedFiles.map(async (item) => ({
        type: item.type,
        preview: URL.createObjectURL(item.file),
        name: item.file.name,
        size: item.file.size
      }))
    );

    const newUserMessage = {
      role: 'user',
      content: userMessage || (attachedFiles.length > 0 ? 'Please analyze this content.' : ''),
      timestamp: new Date().toISOString(),
      media: mediaForDisplay
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    setIsLoading(true);
    setUploadProgress(0);

    try {
      const mediaContent = [];
      const totalFiles = filesToSend.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const item = filesToSend[i];
        setUploadProgress(Math.round(((i + 0.5) / totalFiles) * 60));
        
        const base64Data = await fileToBase64(item.file);
        
        if (item.type === 'image') {
          mediaContent.push({ type: 'image_url', image_url: { url: base64Data } });
        } else if (item.type === 'video') {
          mediaContent.push({ type: 'video_url', video_url: { url: base64Data } });
        }
        
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 60));
      }

      setUploadProgress(70);

      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      setUploadProgress(80);

      const response = await aiAPI.chatWithMedia(
        userMessage || 'Please analyze this content.',
        conversationHistory,
        mediaContent
      );
      
      setUploadProgress(95);

      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setUploadProgress(100);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble processing that. Please try again! 🙏",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(null), 500);
    }
  };

  const loadTips = (subject = null) => {
    const defaultTips = {
      Math: ['Practice daily', 'Show your work', 'Check your answers', 'Understand concepts deeply'],
      Science: ['Do experiments', 'Take notes', 'Ask questions', 'Connect to real life'],
      Language: ['Read daily', 'Practice speaking', 'Build vocabulary', 'Write often'],
      general: ['Take regular breaks', 'Stay hydrated', 'Review notes daily', 'Get enough sleep', 'Ask for help when needed']
    };
    
    setTips(defaultTips[subject] || defaultTips.general);
    setShowTips(true);
  };

  const clearChat = () => {
    setMessages([]);
    setAttachedFiles([]);
    setShowCapabilities(true);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Tab button component
  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-[10px] transition-all flex items-center gap-2 ${
        isActive 
          ? 'bg-primary text-on-primary shadow-[4px_4px_0px_0px_#ff4a8d]' 
          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
      }`}
      style={pixelFont}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-surface-container-high border-4 border-primary shadow-[8px_8px_0px_0px_#ff4a8d] mb-6 overflow-hidden">
          {/* Top bar with gradient */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border-4 border-on-primary flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-on-primary" style={pixelFont}>
                    STUDY BUDDY
                  </h1>
                  <p className="text-on-primary/80 text-xs" style={pixelFont}>
                    AI Learning Companion
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4 text-on-primary">
                <div className="text-center">
                  <div className="text-xs opacity-80" style={pixelFont}>LEVEL</div>
                  <div className="text-lg font-bold" style={pixelFont}>{user?.level || 1}</div>
                </div>
                <div className="w-px h-8 bg-on-primary/30" />
                <div className="text-center">
                  <div className="text-xs opacity-80" style={pixelFont}>CHATS</div>
                  <div className="text-lg font-bold" style={pixelFont}>
                    {messages.filter(m => m.role === 'user').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-t-4 border-outline-variant">
            <TabButton 
              id="chat" 
              label="CHAT" 
              icon="💬" 
              isActive={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')}
            />
            <TabButton 
              id="tips" 
              label="STUDY TIPS" 
              icon="💡" 
              isActive={activeTab === 'tips'} 
              onClick={() => { setActiveTab('tips'); loadTips(); }}
            />
            <TabButton 
              id="help" 
              label="HELP" 
              icon="❓" 
              isActive={activeTab === 'help'} 
              onClick={() => setActiveTab('help')}
            />
            <div className="flex-1" />
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-4 py-3 bg-error/10 hover:bg-error/20 text-error text-[10px] transition-colors"
                style={pixelFont}
              >
                🗑️ CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-surface-container border-4 border-outline-variant shadow-[8px_8px_0px_0px_#150136]">
          
          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <>
              {/* Messages Area */}
              <div className="h-[400px] md:h-[500px] overflow-y-auto p-4 space-y-4">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin text-4xl mb-2">⏳</div>
                      <p className="text-on-surface-variant" style={pixelFont}>Loading...</p>
                    </div>
                  </div>
                ) : showCapabilities ? (
                  <div className="space-y-6 py-4">
                    {/* Welcome */}
                    <div className="text-center">
                      <div className="inline-block bg-tertiary/20 border-4 border-tertiary p-6 mb-4 shadow-[4px_4px_0px_0px_#e9c400]">
                        <div className="text-5xl mb-2">🤖</div>
                      </div>
                      <h2 className="text-xl font-bold text-on-surface mb-2" style={pixelFont}>
                        Welcome to Study Buddy!
                      </h2>
                      <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                        Your AI learning companion. Ask me anything about homework, coding, writing, or upload images for analysis!
                      </p>
                    </div>

                    {/* Capability Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {CAPABILITY_CATEGORIES.map((category) => (
                        <div
                          key={category.id}
                          className="bg-surface-container-high border-2 border-outline-variant p-4 cursor-pointer transition-all hover:border-primary hover:shadow-[4px_4px_0px_0px_#ff4a8d]"
                          onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                        >
                          <h3 className="font-bold text-on-surface text-xs mb-1" style={pixelFont}>
                            {category.title}
                          </h3>
                          <p className="text-on-surface-variant text-xs mb-3">{category.description}</p>
                          
                          {activeCategory === category.id && (
                            <div className="space-y-1 pt-2 border-t-2 border-outline-variant">
                              <p className="text-[10px] text-secondary mb-2" style={pixelFont}>TRY ASKING:</p>
                              {category.examples.map((example, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => { e.stopPropagation(); handleExampleClick(example); }}
                                  className="block w-full text-left text-xs text-on-surface-variant hover:text-primary hover:bg-surface-container px-2 py-1 transition-colors"
                                >
                                  "{example}"
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {activeCategory !== category.id && (
                            <div className="text-[10px] text-on-surface-variant flex items-center gap-1" style={pixelFont}>
                              <span>Click to see examples</span>
                              <span>▼</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Quick Prompts */}
                    <div className="bg-surface-container-high border-2 border-outline-variant p-4">
                      <h3 className="text-xs font-bold text-on-surface mb-3" style={pixelFont}>QUICK ACTIONS</h3>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_PROMPTS.map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => handleExampleClick(prompt.text)}
                            className="bg-surface-container hover:bg-surface-container-lowest border-2 border-outline-variant hover:border-primary px-3 py-2 text-xs transition-all hover:shadow-[2px_2px_0px_0px_#ff4a8d]"
                          >
                            <span>{prompt.emoji}</span> {prompt.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[75%] p-4 border-4 ${
                          message.role === 'user'
                            ? 'bg-primary-container text-on-primary-container border-primary shadow-[4px_4px_0px_0px_#8f0044]'
                            : message.isError
                            ? 'bg-error/10 text-error border-error'
                            : 'bg-surface-container-high text-on-surface border-outline-variant shadow-[4px_4px_0px_0px_#150136]'
                        }`}
                      >
                        {message.role === 'assistant' && !message.isError && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-outline-variant">
                            <span className="w-6 h-6 bg-primary text-on-primary flex items-center justify-center text-xs">🤖</span>
                            <span className="text-xs text-secondary" style={pixelFont}>STUDY BUDDY</span>
                          </div>
                        )}
                        
                        {message.media && message.media.length > 0 && (
                          <MessageMedia media={message.media} />
                        )}

                        {message.role === 'assistant' ? (
                          <MarkdownRenderer content={message.content} />
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                        
                        <p className={`text-[10px] mt-2 ${message.role === 'user' ? 'text-on-primary-container/70' : 'text-on-surface-variant'}`} style={pixelFont}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-surface-container-high text-on-surface p-4 border-4 border-outline-variant shadow-[4px_4px_0px_0px_#150136] min-w-64">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-primary text-on-primary flex items-center justify-center text-xs">🤖</span>
                        <span className="text-secondary text-xs" style={pixelFont}>
                          {uploadProgress !== null && uploadProgress < 70 ? 'UPLOADING...' : 
                           uploadProgress !== null && uploadProgress < 95 ? 'PROCESSING...' : 'THINKING...'}
                        </span>
                      </div>
                      {uploadProgress !== null ? (
                        <div className="space-y-1">
                          <div className="w-full h-3 bg-surface-container border-2 border-outline-variant overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-on-surface-variant text-right" style={pixelFont}>{uploadProgress}%</div>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <span className="w-3 h-3 bg-primary animate-bounce"></span>
                          <span className="w-3 h-3 bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-3 h-3 bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="border-t-4 border-outline-variant p-4 bg-surface-container-lowest">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-on-surface-variant" style={pixelFont}>
                      📎 {attachedFiles.length}/{FILE_CONFIG.maxFiles} files ({formatFileSize(getTotalFileSize())})
                    </span>
                    <button
                      onClick={clearAllFiles}
                      className="text-xs text-error hover:text-red-400 transition-colors"
                      style={pixelFont}
                    >
                      CLEAR ALL
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {attachedFiles.map((item) => (
                      <MediaPreview key={item.id} file={item.file} onRemove={() => removeFile(item.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={sendMessage} className="border-t-4 border-outline-variant p-4 bg-surface-container">
                <div className="flex gap-2 items-end">
                  <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'image')} 
                    accept={FILE_CONFIG.image.acceptString} multiple className="hidden" />
                  <input type="file" ref={videoInputRef} onChange={(e) => handleFileSelect(e, 'video')} 
                    accept={FILE_CONFIG.video.acceptString} multiple className="hidden" />
                  
                  {/* Media buttons */}
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || attachedFiles.length >= FILE_CONFIG.maxFiles}
                      className="w-10 h-10 bg-surface-container-high hover:bg-surface-container-lowest disabled:opacity-50 disabled:cursor-not-allowed border-2 border-outline-variant hover:border-primary transition-all flex items-center justify-center text-lg">
                      📷
                    </button>
                    <button type="button" onClick={() => videoInputRef.current?.click()}
                      disabled={isLoading || attachedFiles.length >= FILE_CONFIG.maxFiles}
                      className="w-10 h-10 bg-surface-container-high hover:bg-surface-container-lowest disabled:opacity-50 disabled:cursor-not-allowed border-2 border-outline-variant hover:border-primary transition-all flex items-center justify-center text-lg">
                      🎥
                    </button>
                  </div>

                  <div className="flex-1">
                    <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={attachedFiles.length > 0 ? "Add a message or send media..." : "Ask me anything..."}
                      className="w-full bg-surface-container-lowest border-4 border-outline-variant px-4 py-3 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                      style={pixelFont}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button type="submit" disabled={isLoading || (!inputMessage.trim() && attachedFiles.length === 0)}
                    className={`px-6 py-3 border-4 transition-all ${
                      isLoading || (!inputMessage.trim() && attachedFiles.length === 0)
                        ? 'bg-surface-container text-on-surface-variant border-outline-variant cursor-not-allowed'
                        : 'bg-primary text-on-primary border-on-primary shadow-[4px_4px_0px_0px_#ff4a8d] hover:shadow-[2px_2px_0px_0px_#ff4a8d] hover:translate-x-[2px] hover:translate-y-[2px]'
                    }`}
                    style={pixelFont}
                  >
                    {isLoading ? '...' : 'SEND'}
                  </button>
                </div>
                
                {/* File limits toggle */}
                <div className="mt-3">
                  <button type="button" onClick={() => setShowFileLimits(!showFileLimits)}
                    className="text-[10px] text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
                    style={pixelFont}
                  >
                    <span>ℹ️ FILE LIMITS</span>
                    <span>{showFileLimits ? '▲' : '▼'}</span>
                  </button>
                  
                  {showFileLimits && (
                    <div className="mt-2 p-3 bg-surface-container-lowest border-2 border-outline-variant text-[10px] text-on-surface-variant" style={pixelFont}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>📷 Images: {FILE_CONFIG.image.maxSizeLabel}</div>
                        <div>🎥 Videos: {FILE_CONFIG.video.maxSizeLabel}</div>
                        <div>📎 Max {FILE_CONFIG.maxFiles} files</div>
                        <div>💾 Max {formatFileSize(FILE_CONFIG.maxTotalSize)} total</div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </>
          )}

          {/* STUDY TIPS TAB */}
          {activeTab === 'tips' && (
            <div className="p-6 min-h-[400px]">
              <h2 className="text-lg font-bold text-on-surface mb-6" style={pixelFont}>💡 STUDY TIPS</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {['Math', 'Science', 'Language', 'General'].map((subject) => (
                  <button
                    key={subject}
                    onClick={() => loadTips(subject === 'General' ? null : subject)}
                    className="bg-surface-container-high border-2 border-outline-variant hover:border-tertiary p-4 text-left transition-all hover:shadow-[4px_4px_0px_0px_#e9c400]"
                  >
                    <span className="text-lg mb-2 block">
                      {subject === 'Math' && '🔢'}
                      {subject === 'Science' && '🔬'}
                      {subject === 'Language' && '📖'}
                      {subject === 'General' && '⭐'}
                    </span>
                    <span className="text-xs font-bold text-on-surface" style={pixelFont}>{subject} TIPS</span>
                  </button>
                ))}
              </div>

              {showTips && tips.length > 0 && (
                <div className="bg-surface-container-high border-4 border-tertiary p-6 shadow-[4px_4px_0px_0px_#e9c400]">
                  <h3 className="text-tertiary text-sm mb-4" style={pixelFont}>QUICK TIPS</h3>
                  <ul className="space-y-3">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 text-on-surface">
                        <span className="text-tertiary mt-1">▸</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* HELP TAB */}
          {activeTab === 'help' && (
            <div className="p-6 min-h-[400px]">
              <h2 className="text-lg font-bold text-on-surface mb-6" style={pixelFont}>❓ HOW TO USE</h2>
              
              <div className="space-y-4">
                <div className="bg-surface-container-high border-2 border-outline-variant p-4">
                  <h3 className="text-primary text-xs mb-2" style={pixelFont}>💬 ASKING QUESTIONS</h3>
                  <p className="text-on-surface-variant text-sm">Type any question in the chat box and press SEND. I can help with homework, explain concepts, or give advice!</p>
                </div>
                
                <div className="bg-surface-container-high border-2 border-outline-variant p-4">
                  <h3 className="text-primary text-xs mb-2" style={pixelFont}>📷 UPLOADING IMAGES</h3>
                  <p className="text-on-surface-variant text-sm">Click the 📷 button to upload images of worksheets, diagrams, or problems. I can analyze them and help you solve them!</p>
                </div>
                
                <div className="bg-surface-container-high border-2 border-outline-variant p-4">
                  <h3 className="text-primary text-xs mb-2" style={pixelFont}>🎥 UPLOADING VIDEOS</h3>
                  <p className="text-on-surface-variant text-sm">Click the 🎥 button to upload short videos (max 200MB). I can help analyze video content!</p>
                </div>
                
                <div className="bg-surface-container-high border-2 border-outline-variant p-4">
                  <h3 className="text-primary text-xs mb-2" style={pixelFont}>💡 QUICK PROMPTS</h3>
                  <p className="text-on-surface-variant text-sm">Use the quick prompt buttons to get instant help with common requests like study tips or practice problems!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-on-surface-variant" style={pixelFont}>
            Powered by Kimi K2.5 AI • Made for StudyQuest
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;
