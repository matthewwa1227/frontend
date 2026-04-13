import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Flag, PlayArrow, CleaningServices, CheckCircle, Lock, Skull, 
  Description, AutoGraph, Bolt, ChevronRight, RotateCcw, Trophy, AlertTriangle,
  ArrowLeft, Code, Target, Zap, Swords, ArrowBack, ArrowForward, HelpCenter,
  Psychology, MenuBook, Database, WorkspacePremium, ContentCopy, Search,
  DoneAll, Schedule, AutoAwesome, Notifications, Settings, TrendingUp,
  GridView, Bot, AccountTree
} from 'lucide-react';
import api from '../../utils/api';

// ============================================
// API SERVICE
// ============================================
const newquestAPI = {
  getProjects: (status) => api.get(`/projects${status ? `?status=${status}` : ''}`),
  createProject: (data) => api.post('/projects', data),
  getProject: (id) => api.get(`/projects/${id}`),
  getChapters: (projectId) => api.get(`/chapters?projectId=${projectId}`),
  getArtifacts: (projectId) => api.get(`/artifacts?projectId=${projectId}`),
  generateChapter: (data) => api.post('/chapters/generate', data),
  completeChapter: (id) => api.post(`/chapters/${id}/complete`),
  startBossBattle: (projectId) => api.post('/boss-battles/start', { projectId }),
  getBossBattle: (id) => api.get(`/boss-battles/${id}`),
  submitStage: (id, solution, mode = 'normal') => api.post(`/boss-battles/${id}/stage`, { solution, mode }),
  retryStage: (id) => api.post(`/boss-battles/${id}/retry`),
  downshift: (id) => api.post(`/boss-battles/${id}/downshift`),
  retake: (id) => api.post(`/boss-battles/${id}/retake`),
};

// ============================================
// GLOBAL STYLES HELPERS
// ============================================
const fontRetro = "font-['Press_Start_2P']";
const fontHeadline = "font-['Space_Grotesk']";

