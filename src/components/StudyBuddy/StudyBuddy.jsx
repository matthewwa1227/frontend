import React, { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../../utils/api';
import { getUser } from '../../utils/auth';

const pixelText = { fontFamily: 'monospace' };

// Markdown Renderer Component
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
        .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-pink-400 text-sm font-mono">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    };

    const processTextBlock = (textBlock) => {
      const lines = textBlock.split('\n');
      const result = [];
      let listItems = [];
      let listType = 'ul';

      const flushList = () => {
        if (listItems.length > 0) {
          result.push(
            <ul key={`list-${result.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} list-inside space-y-1 my-2 text-gray-300`}>
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
            <h3 key={`h3-${idx}`} className="text-lg font-bold text-purple-300 mt-3 mb-1" 
                dangerouslySetInnerHTML={{ __html: processInlineMarkdown(line.slice(4)) }} />
          );
        } else if (line.startsWith('## ')) {
          flushList();
          result.push(
            <h2 key={`h2-${idx}`} className="text-xl font-bold text-purple-200 mt-4 mb-2" 
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
            <p key={`p-${idx}`} className="text-gray-300 my-1" 
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
        <div key={`code-${currentIndex}`} className="my-3 rounded-lg overflow-hidden border border-gray-600">
          <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
            <span className="text-xs text-gray-400 font-mono">{language}</span>
            <button
              onClick={() => copyToClipboard(code, currentIndex)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              {copiedIndex === currentIndex ? (
                <span>✓ Copied!</span>
              ) : (
                <span>📋 Copy</span>
              )}
            </button>
          </div>
          <pre className="bg-gray-900 p-4 overflow-x-auto">
            <code className="text-sm font-mono text-green-300 whitespace-pre">{code}</code>
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

// Media Preview Component
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
      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-purple-500 bg-gray-800">
        {isImage && preview && (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        )}
        {isVideo && preview && (
          <div className="relative w-full h-full">
            <video src={preview} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <span className="text-3xl">🎬</span>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white text-sm border-2 border-white shadow-lg transition-colors"
      >
        ✕
      </button>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-xs text-center py-1 text-gray-300">
        <div className="truncate px-1">{isVideo ? '🎬' : '🖼️'} {formatFileSize(file.size)}</div>
      </div>
    </div>
  );
};

// Message Media Display Component
const MessageMedia = ({ media }) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {media.map((item, index) => (
        <div key={index} className="rounded-lg overflow-hidden border border-gray-600">
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

// File Size Configuration
const FILE_CONFIG = {
  image: {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxSizeLabel: '50MB',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'],
    acceptString: 'image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml',
    emoji: '🖼️',
    label: 'Images'
  },
  video: {
    maxSize: 200 * 1024 * 1024, // 200MB
    maxSizeLabel: '200MB',
    acceptedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    acceptString: 'video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska',
    emoji: '🎬',
    label: 'Videos'
  },
  maxFiles: 10,
  maxTotalSize: 500 * 1024 * 1024 // 500MB total
};

const StudyBuddy = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [tips, setTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showFileLimits, setShowFileLimits] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const user = getUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadHistory();
  }, []);

  // Calculate total size of attached files
  const getTotalFileSize = () => {
    return attachedFiles.reduce((total, item) => total + item.file.size, 0);
  };

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
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setMessages([{
        role: 'assistant',
        content: `Hey there! 👋 I'm your Study Buddy. I'm here to help you learn, stay motivated, and crush your goals. You can also share images or videos with me, and I'll help analyze them! What would you like to work on today?`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    const config = FILE_CONFIG[type];
    const validFiles = [];
    const errors = [];
    const currentTotalSize = getTotalFileSize();

    files.forEach(file => {
      // Check individual file size
      if (file.size > config.maxSize) {
        errors.push(`❌ "${file.name}" is too large (${formatFileSize(file.size)}). Max size for ${type}s: ${config.maxSizeLabel}`);
        return;
      }

      // Check if adding this file would exceed total limit
      const newTotalSize = currentTotalSize + validFiles.reduce((sum, f) => sum + f.file.size, 0) + file.size;
      if (newTotalSize > FILE_CONFIG.maxTotalSize) {
        errors.push(`❌ Adding "${file.name}" would exceed total upload limit of ${formatFileSize(FILE_CONFIG.maxTotalSize)}`);
        return;
      }

      // Validate file type
      const fileType = file.type.toLowerCase();
      if (!config.acceptedTypes.some(accepted => fileType.startsWith(accepted.split('/')[0]))) {
        errors.push(`❌ "${file.name}" is not a valid ${type} file`);
        return;
      }

      // Check max files limit
      if (attachedFiles.length + validFiles.length >= FILE_CONFIG.maxFiles) {
        errors.push(`❌ Maximum ${FILE_CONFIG.maxFiles} files allowed`);
        return;
      }

      validFiles.push({
        file,
        type,
        id: Date.now() + Math.random()
      });
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
    }
    
    // Reset input
    e.target.value = '';
  };

  const removeFile = (id) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => {
    setAttachedFiles([]);
  };

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
    
    // Prepare media previews for display
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
    
    // Store files before clearing
    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Convert files to base64 with progress tracking
      const mediaContent = [];
      const totalFiles = filesToSend.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const item = filesToSend[i];
        setUploadProgress(Math.round(((i + 0.5) / totalFiles) * 60));
        
        const base64Data = await fileToBase64(item.file);
        
        if (item.type === 'image') {
          mediaContent.push({
            type: 'image_url',
            image_url: {
              url: base64Data
            }
          });
        } else if (item.type === 'video') {
          mediaContent.push({
            type: 'video_url',
            video_url: {
              url: base64Data
            }
          });
        }
        
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 60));
      }

      setUploadProgress(70);

      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      setUploadProgress(80);

      // Call API with media content
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
          timestamp: new Date().toISOString(),
          isHint: !response.data.meta?.isDirectAnswer && response.data.meta?.isHomework,
          isDirectAnswer: response.data.meta?.isDirectAnswer,
          hintLevel: response.data.meta?.hintLevel || 0
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
        content: "Sorry, I'm having trouble processing that. Please try again with smaller files or check your connection! 🔄",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(null), 500);
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

  const clearChat = async () => {
    try {
      setMessages([{
        role: 'assistant',
        content: `Chat cleared! 🧹 Ready to start fresh. What would you like to learn about?`,
        timestamp: new Date().toISOString()
      }]);
      setAttachedFiles([]);
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  const quickPrompts = [
    { text: "Help me understand", emoji: "🧠" },
    { text: "Give me a hint", emoji: "💡" },
    { text: "Explain step by step", emoji: "📚" },
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
                <p className="text-purple-200 text-sm">Socratic AI Tutor - Learn by Thinking!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="bg-red-500 hover:bg-red-400 text-white px-3 py-2 font-pixel text-sm border-2 border-white transition-all hover:scale-105"
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                onClick={() => loadTips()}
                className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 font-pixel text-sm border-2 border-white transition-all hover:scale-105"
              >
                💡 Tips
              </button>
            </div>
          </div>
          {/* Socratic Method Info */}
          <div className="mt-3 p-2 bg-black/30 rounded border border-purple-400/50">
            <p className="text-purple-200 text-xs font-pixel">
              🎓 <span className="text-yellow-300">SOCRATIC MODE:</span> I guide you to answers rather than giving them directly. 
              Ask up to 3 times for hints, then I'll explain fully!
            </p>
          </div>
        </div>

        {/* Tips Panel */}
        {showTips && (
          <div className="bg-pixel-primary border-4 border-pixel-accent p-4 mb-4 shadow-pixel">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-pixel text-yellow-400">📚 Study Tips</h3>
              <button 
                onClick={() => setShowTips(false)}
                className="text-gray-400 hover:text-white text-xl"
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
            <div className="flex gap-2 mt-4 flex-wrap">
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
                  <p className="text-gray-500 text-sm">Ask me anything about studying, share images or videos for analysis, or let me help you understand difficult concepts.</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white border-2 border-blue-400'
                        : message.isError
                        ? 'bg-red-900 text-red-200 border-2 border-red-600'
                        : 'bg-gray-700 text-gray-100 border-2 border-gray-500'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-600">
                        <span className="text-sm">🤖</span>
                        <span className="text-xs text-purple-400 font-medium">Study Buddy</span>
                      </div>
                    )}
                    
                    {/* Display attached media */}
                    {message.media && message.media.length > 0 && (
                      <MessageMedia media={message.media} />
                    )}
                    
                    {/* Hint/Direct Answer Badge */}
                    {message.isHint && (
                      <div className="mb-2 p-2 bg-amber-900/50 border border-amber-600 rounded">
                        <p className="text-amber-400 text-xs flex items-center gap-1" style={pixelText}>
                          💡 HINT MODE (Attempt {message.hintLevel || 1}/3)
                        </p>
                        <p className="text-amber-300/70 text-[10px] mt-1">
                          I'm guiding you to find the answer yourself. Try again if you need more help!
                        </p>
                      </div>
                    )}
                    {message.isDirectAnswer && (
                      <div className="mb-2 p-2 bg-emerald-900/50 border border-emerald-600 rounded">
                        <p className="text-emerald-400 text-xs flex items-center gap-1" style={pixelText}>
                          📚 FULL EXPLANATION
                        </p>
                        <p className="text-emerald-300/70 text-[10px] mt-1">
                          You've asked about this a few times. Here's the complete answer with explanation!
                        </p>
                      </div>
                    )}

                    {/* Conditional rendering: Markdown for assistant, plain text for user */}
                    {message.role === 'assistant' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 p-4 rounded-lg border-2 border-gray-500 min-w-64">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🤖</span>
                    <span className="text-purple-400 text-sm">
                      {uploadProgress !== null && uploadProgress < 70 
                        ? 'Uploading files...' 
                        : uploadProgress !== null && uploadProgress < 95
                        ? 'Processing...'
                        : 'Thinking...'}
                    </span>
                  </div>
                  {uploadProgress !== null && (
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 text-right">{uploadProgress}%</div>
                    </div>
                  )}
                  {uploadProgress === null && (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="border-t-2 border-gray-600 p-3 bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    📎 {attachedFiles.length}/{FILE_CONFIG.maxFiles} files
                  </span>
                  <span className="text-xs text-gray-500">
                    ({formatFileSize(getTotalFileSize())} / {formatFileSize(FILE_CONFIG.maxTotalSize)})
                  </span>
                </div>
                <button
                  onClick={clearAllFiles}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
              {/* Progress bar for total size */}
              <div className="w-full h-1 bg-gray-700 rounded-full mb-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    getTotalFileSize() / FILE_CONFIG.maxTotalSize > 0.8 
                      ? 'bg-red-500' 
                      : getTotalFileSize() / FILE_CONFIG.maxTotalSize > 0.5 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${(getTotalFileSize() / FILE_CONFIG.maxTotalSize) * 100}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {attachedFiles.map((item) => (
                  <MediaPreview 
                    key={item.id} 
                    file={item.file} 
                    onRemove={() => removeFile(item.id)} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Prompts */}
          <div className="border-t-2 border-gray-600 p-3 flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(prompt.text)}
                disabled={isLoading}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm rounded-full border border-gray-500 transition-colors flex items-center gap-1"
              >
                <span>{prompt.emoji}</span>
                <span>{prompt.text}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="border-t-4 border-pixel-accent p-4">
            <div className="flex gap-2 items-end">
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e, 'image')}
                accept={FILE_CONFIG.image.acceptString}
                multiple
                className="hidden"
              />
              <input
                type="file"
                ref={videoInputRef}
                onChange={(e) => handleFileSelect(e, 'video')}
                accept={FILE_CONFIG.video.acceptString}
                multiple
                className="hidden"
              />
              
              {/* Media buttons */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || attachedFiles.length >= FILE_CONFIG.maxFiles}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-gray-500 transition-colors text-lg"
                  title={`Attach image (max ${FILE_CONFIG.image.maxSizeLabel})`}
                >
                  🖼️
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isLoading || attachedFiles.length >= FILE_CONFIG.maxFiles}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-gray-500 transition-colors text-lg"
                  title={`Attach video (max ${FILE_CONFIG.video.maxSizeLabel})`}
                >
                  🎬
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={attachedFiles.length > 0 ? "Add a message or send media..." : "Ask me anything..."}
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || (!inputMessage.trim() && attachedFiles.length === 0)}
                className={`px-6 py-3 font-pixel text-sm rounded-lg border-2 transition-all ${
                  isLoading || (!inputMessage.trim() && attachedFiles.length === 0)
                    ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 border-purple-400 text-white hover:bg-purple-500 hover:scale-105'
                }`}
              >
                {isLoading ? '⏳' : '📤 Send'}
              </button>
            </div>
            
            {/* File limits info */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowFileLimits(!showFileLimits)}
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1"
              >
                <span>ℹ️</span>
                <span>File upload limits</span>
                <span>{showFileLimits ? '▲' : '▼'}</span>
              </button>
              
              {showFileLimits && (
                <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700 text-xs text-gray-400">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-300">🖼️ Images</div>
                      <div>Max size: {FILE_CONFIG.image.maxSizeLabel}</div>
                      <div className="text-gray-500">JPG, PNG, GIF, WebP, BMP, TIFF, SVG</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-300">🎬 Videos</div>
                      <div>Max size: {FILE_CONFIG.video.maxSizeLabel}</div>
                      <div className="text-gray-500">MP4, WebM, OGG, MOV, AVI, MKV</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-300">📎 Total Files</div>
                      <div>Max: {FILE_CONFIG.maxFiles} files</div>
                      <div className="text-gray-500">Per message</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-300">💾 Total Size</div>
                      <div>Max: {formatFileSize(FILE_CONFIG.maxTotalSize)}</div>
                      <div className="text-gray-500">Combined upload</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* User Stats Footer */}
        <div className="mt-4 bg-pixel-primary border-4 border-pixel-accent p-4 shadow-pixel">
          <div className="flex items-center justify-between text-sm flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-gray-400">👤 {user?.username || 'Student'}</span>
              <span className="text-yellow-400">⭐ Level {user?.level || 1}</span>
              <span className="text-green-400">💬 {messages.filter(m => m.role === 'user').length} messages</span>
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