import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, BookOpen, Brain, ChevronRight, CheckCircle,
  X, Loader2, Trophy, MessageSquare, Link, ArrowLeft, Sparkles,
  Target, Lightbulb, DocumentText, Clock
} from 'lucide-react';
import { revisionAPI } from '../../utils/api';

const pixelText = { fontFamily: 'monospace' };

// ============================================
// PIXEL COMPONENTS
// ============================================
const PixelCard = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-800 border-slate-600',
    primary: 'bg-blue-900 border-blue-600',
    success: 'bg-emerald-900 border-emerald-600',
    gold: 'bg-amber-900 border-amber-600'
  };
  
  return (
    <div className={`${variants[variant]} border-4 border-b-slate-900 border-r-slate-900 ${className}`}>
      {children}
    </div>
  );
};

const PixelButton = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-400 border-blue-700 text-white',
    success: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-700 text-white',
    ghost: 'bg-slate-700 hover:bg-slate-600 border-slate-800 text-slate-200',
    gold: 'bg-amber-500 hover:bg-amber-400 border-amber-700 text-amber-950'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95, y: 2 }}
      className={`${variants[variant]} px-5 py-3 text-sm border-b-4 border-r-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${className}`}
      style={pixelText}
    >
      {children}
    </motion.button>
  );
};

