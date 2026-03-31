import React, { useState, useRef, useCallback, useMemo } from 'react';
import { exerciseAPI } from '../../utils/api';
import { getUser } from '../../utils/auth';

// Pixel font style
const pixelFont = { fontFamily: "'Press Start 2P', monospace" };

// ============================================
// FILE UPLOAD ZONE COMPONENT
// ============================================
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
        relative border-4 border-dashed p-8 text-center cursor-pointer transition-all
        ${isDragging ? 'border-primary bg-primary/10' : ''}
        ${files.length > 0 ? 'border-tertiary bg-tertiary/10' : 'border-outline-variant hover:border-primary'}
        ${analyzing ? 'border-secondary bg-secondary/10' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png,.webp"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div className={`text-4xl mb-3 ${analyzing ? 'animate-spin' : ''}`}>
        {getFileIcon()}
      </div>
      
      {files.length > 0 ? (
        <div>
          <p className="text-tertiary font-bold text-xs" style={pixelFont}>
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </p>
          <p className="text-on-surface-variant text-[10px] mt-1" style={pixelFont}>
            {(files.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
          </p>
          {analyzing && (
            <p className="text-secondary text-xs mt-2" style={pixelFont}>
              🔍 ANALYZING...
            </p>
          )}
          {analyzed && (
            <p className="text-tertiary text-xs mt-2" style={pixelFont}>
              ✨ AUTO-DETECTED!
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-primary font-bold text-xs mb-1" style={pixelFont}>
            DROP FILES HERE
          </p>
          <p className="text-on-surface-variant text-[10px]" style={pixelFont}>
            OR CLICK TO BROWSE
          </p>
          <p className="text-on-surface-variant/60 text-[8px] mt-2" style={pixelFont}>
            PDF, DOCX, TXT, IMAGES
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// MODE TOGGLE COMPONENT
// ============================================
const ModeToggle = ({ mode, onChange }) => {
  const modes = [
    { id: 'original', label: 'ORIGINAL', icon: '✨', color: 'primary' },
    { id: 'similar', label: 'SIMILAR', icon: '📋', color: 'secondary' },
    { id: 'reading', label: 'READING', icon: '📖', color: 'tertiary' },
  ];

  return (
    <div className="flex gap-2 p-2 bg-surface-container border-2 border-outline-variant">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`flex-1 py-3 px-2 text-[10px] font-bold transition-all border-2 ${
            mode === m.id
              ? `bg-${m.color} text-on-${m.color} border-on-${m.color} shadow-[4px_4px_0px_0px_${m.color === 'primary' ? '#ff4a8d' : m.color === 'secondary' ? '#00f1fe' : '#e9c400'}]`
              : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary'
          }`}
          style={pixelFont}
        >
          <span className="block text-lg mb-1">{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const ExerciseGenerator = () => {
  const [mode, setMode] = useState('original');
  const [subject, setSubject] = useState('');
  const [concept, setConcept] = useState('');
  const [numExercises, setNumExercises] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [passageType, setPassageType] = useState('narrative');
  const [includeVocabulary, setIncludeVocabulary] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [extractedExercises, setExtractedExercises] = useState([]);
  const [autoDetected, setAutoDetected] = useState(false);
  const [referenceExercises, setReferenceExercises] = useState('');
  const [preservePattern, setPreservePattern] = useState(true);
  const [exercises, setExercises] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState(null);

  const user = useMemo(() => getUser(), []);

  // Handle file selection
  const handleFilesSelect = async (newFiles) => {
    const filesToAdd = newFiles.slice(0, 3 - uploadedFiles.length);
    const updatedFiles = [...uploadedFiles, ...filesToAdd].slice(0, 3);
    setUploadedFiles(updatedFiles);
    setAnalyzed(false);
    setAutoDetected(false);
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const result = await exerciseAPI.analyzeDocument(updatedFiles);
      
      if (result.data.success) {
        setSubject(result.data.subject || '');
        setConcept(result.data.concept || '');
        setDifficulty(result.data.difficulty || 'medium');
        setExtractedExercises(result.data.extractedExercises || []);
        setNumExercises(result.data.suggestedQuestionCount || 10);
        setAnalyzed(true);
        setAutoDetected(true);
      } else {
        setError(result.data.message || 'Failed to analyze document');
      }
    } catch (err) {
      setError('Failed to analyze document. Please try again.');
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
    // Validation
    if (mode === 'original') {
      if (!subject || !concept) {
        setError('Please fill in Subject and Grammar/Concept Focus');
        return;
      }
    } else if (mode === 'similar') {
      if (uploadedFiles.length === 0 && !referenceExercises.trim()) {
        setError('Please upload a document or paste reference exercises');
        return;
      }
    } else if (mode === 'reading') {
      if (!subject || !['English', 'Chinese'].includes(subject)) {
        setError('Please select English or Chinese for Reading mode');
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    setLoadingStatus(mode === 'reading' ? 'writing_passage' : '');
    
    const safeCount = Math.min(numExercises, 15);
    const timeoutDuration = mode === 'reading' ? 240000 : 60000;
    
    try {
      let res;
      
      if (mode === 'original') {
        res = await exerciseAPI.generate({
          subject,
          concept,
          numExercises: safeCount,
          difficulty
        });
      } else if (mode === 'reading') {
        setLoadingStatus('writing_passage');
        
        const startTime = Date.now();
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutDuration);
        });
        
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          console.log(`⏳ Reading generation... (${elapsed/1000}s)`);
        }, 30000);
        
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
        setLoadingStatus('creating_questions');
      } else {
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
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        setError(mode === 'reading' 
          ? '⏱️ Timeout: Reading passages take 2-4 minutes. Try with 5 questions.' 
          : 'Generation timed out. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handlePrint = () => window.print();

  const handleCopyReference = () => {
    if (exercises?.questions) {
      const text = exercises.questions.map((q, i) => {
        let questionText = `${i + 1}. ${q.question}`;
        if (q.choices) {
          questionText += '\n' + q.choices.map((c, idx) => `   ${String.fromCharCode(65 + idx)}. ${c}`).join('\n');
        }
        questionText += `\n   Answer: ${typeof q.answer === 'object' ? q.answer.text : q.answer}`;
        return questionText;
      }).join('\n\n');
      
      navigator.clipboard.writeText(text);
      alert('Exercises copied! You can paste them in "Similar Practice" mode.');
    }
  };

  // Helper functions for display
  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/([A-D])\.\s*\1\.\s*/g, '$1. ').trim();
  };

  const cleanQuestionText = (question, hasChoices) => {
    if (!question) return '';
    let cleaned = cleanText(question);
    if (hasChoices) {
      cleaned = cleaned.replace(/\s*[A-D]\.\s*[^A-D]+(?:[A-D]\.\s*[^A-D]+)*$/g, '');
    }
    return cleaned.trim();
  };

  const formatChoice = (choice, index) => {
    const letter = String.fromCharCode(65 + index);
    const text = typeof choice === 'object' ? choice.text : choice;
    const cleanedText = cleanText(text).replace(/^[A-D]\.\s*/, '');
    return `${letter}. ${cleanedText}`;
  };

  // Render different question types
  const renderQuestion = (q, idx) => {
    const hasChoices = q.choices && q.choices.length > 0;
    const isTrueFalse = q.answer === 'T' || q.answer === 'F' || 
                       q.answer?.toString().toLowerCase() === 'true' || 
                       q.answer?.toString().toLowerCase() === 'false';
    
    switch (q.type) {
      case 'fill_blank':
        if (isTrueFalse) {
          return (
            <div className="ml-4 flex items-baseline gap-3">
              <span className="text-sm leading-relaxed flex-1">{cleanQuestionText(q.question, false)}</span>
              <span className="text-sm font-bold whitespace-nowrap">( ______ )</span>
            </div>
          );
        }
        
        if (hasChoices) {
          return (
            <div className="ml-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {q.choices.map((choice, i) => (
                  <span key={i} className="whitespace-nowrap">{formatChoice(choice, i)}</span>
                ))}
              </div>
            </div>
          );
        }
        
        return (
          <div className="ml-4 space-y-2">
            {q.items?.map((item, i) => (
              <p key={i} className="text-sm leading-relaxed">{i + 1}. {cleanText(item.sentence)}</p>
            ))}
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {q.choices?.map((choice, i) => (
              <p key={i} className="text-sm">{formatChoice(choice, i)}</p>
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
        
      default:
        return (
          <div className="ml-4">
            <p className="text-sm">Answer: <span className="border-b border-black inline-block min-w-[200px]"></span></p>
          </div>
        );
    }
  };

  // Section card component
  const SectionCard = ({ children, title, className = '' }) => (
    <div className={`bg-surface-container-high border-4 border-outline-variant shadow-[8px_8px_0px_0px_#150136] ${className}`}>
      {title && (
        <div className="bg-surface-container border-b-4 border-outline-variant p-4">
          <h2 className="text-sm font-bold text-on-surface" style={pixelFont}>{title}</h2>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-surface-container-high border-4 border-secondary shadow-[8px_8px_0px_0px_#00f1fe] mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-secondary to-secondary-container p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border-4 border-on-secondary flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-on-secondary" style={pixelFont}>
                    EXERCISE GEN
                  </h1>
                  <p className="text-on-secondary/80 text-xs" style={pixelFont}>
                    Create Practice Worksheets
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4 text-on-secondary">
                <div className="text-center">
                  <div className="text-xs opacity-80" style={pixelFont}>MODE</div>
                  <div className="text-lg font-bold uppercase" style={pixelFont}>{mode}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!exercises ? (
          <SectionCard title="⚙️ CONFIGURE WORKSHEET">
            {error && (
              <div className="mb-4 p-4 bg-error/10 border-4 border-error">
                <p className="text-error text-xs" style={pixelFont}>❌ {error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div>
                <label className="text-secondary text-[10px] block mb-2" style={pixelFont}>
                  GENERATION MODE
                </label>
                <ModeToggle mode={mode} onChange={(newMode) => {
                  setMode(newMode);
                  clearAllFiles();
                  if (newMode === 'reading') setSubject('English');
                }} />
                <p className="text-on-surface-variant text-[10px] mt-2" style={pixelFont}>
                  {mode === 'original' ? 'Generate brand new exercises' : 
                   mode === 'reading' ? '📖 Reading comprehension passages' : 
                   'Create exercises from your files'}
                </p>
              </div>

              {/* Reading Mode Settings */}
              {mode === 'reading' && (
                <div className="bg-tertiary/10 border-4 border-tertiary p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📖</span>
                    <span className="text-tertiary font-bold text-xs" style={pixelFont}>READING MODE</span>
                  </div>
                  
                  {/* Language Selection */}
                  <div className="mb-4">
                    <label className="text-tertiary text-[10px] block mb-2" style={pixelFont}>LANGUAGE</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['English', 'Chinese'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSubject(lang)}
                          className={`py-3 px-4 border-4 text-xs transition-all ${
                            subject === lang
                              ? 'bg-tertiary text-on-tertiary border-on-tertiary shadow-[4px_4px_0px_0px_#e9c400]'
                              : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-tertiary'
                          }`}
                          style={pixelFont}
                        >
                          {lang === 'English' ? '🇬🇧 ENGLISH' : '🇭🇰 CHINESE'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Passage Type */}
                  <div className="mb-4">
                    <label className="text-tertiary text-[10px] block mb-2" style={pixelFont}>PASSAGE TYPE</label>
                    <select
                      value={passageType}
                      onChange={(e) => setPassageType(e.target.value)}
                      className="w-full bg-surface-container-lowest border-4 border-outline-variant p-3 text-on-surface focus:border-tertiary focus:outline-none"
                      style={pixelFont}
                    >
                      <option value="narrative">📖 NARRATIVE (Story)</option>
                      <option value="argumentative">💬 ARGUMENTATIVE (Debate)</option>
                      <option value="descriptive">🎨 DESCRIPTIVE</option>
                      <option value="expository">📚 EXPOSITORY (Informative)</option>
                      {subject === 'Chinese' && <option value="classical">📜 CLASSICAL (文言文)</option>}
                    </select>
                  </div>

                  {/* Vocabulary Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="includeVocabulary"
                      checked={includeVocabulary}
                      onChange={(e) => setIncludeVocabulary(e.target.checked)}
                      className="w-4 h-4 accent-tertiary"
                    />
                    <label htmlFor="includeVocabulary" className="text-on-surface text-xs" style={pixelFont}>
                      Include vocabulary list
                    </label>
                  </div>
                </div>
              )}

              {/* Similar Mode - File Upload */}
              {mode === 'similar' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-secondary text-[10px] block mb-2" style={pixelFont}>
                      UPLOAD REFERENCE FILES
                    </label>
                    <FileUploadZone
                      onFilesSelect={handleFilesSelect}
                      files={uploadedFiles}
                      analyzing={analyzing}
                      analyzed={analyzed}
                    />
                    
                    {/* File List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedFiles.map((file, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between bg-surface-container border-2 border-outline-variant p-3"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-tertiary text-xs">📄</span>
                              <span className="text-on-surface text-xs truncate" style={pixelFont}>
                                {file.name}
                              </span>
                              <span className="text-on-surface-variant text-[10px]" style={pixelFont}>
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                              className="text-error hover:text-red-400 px-2"
                              style={pixelFont}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={clearAllFiles}
                            className="text-error text-xs hover:text-red-400"
                            style={pixelFont}
                          >
                            🗑️ REMOVE ALL
                          </button>
                          {autoDetected && (
                            <span className="text-tertiary text-xs" style={pixelFont}>
                              ✨ AUTO-DETECTED!
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual Input Fallback */}
                  {uploadedFiles.length === 0 && (
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1 h-px bg-outline-variant" />
                        <span className="text-on-surface-variant text-[10px]" style={pixelFont}>OR</span>
                        <div className="flex-1 h-px bg-outline-variant" />
                      </div>
                      <label className="text-on-surface-variant text-[10px] block mb-2" style={pixelFont}>
                        PASTE EXERCISES MANUALLY
                      </label>
                      <textarea
                        value={referenceExercises}
                        onChange={(e) => setReferenceExercises(e.target.value)}
                        placeholder="Paste example exercises here..."
                        className="w-full h-32 bg-surface-container-lowest border-4 border-outline-variant p-3 text-on-surface placeholder-on-surface-variant focus:border-secondary focus:outline-none resize-none text-xs"
                        style={pixelFont}
                      />
                    </div>
                  )}

                  {/* Preserve Pattern Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="preservePattern"
                      checked={preservePattern}
                      onChange={(e) => setPreservePattern(e.target.checked)}
                      className="w-4 h-4 accent-secondary"
                    />
                    <label htmlFor="preservePattern" className="text-on-surface text-xs" style={pixelFont}>
                      Strictly preserve the exact pattern
                    </label>
                  </div>
                </div>
              )}

              {/* Subject & Concept (Not in Reading Mode) */}
              {mode !== 'reading' && (
                <>
                  <div>
                    <label className="text-secondary text-[10px] block mb-2" style={pixelFont}>
                      SUBJECT {autoDetected && <span className="text-tertiary">(AUTO)</span>}
                    </label>
                    <select 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full bg-surface-container-lowest border-4 p-3 text-on-surface focus:border-secondary focus:outline-none ${
                        autoDetected ? 'border-tertiary' : 'border-outline-variant'
                      }`}
                      style={pixelFont}
                    >
                      <option value="">SELECT SUBJECT</option>
                      <option value="English">ENGLISH</option>
                      <option value="Mathematics">MATHEMATICS</option>
                      <option value="History">HISTORY</option>
                      <option value="Science">SCIENCE</option>
                      <option value="Chinese">CHINESE</option>
                      <option value="Geography">GEOGRAPHY</option>
                      <option value="Other">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-secondary text-[10px] block mb-2" style={pixelFont}>
                      CONCEPT / GRAMMAR FOCUS {autoDetected && <span className="text-tertiary">(AUTO)</span>}
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g., past tense, fractions..."
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      className={`w-full bg-surface-container-lowest border-4 p-3 text-on-surface placeholder-on-surface-variant focus:border-secondary focus:outline-none ${
                        autoDetected ? 'border-tertiary' : 'border-outline-variant'
                      }`}
                      style={pixelFont}
                    />
                  </div>
                </>
              )}

              {/* Number & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-secondary text-[10px] block mb-2" style={pixelFont}>QUESTIONS</label>
                  <select 
                    value={numExercises}
                    onChange={(e) => setNumExercises(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest border-4 border-outline-variant p-3 text-on-surface focus:border-secondary focus:outline-none"
                    style={pixelFont}
                  >
                    <option value={5}>5 (FAST)</option>
                    <option value={10}>10</option>
                    {mode === 'reading' && <option value={15}>15</option>}
                  </select>
                </div>
                
                <div>
                  <label className="text-secondary text-[10px] block mb-2" style={pixelFont}>DIFFICULTY</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-surface-container-lowest border-4 border-outline-variant p-3 text-on-surface focus:border-secondary focus:outline-none"
                    style={pixelFont}
                  >
                    <option value="easy">⭐ EASY</option>
                    <option value="medium">⭐⭐ MEDIUM</option>
                    <option value="hard">⭐⭐⭐ HARD</option>
                  </select>
                </div>
              </div>

              {/* Time Warning */}
              {(numExercises >= 10 || mode === 'reading') && (
                <div className="bg-secondary/10 border-4 border-secondary p-3">
                  <p className="text-secondary text-[10px]" style={pixelFont}>
                    ⏱️ {mode === 'reading' 
                      ? 'Reading passages take 2-4 minutes. Please wait...' 
                      : 'This may take 15-30 seconds. Please wait...'}
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <button 
                onClick={generateExercises}
                disabled={loading || analyzing}
                className={`w-full py-4 border-4 text-sm transition-all ${
                  loading || analyzing
                    ? 'bg-surface-container text-on-surface-variant border-outline-variant cursor-not-allowed'
                    : mode === 'similar' 
                      ? 'bg-secondary text-on-secondary border-on-secondary shadow-[4px_4px_0px_0px_#00f1fe] hover:shadow-[2px_2px_0px_0px_#00f1fe] hover:translate-x-[2px] hover:translate-y-[2px]'
                      : mode === 'reading'
                        ? 'bg-tertiary text-on-tertiary border-on-tertiary shadow-[4px_4px_0px_0px_#e9c400] hover:shadow-[2px_2px_0px_0px_#e9c400] hover:translate-x-[2px] hover:translate-y-[2px]'
                        : 'bg-primary text-on-primary border-on-primary shadow-[4px_4px_0px_0px_#ff4a8d] hover:shadow-[2px_2px_0px_0px_#ff4a8d] hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
                style={pixelFont}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="animate-spin">⏳</span>
                    <span className="flex flex-col items-start">
                      <span>{mode === 'reading' ? 'WRITING PASSAGE...' : 'GENERATING...'}</span>
                      {mode === 'reading' && (
                        <span className="text-[8px] opacity-70">2-4 minutes • Don't close</span>
                      )}
                    </span>
                  </span>
                ) : (
                  <>
                    {mode === 'similar' && '📋 '}
                    {mode === 'reading' && '📖 '}
                    {mode === 'original' && '✨ '}
                    GENERATE
                    {mode === 'reading' && ' READING'}
                  </>
                )}
              </button>
            </div>
          </SectionCard>
        ) : (
          /* Generated Exercises Display */
          <>
            {/* Fallback Notice */}
            {(exercises.isAutoGenerated || exercises._fallback) && (
              <div className="bg-tertiary/10 border-4 border-tertiary p-3 mb-4 no-print">
                <p className="text-tertiary text-xs flex items-center justify-between" style={pixelFont}>
                  <span>⚠️ AI timed out. Showing pre-made exercises.</span>
                  <button onClick={() => { setExercises(null); generateExercises(); }} className="underline">
                    RETRY
                  </button>
                </p>
              </div>
            )}

            {/* Print Version */}
            <div className="bg-white text-black p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000] print:shadow-none print:border-0" id="exercise-sheet">
              {/* Header */}
              <div className="text-center mb-8 border-b-4 border-black pb-6">
                <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'serif' }}>
                  {exercises.isReadingComprehension 
                    ? `📖 ${exercises.subject === 'Chinese' ? '閱讀理解練習' : 'Reading Comprehension'}`
                    : (exercises.title || `${subject} Practice`)}
                </h1>
                <div className="text-sm space-y-1" style={{ fontFamily: 'sans-serif' }}>
                  <p>
                    <strong>Subject:</strong> {exercises.subject || subject} 
                    {!exercises.isReadingComprehension && <span> | <strong>Focus:</strong> {exercises.concept || concept}</span>}
                  </p>
                  <p><strong>Difficulty:</strong> {exercises.difficulty || difficulty} | <strong>Questions:</strong> {exercises.questions?.length || 0}</p>
                  {exercises.wordCount && <span> | <strong>Words:</strong> {exercises.wordCount}</span>}
                  {exercises.autoDetected && <p className="text-green-600"><em>✨ Auto-detected from document</em></p>}
                </div>
                
                {/* Student Info */}
                <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-400">
                  <div className="flex justify-center gap-8 text-sm">
                    <span><strong>Name:</strong> _______________</span>
                    <span><strong>Class:</strong> _______</span>
                    <span><strong>Date:</strong> _______</span>
                  </div>
                </div>
              </div>

              {/* Reading Comprehension Layout */}
              {exercises.isReadingComprehension ? (
                <>
                  {exercises.title && (
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold" style={{ fontFamily: 'serif' }}>{exercises.title}</h2>
                    </div>
                  )}

                  {/* Passage */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-8 border-2 border-gray-200">
                    <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase">📖 Reading Passage</h3>
                    <div className="text-sm leading-relaxed text-justify" style={{ fontFamily: 'serif', lineHeight: '1.8' }}>
                      {exercises.passage?.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-4 indent-8">{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  {/* Vocabulary */}
                  {exercises.vocabulary && exercises.vocabulary.length > 0 && (
                    <div className="bg-amber-50 p-4 rounded-lg mb-8 border border-amber-200">
                      <h3 className="text-sm font-bold text-amber-800 mb-3">📝 Vocabulary</h3>
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
                      ? '閱讀以上文章，然後回答下列問題。' 
                      : 'Read the passage, then answer the questions below.'}
                  </div>

                  {/* Questions */}
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
                /* Standard Exercise Layout */
                <>
                  <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm italic">
                    <strong>Instructions:</strong> Read each question carefully. Write your answers clearly.
                  </div>

                  <div className="space-y-8">
                    {exercises.questions?.map((q, idx) => {
                      const hasChoices = q.choices && q.choices.length > 0;
                      const isFillBlank = q.type === 'fill_blank';
                      const isTrueFalse = q.answer === 'T' || q.answer === 'F' || 
                                         q.answer?.toString().toLowerCase() === 'true' || 
                                         q.answer?.toString().toLowerCase() === 'false';
                      
                      const typeIcon = q.type === 'multiple_choice' || (isFillBlank && hasChoices && !isTrueFalse) 
                        ? '🔘' 
                        : isTrueFalse 
                          ? '✓/✗' 
                          : q.type === 'match' 
                            ? '⇄' 
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
                <p>Generated by StudyQuest</p>
                <p>Good luck! 💪</p>
              </div>

              {/* Answer Key */}
              <div className="mt-12 pt-8 border-t-4 border-dashed border-gray-400 page-break-before print:mt-0">
                <h3 className="text-xl font-bold mb-6 text-center" style={{ fontFamily: 'serif' }}>
                  ANSWER KEY (Teacher Use Only)
                </h3>
                
                {exercises.isReadingComprehension ? (
                  <div className="space-y-3 text-sm">
                    {exercises.questions?.map((q, idx) => (
                      <div key={idx} className="bg-gray-100 p-3 rounded">
                        <div className="flex items-start gap-2">
                          <span className="font-bold whitespace-nowrap">{idx + 1}.</span>
                          <div>
                            <span className="font-bold text-emerald-700">{q.answer}</span>
                            {q.explanation && <p className="text-xs text-gray-600 mt-1 italic">{q.explanation}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-4 text-sm">
                    {exercises.questions?.map((q, idx) => {
                      let answerText = typeof q.answer === 'object' ? q.answer.text : q.answer;
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
              <button 
                onClick={handlePrint}
                className="px-6 py-3 bg-tertiary text-on-tertiary border-4 border-on-tertiary shadow-[4px_4px_0px_0px_#e9c400] hover:shadow-[2px_2px_0px_0px_#e9c400] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs"
                style={pixelFont}
              >
                🖨️ PRINT
              </button>
              
              <button 
                onClick={handleCopyReference}
                className="px-6 py-3 bg-secondary text-on-secondary border-4 border-on-secondary shadow-[4px_4px_0px_0px_#00f1fe] hover:shadow-[2px_2px_0px_0px_#00f1fe] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs"
                style={pixelFont}
              >
                📋 COPY
              </button>
              
              <button 
                onClick={() => { setExercises(null); setError(null); }}
                className="px-6 py-3 bg-surface-container text-on-surface border-4 border-outline-variant hover:bg-surface-container-high transition-all text-xs"
                style={pixelFont}
              >
                🔄 NEW
              </button>
            </div>
          </>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page { margin: 15mm; }
          .no-print { display: none !important; }
          #exercise-sheet { 
            background: white !important; 
            color: black !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .page-break-before { page-break-before: always; }
          .break-inside-avoid { break-inside: avoid; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default ExerciseGenerator;
