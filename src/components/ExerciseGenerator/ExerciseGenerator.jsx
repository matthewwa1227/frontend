import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, RotateCcw, Wand2, Copy, Upload, FileText, X, Check, Sparkles } from 'lucide-react';
import { exerciseAPI } from '../../utils/api';

const pixelText = { fontFamily: 'monospace' };

// Pixel Button Component
const PixelButton = ({ children, onClick, variant = 'primary', disabled = false, className = '', icon: Icon }) => {
  const baseStyles = "px-6 py-3 text-sm border-b-4 border-r-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold uppercase tracking-wider flex items-center justify-center gap-2";
  
  const variants = {
    primary: `${baseStyles} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border-blue-800 text-white shadow-lg shadow-blue-900/50`,
    gold: `${baseStyles} bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border-amber-700 text-amber-950 shadow-lg shadow-amber-900/50`,
    success: `${baseStyles} bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border-emerald-800 text-white shadow-lg shadow-emerald-900/50`,
    secondary: `${baseStyles} bg-slate-700/80 hover:bg-slate-600 border-slate-900 text-slate-200`,
    accent: `${baseStyles} bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 border-violet-800 text-white shadow-lg shadow-violet-900/50`,
    outline: `${baseStyles} bg-transparent border-2 border-violet-500 text-violet-400 hover:bg-violet-500/10`
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
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.button>
  );
};

// Pixel Card Component
const PixelCard = ({ children, title, icon: Icon, className = '' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-slate-800/90 border-2 border-slate-600 rounded-xl p-6 shadow-2xl ${className}`}
  >
    {(title || Icon) && (
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-700">
        {Icon && <Icon className="w-8 h-8 text-amber-400" />}
        <h2 className="text-xl font-bold text-amber-400" style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          {title}
        </h2>
      </div>
    )}
    {children}
  </motion.div>
);

// Mode Toggle Component - MISSION 55: Added Reading Mode
const ModeToggle = ({ mode, onChange }) => (
  <div className="flex gap-1 p-1 bg-slate-900 rounded-lg border-2 border-slate-600 flex-wrap">
    <button
      onClick={() => onChange('original')}
      className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all min-w-[80px] ${
        mode === 'original'
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-slate-400 hover:text-white'
      }`}
      style={pixelText}
    >
      ✨ ORIGINAL
    </button>
    <button
      onClick={() => onChange('similar')}
      className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all min-w-[80px] ${
        mode === 'similar'
          ? 'bg-violet-600 text-white shadow-lg'
          : 'text-slate-400 hover:text-white'
      }`}
      style={pixelText}
    >
      📋 SIMILAR
    </button>
    <button
      onClick={() => onChange('reading')}
      className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all min-w-[80px] ${
        mode === 'reading'
          ? 'bg-emerald-600 text-white shadow-lg'
          : 'text-slate-400 hover:text-white'
      }`}
      style={pixelText}
    >
      📖 READING
    </button>
  </div>
);