// ============================================
// UPLOAD SCREEN
// ============================================
const UploadScreen = ({ onDocumentUploaded, onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    const allowedTypes = ['.txt', '.md', '.pdf', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      setError('Please upload a TXT, MD, PDF, or DOCX file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max size is 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await revisionAPI.uploadDocument(file);
      if (response.data.success) {
        onDocumentUploaded(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim() || !urlInput.startsWith('http')) {
      setError('Please enter a valid URL');
      return;
    }

    setFetchingUrl(true);
    setError(null);

    try {
      const response = await revisionAPI.fetchUrl(urlInput);
      if (response.data.success) {
        // Create a virtual document from URL content
        onDocumentUploaded({
          documentId: 'url-' + Date.now(),
          title: response.data.title,
          wordCount: response.data.wordCount,
          isUrl: true,
          urlContent: response.data.content,
          url: urlInput
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch URL');
    } finally {
      setFetchingUrl(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
          <div>
            <h1 className="text-amber-400 text-xl font-bold" style={{ ...pixelText, textShadow: '2px 2px 0 #000' }}>
              📚 REVISION MODE
            </h1>
            <p className="text-slate-400 text-xs" style={pixelText}>Upload notes to generate quizzes</p>
          </div>
        </div>

        {/* URL Input */}
        <PixelCard className="p-4 mb-4" variant="primary">
          <div className="flex items-center gap-2 mb-3">
            <Link className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-xs font-bold" style={pixelText}>FETCH FROM URL</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              className="flex-1 bg-slate-900 border-2 border-slate-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              style={pixelText}
            />
            <button
              onClick={handleFetchUrl}
              disabled={fetchingUrl}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white border-b-4 border-blue-800 disabled:opacity-50"
              style={pixelText}
            >
              {fetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : 'FETCH'}
            </button>
          </div>
        </PixelCard>

        <div className="text-center text-slate-500 text-xs my-4" style={pixelText}>— OR —</div>

        {/* File Upload */}
        <motion.div
          className={`border-4 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".txt,.md,.pdf,.docx"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          
          {uploading ? (
            <div className="py-4">
              <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-3 animate-spin" />
              <p className="text-blue-400 text-sm" style={pixelText}>UPLOADING...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-white text-sm mb-2" style={pixelText}>DROP FILE OR CLICK</p>
              <p className="text-slate-500 text-xs" style={pixelText}>
                TXT, MD, PDF, DOCX (max 10MB)
              </p>
            </>
          )}
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-rose-900/50 border-2 border-rose-600 text-rose-400 text-xs text-center"
            style={pixelText}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Tips */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span style={pixelText}>Works best with study notes, articles, or textbook chapters</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Brain className="w-4 h-4 text-blue-400" />
            <span style={pixelText}>AI will generate questions based on key concepts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// QUIZ SCREEN
// ============================================
const QuizScreen = ({ quiz, documentInfo, onBack }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQuestion = quiz.questions[currentQIndex];

  const handleSelect = (choice, index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setIsCorrect(choice.correct);
    setShowResult(true);
    if (choice.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center w-full max-w-sm">
          <div className="text-6xl mb-4">{percentage >= 70 ? '🏆' : percentage >= 50 ? '🥈' : '📚'}</div>
          <h1 className="text-emerald-400 text-xl font-bold mb-4" style={{ ...pixelText, textShadow: '2px 2px 0 #000' }}>
            REVISION COMPLETE!
          </h1>
          
          <PixelCard className="p-6 mb-6" variant="success">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400" style={pixelText}>{score}/{quiz.questions.length}</p>
                <p className="text-slate-500 text-xs" style={pixelText}>CORRECT</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400" style={pixelText}>{percentage}%</p>
                <p className="text-slate-500 text-xs" style={pixelText}>SCORE</p>
              </div>
            </div>
            
            {percentage >= 70 && (
              <p className="text-emerald-400 text-xs text-center" style={pixelText}>
                ✨ Great job! You've mastered this material!
              </p>
            )}
          </PixelCard>

          <div className="space-y-2">
            <PixelButton onClick={onBack} variant="success" className="w-full">
              <ArrowLeft className="w-4 h-4" />
              REVISE ANOTHER TOPIC
            </PixelButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="text-center flex-1">
          <p className="text-white text-xs truncate max-w-[200px] mx-auto" style={pixelText}>
            {documentInfo.title}
          </p>
        </div>
        <div className="bg-emerald-900/50 px-3 py-1 border-2 border-emerald-600">
          <span className="text-emerald-400 text-xs" style={pixelText}>★ {score}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <span style={pixelText}>Q {currentQIndex + 1} / {quiz.questions.length}</span>
        <div className="flex gap-1">
          {quiz.questions.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-sm ${
              i < currentQIndex ? 'bg-emerald-500' : i === currentQIndex ? 'bg-amber-500' : 'bg-slate-700'
            }`} />
          ))}
        </div>
      </div>

      {/* Question */}
      <PixelCard className="p-5 mb-4" variant="primary">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          <p className="text-white text-sm leading-relaxed" style={{ ...pixelText, lineHeight: '1.8' }}>
            {currentQuestion.question}
          </p>
        </div>
      </PixelCard>

      {/* Answers */}
      <div className="space-y-2">
        {currentQuestion.choices.map((choice, i) => {
          const letter = String.fromCharCode(65 + i);
          let buttonClass = 'bg-slate-800 border-slate-600 hover:border-blue-500';
          
          if (showResult) {
            if (choice.correct) buttonClass = 'bg-emerald-900/50 border-emerald-500';
            else if (selectedAnswer === i) buttonClass = 'bg-rose-900/50 border-rose-500';
            else buttonClass = 'bg-slate-800 border-slate-700 opacity-50';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(choice, i)}
              disabled={showResult}
              className={`w-full p-4 border-4 text-left transition-all ${buttonClass}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${
                  showResult && choice.correct ? 'bg-emerald-500 text-white' :
                  showResult && selectedAnswer === i ? 'bg-rose-500 text-white' :
                  'bg-slate-700 text-slate-300'
                }`} style={pixelText}>{letter}</span>
                <span className="text-slate-200 text-sm flex-1" style={pixelText}>{choice.text}</span>
                {showResult && choice.correct && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 border-4 ${isCorrect ? 'bg-emerald-950/50 border-emerald-600' : 'bg-rose-950/50 border-rose-600'}`}
          >
            <p className={`font-bold text-center mb-2 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`} style={pixelText}>
              {isCorrect ? '✓ CORRECT!' : '✗ NOT QUITE'}
            </p>
            <p className="text-slate-300 text-xs text-center mb-3" style={{ ...pixelText, fontSize: '10px' }}>
              {currentQuestion.explanation}
            </p>
            <button
              onClick={handleNext}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold border-b-4 border-amber-700"
              style={pixelText}
            >
              {currentQIndex < quiz.questions.length - 1 ? 'NEXT QUESTION →' : 'SEE RESULTS 🏆'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function RevisionMode() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('upload'); // 'upload', 'generating', 'quiz'
  const [documentInfo, setDocumentInfo] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);

  const handleDocumentUploaded = async (docInfo) => {
    setDocumentInfo(docInfo);
    setScreen('generating');
    setError(null);

    try {
      // If it's a URL with content already, we need to handle it differently
      // For now, just generate quiz normally
      const response = await revisionAPI.generateQuiz(docInfo.documentId, 5);
      if (response.data.success) {
        setQuiz(response.data);
        setScreen('quiz');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz');
      setScreen('upload');
    }
  };

  if (screen === 'upload') {
    return <UploadScreen onDocumentUploaded={handleDocumentUploaded} onBack={() => navigate('/dashboard')} />;
  }

  if (screen === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Brain className="w-16 h-16 text-blue-400" />
        </motion.div>
        <p className="text-blue-400 text-lg mt-4 font-bold" style={{ ...pixelText, textShadow: '2px 2px 0 #000' }}>
          GENERATING QUIZ...
        </p>
        <p className="text-slate-500 text-xs mt-2" style={pixelText}>
          AI is analyzing your document
        </p>
      </div>
    );
  }

  if (screen === 'quiz' && quiz) {
    return <QuizScreen quiz={quiz} documentInfo={documentInfo} onBack={() => setScreen('upload')} />;
  }

  return null;
}
