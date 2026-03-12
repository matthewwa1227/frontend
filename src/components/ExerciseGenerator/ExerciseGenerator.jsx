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

// Mode Toggle Component
const ModeToggle = ({ mode, onChange }) => (
  <div className="flex gap-2 p-1 bg-slate-900 rounded-lg border-2 border-slate-600">
    <button
      onClick={() => onChange('original')}
      className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${
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
      className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${
        mode === 'similar'
          ? 'bg-violet-600 text-white shadow-lg'
          : 'text-slate-400 hover:text-white'
      }`}
      style={pixelText}
    >
      📋 SIMILAR PRACTICE
    </button>
  </div>
);

// File Upload Component
const FileUploadZone = ({ onFileSelect, file, analyzing, analyzed }) => {
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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileSelect(droppedFile);
  }, [onFileSelect]);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) onFileSelect(selectedFile);
  };

  const getFileIcon = () => {
    if (analyzing) return '⏳';
    if (analyzed) return '✅';
    if (file) return '📄';
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
        ${file ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600 hover:border-slate-500'}
        ${analyzing ? 'border-amber-500 bg-amber-500/10' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
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
      
      {file ? (
        <div>
          <p className="text-emerald-400 font-bold" style={pixelText}>{file.name}</p>
          <p className="text-slate-400 text-xs mt-1" style={pixelText}>
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          {analyzing && (
            <p className="text-amber-400 text-sm mt-2" style={pixelText}>
              🔍 Analyzing document...
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
            Drop file here or click to browse
          </p>
          <p className="text-slate-500 text-xs" style={pixelText}>
            PDF, DOCX, TXT, MD, or Images (JPG, PNG, WebP)
          </p>
          <p className="text-slate-600 text-xs mt-1" style={pixelText}>
            Max 10MB
          </p>
        </div>
      )}
    </div>
  );
};

const ExerciseGenerator = () => {
  // Mode: 'original' or 'similar'
  const [mode, setMode] = useState('original');
  
  // Common fields
  const [subject, setSubject] = useState('');
  const [concept, setConcept] = useState('');
  const [numExercises, setNumExercises] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
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
  const [error, setError] = useState(null);

  // Handle file selection and analysis
  const handleFileSelect = async (file) => {
    setUploadedFile(file);
    setAnalyzed(false);
    setAutoDetected(false);
    
    // Analyze the document
    setAnalyzing(true);
    setError(null);
    
    try {
      const result = await exerciseAPI.analyzeDocument(file);
      
      if (result.data.success) {
        // Auto-fill the fields
        setSubject(result.data.subject || '');
        setConcept(result.data.concept || '');
        setDifficulty(result.data.difficulty || 'medium');
        setExtractedExercises(result.data.extractedExercises || []);
        setNumExercises(result.data.suggestedQuestionCount || 10);
        setAnalyzed(true);
        setAutoDetected(true);
        
        console.log(`✅ Analyzed: ${result.data.subject} - ${result.data.concept}`);
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

  const clearFile = () => {
    setUploadedFile(null);
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
    } else {
      // Similar mode - either file or text required
      if (!uploadedFile && !referenceExercises.trim()) {
        setError('Please upload a document or paste reference exercises');
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let res;
      
      if (mode === 'original') {
        // Original mode - use standard endpoint
        res = await exerciseAPI.generate({
          subject,
          concept,
          numExercises,
          difficulty
        });
      } else {
        // Similar mode - use file upload endpoint
        res = await exerciseAPI.generateSimilar({
          document: uploadedFile,
          subject,
          concept,
          numExercises,
          difficulty,
          preservePattern,
          referenceExercises: extractedExercises.length > 0 
            ? JSON.stringify(extractedExercises) 
            : referenceExercises
        });
      }
      
      setExercises(res.data);
      console.log(`✅ Generated ${res.data.questions?.length || 0} exercises`);
    } catch (err) {
      console.error('Failed to generate exercises:', err);
      setError(err.response?.data?.message || 'Failed to generate exercises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReference = () => {
    if (exercises?.questions) {
      const text = exercises.questions.map((q, i) => {
        let questionText = `${i + 1}. ${q.question}`;
        if (q.choices) {
          questionText += '\n' + q.choices.map((c, idx) => `   ${String.fromCharCode(65 + idx)}. ${c}`).join('\n');
        }
        if (q.items) {
          questionText += '\n' + q.items.map(item => `   - ${item.sentence}`).join('\n');
        }
        questionText += `\n   Answer: ${q.answer}`;
        return questionText;
      }).join('\n\n');
      
      navigator.clipboard.writeText(text);
      alert('Exercises copied! You can paste them in "Similar Practice" mode to generate more like these.');
    }
  };

  // Sample exercise structure for preview
  const renderQuestion = (q, idx) => {
    switch (q.type) {
      case 'fill_blank':
        return (
          <div className="ml-4 space-y-2">
            {q.items?.map((item, i) => (
              <p key={i} className="text-sm leading-relaxed">
                {i + 1}. {item.sentence}
              </p>
            ))}
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {q.choices?.map((choice, i) => (
              <p key={i} className="text-sm">
                <span className="font-bold">{String.fromCharCode(65 + i)}.</span> {choice}
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
              <div className="mb-4 p-3 bg-rose-900/50 border border-rose-500 rounded-lg text-rose-300 text-sm" style={pixelText}>
                {error}
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
                  clearFile();
                }} />
                <p className="text-slate-500 text-xs mt-1" style={pixelText}>
                  {mode === 'original' 
                    ? 'Generate brand new exercises based on your settings' 
                    : 'Create exercises similar to your uploaded document'}
                </p>
              </div>

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
                        onFileSelect={handleFileSelect}
                        file={uploadedFile}
                        analyzing={analyzing}
                        analyzed={analyzed}
                      />
                      
                      {uploadedFile && (
                        <div className="mt-2 flex items-center justify-between">
                          <button
                            onClick={clearFile}
                            className="text-rose-400 text-xs hover:text-rose-300 flex items-center gap-1"
                            style={pixelText}
                          >
                            <X className="w-3 h-3" /> Remove file
                          </button>
                          {autoDetected && (
                            <span className="text-emerald-400 text-xs flex items-center gap-1" style={pixelText}>
                              <Sparkles className="w-3 h-3" /> Auto-detected!
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-slate-500 text-xs mt-2" style={pixelText}>
                        Upload a PDF, image, or document containing exercises. AI will analyze and create similar ones.
                      </p>
                    </div>

                    {/* Text fallback for similar mode */}
                    {!uploadedFile && (
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-slate-800 px-2 text-slate-400 text-xs" style={pixelText}>OR</span>
                        </div>
                      </div>
                    )}
                    
                    {!uploadedFile && (
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
                  </motion.div>
                )}
              </AnimatePresence>

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
                  placeholder={mode === 'similar' && uploadedFile ? "Will be auto-detected from file..." : "e.g., past tense, fractions, photosynthesis"}
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
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
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

              {/* Generate Button */}
              <PixelButton 
                variant={mode === 'similar' ? 'accent' : 'gold'}
                onClick={generateExercises} 
                disabled={loading || analyzing}
                className="w-full mt-4"
                icon={loading ? null : mode === 'similar' ? Copy : Wand2}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⏳
                    </motion.span>
                    GENERATING...
                  </span>
                ) : mode === 'similar' ? (
                  'GENERATE SIMILAR EXERCISES'
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
            {/* Print Version */}
            <div className="bg-white text-black p-8 rounded-lg shadow-2xl print:shadow-none print:p-0" id="exercise-sheet">
              {/* Header */}
              <div className="text-center mb-8 border-b-4 border-black pb-6">
                <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'serif' }}>
                  {exercises.title || `${subject} Practice Worksheet`}
                </h1>
                <div className="text-sm space-y-1" style={{ fontFamily: 'sans-serif' }}>
                  <p><strong>Subject:</strong> {exercises.subject || subject} | <strong>Focus:</strong> {exercises.concept || concept}</p>
                  <p><strong>Difficulty:</strong> {exercises.difficulty || difficulty} | <strong>Total Questions:</strong> {exercises.questions?.length || 0}</p>
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

              {/* Instructions */}
              <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm italic">
                <strong>Instructions:</strong> Read each question carefully. Write your answers clearly. 
                For multiple choice, circle the correct letter. For fill-in-the-blanks, write the correct word(s).
              </div>

              {/* Questions */}
              <div className="space-y-8">
                {exercises.questions?.map((q, idx) => (
                  <div key={idx} className="break-inside-avoid">
                    <p className="font-bold text-base mb-3" style={{ fontFamily: 'serif' }}>
                      {idx + 1}. {q.question}
                    </p>
                    {renderQuestion(q, idx)}
                  </div>
                ))}
              </div>

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
                <div className="grid grid-cols-4 md:grid-cols-5 gap-4 text-sm">
                  {exercises.questions?.map((q, idx) => (
                    <div key={idx} className="bg-gray-100 p-2 rounded">
                      <span className="font-bold">{idx + 1}.</span> {q.answer}
                    </div>
                  ))}
                </div>
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
