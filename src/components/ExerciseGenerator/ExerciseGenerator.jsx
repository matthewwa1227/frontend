import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, RotateCcw, BookOpen, Wand2 } from 'lucide-react';
import { exerciseAPI } from '../../utils/api';

const pixelText = { fontFamily: 'monospace' };

// Pixel Button Component
const PixelButton = ({ children, onClick, variant = 'primary', disabled = false, className = '', icon: Icon }) => {
  const baseStyles = "px-6 py-3 text-sm border-b-4 border-r-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold uppercase tracking-wider flex items-center justify-center gap-2";
  
  const variants = {
    primary: `${baseStyles} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border-blue-800 text-white shadow-lg shadow-blue-900/50`,
    gold: `${baseStyles} bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border-amber-700 text-amber-950 shadow-lg shadow-amber-900/50`,
    success: `${baseStyles} bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border-emerald-800 text-white shadow-lg shadow-emerald-900/50`,
    secondary: `${baseStyles} bg-slate-700/80 hover:bg-slate-600 border-slate-900 text-slate-200`
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

const ExerciseGenerator = () => {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [concept, setConcept] = useState('');
  const [numExercises, setNumExercises] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [exercises, setExercises] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateExercises = async () => {
    if (!subject || !topic || !concept) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await exerciseAPI.generate({
        subject,
        topic,
        concept,
        numExercises,
        difficulty
      });
      
      setExercises(res.data);
      console.log(`✅ Generated ${res.data.questions?.length || 0} exercises`);
    } catch (err) {
      console.error('Failed to generate exercises:', err);
      setError('Failed to generate exercises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
              {/* Subject */}
              <div>
                <label className="text-amber-400 font-bold text-xs block mb-2" style={pixelText}>
                  SUBJECT *
                </label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  style={pixelText}
                >
                  <option value="">Select Subject</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="History">History</option>
                  <option value="Science">Science</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="text-amber-400 font-bold text-xs block mb-2" style={pixelText}>
                  TOPIC / THEME *
                </label>
                <input 
                  type="text"
                  placeholder="e.g., Hong Kong History, Ancient Egypt, Place Value"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                  style={pixelText}
                />
              </div>

              {/* Concept */}
              <div>
                <label className="text-amber-400 font-bold text-xs block mb-2" style={pixelText}>
                  GRAMMAR / CONCEPT FOCUS *
                </label>
                <input 
                  type="text"
                  placeholder="e.g., there was/were, past tense, multiplication tables"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
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
                variant="gold" 
                onClick={generateExercises} 
                disabled={loading}
                className="w-full mt-4"
                icon={loading ? null : Wand2}
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
                  <p><strong>Subject:</strong> {exercises.subject || subject} | <strong>Topic:</strong> {exercises.topic || topic}</p>
                  <p><strong>Focus:</strong> {exercises.concept || concept} | <strong>Difficulty:</strong> {exercises.difficulty || difficulty}</p>
                  <p><strong>Total Questions:</strong> {exercises.questions?.length || 0}</p>
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