// ============================================
// PIXEL BUTTON
// ============================================
const PixelBtn = ({ children, onClick, variant = 'primary', disabled = false, className = '', icon: Icon }) => {
  const base = `${fontRetro} text-[10px] py-3 px-5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`;
  const variants = {
    primary: `${base} bg-primary-container text-on-primary-container shadow-[0_4px_0_0_#8f0044] hover:brightness-110`,
    secondary: `${base} bg-secondary text-on-secondary shadow-[0_4px_0_0_#004f54] hover:brightness-110`,
    tertiary: `${base} bg-tertiary text-on-tertiary shadow-[0_4px_0_0_#544600] hover:brightness-110`,
    danger: `${base} bg-error text-on-error shadow-[0_4px_0_0_#690005] hover:brightness-110`,
    ghost: `${base} bg-surface-container-highest text-on-surface shadow-[0_4px_0_0_#271448] hover:bg-surface-container`,
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// ============================================
// BADGE STARS
// ============================================
const BadgeStars = ({ tier, size = 'sm' }) => {
  const count = { mastery: 3, proficiency: 2, completion: 1, null: 0 }[tier] || 0;
  return (
    <div className="flex gap-0.5">
      {[...Array(3)].map((_, i) => (
        <span key={i} className={`${size === 'sm' ? 'text-sm' : 'text-2xl'} ${i < count ? 'text-tertiary' : 'text-surface-container-highest'}`}>★</span>
      ))}
    </div>
  );
};

// ============================================
// TOP APP BAR
// ============================================
const TopBar = ({ title = 'STUDYQUEST', tabs = [] }) => (
  <header className="fixed top-0 w-full z-50 bg-[#1a063b] text-[#ffb1c4] font-['Space_Grotesk'] uppercase tracking-wider border-b-4 border-[#271448] shadow-[0_4px_0_0_#271448] flex justify-between items-center px-6 h-16">
    <div className="text-2xl font-black text-[#ffb1c4] tracking-tighter">{title}</div>
    <div className="flex items-center gap-6">
      <div className="hidden md:flex gap-6 items-center">
        {tabs.map((t, i) => (
          <span key={i} className={`${t.active ? 'text-[#ffb1c4] border-b-2 border-[#ffb1c4]' : 'text-[#ddfcff] opacity-80 hover:text-[#ffb1c4]'} transition-colors cursor-pointer`}>{t.label}</span>
        ))}
      </div>
      <div className="flex gap-4 items-center">
        <span className="material-symbols-outlined cursor-pointer hover:bg-[#271448] p-1 rounded">account_circle</span>
        <span className="material-symbols-outlined cursor-pointer hover:bg-[#271448] p-1 rounded">settings</span>
      </div>
    </div>
  </header>
);

// ============================================
// KIMI FOOTER HUD
// ============================================
const KimiFooter = ({ message, onHint, onDownshift, showDownshift = false, variant = 'arena' }) => (
  <footer className={`fixed bottom-0 left-0 w-full z-40 bg-[#1a063b] border-t-4 ${variant === 'arena' ? 'border-[#ffb1c4]' : 'border-primary'} shadow-[0_-4px_0_0_#271448] p-4 flex flex-col md:flex-row items-center justify-between gap-4`}>
    <div className="flex items-center gap-4">
      <div className="relative w-12 h-12 bg-surface-container-highest border-2 border-primary overflow-hidden flex items-center justify-center">
        <Bot className="w-8 h-8 text-secondary" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-tertiary animate-pulse border-2 border-[#1a063b]" />
      </div>
      <div>
        <span className={`${fontRetro} text-[10px] text-primary`}>KIMI_AI // HUD</span>
        <p className="font-body text-sm text-secondary italic max-w-xl">"{message}"</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      {onHint && (
        <PixelBtn onClick={onHint} variant="tertiary" icon={HelpCenter} className="text-[8px] py-2">
          REQUEST HINT
        </PixelBtn>
      )}
      {showDownshift && onDownshift && (
        <PixelBtn onClick={onDownshift} variant="danger" className="text-[8px] py-2">
          DOWNSHIFT
        </PixelBtn>
      )}
    </div>
  </footer>
);

// ============================================
// BOSS BATTLE VIEW
// ============================================
const BossBattleView = ({ battleState, project, artifacts, onBack, onStageSubmit, onDownshift }) => {
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [hotfixMode, setHotfixMode] = useState(false);
  const [kimiMessage, setKimiMessage] = useState("The battle awaits. Show me what you've learned.");

  const battle = battleState.bossBattle;
  const stages = battleState.stages || [];
  const currentStageIndex = battleState.currentStageIndex || 0;
  const currentStage = battleState.currentStage;
  const stageSolutions = battleState.stageSolutions || [];

  // Reset state when stage changes
  useEffect(() => {
    setSolution('');
    setResult(null);
    setHotfixMode(false);
    if (currentStage) {
      setKimiMessage(`Stage ${currentStage.stageNumber}: ${currentStage.scenario}`);
    }
  }, [currentStage?.id]);

  const isHotfixRequired = battle.failed_stage !== null && battle.failed_stage < currentStageIndex;
  const activeStageNumber = hotfixMode && isHotfixRequired ? battle.failed_stage + 1 : currentStageIndex + 1;

  const handleSubmit = async () => {
    if (!solution.trim()) return;
    setSubmitting(true);
    try {
      const mode = hotfixMode ? 'hotfix' : 'normal';
      const res = await newquestAPI.submitStage(battle.id, solution, mode);
      setResult(res.data);
      if (res.data.passed) {
        if (res.data.status === 'hotfix-resolved') {
          setKimiMessage('Excellent! The upstream bug is fixed. Continue to the next stage.');
        } else if (res.data.status === 'victory') {
          setKimiMessage(`Victory! You earned the ${res.data.badge} badge!`);
        } else {
          setKimiMessage('Stage passed! Onward to the next challenge.');
        }
        if (onStageSubmit) onStageSubmit(res.data);
      } else {
        setKimiMessage(res.data.hint || 'That solution needs work. Check your artifacts and try again.');
      }
    } catch (err) {
      setResult({ passed: false, status: 'error', diagnosis: 'Submission failed. Please retry.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStageStatus = (idx) => {
    if (idx < currentStageIndex) return 'completed';
    if (idx === currentStageIndex) return 'active';
    return 'pending';
  };

  const previousSolution = activeStageNumber > 1 ? stageSolutions[activeStageNumber - 2] : null;

  return (
    <div className="min-h-screen bg-background text-on-background font-body pb-32">
      <TopBar title="STUDYQUEST" tabs={[{ label: 'ARENA', active: true }, { label: 'TUTORIALS' }, { label: 'RANKINGS' }]} />

      <main className="pt-20 pb-8 px-4 md:px-6 max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <section className="bg-surface-container-low p-4 md:p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ff4a8d 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 relative z-10">
            <div className="space-y-2">
              <h1 className={`${fontRetro} text-lg md:text-xl text-primary tracking-tight`}>BOSS BATTLE: {battle.title?.toUpperCase()}</h1>
              <div className="flex items-center gap-4 text-secondary font-mono text-[10px]">
                <span className="text-tertiary">LVL 42 SCHOLAR</span>
                <span className="opacity-50">|</span>
                <span>DIFFICULTY: GRANDMASTER</span>
              </div>
            </div>
            {/* Stepper */}
            <div className="flex-1 max-w-2xl w-full grid grid-cols-3 gap-2">
              {stages.map((stage, idx) => {
                const status = getStageStatus(idx);
                const isFailed = battle.failed_stage === idx;
                return (
                  <div key={stage.id} className="relative">
                    <div className={`h-8 flex items-center justify-center px-2 ${
                      status === 'completed' ? 'bg-secondary text-on-secondary' : 
                      status === 'active' ? 'bg-primary text-on-primary' : 
                      'bg-surface-container-highest border-2 border-outline-variant text-on-surface'
                    }`}>
                      <span className={`${fontRetro} text-[8px] text-center`}>
                        STAGE {idx + 1}: {stage.title?.toUpperCase()}
                      </span>
                    </div>
                    {(status === 'completed' || isFailed) && (
                      <div className={`absolute -bottom-1 left-0 w-full h-1 ${status === 'completed' ? 'bg-secondary' : 'bg-error'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workspace */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 flex-1">
          {/* Left: Terminal */}
          <div className="flex-[3] flex flex-col bg-surface-container-lowest border-4 border-surface-container relative min-h-[400px]">
            <div className="bg-surface-container p-3 flex justify-between items-center border-b-4 border-surface-container-lowest">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-error" />
                <div className="w-3 h-3 rounded-full bg-tertiary" />
                <div className="w-3 h-3 rounded-full bg-secondary" />
              </div>
              <span className={`${fontRetro} text-[10px] text-primary`}>
                TERMINAL_v8.4 {hotfixMode ? '// HOTFIX_MODE' : '// STAGE_' + activeStageNumber}
              </span>
            </div>

            <div className="p-4 md:p-6 font-mono text-sm leading-relaxed overflow-auto flex-1">
              {hotfixMode && previousSolution && (
                <>
                  <div className="mb-4 flex items-center gap-3 opacity-60">
                    <span className="text-secondary"># PREVIOUS STAGE OUTPUT (READ-ONLY)</span>
                  </div>
                  <div className="text-on-surface-variant opacity-60 mb-6 p-3 bg-surface-container/30 border-l-2 border-error">
                    <pre className="whitespace-pre-wrap">{typeof previousSolution.solution === 'string' ? previousSolution.solution : JSON.stringify(previousSolution.solution, null, 2)}</pre>
                  </div>
                </>
              )}

              {!hotfixMode && currentStage?.task && (
                <div className="mb-4 text-on-surface-variant">
                  <span className="text-secondary"># TASK:</span> {currentStage.task}
                </div>
              )}

              <div className="flex gap-4">
                <span className="text-primary-container">01</span>
                <span className="text-secondary">#</span> <span className="text-on-surface">YOUR SOLUTION BELOW</span>
              </div>
              <div className="flex gap-4 mt-2">
                <span className="text-primary-container">02</span>
                <span className="w-2 h-5 bg-primary animate-pulse" />
              </div>
            </div>

            {/* Editable Area Overlay */}
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder={hotfixMode ? "Paste your fixed code here..." : "Write or paste your solution here..."}
              className="absolute left-12 right-6 bottom-20 top-24 bg-transparent font-mono text-sm text-on-surface focus:outline-none resize-none whitespace-pre"
            />

            {/* Action Bar */}
            <div className="p-4 bg-surface-container-low flex flex-wrap gap-3 border-t-4 border-surface-container-lowest">
              <PixelBtn 
                onClick={handleSubmit} 
                disabled={submitting || !solution.trim()} 
                variant={hotfixMode ? 'danger' : 'primary'} 
                icon={hotfixMode ? AlertTriangle : PlayArrow}
              >
                {submitting ? 'VALIDATING...' : hotfixMode ? 'SUBMIT HOTFIX' : 'SUBMIT SOLUTION'}
              </PixelBtn>
              {isHotfixRequired && (
                <PixelBtn 
                  onClick={() => setHotfixMode(!hotfixMode)} 
                  variant={hotfixMode ? 'ghost' : 'secondary'}
                >
                  {hotfixMode ? 'EXIT HOTFIX' : 'ENTER HOTFIX'}
                </PixelBtn>
              )}
              <PixelBtn onClick={onBack} variant="ghost" icon={ArrowBack}>
                BACK
              </PixelBtn>
            </div>
          </div>

          {/* Right: Simulation & Artifacts */}
          <div className="flex flex-col flex-[2] gap-4 md:gap-6">
            {/* Simulation Preview */}
            <div className="flex-1 bg-surface-container relative p-4 md:p-6 border-4 border-surface-container-highest min-h-[280px]">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                <span className={`${fontRetro} text-[8px] text-error`}>LIVE SIMULATION</span>
              </div>
              <h3 className={`${fontRetro} text-[10px] text-secondary mb-6`}>OUTPUT PREVIEW</h3>
              
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                {/* Tech Debt Tracker */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-error">SHADOW OF DOOM (TECH DEBT)</span>
                    <span className="text-error">{result?.passed ? '12%' : isHotfixRequired ? '84%' : '45%'}</span>
                  </div>
                  <div className="h-4 bg-surface-container-highest border-2 border-outline-variant p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-error to-primary-container segmented-progress transition-all duration-500"
                      style={{ 
                        width: result?.passed ? '12%' : isHotfixRequired ? '84%' : '45%',
                        backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 75%, #1a063b 75%, #1a063b 100%)',
                        backgroundSize: '8px 100%'
                      }}
                    />
                  </div>
                </div>

                {/* Result Panel */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`w-full p-4 border-2 ${
                        result.passed ? 'bg-secondary-container/20 border-secondary' : 'bg-error-container/20 border-error'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.passed ? <CheckCircle className="w-4 h-4 text-secondary" /> : <AlertTriangle className="w-4 h-4 text-error" />}
                        <span className={`${fontRetro} text-[10px] ${result.passed ? 'text-secondary' : 'text-error'}`}>
                          {result.passed ? 'VALIDATION PASSED' : 'VALIDATION FAILED'}
                        </span>
                      </div>
                      {result.diagnosis && (
                        <p className="text-xs text-on-surface-variant">{result.diagnosis}</p>
                      )}
                      {result.status === 'victory' && (
                        <div className="mt-3 text-center">
                          <div className="text-2xl mb-1">🏆</div>
                          <BadgeStars tier={result.badge} size="lg" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Visualization Placeholder */}
                {!result && (
                  <div className="w-full h-40 border-2 border-dashed border-outline-variant flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-secondary" />
                    <span className={`${fontRetro} text-[10px] text-outline text-center px-4 relative z-10`}>
                      AWAITING STABLE DATA STREAM...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Knowledge Artifacts */}
            <div className="bg-surface-container-low border-r-4 border-primary p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`${fontRetro} text-[10px] text-tertiary`}>KNOWLEDGE ARTIFACTS</h3>
                <WorkspacePremium className="w-5 h-5 text-tertiary" />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto retro-scroll">
                {artifacts.length > 0 ? artifacts.map((art) => {
                  const isRelevant = currentStage?.uiState?.artifactGlow?.includes(art.title);
                  return (
                    <div 
                      key={art.id} 
                      className={`p-3 border-l-4 shadow-[4px_4px_0_0_#4c3f00] cursor-pointer hover:translate-x-1 transition-transform ${
                        isRelevant 
                          ? 'bg-primary border-white animate-pulse' 
                          : 'bg-surface-container-highest border-tertiary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Description className={`w-4 h-4 ${isRelevant ? 'text-white' : 'text-tertiary'}`} />
                        <span className={`font-headline text-sm font-bold tracking-tight ${isRelevant ? 'text-on-primary uppercase' : ''}`}>
                          {art.title}
                        </span>
                      </div>
                      {isRelevant && (
                        <p className={`text-[10px] mt-2 ${fontRetro} leading-tight opacity-80 text-on-primary`}>RELEVANT TO CURRENT ERROR</p>
                      )}
                    </div>
                  );
                }) : (
                  <div className="p-3 bg-surface-container-highest opacity-50">
                    <span className="text-sm text-on-surface-variant">No artifacts forged yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <KimiFooter 
        message={kimiMessage}
        onHint={() => setKimiMessage(currentStage?.hint || "Check your Knowledge Artifacts for clues.")}
        onDownshift={onDownshift}
        showDownshift={battleState.progress?.canDownshift}
        variant="arena"
      />
    </div>
  );
};

// ============================================
// LEARN CHAPTER VIEW
// ============================================
const LearnChapterView = ({ chapter, project, artifacts, onBack, onComplete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = chapter?.full_lesson || `This chapter covers ${chapter?.title}. Master the concepts to forge your Knowledge Artifact.`;
  const keyPoints = chapter?.key_points || ['Key concept 1', 'Key concept 2', 'Key concept 3'];
  const whyItMatters = chapter?.why_it_matters || 'This skill is essential for completing your project.';

  return (
    <div className="min-h-screen bg-background text-on-background font-body overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-[#1a063b] flex justify-between items-center w-full px-6 py-4 shadow-[0_0_40px_rgba(255,177,196,0.1)] sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black text-[#ffb1c4] uppercase font-['Space_Grotesk'] tracking-tight">PROJECT_OMEGA</h1>
          <div className="hidden md:flex items-center bg-surface-container-lowest p-2 border-l-4 border-secondary px-4 gap-4">
            <div className="flex flex-col">
              <span className={`${fontRetro} text-[8px] text-secondary opacity-70`}>ACTIVE PROJECT</span>
              <span className="font-headline font-bold text-secondary uppercase tracking-wider">{project?.title}</span>
            </div>
            <div className="w-32 h-4 bg-surface-container-highest relative overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-secondary-container w-[65%] relative">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '8px 100%' }} />
              </div>
            </div>
            <span className={`${fontRetro} text-[8px] text-secondary`}>65%</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 bg-surface-container p-2 pr-4 border-2 border-primary-container">
            <div className="w-10 h-10 bg-primary-container flex items-center justify-center">
              <span className="text-lg">🎓</span>
            </div>
            <div className="flex flex-col">
              <span className={`${fontRetro} text-[8px] text-primary`}>SCHOLAR</span>
              <span className="font-headline font-black text-on-surface">LVL 42</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Notifications className="w-6 h-6 text-[#ffb1c4] cursor-pointer hover:bg-[#271448] p-1 rounded transition-all" />
            <Settings className="w-6 h-6 text-[#ffb1c4] cursor-pointer hover:bg-[#271448] p-1 rounded transition-all" />
          </div>
        </div>
      </header>
      <div className="bg-[#271448] h-[2px] w-full" />

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        {/* Knowledge Vault Sidebar */}
        <aside className="w-80 bg-surface-container-low border-r-4 border-surface-dim hidden md:flex flex-col p-4 gap-6 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className={`${fontRetro} text-[10px] text-secondary uppercase px-2`}>Knowledge Vault</label>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-lowest border-2 border-outline-variant p-3 font-mono text-xs focus:border-primary focus:ring-0 text-on-surface"
                placeholder="SEARCH ARTIFACTS..."
                type="text"
              />
              <Search className="absolute right-3 top-3 w-4 h-4 text-outline" />
            </div>
          </div>
          <nav className="flex flex-col gap-4">
            <div className="group cursor-pointer">
              <div className="flex items-center gap-3 p-4 bg-primary text-on-primary shadow-[4px_4px_0_0_#ff4a8d] transition-all active:translate-y-1">
                <MenuBook className="w-5 h-5" />
                <span className={`${fontRetro} text-[8px] uppercase`}>{chapter?.title}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`${fontRetro} text-[8px] text-outline px-2 mb-2 uppercase opacity-50`}>Saved Artifacts</span>
              {artifacts.map((art) => (
                <div key={art.id} className="flex items-center gap-3 p-3 text-secondary hover:bg-surface-container transition-all cursor-pointer">
                  <Description className="w-4 h-4" />
                  <span className="font-headline font-medium text-sm">{art.title}</span>
                </div>
              ))}
              {artifacts.length === 0 && (
                <div className="p-3 text-on-surface-variant text-sm opacity-50">No artifacts yet</div>
              )}
            </div>
          </nav>
          <div className="mt-auto pt-6 border-t border-outline-variant/20">
            <div className="bg-tertiary/10 p-4 border-l-4 border-tertiary flex gap-3">
              <WorkspacePremium className="w-5 h-5 text-tertiary flex-shrink-0" />
              <div className="flex flex-col">
                <span className={`${fontRetro} text-[8px] text-tertiary`}>MASTER QUEST</span>
                <span className="font-body text-xs text-on-surface/80">Complete this chapter to forge a Knowledge Artifact.</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Scriptorium */}
        <section className="flex-1 bg-surface overflow-y-auto p-6 md:p-12">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Lesson Header */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
              <h2 className={`${fontRetro} text-2xl md:text-3xl text-primary leading-relaxed uppercase mb-4 relative z-10`}>{chapter?.title}</h2>
              <div className="flex items-center gap-4 font-headline text-secondary tracking-widest uppercase text-sm font-bold opacity-80">
                <span className="flex items-center gap-1"><Schedule className="w-4 h-4" /> 15 MIN QUEST</span>
                <span className="w-1 h-1 bg-outline rounded-full" />
                <span className="flex items-center gap-1"><AutoAwesome className="w-4 h-4" /> 450 XP REWARD</span>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-surface-container-low p-6 border-2 border-outline-variant relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none transform translate-x-10 -translate-y-10">
                  <Psychology className="w-32 h-32" />
                </div>
                <h3 className={`${fontRetro} text-[10px] text-tertiary mb-4 uppercase`}>Why It Matters</h3>
                <p className="font-body text-on-surface leading-relaxed text-lg">{whyItMatters}</p>
              </div>
              <div className="md:col-span-1 bg-surface-container-highest p-6 shadow-[8px_8px_0_0_#150136]">
                <h3 className={`${fontRetro} text-[10px] text-secondary mb-4 uppercase`}>Key Points</h3>
                <ul className="space-y-3 font-headline text-sm font-bold text-on-surface-variant">
                  {keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <DoneAll className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{String(pt).toUpperCase()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Full Lesson */}
            <article className="space-y-6">
              <h3 className={`${fontRetro} text-[10px] text-primary uppercase`}>Full Lesson</h3>
              <div className="font-body text-on-surface leading-relaxed space-y-4 text-lg whitespace-pre-wrap">
                {content}
              </div>

              {/* Code Block Example */}
              <div className="bg-surface-container-lowest p-6 border-l-4 border-primary-container font-mono text-sm relative">
                <div className="absolute top-2 right-4 font-mono text-[8px] text-outline opacity-40">PYTHON_SCROLL</div>
                <pre className="text-secondary overflow-x-auto">
{`import pandas as pd

# Load your data realm
df = pd.read_csv('fitness_data.csv')

# Purge all rows with missing values
df_clean = df.dropna()

print(f"Void rows banished! New count: {len(df_clean)}")`}
                </pre>
                <button 
                  onClick={() => handleCopy(content)}
                  className="absolute bottom-4 right-4 bg-surface-container-high p-2 hover:bg-primary-container transition-colors"
                >
                  <ContentCopy className="w-4 h-4 text-white" />
                </button>
              </div>
            </article>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t-2 border-outline-variant/30">
              <button 
                onClick={onBack}
                className="flex items-center gap-2 font-mono text-[10px] text-outline hover:text-primary transition-colors"
              >
                <ArrowBack className="w-4 h-4" /> PREVIOUS
              </button>
              <PixelBtn onClick={onComplete} variant="primary" icon={ArrowForward}>
                COMPLETE QUEST
              </PixelBtn>
            </div>
          </div>
        </section>
      </main>

      {/* Kimi Footer */}
      <footer className="h-20 bg-[#1a063b]/90 backdrop-blur-md flex items-center justify-between px-8 border-t-4 border-primary sticky bottom-0 z-50">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 bg-secondary-container flex items-center justify-center">
            <Bot className="w-6 h-6 text-on-secondary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-tertiary animate-pulse border-2 border-[#1a063b]" />
          </div>
          <div className="flex flex-col">
            <span className={`${fontRetro} text-[8px] text-secondary tracking-widest`}>KIMI_AI</span>
            <p className="font-body text-sm text-on-surface font-medium italic">
              "Try using <span className="text-secondary">.fillna()</span> for missing values!"
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`${fontRetro} text-[8px] text-outline`}>QUEST HP</span>
            <div className="w-24 h-2 bg-surface-container-highest">
              <div className="h-full bg-primary w-full" />
            </div>
          </div>
          <button className="p-2 border-2 border-outline-variant hover:border-primary text-outline hover:text-primary transition-all">
            <HelpCenter className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

// ============================================
// HUB VIEW
// ============================================
const HubView = ({ project, chapters, artifacts, bossBattle, onStartBattle, onResumeBattle, onRetake, onLearnChapter }) => {
  const completedCount = chapters.filter(c => c.status === 'completed').length;
  const progress = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;
  const activeChapter = chapters.find(c => c.status === 'active');

  const skillSteps = chapters.map((ch) => ({
    id: ch.id,
    title: ch.title?.toUpperCase() || 'CHAPTER',
    status: ch.status,
    icon: ch.title?.toLowerCase().includes('clean') ? CleaningServices : 
          ch.title?.toLowerCase().includes('csv') || ch.title?.toLowerCase().includes('load') ? Terminal :
          ch.title?.toLowerCase().includes('visual') ? AutoGraph : Code
  }));

  skillSteps.push({
    id: 'boss',
    title: 'BOSS BATTLE',
    status: bossBattle?.status === 'completed' ? 'completed' : 
            bossBattle?.status === 'active' ? 'active' : 'locked',
    icon: Skull
  });

  return (
    <div className="min-h-screen bg-background text-on-background font-body pb-24">
      <TopBar title="STUDYQUEST" tabs={[{ label: 'QUEST LOG', active: true }, { label: 'RESOURCES' }, { label: 'MARKET' }]} />

      {/* SideNav */}
      <aside className="fixed left-0 h-full w-64 z-40 bg-[#271448] border-r-4 border-[#1a063b] shadow-[4px_0_0_0_#1a063b] divide-y-4 divide-[#1a063b] hidden md:flex flex-col pt-20 pb-8 px-4">
        <div className="py-6 flex flex-col items-center">
          <div className="w-20 h-20 bg-surface-container-highest border-4 border-tertiary-fixed-dim p-1 mb-3 flex items-center justify-center">
            <span className="text-3xl">🎓</span>
          </div>
          <div className={`${fontRetro} text-[10px] text-[#e9c400] mb-1`}>LEVEL 42</div>
          <div className={`${fontRetro} text-[8px] text-[#ddfcff] opacity-60`}>GRAND SCHOLAR</div>
        </div>
        <nav className="flex-1 py-6 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-[#1a063b] text-[#ffb1c4] border-l-4 border-[#ffb1c4] font-['Press_Start_2P'] text-[10px] cursor-pointer">
            <AccountTree className="w-4 h-4" />
            <span>SKILL TREE</span>
          </div>
          <div className="flex items-center gap-3 p-3 text-[#ddfcff] opacity-80 hover:bg-[#1a063b] hover:text-white font-['Press_Start_2P'] text-[10px] cursor-pointer">
            <Assignment className="w-4 h-4" />
            <span>QUEST LOG</span>
          </div>
          <div className="flex items-center gap-3 p-3 text-[#ddfcff] opacity-80 hover:bg-[#1a063b] hover:text-white font-['Press_Start_2P'] text-[10px] cursor-pointer">
            <Description className="w-4 h-4" />
            <span>ARTIFACTS</span>
          </div>
          <div className="flex items-center gap-3 p-3 text-[#ddfcff] opacity-80 hover:bg-[#1a063b] hover:text-white font-['Press_Start_2P'] text-[10px] cursor-pointer">
            <TrendingUp className="w-4 h-4" />
            <span>RANKINGS</span>
          </div>
        </nav>
        <div className="pt-6">
          <button className="w-full bg-primary-container text-on-primary-container font-['Press_Start_2P'] text-[8px] py-4 border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all mb-4">
            SUMMON AI GUIDE
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-64 pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Project HUD */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-surface-container p-6 border-l-8 border-primary relative overflow-hidden shadow-[4px_4px_0_0_#1a063b]">
            <div className="absolute -right-8 -bottom-8 opacity-5">
              <Terminal className="w-40 h-40 text-primary" />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h1 className="font-headline font-black text-3xl md:text-4xl text-primary tracking-tighter mb-2">{project?.title}</h1>
                <p className="font-body text-secondary opacity-90 flex items-center gap-2 text-sm">
                  <Flag className="w-4 h-4" /> Goal: {project?.deliverable}
                </p>
              </div>
              <div className="bg-surface-container-highest px-4 py-2 border-2 border-secondary-fixed-dim">
                <span className={`${fontRetro} text-[10px] text-secondary`}>STATUS: ACTIVE</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-8 items-end relative z-10">
              <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between font-mono text-[8px] mb-2 text-on-surface-variant">
                  <span>PROGRESS</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-6 bg-surface-container-lowest border-2 border-surface-container-highest relative">
                  <div className="h-full bg-gradient-to-r from-secondary to-secondary-container relative overflow-hidden transition-all" style={{ width: `${progress}%` }}>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(90deg, transparent 75%, #1a063b 75%)', backgroundSize: '8px 100%' }} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`${fontRetro} text-[8px] text-on-surface-variant`}>DELIVERABLE</span>
                <div className="flex items-center gap-2 text-secondary font-mono bg-surface-container-lowest px-3 py-1 text-sm">
                  <Code className="w-4 h-4" />
                  fitness_dashboard.py
                </div>
              </div>
            </div>
          </div>

          {/* Kimi Advice */}
          <div className="bg-surface-container p-6 border-4 border-outline-variant relative shadow-[4px_4px_0_0_#1a063b] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Bot className="w-10 h-10 text-tertiary" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-tertiary-container flex items-center justify-center p-2">
                <Bot className="w-8 h-8 text-on-tertiary" />
              </div>
              <h3 className="font-headline font-bold text-tertiary">KIMI'S ADVICE</h3>
            </div>
            <p className="font-body text-on-surface leading-relaxed italic text-sm">
              "Master Data Cleaning to unlock the Visualization Chapter! Your data's purity determines your dashboard's destiny."
            </p>
          </div>
        </section>

        {/* Skill Tree */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <AccountTree className="text-primary text-3xl" />
            <h2 className="font-headline font-extrabold text-2xl tracking-tight uppercase">Project Skill Tree</h2>
          </div>
          <div className="bg-surface-container-low p-8 md:p-12 relative overflow-hidden border-2 border-outline-variant/20">
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
              <path d="M 150,150 L 400,150 L 650,150 L 900,150" fill="none" stroke="#ffb1c4" strokeDasharray="8 8" strokeWidth="4" />
            </svg>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {skillSteps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'active';
                const isLocked = step.status === 'locked';
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-20 h-20 md:w-24 md:h-24 border-4 flex items-center justify-center mb-4 relative ${
                      isCompleted ? 'bg-surface-container-highest border-secondary-fixed-dim' :
                      isCurrent ? 'bg-surface-container border-primary shadow-[0_0_20px_rgba(255,177,196,0.3)]' :
                      'bg-surface-container-lowest border-outline-variant opacity-40'
                    } ${step.id === 'boss' && !isLocked ? 'border-tertiary-container' : ''}`}>
                      {isCompleted ? <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-secondary-fixed-dim" /> :
                       isLocked ? <Lock className="w-8 h-8 md:w-10 md:h-10 text-on-surface-variant" /> :
                       step.icon === CleaningServices ? <CleaningServices className="w-8 h-8 md:w-10 md:h-10 text-primary" /> :
                       step.icon === Skull ? <Skull className="w-8 h-8 md:w-10 md:h-10 text-tertiary" /> :
                       step.icon === AutoGraph ? <AutoGraph className="w-8 h-8 md:w-10 md:h-10 text-primary" /> :
                       <Terminal className="w-8 h-8 md:w-10 md:h-10 text-secondary-fixed-dim" />}
                      
                      {isCompleted && <div className="absolute -top-3 -right-3 bg-secondary-fixed-dim text-on-secondary px-2 py-0.5 font-mono text-[8px]">DONE</div>}
                      {isCurrent && <div className="absolute -top-3 -right-3 bg-primary text-on-primary px-2 py-0.5 font-mono text-[8px]">ACTIVE</div>}
                      {step.id === 'boss' && bossBattle?.badge_tier && (
                        <div className="absolute -top-3 -right-3 bg-tertiary text-on-tertiary px-1 py-0.5">
                          <BadgeStars tier={bossBattle.badge_tier} />
                        </div>
                      )}
                    </div>
                    <span className={`${fontRetro} text-[10px] text-center ${
                      isCompleted ? 'text-secondary' : isCurrent ? 'text-primary' : isLocked ? 'text-on-surface-variant' : step.id === 'boss' ? 'text-tertiary' : ''
                    }`}>
                      {step.title}
                    </span>
                    
                    {step.id === 'boss' && !isLocked && (
                      <div className="mt-3">
                        {bossBattle?.status === 'active' ? (
                          <PixelBtn onClick={onResumeBattle} variant="tertiary" icon={Swords} className="text-[8px] py-2 px-3">
                            {bossBattle.current_stage > 0 ? 'RESUME' : 'START'}
                          </PixelBtn>
                        ) : bossBattle?.status === 'completed' ? (
                          <PixelBtn onClick={onRetake} variant="primary" icon={RotateCcw} className="text-[8px] py-2 px-3">
                            RETAKE
                          </PixelBtn>
                        ) : (
                          <PixelBtn onClick={onStartBattle} variant="tertiary" icon={Swords} className="text-[8px] py-2 px-3">
                            START
                          </PixelBtn>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Artifacts & Objective */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Artifacts */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Description className="text-tertiary" />
              <h3 className="font-headline font-bold text-xl uppercase tracking-tighter">Knowledge Artifacts</h3>
            </div>
            <div className="space-y-4">
              {artifacts.length > 0 ? artifacts.map((art) => (
                <div key={art.id} className="bg-surface-container p-4 border-l-4 border-tertiary flex items-center justify-between group hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center">
                      <Description className="text-tertiary" />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-sm">{art.title}</h4>
                      <p className="text-xs text-on-surface-variant">Forged {new Date(art.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <>
                  <div className="bg-surface-container p-4 border-l-4 border-tertiary flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center"><Description className="text-tertiary" /></div>
                      <div><h4 className="font-headline font-bold text-sm">Pandas Cheat Sheet</h4><p className="text-xs text-on-surface-variant">Forged 2 days ago</p></div>
                    </div>
                  </div>
                  <div className="bg-surface-container p-4 border-l-4 border-outline-variant opacity-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center"><AutoGraph className="text-on-surface-variant" /></div>
                      <div><h4 className="font-headline font-bold text-sm">Matplotlib Scroll</h4><p className="text-xs text-on-surface-variant">Unlock to Forge</p></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Objective */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Bolt className="text-secondary" />
              <h3 className="font-headline font-bold text-xl uppercase tracking-tighter">Current Objective</h3>
            </div>
            <div className="bg-surface-container-high p-8 border-4 border-primary relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3">
                  <div className="w-full aspect-square bg-surface-container-lowest border-4 border-outline-variant flex items-center justify-center">
                    <Code className="w-16 h-16 text-primary opacity-50" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className={`${fontRetro} text-[10px] text-primary mb-4`}>
                    MODULE 0{Math.max(1, chapters.findIndex(c => c.status === 'active') + 1)}: THE CURRENT QUEST
                  </div>
                  <h4 className="font-headline font-black text-2xl mb-4 text-on-surface">
                    {activeChapter?.title || (bossBattle?.status === 'completed' ? 'Boss Battle Conquered!' : 'Prepare for the Boss Battle')}
                  </h4>
                  <p className="font-body text-on-surface-variant mb-6 leading-relaxed">
                    {project?.description || 'Complete all chapters to unlock the Boss Battle. Each chapter forges a Knowledge Artifact for the final synthesis.'}
                  </p>
                  
                  {bossBattle?.status === 'completed' && (
                    <div className="mb-4 p-3 bg-tertiary-container/20 border-2 border-tertiary">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-tertiary" />
                        <span className={`${fontRetro} text-[10px] text-tertiary`}>BOSS BATTLE COMPLETED</span>
                      </div>
                      <BadgeStars tier={bossBattle.badge_tier} />
                    </div>
                  )}
                  
                  {activeChapter ? (
                    <PixelBtn onClick={() => onLearnChapter(activeChapter)} variant="primary" icon={PlayArrow}>
                      BEGIN CODING QUEST
                    </PixelBtn>
                  ) : chapters.every(c => c.status === 'completed') && !bossBattle ? (
                    <PixelBtn onClick={onStartBattle} variant="tertiary" icon={Swords}>
                      START BOSS BATTLE
                    </PixelBtn>
                  ) : (
                    <PixelBtn onClick={onResumeBattle} variant="primary" icon={PlayArrow}>
                      {bossBattle?.status === 'active' ? 'RESUME BOSS BATTLE' : 'CONTINUE'}
                    </PixelBtn>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile BottomNav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-[#1a063b] border-t-4 border-[#ffb1c4] shadow-[0_-4px_0_0_#271448] md:hidden z-50">
        <div className="flex flex-col items-center justify-center bg-[#271448] text-[#ffb1c4] p-2 font-['Press_Start_2P'] text-[8px] uppercase">
          <GridView className="w-5 h-5 mb-1" />
          <span>DASHBOARD</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#ddfcff] p-2 font-['Press_Start_2P'] text-[8px] uppercase">
          <Bolt className="w-5 h-5 mb-1" />
          <span>SKILLS</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#ddfcff] p-2 font-['Press_Start_2P'] text-[8px] uppercase">
          <Description className="w-5 h-5 mb-1" />
          <span>INVENTORY</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#ddfcff] p-2 font-['Press_Start_2P'] text-[8px] uppercase">
          <Bot className="w-5 h-5 mb-1" />
          <span>AI HELPER</span>
        </div>
      </nav>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function Newquest() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [bossBattle, setBossBattle] = useState(null);
  const [battleState, setBattleState] = useState(null);
  const [view, setView] = useState('hub'); // hub | battle | learn
  const [activeChapter, setActiveChapter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    setLoading(true);
    try {
      // Try get active project
      let proj = null;
      try {
        const res = await newquestAPI.getProjects('active');
        if (res.data?.projects?.length > 0) proj = res.data.projects[0];
      } catch (e) {}

      // Fallback create
      if (!proj) {
        try {
          const createRes = await newquestAPI.createProject({
            title: 'Python Fitness Analyzer',
            description: 'Learn Python by building a health dashboard that analyzes fitness data',
            deliverable: 'Working fitness_dashboard.py script',
            subject: 'Programming'
          });
          proj = createRes.data.project;
        } catch (e) {}
      }

      if (proj) {
        setProject(proj);
        await loadProjectData(proj.id);
      }
    } catch (err) {
      setError('Failed to initialize Newquest');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (projectId) => {
    try {
      const [chRes, artRes, bbRes] = await Promise.all([
        newquestAPI.getChapters(projectId).catch(() => ({ data: { chapters: [] } })),
        newquestAPI.getArtifacts(projectId).catch(() => ({ data: { artifacts: [] } })),
        api.get(`/boss-battles?projectId=${projectId}`).catch(() => ({ data: { battles: [] } }))
      ]);
      
      let chs = chRes.data.chapters || [];
      // Default chapters if none exist
      if (chs.length === 0) {
        chs = [
          { id: 'ch1', title: 'CSV Loading', status: 'completed', chapter_number: 1 },
          { id: 'ch2', title: 'Data Cleaning', status: 'active', chapter_number: 2 },
          { id: 'ch3', title: 'Visualization', status: 'locked', chapter_number: 3 }
        ];
      }
      setChapters(chs);
      setArtifacts(artRes.data.artifacts || []);
      
      const battles = bbRes.data.battles || [];
      const active = battles.find(b => b.status === 'active');
      const completed = battles.find(b => b.status === 'completed');
      if (active) {
        setBossBattle(active);
        await loadBossBattle(active.id);
      } else if (completed) {
        setBossBattle(completed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBossBattle = async (battleId) => {
    try {
      const res = await newquestAPI.getBossBattle(battleId);
      setBossBattle(res.data.bossBattle);
      setBattleState(res.data);
    } catch (e) {
      console.error('Failed to load boss battle', e);
    }
  };

  const startBossBattle = async () => {
    if (!project) return;
    setLoading(true);
    try {
      const res = await newquestAPI.startBossBattle(project.id);
      await loadBossBattle(res.data.bossBattle.id);
      setView('battle');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start battle');
    } finally {
      setLoading(false);
    }
  };

  const resumeBattle = async () => {
    if (bossBattle) {
      await loadBossBattle(bossBattle.id);
      setView('battle');
    }
  };

  const handleStageSubmit = async (result) => {
    if (!bossBattle) return;
    // Reload battle state after short delay for animation
    setTimeout(async () => {
      await loadBossBattle(bossBattle.id);
      if (result.status === 'victory' || result.status === 'progress' || result.status === 'hotfix-resolved') {
        // Stay in battle view, state will update
      }
    }, 800);
  };

  const handleDownshift = async () => {
    if (!bossBattle) return;
    try {
      await newquestAPI.downshift(bossBattle.id);
      await loadBossBattle(bossBattle.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Downshift failed');
    }
  };

  const handleRetake = async () => {
    if (!bossBattle) return;
    setLoading(true);
    try {
      await newquestAPI.retake(bossBattle.id);
      await loadBossBattle(bossBattle.id);
      setView('battle');
    } catch (err) {
      setError('Retake failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLearnChapter = (chapter) => {
    setActiveChapter(chapter);
    setView('learn');
  };

  const handleCompleteChapter = async () => {
    if (!activeChapter) return;
    try {
      await newquestAPI.completeChapter(activeChapter.id);
      await loadProjectData(project.id);
      setView('hub');
      setActiveChapter(null);
    } catch (err) {
      setError('Failed to complete chapter');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚔️</div>
          <p className={`${fontRetro} text-[10px] text-primary`}>Loading Newquest...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {view === 'hub' && (
          <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HubView
              project={project}
              chapters={chapters}
              artifacts={artifacts}
              bossBattle={bossBattle}
              onStartBattle={startBossBattle}
              onResumeBattle={resumeBattle}
              onRetake={handleRetake}
              onLearnChapter={handleLearnChapter}
            />
          </motion.div>
        )}
        
        {view === 'battle' && battleState && (
          <motion.div key="battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BossBattleView
              battleState={battleState}
              project={project}
              artifacts={artifacts}
              onBack={() => setView('hub')}
              onStageSubmit={handleStageSubmit}
              onDownshift={handleDownshift}
            />
          </motion.div>
        )}
        
        {view === 'learn' && activeChapter && (
          <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LearnChapterView
              chapter={activeChapter}
              project={project}
              artifacts={artifacts}
              onBack={() => setView('hub')}
              onComplete={handleCompleteChapter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-4 z-[100] bg-error-container text-error px-4 py-3 border-2 border-error max-w-sm shadow-lg"
          >
            <p className={`${fontRetro} text-[8px] leading-relaxed`}>{error}</p>
            <button onClick={() => setError(null)} className="text-xs underline mt-2 hover:text-white">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
