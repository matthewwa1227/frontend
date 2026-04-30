import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseAPI } from '../../utils/api';
import { getUser } from '../../utils/auth';

// Layout Components
import TopAppBar from '../layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../layout/SideNavBar';

const ExerciseGenerator = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [user, setUser] = useState(currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form state
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
  const [autoDetected, setAutoDetected] = useState(false);
  const [referenceExercises, setReferenceExercises] = useState('');
  const [preservePattern, setPreservePattern] = useState(true);
  const [exercises, setExercises] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

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

  // Recent artifacts mock data
  const recentArtifacts = [
    { id: 1, name: 'Calculus Scroll IV', time: '2m ago', icon: 'scrollable_header', color: 'tertiary' },
    { id: 2, name: 'Organic Chem Tome', time: '1h ago', icon: 'description', color: 'secondary' },
  ];

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
        setAnalyzed(true);
        setAutoDetected(true);
      } else {
        setError(result.data.message || 'Analysis returned no data');
      }
    } catch (err) {
      console.error('Analyze document error:', err);
      const msg = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
        ? 'Analysis timed out. Large images may take longer — please try again.'
        : err.response?.data?.message || err.message || 'Failed to analyze document';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length <= 1) {
      setAnalyzed(false);
      setAutoDetected(false);
    }
  };

  // Generate exercises
  const generateExercises = async () => {
    if (mode === 'original' && (!subject || !concept)) {
      setError('Please fill in Subject and Concept Focus');
      return;
    }
    
    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 5, 75));
    }, 500);
    
    try {
      let res;
      if (mode === 'original') {
        res = await exerciseAPI.generate({
          subject, concept, numExercises, difficulty
        });
      } else if (mode === 'reading') {
        res = await exerciseAPI.generateReading({
          subject, difficulty, passageType, numQuestions: numExercises
        });
      } else {
        res = await exerciseAPI.generateSimilar({
          document: uploadedFiles[0],
          subject, concept, numExercises, difficulty, preservePattern
        });
      }
      
      setLoadingProgress(100);
      setTimeout(() => {
        setExercises(res.data);
        setLoading(false);
      }, 300);
    } catch (err) {
      setError('Failed to generate exercises');
      setLoading(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  // Get mode color
  const getModeColor = () => {
    switch (mode) {
      case 'original': return 'primary';
      case 'similar': return 'secondary';
      case 'reading': return 'tertiary';
      default: return 'primary';
    }
  };

  const modeColor = getModeColor();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopAppBar 
        title="SCROLL FORGE" 
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation */}
      <SideNavBar 
        items={navItems} 
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeItem="exercise-gen"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item && item.href) navigate(item.href);
        }}
      />

      {/* Main Content Area */}
      <main className="lg:ml-64 pt-20 pb-32 px-4 md:px-8">
        {/* Top App Bar */}
        <header className="flex justify-between items-center w-full mb-8 bg-background border-b-4 border-surface-container py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-primary tracking-tighter font-headline uppercase">FORGE COMMAND</h2>
          </div>
        </header>

        {!exercises ? (
          /* Command Center Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Blueprint Configuration */}
            <section className="col-span-12 lg:col-span-3 space-y-6">
              {/* Mode Selection */}
              <div className="bg-surface-container p-6 relative group">
                <div className="absolute -inset-1 border-2 border-primary/20 pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary neon-glow-primary">architecture</span>
                  <h3 className="font-retro text-[10px] uppercase text-primary">Blueprint</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Mode Buttons */}
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'original', label: 'ORIGINAL', icon: 'auto_fix_high', desc: 'Pure AI Creation' },
                      { id: 'similar', label: 'MIMIC', icon: 'content_copy', desc: 'Follow existing patterns' },
                      { id: 'reading', label: 'READING', icon: 'menu_book', desc: 'Comprehension passages' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`w-full flex items-center gap-3 p-3 border-2 transition-all ${
                          mode === m.id
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface-container-high border-outline-variant hover:border-secondary text-on-surface/60'
                        }`}
                      >
                        <span className="material-symbols-outlined">{m.icon}</span>
                        <div className="text-left">
                          <p className="font-retro text-[8px] uppercase">{m.label}</p>
                          <p className="text-[10px] opacity-50 font-body">{m.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label className="block font-retro text-[8px] text-secondary/60 mb-2 uppercase">Subject Matter</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Mathematics, English, History"
                      className="w-full bg-surface-container-low border-2 border-outline-variant text-on-surface p-3 font-headline focus:border-primary focus:ring-0"
                    />
                  </div>

                  {/* Concept Focus */}
                  <div>
                    <label className="block font-retro text-[8px] text-secondary/60 mb-2 uppercase">Focus / Concept</label>
                    <input
                      type="text"
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      placeholder="e.g., Calculus II"
                      className="w-full bg-surface-container-low border-2 border-outline-variant text-on-surface p-3 font-headline focus:border-primary focus:ring-0"
                    />
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block font-retro text-[8px] text-secondary/60 mb-2 uppercase">Skill Tier</label>
                    <div className="grid grid-cols-1 gap-2">
                      {['easy', 'medium', 'hard'].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          className={`w-full text-left p-3 border-2 font-headline flex justify-between items-center transition-colors ${
                            difficulty === diff
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-outline-variant hover:border-secondary text-on-surface/60'
                          }`}
                        >
                          {diff === 'easy' ? 'NOVICE' : diff === 'medium' ? 'ADEPT' : 'ARCHMAGE'}
                          <span className="material-symbols-outlined text-sm">
                            {difficulty === diff ? 'star' : 'star_border'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label className="block font-retro text-[8px] text-secondary/60 mb-2 uppercase">Artifact Count</label>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      value={numExercises}
                      onChange={(e) => setNumExercises(Number(e.target.value))}
                      className="w-full accent-primary bg-surface-container-highest h-2 appearance-none"
                    />
                    <div className="flex justify-between mt-2 font-retro text-[8px] text-secondary">
                      <span>5</span>
                      <span className="text-primary">{numExercises}</span>
                      <span>25</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recently Forged */}
              <div className="bg-surface-container-low p-6 border-l-4 border-secondary/20">
                <h3 className="font-retro text-[10px] uppercase text-secondary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">history</span>
                  Recent Artifacts
                </h3>
                <div className="space-y-4">
                  {recentArtifacts.map((artifact) => (
                    <div key={artifact.id} className="group flex items-center gap-3 p-2 hover:bg-surface-container-highest transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center">
                        <span className={`material-symbols-outlined text-${artifact.color} text-lg`}>{artifact.icon}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-headline font-bold text-on-surface">{artifact.name}</p>
                        <p className="text-[8px] font-retro text-on-surface/40 uppercase">{artifact.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Center: Summoning Circle */}
            <section className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center min-h-[400px] relative">
              {/* Summoning Ring Background */}
              <div className="absolute w-[350px] h-[350px] rounded-full bg-gradient-radial from-primary/10 to-transparent animate-pulse"></div>
              
              {/* Main Progress Ring */}
              <div className="relative w-72 h-72 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    className="text-surface-container-highest" 
                    cx="144" 
                    cy="144" 
                    fill="transparent" 
                    r="130" 
                    stroke="currentColor" 
                    strokeWidth="8"
                  />
                  <circle 
                    className="text-primary neon-glow-primary"
                    cx="144" 
                    cy="144" 
                    fill="transparent" 
                    r="130" 
                    stroke="currentColor" 
                    strokeDasharray="817" 
                    strokeDashoffset={817 - (817 * (loading ? loadingProgress : 0) / 100)}
                    strokeLinecap="butt" 
                    strokeWidth="12"
                  />
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-5xl text-primary mb-4 animate-spin">refresh</span>
                      <h2 className="font-retro text-3xl text-on-surface mb-2">{loadingProgress}%</h2>
                      <p className="font-retro text-[10px] text-secondary animate-pulse uppercase">ESSENCE STABILIZING...</p>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-6xl text-primary mb-4 neon-glow-primary">auto_fix_high</span>
                      <h2 className="font-retro text-xl text-on-surface mb-2">READY</h2>
                      <p className="font-retro text-[10px] text-secondary uppercase">CONFIGURE BLUEPRINT</p>
                    </>
                  )}
                </div>

                {/* Floating Orbiting Icons */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-surface-container border-2 border-primary flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-primary text-sm">functions</span>
                </div>
                <div className="absolute top-1/4 -right-2 w-8 h-8 bg-surface-container border-2 border-secondary flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-secondary text-xs">science</span>
                </div>
                <div className="absolute bottom-1/4 -left-2 w-8 h-8 bg-surface-container border-2 border-tertiary flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-tertiary text-xs">menu_book</span>
                </div>
              </div>

              {/* Status Feedback */}
              <div className="mt-8 w-full max-w-md bg-surface-container-highest p-4 flex gap-4 items-center border-t-4 border-primary">
                <div className="w-2 h-2 bg-primary animate-ping"></div>
                <p className="font-headline italic text-on-surface/80 text-sm">
                  "The runes are aligning. Configure your blueprint to begin forging."
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 w-full max-w-md bg-error/10 p-4 border-2 border-error">
                  <p className="font-retro text-[10px] text-error uppercase">{error}</p>
                </div>
              )}
            </section>

            {/* Right: Enchantment Settings */}
            <section className="col-span-12 lg:col-span-3 space-y-6">
              <div className="bg-surface-container p-6 relative">
                <div className="absolute -inset-1 border-2 border-secondary/20 pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-secondary neon-glow-secondary">magic_button</span>
                  <h3 className="font-retro text-[10px] uppercase text-secondary">Enchantments</h3>
                </div>

                <div className="space-y-4">
                  {/* File Upload for Similar Mode */}
                  {mode === 'similar' && (
                    <div className="space-y-3">
                      <label className="block font-retro text-[8px] text-secondary/60 uppercase">Reference Scrolls</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-outline-variant hover:border-primary transition-colors cursor-pointer text-center"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => handleFilesSelect(Array.from(e.target.files))}
                          className="hidden"
                        />
                        <span className="material-symbols-outlined text-3xl text-primary mb-2">upload_file</span>
                        <p className="font-retro text-[8px] text-on-surface/60 uppercase">Drop files or click</p>
                      </div>
                      
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-surface-container-high p-2">
                              <span className="text-[10px] truncate">{file.name}</span>
                              <button onClick={() => removeFile(idx)} className="text-error">
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {analyzing && (
                        <p className="font-retro text-[8px] text-secondary animate-pulse">ANALYZING SCROLL...</p>
                      )}
                      {analyzed && (
                        <p className="font-retro text-[8px] text-tertiary">✓ AUTO-DETECTED</p>
                      )}
                    </div>
                  )}

                  {/* Reading Mode Options */}
                  {mode === 'reading' && (
                    <div className="space-y-3">
                      <label className="block font-retro text-[8px] text-secondary/60 uppercase">Passage Type</label>
                      <select
                        value={passageType}
                        onChange={(e) => setPassageType(e.target.value)}
                        className="w-full bg-surface-container-low border-2 border-outline-variant text-on-surface p-3 font-headline focus:border-secondary focus:ring-0"
                      >
                        <option value="narrative">📖 NARRATIVE</option>
                        <option value="argumentative">💬 ARGUMENTATIVE</option>
                        <option value="descriptive">🎨 DESCRIPTIVE</option>
                        <option value="expository">📚 EXPOSITORY</option>
                      </select>

                      <div className="flex items-center gap-3 mt-4">
                        <input
                          type="checkbox"
                          id="vocab"
                          checked={includeVocabulary}
                          onChange={(e) => setIncludeVocabulary(e.target.checked)}
                          className="w-4 h-4 accent-secondary"
                        />
                        <label htmlFor="vocab" className="font-retro text-[8px] text-on-surface uppercase">Include Vocabulary</label>
                      </div>
                    </div>
                  )}

                  {/* Preserve Pattern Toggle */}
                  {mode === 'similar' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="preserve"
                        checked={preservePattern}
                        onChange={(e) => setPreservePattern(e.target.checked)}
                        className="w-4 h-4 accent-secondary"
                      />
                      <label htmlFor="preserve" className="font-retro text-[8px] text-on-surface uppercase">Preserve Pattern</label>
                    </div>
                  )}

                  {/* Mana Cost / Progress */}
                  <div className="mt-8 pt-6 border-t border-outline-variant/30">
                    <h4 className="font-retro text-[8px] text-secondary/60 mb-4 uppercase">Mana Cost</h4>
                    <div className="h-4 w-full bg-surface-container-lowest overflow-hidden">
                      <div 
                        className={`h-full bg-${modeColor} w-3/4 shadow-[0_0_10px_currentColor]`}
                      ></div>
                    </div>
                    <p className="mt-2 font-retro text-[8px] text-secondary text-right uppercase">
                      {Math.round(numExercises * 3)} / 100 MP
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* Generated Exercises Display */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white text-black p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              {/* Header */}
              <div className="text-center mb-8 border-b-4 border-black pb-6">
                <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'serif' }}>
                  {exercises.title || `${subject} Practice Scroll`}
                </h1>
                <div className="text-sm space-y-1">
                  <p><strong>Subject:</strong> {exercises.subject || subject}</p>
                  <p><strong>Difficulty:</strong> {exercises.difficulty || difficulty}</p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {exercises.questions?.map((q, idx) => (
                  <div key={idx}>
                    <p className="font-bold mb-2">{idx + 1}. {q.question}</p>
                    {q.choices && (
                      <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.choices.map((choice, i) => (
                          <p key={i}>{String.fromCharCode(65 + i)}. {choice}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Answer Key */}
              <div className="mt-12 pt-8 border-t-4 border-dashed border-gray-400">
                <h3 className="text-xl font-bold mb-6 text-center">ANSWER KEY</h3>
                <div className="grid grid-cols-5 gap-4">
                  {exercises.questions?.map((q, idx) => (
                    <div key={idx} className="bg-gray-100 p-2">
                      <span className="font-bold">{idx + 1}.</span> {q.answer}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-4">
              <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-tertiary text-on-tertiary border-4 border-on-tertiary shadow-[4px_4px_0px_0px_#e9c400] font-retro text-[10px] uppercase"
              >
                PRINT SCROLL
              </button>
              <button 
                onClick={() => { setExercises(null); setError(null); }}
                className="px-6 py-3 bg-surface-container text-on-surface border-4 border-outline-variant font-retro text-[10px] uppercase"
              >
                FORGE NEW
              </button>
            </div>
          </div>
        )}

        {/* Floating Forge Button */}
        {!exercises && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-40">
            <button 
              onClick={generateExercises}
              disabled={loading}
              className={`w-full py-6 flex items-center justify-center gap-4 group transition-all transform hover:-translate-y-1 active:translate-y-1 relative ${
                loading ? 'bg-surface-container cursor-not-allowed' : `bg-${modeColor}-container hover:bg-${modeColor}`
              } text-white`}
            >
              {/* Button Lip for 3D effect */}
              <div className={`absolute inset-x-0 -bottom-2 h-2 bg-${modeColor === 'primary' ? '#8f0044' : modeColor === 'secondary' ? '#004f54' : '#544600'}`}></div>
              <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">hardware</span>
              <span className="font-retro text-xl tracking-wider uppercase">
                {loading ? 'FORGING...' : 'FORGE SCROLL'}
              </span>
              <div className="absolute right-8 opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>rebase_edit</span>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavBar 
        items={navItems.filter(i => ['dashboard', 'tasks', 'timer', 'social'].includes(i.id))} 
        activeItem="exercise-gen"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />

      {/* Additional CSS for neon glow effects */}
      <style>{`
        .neon-glow-primary {
          filter: drop-shadow(0 0 8px #ff4a8d);
        }
        .neon-glow-secondary {
          filter: drop-shadow(0 0 8px #00f1fe);
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, rgba(255,74,141,0.1) 0%, rgba(26,6,59,0) 70%);
        }
      `}</style>
    </div>
  );
};

export default ExerciseGenerator;