// File Upload Component - Supports multiple files (MISSION 51)
const FileUploadZone = ({ onFilesSelect, files, analyzing, analyzed, onRemoveFile }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) onFilesSelect(droppedFiles);
  }, [onFilesSelect]);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) onFilesSelect(selectedFiles);
  };

  const getFileIcon = () => {
    if (analyzing) return '⏳';
    if (analyzed) return '✅';
    if (files.length > 0) return '📄';
    return '📎';
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragging ? 'border-violet-400 bg-violet-500/10' : ''}
        ${files.length > 0 ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600 hover:border-slate-500'}
        ${analyzing ? 'border-amber-500 bg-amber-500/10' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple  // MISSION 51: Enable multi-file selection
        accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png,.webp"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <motion.div
        animate={analyzing ? { rotate: 360 } : {}}
        transition={analyzing ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        className="text-4xl mb-3"
      >
        {getFileIcon()}
      </motion.div>
      
      {files.length > 0 ? (
        <div>
          <p className="text-emerald-400 font-bold" style={pixelText}>
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </p>
          <p className="text-slate-400 text-xs mt-1" style={pixelText}>
            {(files.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
          </p>
          {analyzing && (
            <p className="text-amber-400 text-sm mt-2" style={pixelText}>
              🔍 Analyzing document{files.length > 1 ? 's' : ''}...
            </p>
          )}
          {analyzed && (
            <p className="text-emerald-400 text-sm mt-2" style={pixelText}>
              ✨ Auto-detected subject & concept!
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-violet-400 font-bold mb-1" style={pixelText}>
            Drop files here or click to browse
          </p>
          <p className="text-slate-500 text-xs" style={pixelText}>
            PDF, DOCX, TXT, MD, or Images (JPG, PNG, WebP)
          </p>
          <p className="text-slate-600 text-xs mt-1" style={pixelText}>
            Max 3 files, 10MB each
          </p>
        </div>
      )}
    </div>
  );
};

const ExerciseGenerator = () => {
  // Mode: 'original', 'similar', or 'reading' - MISSION 55: Added reading mode
  const [mode, setMode] = useState('original');
  
  // Common fields
  const [subject, setSubject] = useState('');
  const [concept, setConcept] = useState('');
  const [numExercises, setNumExercises] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  
  // MISSION 55: Reading mode specific fields
  const [passageType, setPassageType] = useState('narrative');
  const [includeVocabulary, setIncludeVocabulary] = useState(true);
  
  // File upload state - MISSION 51: Support multiple files
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [extractedExercises, setExtractedExercises] = useState([]);
  const [autoDetected, setAutoDetected] = useState(false);
  
  // Similar mode text input (fallback)
  const [referenceExercises, setReferenceExercises] = useState('');
  const [preservePattern, setPreservePattern] = useState(true);
  
  // Output state
  const [exercises, setExercises] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(''); // MISSION 56: For reading mode progress
  const [error, setError] = useState(null);

  // Handle file selection and analysis - MISSION 52: Batch all files in one API call
  const handleFilesSelect = async (newFiles) => {
    // Limit to 3 files max
    const filesToAdd = newFiles.slice(0, 3 - uploadedFiles.length);
    const updatedFiles = [...uploadedFiles, ...filesToAdd].slice(0, 3);
    setUploadedFiles(updatedFiles);
    setAnalyzed(false);
    setAutoDetected(false);
    
    // Analyze all documents in ONE batch API call
    setAnalyzing(true);
    setError(null);
    
    try {
      // MISSION 52: Send all files at once for batch analysis
      console.log(`🚀 Batch analyzing ${updatedFiles.length} file(s)...`);
      const result = await exerciseAPI.analyzeDocument(updatedFiles);
      
      if (result.data.success) {
        // Auto-fill the fields
        setSubject(result.data.subject || '');
        setConcept(result.data.concept || '');
        setDifficulty(result.data.difficulty || 'medium');
        setExtractedExercises(result.data.extractedExercises || []);
        setNumExercises(result.data.suggestedQuestionCount || 10);
        setAnalyzed(true);
        setAutoDetected(true);
        
        if (result.data.batchProcessed) {
          console.log(`✅ Batch analyzed ${result.data.batchProcessed} files: ${result.data.subject} - ${result.data.concept}`);
        } else {
          console.log(`✅ Analyzed: ${result.data.subject} - ${result.data.concept}`);
        }
      } else {
        setError(result.data.message || 'Failed to analyze document');
      }
    } catch (err) {
      console.error('Document analysis error:', err);
      setError('Failed to analyze document. Please try again or enter details manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length <= 1) {
      setAnalyzed(false);
      setAutoDetected(false);
      setExtractedExercises([]);
    }
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setAnalyzed(false);
    setAutoDetected(false);
    setExtractedExercises([]);
  };

  const generateExercises = async () => {
    // Validation based on mode
    if (mode === 'original') {
      if (!subject || !concept) {
        setError('Please fill in Subject and Grammar/Concept Focus');
        return;
      }
    } else if (mode === 'similar') {
      // Similar mode - either file or text required
      if (uploadedFiles.length === 0 && !referenceExercises.trim()) {
        setError('Please upload a document or paste reference exercises');
        return;
      }
    } else if (mode === 'reading') {
      // MISSION 55: Reading mode validation
      if (!subject || !['English', 'Chinese'].includes(subject)) {
        setError('Please select English or Chinese for Reading mode');
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    setLoadingStatus(mode === 'reading' ? 'writing_passage' : '');
    
    // Cap at 15 exercises to avoid timeout
    const safeCount = Math.min(numExercises, 15);
    
    // MISSION 57: Synchronized timeouts - 240s frontend, 300s backend for reading
    const timeoutDuration = mode === 'reading' ? 240000 : 60000; // 240s (4 min) for reading, 60s for others
    
    console.log(`⏱️ MISSION 57: Frontend timeout set to ${timeoutDuration/1000}s for ${mode} mode`);
    
    try {
      let res;
      
      if (mode === 'original') {
        // Original mode - use standard endpoint
        res = await exerciseAPI.generate({
          subject,
          concept,
          numExercises: safeCount,
          difficulty
        });
      } else if (mode === 'reading') {
        // MISSION 57: Reading comprehension with 240s frontend timeout
        setLoadingStatus('writing_passage');
        
        const startTime = Date.now();
        
        // Create timeout promise (frontend safeguard)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            const elapsed = Date.now() - startTime;
            console.error(`⏱️ MISSION 57: Frontend timeout after ${elapsed}ms`);
            reject(new Error('TIMEOUT'));
          }, timeoutDuration);
        });
        
        // Log progress every 30s
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          console.log(`⏳ MISSION 57: Still waiting for reading generation... (${elapsed/1000}s elapsed)`);
        }, 30000);
        
        // Race between API call and timeout
        res = await Promise.race([
          exerciseAPI.generateReading({
            subject,
            difficulty,
            passageType,
            numQuestions: safeCount
          }),
          timeoutPromise
        ]);
        
        clearInterval(progressInterval);
        console.log(`✅ MISSION 57: Reading received after ${(Date.now() - startTime)/1000}s`);
        
        setLoadingStatus('creating_questions');
      } else {
        // Similar mode - use file upload endpoint (use first file for now)
        res = await exerciseAPI.generateSimilar({
          document: uploadedFiles[0],
          subject,
          concept,
          numExercises: safeCount,
          difficulty,
          preservePattern,
          referenceExercises: extractedExercises.length > 0 
            ? JSON.stringify(extractedExercises) 
            : referenceExercises
        });
      }
      
      setExercises(res.data);
      
      // Log if fallback was used
      if (res.data._fallback) {
        console.log('⚠️ Used fallback exercises:', res.data._message);
      }
      
      console.log(`✅ Generated ${res.data.questions?.length || 0} exercises`);
    } catch (err) {
      console.error('Failed to generate exercises:', err);
      
      // MISSION 57: Better error messages with specific guidance
      if (err.message === 'TIMEOUT') {
        setError(mode === 'reading' 
          ? `⏱️ Timeout: Reading passages take 2-4 minutes. Please try again or reduce to 5 questions.` 
          : 'Generation timed out. Please try again.');
      } else if (err.message?.includes('timeout') || err.message?.includes('longer than')) {
        // Backend timeout message
        setError(`⏱️ ${err.message}`);
      } else if (err.message?.includes('aborted') || err.message?.includes('AbortError')) {
        setError(mode === 'reading'
          ? '⏱️ Connection timeout. Reading passages need 2-4 minutes. Please wait or try with fewer questions.'
          : 'Generation timed out. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReference = () => {
    if (exercises?.questions) {
      const text = exercises.questions.map((q, i) => {
        const hasChoices = q.choices && q.choices.length > 0;
        // MISSION 54: Clean question text
        let questionText = `${i + 1}. ${cleanQuestionText(q.question, hasChoices)}`;
        
        if (q.choices) {
          questionText += '\n' + q.choices.map((c, idx) => `   ${formatChoice(c, idx)}`).join('\n');
        }
        if (q.items) {
          questionText += '\n' + q.items.map(item => `   - ${cleanText(item.sentence)}`).join('\n');
        }
        
        // MISSION 54: Clean answer text
        let answerText = typeof q.answer === 'object' ? q.answer.text : q.answer;
        answerText = cleanText(answerText).replace(/^[A-D]\.\s*/, '');
        
        questionText += `\n   Answer: ${answerText}`;
        return questionText;
      }).join('\n\n');
      
      navigator.clipboard.writeText(text);
      alert('Exercises copied! You can paste them in "Similar Practice" mode to generate more like these.');
    }
  };

  // MISSION 54: Helper to clean duplicate letter prefixes (e.g., "A. A." → "A.")
  const cleanText = (text) => {
    if (!text) return '';
    // Remove duplicate letter prefixes like "A. A. ", "B. B. "
    return text.replace(/([A-D])\.\s*\1\.\s*/g, '$1. ').trim();
  };

  // MISSION 54: Helper to clean question text (remove inline choices)
  const cleanQuestionText = (question, hasChoices) => {
    if (!question) return '';
    let cleaned = cleanText(question);
    // If question has choices, remove inline choice text like "A. xxx B. yyy"
    if (hasChoices) {
      // Remove patterns like "A. word B. word C. word D. word" from end of question
      cleaned = cleaned.replace(/\s*[A-D]\.\s*[^A-D]+(?:[A-D]\.\s*[^A-D]+)*$/g, '');
    }
    return cleaned.trim();
  };

  // MISSION 54: Helper to format choice text
  const formatChoice = (choice, index) => {
    const letter = String.fromCharCode(65 + index);
    const text = typeof choice === 'object' ? choice.text : choice;
    const cleanedText = cleanText(text);
    // Remove leading letter prefix if present (to avoid "A. A. xxx")
    const finalText = cleanedText.replace(/^[A-D]\.\s*/, '');
    return `${letter}. ${finalText}`;
  };

  // Sample exercise structure for preview
  const renderQuestion = (q, idx) => {
    // Determine if question has choices (either explicit or fill_blank with choices)
    const hasChoices = q.choices && q.choices.length > 0;
    
    switch (q.type) {
      case 'fill_blank':
        // MISSION 51: Check if this is a True/False question (single T/F answer)
        const isTrueFalse = q.answer === 'T' || q.answer === 'F' || 
                           q.answer?.toString().toLowerCase() === 'true' || 
                           q.answer?.toString().toLowerCase() === 'false';
        
        if (isTrueFalse) {
          // True/False format: Show question once with blank for T/F
          return (
            <div className="ml-4 flex items-baseline gap-3">
              <span className="text-sm leading-relaxed flex-1">
                {cleanQuestionText(q.question, false)}
              </span>
              <span className="text-sm font-bold whitespace-nowrap">
                ( ______ )
              </span>
            </div>
          );
        }
        
        // MISSION 54: Fill blank with choices shown as inline options
        if (hasChoices) {
          return (
            <div className="ml-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {q.choices.map((choice, i) => (
                  <span key={i} className="whitespace-nowrap">
                    {formatChoice(choice, i)}
                  </span>
                ))}
              </div>
            </div>
          );
        }
        
        // Standard fill_blank with items
        return (
          <div className="ml-4 space-y-2">
            {q.items?.map((item, i) => (
              <p key={i} className="text-sm leading-relaxed">
                {i + 1}. {cleanText(item.sentence)}
              </p>
            ))}
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {q.choices?.map((choice, i) => (
              <p key={i} className="text-sm">
                {formatChoice(choice, i)}
              </p>
            ))}
          </div>
        );
        
      case 'match':
        return (
          <div className="ml-4 flex flex-wrap gap-8">
            <div>
              <p className="font-bold text-sm mb-2 border-b border-black">Column A</p>
              {q.columnA?.map((item, i) => (
                <p key={i} className="text-sm py-1">{i + 1}. {item}</p>
              ))}
            </div>
            <div>
              <p className="font-bold text-sm mb-2 border-b border-black">Column B</p>
              {q.columnB?.map((item, i) => (
                <p key={i} className="text-sm py-1">{String.fromCharCode(65 + i)}. {item}</p>
              ))}
            </div>
          </div>
        );
        
      case 'error_correction':
        return (
          <div className="ml-4">
            <p className="text-sm italic mb-2 bg-gray-100 p-2 rounded">"{q.sentence}"</p>
            <p className="text-sm">Correction: <span className="border-b border-black inline-block min-w-[200px]"></span></p>
          </div>
        );
        
      case 'unscramble':
        return (
          <div className="ml-4">
            <p className="text-sm mb-2">
              <span className="font-semibold">Words:</span> {q.words?.join(' / ')}
            </p>
            <p className="text-sm">Answer: <span className="border-b border-black inline-block min-w-[250px]"></span></p>
          </div>
        );
        
      case 'short_answer':
        return (
          <div className="ml-4">
            <p className="text-sm">Answer: <span className="border-b border-black inline-block w-full mt-2"></span></p>
          </div>
        );
        
      default:
        return (
          <div className="ml-4">
            <p className="text-sm">Answer: <span className="border-b border-black inline-block min-w-[200px]"></span></p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            📝
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ ...pixelText, textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
            EXERCISE GENERATOR
          </h1>
          <p className="text-slate-400 text-sm" style={pixelText}>
            Create printable practice worksheets with AI
          </p>
        </div>

        {/* Input Form */}
        {!exercises && (
          <PixelCard title="CONFIGURE WORKSHEET" icon={Wand2}>
            {error && (
              <div className="mb-4 p-4 rounded-lg border bg-rose-900/50 border-rose-500">
                <p className="text-sm font-bold mb-2 text-rose-300" style={pixelText}>
                  ❌ ERROR
                </p>
                <p className="text-sm text-rose-300" style={pixelText}>
                  {error}
                </p>
              </div>
            )}
            
            <div className="space-y-5">
              {/* Mode Toggle */}
              <div>
                <label className="text-amber-400 font-bold text-xs block mb-2" style={pixelText}>
                  GENERATION MODE
                </label>
                <ModeToggle mode={mode} onChange={(newMode) => {
                  setMode(newMode);
                  clearAllFiles();
                  // MISSION 55: Reset subject when switching to/from reading mode
                  if (newMode === 'reading') {
                    setSubject('English'); // Default for reading
                  }
                }} />
                <p className="text-slate-500 text-xs mt-1" style={pixelText}>
                  {mode === 'original' 
                    ? 'Generate brand new exercises based on your settings' 
                    : mode === 'reading'
                      ? '📖 Generate reading comprehension passages with questions'
                      : 'Create exercises similar to your uploaded document'}
                </p>
              </div>

              {/* MISSION 55: Reading Mode Configuration */}
              <AnimatePresence>
                {mode === 'reading' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto'}}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📖</span>
                      <span className="text-emerald-400 font-bold text-sm" style={pixelText}>
                        READING COMPREHENSION MODE
                      </span>
                    </div>
                    
                    {/* Passage Type */}
                    <div>
                      <label className="text-emerald-400 font-bold text-xs block mb-2" style={pixelText}>
                        PASSAGE TYPE
                      </label>
                      <select
                        value={passageType}
                        onChange={(e) => setPassageType(e.target.value)}
                        className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        style={pixelText}
                      >
                        <option value="narrative">📖 Narrative (Story)</option>
                        <option value="argumentative">💬 Argumentative (Debate)</option>
                        <option value="descriptive">🎨 Descriptive (Description)</option>
                        <option value="expository">📚 Expository (Informative)</option>
                        {subject === 'Chinese' && (
                          <option value="classical">📜 Classical Chinese (文言文)</option>
                        )}
                      </select>
                    </div>

                    {/* Subject for Reading */}
                    <div>
                      <label className="text-emerald-400 font-bold text-xs block mb-2" style={pixelText}>
                        LANGUAGE
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSubject('English')}
                          className={`py-3 px-4 rounded-lg border-2 font-bold text-sm transition-all ${
                            subject === 'English'
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-emerald-600/50'
                          }`}
                          style={pixelText}
                        >
                          🇬🇧 English (DSE Style)
                        </button>
                        <button
                          onClick={() => setSubject('Chinese')}
                          className={`py-3 px-4 rounded-lg border-2 font-bold text-sm transition-all ${
                            subject === 'Chinese'
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-emerald-600/50'
                          }`}
                          style={pixelText}
                        >
                          🇭🇰 Chinese (閱讀理解)
                        </button>
                      </div>
                    </div>

                    {/* Include Vocabulary */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeVocabulary"
                        checked={includeVocabulary}
                        onChange={(e) => setIncludeVocabulary(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <label htmlFor="includeVocabulary" className="text-slate-300 text-sm" style={pixelText}>
                        Include vocabulary list with definitions
                      </label>
                    </div>

                    <p className="text-slate-500 text-xs" style={pixelText}>
                      {subject === 'Chinese' 
                        ? '生成中文閱讀理解，包括：段意、詞意、主旨、推理題型'
                        : 'Generate English reading comprehension: main idea, details, inference, vocabulary'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Similar Mode - File Upload */}
              <AnimatePresence>
                {mode === 'similar' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-violet-400 font-bold text-xs block mb-2" style={pixelText}>
                        UPLOAD REFERENCE EXERCISES
                      </label>
                      
                      <FileUploadZone
                        onFilesSelect={handleFilesSelect}
                        files={uploadedFiles}
                        analyzing={analyzing}
                        analyzed={analyzed}
                      />
                      
                      {/* MISSION 51: File list with individual remove buttons */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {uploadedFiles.map((file, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-emerald-400 text-xs">📄</span>
                                <span className="text-slate-300 text-xs truncate" style={pixelText}>
                                  {file.name}
                                </span>
                                <span className="text-slate-500 text-xs" style={pixelText}>
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(idx);
                                }}
                                className="text-rose-400 hover:text-rose-300 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          
                          <div className="flex items-center justify-between">
                            <button
                              onClick={clearAllFiles}
                              className="text-rose-400 text-xs hover:text-rose-300 flex items-center gap-1"
                              style={pixelText}
                            >
                              <X className="w-3 h-3" /> Remove all
                            </button>
                            {autoDetected && (
                              <span className="text-emerald-400 text-xs flex items-center gap-1" style={pixelText}>
                                <Sparkles className="w-3 h-3" /> Auto-detected!
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-slate-500 text-xs mt-2" style={pixelText}>
                        Upload a PDF, image, or document containing exercises. AI will analyze and create similar ones.
                      </p>
                      <p className="text-slate-600 text-xs" style={pixelText}>
                        💡 Tip: Hold Ctrl/Cmd to select multiple images for multi-page worksheets
                      </p>
                    </div>

                    {/* Text fallback for similar mode */}
                    {uploadedFiles.length === 0 && (
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-slate-800 px-2 text-slate-400 text-xs" style={pixelText}>OR</span>
                        </div>
                      </div>
                    )}
                    
                    {uploadedFiles.length === 0 && (
                      <div>
                        <label className="text-slate-400 font-bold text-xs block mb-2" style={pixelText}>
                          PASTE EXERCISES MANUALLY
                        </label>
                        <textarea
                          value={referenceExercises}
                          onChange={(e) => setReferenceExercises(e.target.value)}
                          placeholder={`Paste example exercises here...`}
                          className="w-full h-32 bg-slate-900 border-2 border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-colors resize-none text-sm"
                          style={pixelText}
                        />
                      </div>
                    )}

                    {/* MISSION 56: Hide preserve pattern checkbox in reading mode */}
                    {mode !== 'reading' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="preservePattern"
                          checked={preservePattern}
                          onChange={(e) => setPreservePattern(e.target.checked)}
                          className="w-4 h-4 accent-violet-500"
                        />
                        <label htmlFor="preservePattern" className="text-slate-300 text-sm" style={pixelText}>
                          Strictly preserve the exact pattern from reference exercises
                        </label>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MISSION 56: Subject and Concept fields - Hidden in reading mode */}
              {mode !== 'reading' && (
                <>
                  {/* Subject */}
                  <div>
                    <label className="text-amber-400 font-bold text-xs block mb-2" style={pixelText}>
                      SUBJECT {autoDetected && <span className="text-emerald-400">(Auto-detected)</span>}
                    </label>
                    <select 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full bg-slate-900 border-2 rounded-lg p-3 text-white focus:border-amber-500 focus:outline-none transition-colors ${
                        autoDetected ? 'border-emerald-600/50' : 'border-slate-600'
                      }`}
                      style={pixelText}
                    >
                      <option value="">Select Subject</option>
                      <option value="English">English</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="History">History</option>
                      <option value="Science">Science</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Geography">Geography</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Concept */}
                  <div>
                    <label className="text-amber-400 font-bold text-xs block mb-2" style={pixelText}>
                      GRAMMAR / CONCEPT FOCUS {mode === 'similar' && !autoDetected && <span className="text-slate-500">(Optional if file uploaded)</span>}
                      {autoDetected && <span className="text-emerald-400 ml-1">(Auto-detected)</span>}
                    </label>
                    <input 
                      type="text"
                      placeholder={mode === 'similar' && uploadedFiles.length > 0 ? "Will be auto-detected from file..." : "e.g., past tense, fractions, photosynthesis"}
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      className={`w-full bg-slate-900 border-2 rounded-lg p-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors ${
                        autoDetected ? 'border-emerald-600/50' : 'border-slate-600'
                      }`}
                      style={pixelText}
                    />
                    <p className="text-slate-500 text-xs mt-1" style={pixelText}>
                      The specific skill or grammar point to practice
                    </p>
                  </div>
                </>
              )}

              {/* Number & Difficulty Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-amber-400 font-bold text-xs block mb-2" style={pixelText}>
                    QUESTIONS
                  </label>
                  <select 
                    value={numExercises}
                    onChange={(e) => setNumExercises(Number(e.target.value))}
                    className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                    style={pixelText}
                  >
                    <option value={5}>5 Questions (Fast)</option>
                    <option value={10}>10 Questions</option>
                    {mode === 'reading' && (
                      <option value={15}>15 Questions (Comprehensive)</option>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="text-amber-400 font-bold text-xs block mb-2" style={pixelText}>
                    DIFFICULTY
                  </label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                    style={pixelText}
                  >
                    <option value="easy">⭐ Easy</option>
                    <option value="medium">⭐⭐ Medium</option>
                    <option value="hard">⭐⭐⭐ Hard</option>
                  </select>
                </div>
              </div>

              {/* Generation Warning - MISSION 57: Updated timing for reading mode */}
              {(numExercises >= 10 || mode === 'reading') && (
                <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-3 mb-4">
                  <p className="text-amber-400 text-xs font-bold flex items-center gap-2" style={pixelText}>
                    <span>⏱️</span>
                    {mode === 'reading' 
                      ? 'Reading passages take 2-4 minutes. Please wait and don\'t close this page...'
                      : 'This may take 15-30 seconds. Please wait while AI writes your exercises...'}
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <PixelButton 
                variant={mode === 'similar' ? 'accent' : mode === 'reading' ? 'success' : 'gold'}
                onClick={generateExercises} 
                disabled={loading || analyzing}
                className="w-full mt-2"
                icon={loading ? null : mode === 'similar' ? Copy : mode === 'reading' ? null : Wand2}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      {mode === 'reading' ? '📖' : '✨'}
                    </motion.span>
                    <span className="flex flex-col items-start">
                      {mode === 'reading' ? (
                        // MISSION 57: Reading mode loading states (2-4 minutes)
                        <>
                          <span>
                            {loadingStatus === 'writing_passage' 
                              ? '📝 AI IS WRITING PASSAGE...' 
                              : '❓ CREATING COMPREHENSION QUESTIONS...'}
                          </span>
                          <span className="text-[10px] opacity-70 font-normal">
                            This may take 2-4 minutes • Please don't close this page
                          </span>
                        </>
                      ) : (
                        <>
                          <span>AI IS WRITING EXERCISES...</span>
                          <span className="text-[10px] opacity-70 font-normal">
                            This may take 15-30 seconds
                          </span>
                        </>
                      )}
                    </span>
                  </span>
                ) : mode === 'similar' ? (
                  'GENERATE SIMILAR EXERCISES'
                ) : mode === 'reading' ? (
                  '📖 GENERATE READING PRACTICE'
                ) : (
                  'GENERATE WORKSHEET'
                )}
              </PixelButton>
            </div>
          </PixelCard>
        )}

        {/* Generated Exercises */}
        {exercises && (
          <>
            {/* Fallback Notice */}
            {(exercises.isAutoGenerated || exercises._fallback) && (
              <div className="bg-amber-900/50 border border-amber-500 p-3 mb-4 rounded-lg no-print">
                <p className="text-amber-400 text-xs flex items-center justify-between" style={pixelText}>
                  <span className="flex items-center gap-2">
                    <span>⚠️</span>
                    AI generation timed out. Showing pre-made exercises instead.
                  </span>
                  <button 
                    onClick={() => {
                      setExercises(null);
                      generateExercises();
                    }} 
                    className="underline hover:text-white ml-2"
                  >
                    Retry
                  </button>
                </p>
              </div>
            )}

            {/* Print Version */}
            <div className="bg-white text-black p-8 rounded-lg shadow-2xl print:shadow-none print:p-0" id="exercise-sheet">
              {/* Header */}
              <div className="text-center mb-8 border-b-4 border-black pb-6">
                <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'serif' }}>
                  {exercises.isReadingComprehension 
                    ? `📖 ${exercises.subject === 'Chinese' ? '閱讀理解練習' : 'Reading Comprehension'}`
                    : (exercises.title || `${subject} Practice Worksheet`)}
                </h1>
                <div className="text-sm space-y-1" style={{ fontFamily: 'sans-serif' }}>
                  <p>
                    <strong>Subject:</strong> {exercises.subject || subject} 
                    {!exercises.isReadingComprehension && (
                      <span> | <strong>Focus:</strong> {exercises.concept || concept}</span>
                    )}
                    {exercises.isReadingComprehension && exercises.passageType && (
                      <span> | <strong>Type:</strong> {exercises.passageType}</span>
                    )}
                  </p>
                  <p>
                    <strong>Difficulty:</strong> {exercises.difficulty || difficulty} 
                    <span> | <strong>Total Questions:</strong> {exercises.questions?.length || 0}</span>
                    {exercises.wordCount && (
                      <span> | <strong>Word Count:</strong> {exercises.wordCount}</span>
                    )}
                  </p>
                  {exercises.basedOn && (
                    <p><em>Generated based on {exercises.basedOn} reference exercises</em></p>
                  )}
                  {exercises.autoDetected && (
                    <p className="text-emerald-600"><em>✨ Subject & concept auto-detected from document</em></p>
                  )}
                </div>
                
                {/* Student Info Fields */}
                <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-400">
                  <div className="flex justify-center gap-8 text-sm">
                    <span><strong>Name:</strong> _________________________</span>
                    <span><strong>Class:</strong> _______</span>
                    <span><strong>Date:</strong> _______</span>
                  </div>
                </div>
              </div>

              {/* MISSION 55: Reading Comprehension Display */}
              {exercises.isReadingComprehension ? (
                <>
                  {/* Passage Title */}
                  {exercises.title && (
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold" style={{ fontFamily: 'serif' }}>
                        {exercises.title}
                      </h2>
                      {exercises.wordCount && (
                        <p className="text-xs text-gray-500 mt-1">
                          ({exercises.wordCount} words)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reading Passage */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-8 border-2 border-gray-200">
                    <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">
                      📖 Reading Passage
                    </h3>
                    <div 
                      className="text-sm leading-relaxed text-justify"
                      style={{ fontFamily: 'serif', lineHeight: '1.8' }}
                    >
                      {exercises.passage?.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-4 indent-8">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Vocabulary List */}
                  {exercises.vocabulary && exercises.vocabulary.length > 0 && (
                    <div className="bg-amber-50 p-4 rounded-lg mb-8 border border-amber-200">
                      <h3 className="text-sm font-bold text-amber-800 mb-3">
                        📝 Vocabulary ({exercises.subject === 'Chinese' ? '詞彙' : 'Vocabulary'})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {exercises.vocabulary.map((v, idx) => (
                          <div key={idx} className="bg-white p-2 rounded border border-amber-100">
                            <span className="font-bold text-amber-900">{v.word}</span>
                            <span className="text-gray-600"> — {v.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm italic">
                    <strong>Instructions:</strong> {exercises.subject === 'Chinese' 
                      ? '閱讀以上文章，然後回答下列問題。請在選擇題中圈出正確答案。' 
                      : 'Read the passage above, then answer the questions below. Circle the correct letter for multiple choice questions.'}
                  </div>

                  {/* Reading Questions */}
                  <div className="space-y-6">
                    {exercises.questions?.map((q, idx) => (
                      <div key={idx} className="break-inside-avoid">
                        <p className="font-bold text-base mb-2" style={{ fontFamily: 'serif' }}>
                          <span className="text-emerald-600 text-sm mr-2">
                            [{q.type === 'main_idea' || q.type === '主旨' ? '主旨' :
                              q.type === 'detail' || q.type === '段意' ? '段意' :
                              q.type === 'vocabulary' || q.type === '詞意' ? '詞意' :
                              q.type === 'inference' || q.type === '推理' ? '推理' :
                              q.type === 'tone' || q.type === '語氣' ? '語氣' :
                              q.type === '賞析' ? '賞析' : '理解'}]
                          </span>
                          {idx + 1}. {q.question}
                        </p>
                        <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options?.map((option, i) => (
                            <p key={i} className="text-sm">
                              <span className="font-bold">{String.fromCharCode(65 + i)}.</span> {option.replace(/^[A-D]\.\s*/, '')}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Instructions */}
                  <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm italic">
                    <strong>Instructions:</strong> Read each question carefully. Write your answers clearly. 
                    For multiple choice, circle the correct letter. For fill-in-the-blanks, write the correct word(s).
                  </div>

                  {/* Questions */}
                  <div className="space-y-8">
                    {exercises.questions?.map((q, idx) => {
                      const hasChoices = q.choices && q.choices.length > 0;
                      const isFillBlank = q.type === 'fill_blank';
                      const isTrueFalse = q.answer === 'T' || q.answer === 'F' || 
                                         q.answer?.toString().toLowerCase() === 'true' || 
                                         q.answer?.toString().toLowerCase() === 'false';
                      
                      // MISSION 54: Get type icon
                      const typeIcon = q.type === 'multiple_choice' || (isFillBlank && hasChoices && !isTrueFalse) 
                        ? '🔘' 
                        : isTrueFalse 
                          ? '✓/✗' 
                          : q.type === 'match' 
                            ? '⇄' 
                            : q.type === 'error_correction'
                              ? '✏️'
                              : '✏️';
                      
                      return (
                        <div key={idx} className="break-inside-avoid">
                          <p className="font-bold text-base mb-3" style={{ fontFamily: 'serif' }}>
                            <span className="text-slate-500 mr-1">{typeIcon}</span>
                            {idx + 1}. {cleanQuestionText(q.question, hasChoices)}
                          </p>
                          {renderQuestion(q, idx)}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-xs text-gray-500">
                <p>Generated by StudyQuest Exercise Generator</p>
                <p>Good luck with your practice! 💪</p>
              </div>

              {/* Answer Key (New Page) */}
              <div className="mt-12 pt-8 border-t-4 border-dashed border-gray-400 page-break-before print:mt-0">
                <h3 className="text-xl font-bold mb-6 text-center" style={{ fontFamily: 'serif' }}>
                  ANSWER KEY (For Teacher Use Only)
                </h3>
                
                {exercises.isReadingComprehension ? (
                  // MISSION 55: Reading comprehension answer key with explanations
                  <div className="space-y-3 text-sm">
                    {exercises.questions?.map((q, idx) => (
                      <div key={idx} className="bg-gray-100 p-3 rounded">
                        <div className="flex items-start gap-2">
                          <span className="font-bold whitespace-nowrap">{idx + 1}.</span>
                          <div>
                            <span className="font-bold text-emerald-700">{q.answer}</span>
                            {q.explanation && (
                              <p className="text-xs text-gray-600 mt-1 italic">
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Standard answer key
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-4 text-sm">
                    {exercises.questions?.map((q, idx) => {
                      // MISSION 54: Format answer cleanly
                      let answerText = typeof q.answer === 'object' ? q.answer.text : q.answer;
                      // Clean duplicate prefixes and leading letter markers
                      answerText = cleanText(answerText).replace(/^[A-D]\.\s*/, '');
                      return (
                        <div key={idx} className="bg-gray-100 p-2 rounded">
                          <span className="font-bold">{idx + 1}.</span> {answerText}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-4 no-print">
              <PixelButton 
                variant="success" 
                onClick={handlePrint}
                icon={Printer}
              >
                🖨️ PRINT WORKSHEET
              </PixelButton>
              
              <PixelButton 
                variant="accent" 
                onClick={handleCopyReference}
                icon={Copy}
              >
                📋 COPY FOR SIMILAR MODE
              </PixelButton>
              
              <PixelButton 
                variant="secondary" 
                onClick={() => {
                  setExercises(null);
                  setError(null);
                }}
                icon={RotateCcw}
              >
                GENERATE NEW
              </PixelButton>
            </div>
          </>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 15mm;
          }
          
          .no-print { 
            display: none !important; 
          }
          
          #exercise-sheet { 
            background: white !important; 
            color: black !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          
          .page-break-before { 
            page-break-before: always; 
          }
          
          .break-inside-avoid { 
            break-inside: avoid; 
          }
          
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default ExerciseGenerator;
