import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { 
  Terminal, Flag, Play, Trash2, CheckCircle, Lock, Skull,
  FileText, LineChart, Bolt, ChevronRight, RotateCcw, Trophy, AlertTriangle,
  ArrowLeft, Code, Target, Zap, Swords, ChevronLeft, HelpCircle,
  Lightbulb, BookOpen, Database, Award, Copy, Search, ClipboardList,
  CheckCheck, Clock, Sparkles, Bell, Settings, TrendingUp,
  LayoutGrid, Bot, GitBranch, User, Shield, FlaskConical, Gem, Pin, X
} from 'lucide-react';
import api from '../../utils/api';
import TopAppBar from '../layout/TopAppBar';
import SideNavBar, { BottomNavBar, defaultNavItems } from '../layout/SideNavBar';

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
  startBossBattle: (projectId, focus) => api.post('/boss-battles/start', { projectId, focus }),
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
const TopBar = ({ title = 'KNOWLEDGE VAULT', tabs = [] }) => (
  <header className="fixed top-0 w-full z-50 bg-[#1a063b] text-[#ffb1c4] font-['Space_Grotesk'] uppercase tracking-wider border-b-2 border-[#271448] flex justify-between items-center px-6 h-20">
    <div className="flex items-center gap-8">
      <div className="text-2xl font-bold text-[#ffb1c4] tracking-tighter font-headline">{title}</div>
      <div className="hidden lg:flex items-center gap-6">
        {tabs.map((t, i) => (
          <span key={i} className={`${t.active ? 'text-[#ffb1c4] border-b-2 border-[#ffb1c4]' : 'text-[#ddfcff] opacity-70 hover:text-[#ffb1c4]'} transition-colors duration-75 font-headline uppercase tracking-wider text-sm cursor-pointer pb-2`}>{t.label}</span>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 text-[#ffb1c4] hover:bg-[#271448] transition-colors duration-75">
        <span className="font-game text-sm">$</span>
      </button>
      <button className="p-2 text-[#ffb1c4] hover:bg-[#271448] transition-colors duration-75 relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-primary-container" />
      </button>
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
        <PixelBtn onClick={onHint} variant="tertiary" icon={HelpCircle} className="text-[8px] py-2">
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
  const [hintOpen, setHintOpen] = useState(false);

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
    setHintOpen(false);
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

  const stageNames = stages.map((s, i) => s.title?.toUpperCase() || `STAGE ${i + 1}`);
  const stageTitles = stageNames.length >= 3 ? stageNames : ['DATA INGESTION', 'TRANSFORMATION', 'VISUALIZATION'];

  const previousSolution = activeStageNumber > 1 ? stageSolutions[activeStageNumber - 2] : null;

  return (
    <div className="bg-background text-on-background font-body px-4 md:px-8 pb-8">
      {/* Back Bar */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-on-surface/70 hover:text-primary transition-colors px-3 py-2 bg-surface-container border-2 border-outline-variant/20">
          <ArrowLeft className="w-4 h-4" />
          <span className={`${fontRetro} text-[10px] uppercase`}>Back to Hub</span>
        </button>
        <div className="flex items-center gap-2">
          <Swords className="text-tertiary w-5 h-5" />
          <span className={`${fontRetro} text-[10px] text-tertiary uppercase`}>BOSS BATTLE: THE SYNTHESIS</span>
        </div>
      </div>
        {/* Battle Arena Header */}
        <section className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className={`${fontRetro} text-xl text-primary mb-2`}>BATTLE ARENA: {battle.title?.toUpperCase() || 'DATA SYNTHESIS'}</h1>
              <p className="font-body text-secondary/60 text-sm italic">Master the flow or be consumed by the void.</p>
            </div>
            <div className="text-right">
              <span className={`${fontRetro} text-[10px] text-tertiary`}>CURRENT STAGE: {stageTitles[currentStageIndex]}</span>
            </div>
          </div>
          <div className="h-10 bg-surface-container-highest flex relative overflow-hidden border-4 border-surface-container">
            {stageTitles.map((title, idx) => {
              const status = getStageStatus(idx);
              return (
                <div key={idx} className={`flex-1 flex items-center justify-center border-r-4 border-background last:border-r-0 relative ${
                  status === 'completed' ? 'bg-primary-container' :
                  status === 'active' ? 'bg-secondary overflow-hidden' :
                  'bg-surface-container-low'
                }`}>
                  {status === 'active' && <div className="absolute inset-0 bg-secondary-fixed-dim/20 animate-pulse" />}
                  <span className={`${fontRetro} text-[8px] text-center relative z-10 ${
                    status === 'completed' ? 'text-on-primary' :
                    status === 'active' ? 'text-on-secondary' :
                    'text-on-surface-variant opacity-40'
                  }`}>
                    {title}
                  </span>
                  {status === 'completed' && <CheckCircle className="absolute right-2 w-4 h-4 text-on-primary" />}
                  {status === 'active' && <div className="absolute bottom-0 left-0 h-1 bg-on-secondary w-full" />}
                </div>
              );
            })}
          </div>
        </section>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Chapter Rituals */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-surface-container p-1 border-4 border-surface-container shadow-[0_0_0_2px_#271448] border-2 border-outline-variant/30">
              <div className="bg-surface-container-high p-4 flex justify-between items-center border-b-2 border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary w-5 h-5" />
                  <span className={`${fontRetro} text-[10px] text-primary`}>CHAPTER RITUALS</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error" />
                  <div className="w-3 h-3 rounded-full bg-tertiary" />
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                </div>
              </div>
              <div className="p-6 font-mono text-sm space-y-4 bg-background/50">
                {hotfixMode && previousSolution && (
                  <>
                    <div className="flex gap-4 opacity-60">
                      <span className="text-secondary/30 select-none">00</span>
                      <p className="text-secondary">{'// PREVIOUS STAGE OUTPUT (READ-ONLY)'}</p>
                    </div>
                    <div className="text-on-surface-variant opacity-60 mb-2 p-3 bg-surface-container/30 border-l-2 border-error">
                      <pre className="whitespace-pre-wrap text-xs">{typeof previousSolution.solution === 'string' ? previousSolution.solution : JSON.stringify(previousSolution.solution, null, 2)}</pre>
                    </div>
                  </>
                )}
                {!hotfixMode && currentStage?.task && (
                  <div className="flex gap-4">
                    <span className="text-secondary/30 select-none">00</span>
                    <p className="text-secondary">{'// TASK: '}{currentStage.task}</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <span className="text-secondary/30 select-none">01</span>
                  <p className="text-secondary">{'// Execute the ritual of transformation'}</p>
                </div>
                <div className="flex gap-4">
                  <span className="text-secondary/30 select-none">02</span>
                  <p className="text-on-background"><span className="text-primary">const</span> <span className="text-secondary">essence</span> = <span className="text-tertiary">fetch</span>(<span className="text-primary">'/void/raw-data'</span>);</p>
                </div>
                <div className="flex gap-4">
                  <span className="text-secondary/30 select-none">03</span>
                  <p className="text-on-background"><span className="text-primary">const</span> <span className="text-secondary">refined</span> = essence.<span className="text-tertiary">map</span>(relic =&gt; {'{'}</p>
                </div>
                <div className="flex gap-4">
                  <span className="text-secondary/30 select-none">04</span>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder={hotfixMode ? "   return { ...relic, value: 42.0 };" : "   return { ...relic, power: relic.value * 1.5 };"}
                    className="flex-1 bg-transparent font-mono text-sm text-on-background focus:outline-none resize-none h-24 whitespace-pre"
                  />
                </div>
                <div className="flex gap-4">
                  <span className="text-secondary/30 select-none">05</span>
                  <p className="text-on-background">{'}'});</p>
                </div>
                {result && !result.passed && (
                  <div className="bg-error-container/20 border-l-4 border-error p-3 mt-4">
                    <p className="text-error font-game text-[8px] uppercase">RUNTIME ERROR: {result.diagnosis || 'VALIDATION FAILED'}</p>
                  </div>
                )}
              </div>
              <div className="p-4 flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !solution.trim()}
                  className="flex-1 bg-primary-container text-on-primary py-3 font-game text-[10px] border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all uppercase disabled:opacity-50"
                >
                  {submitting ? 'CASTING...' : hotfixMode ? 'SUBMIT HOTFIX' : 'CAST RITUAL'}
                </button>
                <button onClick={() => { setSolution(''); setResult(null); }} className="bg-surface-container-highest text-secondary p-3 border-b-4 border-background active:translate-y-1 active:border-b-0 transition-all">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Hotfix Mode UI */}
            {isHotfixRequired && (
              <div className="bg-surface-container p-4 border-4 border-primary">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-primary w-5 h-5" />
                    <span className={`${fontRetro} text-[10px] text-primary`}>HOTFIX MODE: UPSTREAM DEBUGGING</span>
                  </div>
                  <span className="bg-primary text-on-primary px-2 py-0.5 text-[8px] font-game">LIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-3 border border-outline-variant/20">
                    <p className="text-[8px] font-game text-secondary/40 mb-2">RAW_SOURCE.JSON</p>
                    <code className="text-[10px] text-secondary-fixed/70">"value": null</code>
                  </div>
                  <div className="bg-background p-3 border-2 border-primary/50">
                    <p className="text-[8px] font-game text-primary/40 mb-2">HOTFIX_PATCH.JSON</p>
                    <code className="text-[10px] text-primary">"value": 42.0</code>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => setHotfixMode(!hotfixMode)} className={`px-4 py-2 font-game text-[8px] uppercase border-b-4 active:translate-y-1 active:border-b-0 transition-all ${hotfixMode ? 'bg-surface-container-highest text-on-surface border-background' : 'bg-primary text-on-primary border-on-primary-fixed-variant'}`}>
                    {hotfixMode ? 'EXIT HOTFIX' : 'ENTER HOTFIX'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Pane: Live Simulation & Knowledge Artifacts */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live Simulation Output */}
            <div className="bg-surface-container p-1 border-4 border-surface-container shadow-[0_0_0_2px_#271448] border-2 border-secondary/30">
              <div className="bg-surface-container-high p-4 flex justify-between items-center border-b-2 border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <Bot className="text-secondary w-5 h-5" />
                  <span className={`${fontRetro} text-[10px] text-secondary`}>LIVE SIMULATION</span>
                </div>
                <div className="flex items-center gap-2 text-secondary/50">
                  <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
                  <span className={`${fontRetro} text-[8px]`}>FEED ACTIVE</span>
                </div>
              </div>
              <div className="aspect-video bg-surface-container-lowest relative flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ddfcff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative w-full h-full p-8 flex flex-col justify-center gap-4">
                  {/* Sim Visual */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-primary border-4 border-primary animate-bounce ${result?.passed ? 'bg-secondary' : ''}`} />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-secondary w-full" />
                      <div className="h-2 bg-secondary/30 w-3/4" />
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-4 gap-2">
                    {[24, 16, 32, 20].map((h, i) => (
                      <div key={i} className="bg-surface-container-highest border-t-2 border-tertiary" style={{ height: `${h * 4}px`, marginTop: i % 2 === 0 ? '0' : '16px' }} />
                    ))}
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-background/80 px-3 py-1 border border-secondary/20">
                  <span className={`${fontRetro} text-[10px] text-secondary`}>FPS: 60</span>
                </div>
                {/* Result overlay */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute inset-0 flex items-center justify-center bg-background/80 border-4 ${result.passed ? 'border-secondary' : 'border-error'}`}
                    >
                      <div className="text-center p-6">
                        {result.passed ? <Trophy className="w-12 h-12 text-secondary mx-auto mb-2" /> : <AlertTriangle className="w-12 h-12 text-error mx-auto mb-2" />}
                        <p className={`${fontRetro} text-sm ${result.passed ? 'text-secondary' : 'text-error'}`}>
                          {result.passed ? 'RITUAL SUCCESS' : 'RITUAL FAILED'}
                        </p>
                        {result.status === 'victory' && <BadgeStars tier={result.badge} size="lg" />}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Knowledge Artifacts Bento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-surface-container p-4 border-2 border-outline-variant/20">
                <div className="flex justify-between items-center mb-4">
                  <span className={`${fontRetro} text-[10px] text-tertiary uppercase`}>Knowledge Artifacts</span>
                  <button className="bg-primary/20 text-primary p-1">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {artifacts.slice(0, 3).map((art, idx) => {
                    const rarity = idx === 0 ? 'Legendary' : idx === 1 ? 'Epic' : 'Common';
                    const color = idx === 0 ? 'border-tertiary text-tertiary' : idx === 1 ? 'border-primary text-primary' : 'border-secondary text-secondary';
                    return (
                      <div key={art.id} className={`bg-surface-container-low p-3 border-l-4 ${color.split(' ')[0]} flex items-center gap-3 group hover:bg-surface-container-high transition-colors cursor-pointer`}>
                        <div className={`w-10 h-10 flex items-center justify-center ${idx === 0 ? 'bg-tertiary/10' : idx === 1 ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                          <FileText className={`w-5 h-5 ${color.split(' ')[1]}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`${fontRetro} text-[8px] text-on-surface`}>{art.title}</p>
                          <p className={`text-[8px] ${color.split(' ')[1]} font-bold uppercase tracking-widest`}>{rarity} Artifact</p>
                        </div>
                        <ChevronRight className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
                      </div>
                    );
                  })}
                  {artifacts.length === 0 && (
                    <div className="p-3 text-on-surface-variant text-sm opacity-50">No artifacts forged yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action & AI Support */}
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-40">
          <AnimatePresence>
            {hintOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-surface-container-highest p-4 border-4 border-primary/40 max-w-xs mb-2"
              >
                <p className="text-xs text-primary leading-relaxed">
                  {currentStage?.hint || "Check your Knowledge Artifacts for clues. The map() function requires a consistent return structure."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setHintOpen(!hintOpen)}
            className="group bg-surface-container p-4 border-4 border-primary flex items-center gap-4 hover:scale-105 transition-transform duration-75"
          >
            <div className="flex flex-col items-end">
              <span className={`${fontRetro} text-[8px] text-primary`}>REQUEST HINT</span>
              <span className="font-headline text-[10px] text-secondary/60">KIMI AI ACTIVE</span>
            </div>
            <div className="w-12 h-12 bg-primary flex items-center justify-center text-on-primary">
              <Bot className="w-7 h-7" />
            </div>
          </button>
        </div>
    </div>
  );
};

// ============================================
// LEARN CHAPTER VIEW (StoryQuest Style)
// ============================================
const LearnChapterView = ({ chapter, project, artifacts, onBack, onComplete }) => {
  const [completing, setCompleting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleComplete = async () => {
    if (completing) return;
    setCompleting(true);
    try {
      await onComplete();
    } finally {
      setCompleting(false);
    }
  };

  const content = chapter?.full_lesson || chapter?.content?.fullLesson || `This chapter covers ${chapter?.title}. Master the concepts to forge your Knowledge Artifact.`;
  const keyPoints = chapter?.key_points || chapter?.content?.keyPoints || ['Key concept 1', 'Key concept 2', 'Key concept 3'];
  const whyItMatters = chapter?.why_it_matters || chapter?.content?.whyItMatters || 'This skill is essential for completing your project.';
  const context = chapter?.context || chapter?.content?.context || 'You enter the learning chamber...';

  // Parse lesson into sections if it contains markers
  const lessonSections = content.split(/\n#{2,3}\s+/).filter(Boolean);
  const hasSections = lessonSections.length > 1;

  return (
    <div className="bg-background text-on-background font-body min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 flex justify-between items-center w-full px-4 md:px-8 py-4 bg-background/95 backdrop-blur border-b-4 border-surface-container">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-on-surface/70 hover:text-primary transition-colors px-3 py-2 bg-surface-container border-2 border-outline-variant/20">
            <ArrowLeft className="w-4 h-4" />
            <span className={`${fontRetro} text-[10px] uppercase`}>Back to Hub</span>
          </button>
          <span className={`${fontRetro} text-[10px] text-secondary uppercase hidden sm:inline`}>ACTIVE PROJECT: {project?.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-surface-container border-2 border-primary text-primary hover:bg-primary hover:text-on-primary transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span className={`${fontRetro} text-[8px] uppercase hidden sm:inline`}>KIMI AI</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Story Narrative Hero */}
          <section className="relative h-64 w-full bg-surface-container overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="relative h-full p-6 md:p-10 flex flex-col justify-end">
              <span className={`${fontRetro} text-[10px] text-primary-fixed-dim mb-2 uppercase tracking-widest`}>{context}</span>
              <h2 className={`${fontRetro} text-xl md:text-3xl text-primary mb-3 leading-tight`}>{chapter?.title?.toUpperCase()}</h2>
              <p className="max-w-2xl text-on-surface text-sm md:text-base leading-relaxed font-light italic opacity-80">
                {whyItMatters}
              </p>
            </div>
          </section>

          {/* Lesson Content Grid */}
          <div className="px-4 md:px-8 py-8 space-y-8 max-w-5xl mx-auto">
            {/* Key Points */}
            <div className="bg-surface-container p-6 md:p-8 border-2 border-outline-variant shadow-[4px_4px_0_0_#1a063b] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-24 h-24 text-primary" />
              </div>
              <h3 className={`${fontRetro} text-[10px] text-tertiary mb-6 uppercase`}>Core Concepts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {keyPoints.map((pt, i) => {
                  const colors = ['text-secondary', 'text-primary', 'text-tertiary'];
                  const bgColors = ['bg-secondary/10', 'bg-primary/10', 'bg-tertiary/10'];
                  const borderColors = ['border-secondary', 'border-primary', 'border-tertiary'];
                  const c = i % 3;
                  return (
                    <div key={i} className={`flex gap-4 p-4 bg-surface-container-low border-l-4 ${borderColors[c]}`}>
                      <div className={`w-10 h-10 ${bgColors[c]} border ${borderColors[c]} flex items-center justify-center flex-shrink-0`}>
                        <CheckCheck className={`w-5 h-5 ${colors[c]}`} />
                      </div>
                      <div>
                        <p className={`font-headline font-bold text-sm ${colors[c]}`}>{String(pt).toUpperCase()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full Lesson */}
            <div className="bg-surface-container-high p-6 md:p-8 border-l-8 border-primary">
              <h3 className={`${fontRetro} text-[10px] text-primary mb-6 uppercase`}>The Lesson</h3>
              {hasSections ? (
                <div className="space-y-6">
                  {lessonSections.map((section, i) => {
                    const lines = section.split('\n').filter(Boolean);
                    const title = lines[0] || `Section ${i + 1}`;
                    const body = lines.slice(1).join('\n');
                    return (
                      <div key={i} className="bg-surface-container-lowest p-4 border border-outline-variant">
                        <h4 className={`${fontRetro} text-[8px] text-secondary mb-2 uppercase`}>{title}</h4>
                        <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{body}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="font-body text-on-surface leading-relaxed space-y-4 text-base whitespace-pre-wrap">
                  {content}
                </div>
              )}
            </div>

            {/* Mastery Challenge */}
            <div className="bg-surface-container p-6 md:p-8 border-2 border-outline-variant shadow-[4px_4px_0_0_#1a063b]">
              <h3 className={`${fontRetro} text-[10px] text-tertiary mb-4 uppercase`}>Mastery Challenge</h3>
              <p className="text-sm text-on-surface leading-relaxed mb-6">
                Apply what you've learned. Complete this challenge to forge your Knowledge Artifact and unlock the next stage of your quest.
              </p>
              <PixelBtn onClick={handleComplete} variant="primary" icon={ChevronRight} disabled={completing}>
                {completing ? 'FORGING ARTIFACT...' : 'COMPLETE QUEST'}
              </PixelBtn>
            </div>

            {/* Why It Matters */}
            <div className="bg-surface-variant/40 p-6 md:p-8 border-2 border-outline-variant">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-20 h-20 flex-shrink-0 bg-surface-container-lowest border-4 border-tertiary flex items-center justify-center">
                  <Lightbulb className="w-10 h-10 text-tertiary" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-tertiary mb-2">Why It Matters</h3>
                  <p className="text-on-surface leading-relaxed">
                    {whyItMatters}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar (Knowledge Vault + AI Tutor) */}
        <aside className={`fixed right-0 top-[73px] h-[calc(100vh-73px)] w-80 bg-surface-container border-l-4 border-background flex flex-col z-20 transition-transform duration-300 ${chatOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:h-auto lg:border-l-4 lg:border-surface-dim`}>
          {/* Knowledge Vault */}
          <div className="p-6 border-b-4 border-background">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-4 h-4 text-tertiary" />
              <h2 className={`${fontRetro} text-[10px] text-on-surface`}>KNOWLEDGE VAULT</h2>
            </div>
            <div className="space-y-3">
              {artifacts.length > 0 ? artifacts.slice(0, 3).map((art, idx) => {
                const colors = [
                  { border: 'border-secondary', text: 'text-secondary', bg: 'bg-secondary/10' },
                  { border: 'border-primary', text: 'text-primary', bg: 'bg-primary/10' },
                  { border: 'border-tertiary', text: 'text-tertiary', bg: 'bg-tertiary/10' }
                ];
                const c = colors[idx % 3];
                return (
                  <div key={art.id} className={`bg-surface-container-low p-3 border ${c.border} flex items-center gap-3 group cursor-help`}>
                    <div className={`w-10 h-10 ${c.bg} border ${c.border} flex items-center justify-center ${c.text} group-hover:bg-opacity-100 transition-colors`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`${fontRetro} text-[8px] text-on-surface`}>{art.title?.toUpperCase()}</p>
                      <p className="text-[10px] text-on-surface-variant">Artifact {idx + 1}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="bg-surface-container-low p-4 border border-outline-variant text-center">
                  <p className="text-xs text-on-surface-variant italic">Complete chapters to forge artifacts</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Tutor Chat Panel */}
          <div className="flex-1 flex flex-col p-4 min-h-0">
            <div className="flex items-center gap-3 mb-4 bg-surface-container-high p-3 border-2 border-primary">
              <div className="relative">
                <div className="w-10 h-10 bg-background border-2 border-primary flex items-center justify-center overflow-hidden">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-background" />
              </div>
              <div>
                <p className={`${fontRetro} text-[10px] text-primary`}>KIMI AI</p>
                <p className="text-[8px] font-medium text-secondary">TUTOR IS ONLINE</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto mb-4 p-2">
              <div className="bg-surface-container-low p-3 border-l-4 border-secondary text-sm">
                <p className="text-on-surface leading-relaxed">
                  "Welcome to your lesson on <span className="text-secondary font-bold">{chapter?.title}</span>. I'm here to help if you get stuck!"
                </p>
              </div>
              <div className="bg-surface-container-low p-3 border-l-4 border-secondary text-sm">
                <p className="text-on-surface leading-relaxed text-xs">
                  💡 <span className="font-bold">Tip:</span> Focus on the key concepts first, then try the mastery challenge.
                </p>
              </div>
            </div>
            <div className="relative mt-auto">
              <input 
                className="w-full bg-background border-2 border-outline-variant px-4 py-3 font-body text-sm focus:outline-none focus:border-primary text-on-surface"
                placeholder="Ask Kimi..."
                type="text"
                readOnly
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Chat Toggle */}
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary border-4 border-background flex items-center justify-center lg:hidden shadow-lg active:scale-95 transition-transform"
      >
        <Bot className="w-7 h-7 text-on-primary" />
      </button>
    </div>
  );
};

// ============================================
// HUB VIEW
// ============================================
const HubView = ({ user, project, chapters, artifacts, bossBattle, activeTab, onTabChange, onStartBattle, onResumeBattle, onRetake, onLearnChapter, onGenerateFirstChapter, onStartNewQuest, generating }) => {
  const completedCount = chapters.filter(c => c.status === 'completed').length;
  const progress = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;
  const activeChapter = chapters.find(c => c.status === 'active');

  const skillSteps = chapters.map((ch) => ({
    id: ch.id,
    title: ch.title?.toUpperCase() || 'CHAPTER',
    status: ch.status,
    icon: ch.title?.toLowerCase().includes('clean') ? Trash2 :
          ch.title?.toLowerCase().includes('csv') || ch.title?.toLowerCase().includes('load') ? Terminal :
          ch.title?.toLowerCase().includes('visual') ? LineChart : Code
  }));

  const allChaptersCompleted = chapters.length > 0 && chapters.every(c => c.status === 'completed');
  const canAccessBoss = allChaptersCompleted || bossBattle?.status === 'completed';

  skillSteps.push({
    id: 'boss',
    title: 'BOSS BATTLE',
    status: bossBattle?.status === 'completed' ? 'completed' :
            canAccessBoss && (bossBattle?.status === 'active' || bossBattle?.status === 'in_progress') ? 'active' : 'locked',
    icon: Skull
  });

  const internalTabs = [
    { id: 'skilltree', label: 'Hero Stats', icon: User },
    { id: 'quests', label: 'Quest Log', icon: ClipboardList },
    { id: 'artifacts', label: 'Artifacts', icon: FileText },
    { id: 'rankings', label: 'Hall of Heroes', icon: Trophy },
  ];

  const handleStartQuest = () => {
    console.log('[START QUEST clicked]', { chaptersCount: chapters.length, chapterStatuses: chapters.map(c => c.status), hasProject: !!project });
    const activeCh = chapters.find(c => c.status === 'active');
    if (activeCh && onLearnChapter) {
      console.log('[START QUEST] opening active chapter:', activeCh.id);
      onLearnChapter(activeCh);
    } else if (chapters.length === 0 && onGenerateFirstChapter) {
      console.log('[START QUEST] no chapters, generating first');
      onGenerateFirstChapter();
    } else if (chapters.every(c => c.status === 'completed') && onStartBattle) {
      console.log('[START QUEST] all completed, starting boss');
      onStartBattle();
    } else if (onGenerateFirstChapter) {
      console.log('[START QUEST] fallback, generating next chapter');
      onGenerateFirstChapter();
    } else {
      console.warn('[START QUEST] no action taken');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Internal Tab Bar */}
      <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-outline-variant/20 pb-2">
        {internalTabs.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2 font-game text-[10px] uppercase transition-transform ${
                isActive
                  ? 'bg-primary-container text-on-primary border-b-4 border-on-primary-fixed-variant'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
        <button
          onClick={handleStartQuest}
          disabled={generating}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-tertiary text-on-tertiary font-game text-[10px] uppercase border-b-4 border-on-tertiary-fixed-variant hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-on-tertiary border-t-transparent rounded-full animate-spin" />
              GENERATING...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              START QUEST
            </>
          )}
        </button>
        {onStartNewQuest && (
          <button
            onClick={onStartNewQuest}
            className="flex items-center gap-2 px-3 py-2 bg-surface-container-highest text-primary font-game text-[10px] uppercase border-b-4 border-background hover:translate-y-0.5 transition-transform"
          >
            <Sparkles className="w-3 h-3" />
            NEW QUEST
          </button>
        )}
      </div>

      {activeTab === 'skilltree' && (
        <SkillTreeContent
          project={project}
          chapters={chapters}
          artifacts={artifacts}
          bossBattle={bossBattle}
          skillSteps={skillSteps}
          progress={progress}
          activeChapter={activeChapter}
          onStartBattle={onStartBattle}
          onResumeBattle={onResumeBattle}
          onRetake={onRetake}
          onLearnChapter={onLearnChapter}
          onGenerateFirstChapter={onGenerateFirstChapter}
          generating={generating}
        />
      )}
      {activeTab === 'quests' && (
        <QuestsContent user={user} project={project} chapters={chapters} bossBattle={bossBattle} onLearnChapter={onLearnChapter} onStartBattle={onStartBattle} onResumeBattle={onResumeBattle} onGenerateFirstChapter={onGenerateFirstChapter} generating={generating} />
      )}
      {activeTab === 'artifacts' && (
        <ArtifactsContent artifacts={artifacts} chapters={chapters} onLearnChapter={onLearnChapter} onStartBattle={onStartBattle} />
      )}
      {activeTab === 'rankings' && (
        <RankingsContent project={project} chapters={chapters} bossBattle={bossBattle} />
      )}
    </div>
  );
};

// ============================================
// SKILL TREE CONTENT
// ============================================
const SkillTreeContent = ({ project, chapters, artifacts, bossBattle, skillSteps, progress, activeChapter, onStartBattle, onResumeBattle, onRetake, onLearnChapter, onGenerateFirstChapter, generating }) => (
  <>
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
        <GitBranch className="text-primary text-3xl" />
        <h2 className="font-headline font-extrabold text-2xl tracking-tight uppercase">Project Skill Tree</h2>
      </div>
      <div className="bg-surface-container-low p-8 md:p-12 relative overflow-hidden border-2 border-outline-variant/20">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
          <path d="M 150,150 L 400,150 L 650,150 L 900,150" fill="none" stroke="#ffb1c4" strokeDasharray="8 8" strokeWidth="4" />
        </svg>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {skillSteps.map((step) => {
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
                   step.icon === Trash2 ? <Trash2 className="w-8 h-8 md:w-10 md:h-10 text-primary" /> :
                   step.icon === Skull ? <Skull className="w-8 h-8 md:w-10 md:h-10 text-tertiary" /> :
                   step.icon === LineChart ? <LineChart className="w-8 h-8 md:w-10 md:h-10 text-primary" /> :
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
                    {bossBattle?.status === 'active' || bossBattle?.status === 'in_progress' ? (
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
          <FileText className="text-tertiary" />
          <h3 className="font-headline font-bold text-xl uppercase tracking-tighter">Knowledge Artifacts</h3>
        </div>
        <div className="space-y-4">
          {artifacts.length > 0 ? artifacts.slice(0, 4).map((art) => (
            <div key={art.id} className="bg-surface-container p-4 border-l-4 border-tertiary flex items-center justify-between group hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center">
                  <FileText className="text-tertiary" />
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
                  <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center"><FileText className="text-tertiary" /></div>
                  <div><h4 className="font-headline font-bold text-sm">Pandas Cheat Sheet</h4><p className="text-xs text-on-surface-variant">Forged 2 days ago</p></div>
                </div>
              </div>
              <div className="bg-surface-container p-4 border-l-4 border-outline-variant opacity-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center"><LineChart className="text-on-surface-variant" /></div>
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
                <PixelBtn onClick={() => onLearnChapter(activeChapter)} variant="primary" icon={Play}>
                  BEGIN CODING QUEST
                </PixelBtn>
              ) : chapters.length === 0 && onGenerateFirstChapter ? (
                <PixelBtn onClick={onGenerateFirstChapter} variant="primary" icon={generating ? null : Play} disabled={generating}>
                  {generating ? 'GENERATING...' : 'START FIRST CHAPTER'}
                </PixelBtn>
              ) : chapters.every(c => c.status === 'completed') && !bossBattle ? (
                <PixelBtn onClick={onStartBattle} variant="tertiary" icon={Swords}>
                  START BOSS BATTLE
                </PixelBtn>
              ) : onGenerateFirstChapter ? (
                <PixelBtn onClick={onGenerateFirstChapter} variant="primary" icon={generating ? null : Play} disabled={generating}>
                  {generating ? 'GENERATING...' : 'CONTINUE QUEST'}
                </PixelBtn>
              ) : (
                <PixelBtn onClick={onResumeBattle} variant="primary" icon={Play}>
                  {bossBattle?.status === 'active' || bossBattle?.status === 'in_progress' ? 'RESUME BOSS BATTLE' : 'CONTINUE'}
                </PixelBtn>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
);

// ============================================
// QUESTS CONTENT
// ============================================
const QuestsContent = ({ user, project, chapters, bossBattle, onLearnChapter, onStartBattle, onResumeBattle, onGenerateFirstChapter, generating }) => {
  const completedCount = chapters.filter(c => c.status === 'completed').length;
  const progress = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;
  const allChaptersCompleted = chapters.length > 0 && chapters.every(c => c.status === 'completed');
  const canAccessBoss = allChaptersCompleted || bossBattle?.status === 'completed';

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Hero Stats Sidebar */}
      <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
        <section className="bg-surface-container shadow-[4px_4px_0_0_#150136] border-2 border-outline-variant p-6 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-10">
            <Shield className="w-24 h-24 text-primary opacity-10" />
          </div>
          <h3 className={`${fontRetro} text-primary text-[10px] mb-6 uppercase tracking-tight`}>Hero Status</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-surface-container-highest border-4 border-primary flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className={`${fontRetro} text-xs text-on-surface`}>{user?.username?.toUpperCase() || 'HERO'}</p>
                <p className="text-primary text-xs font-bold mt-1">LVL {user?.level || 1} {user?.role?.toUpperCase() || 'ADVENTURER'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t-2 border-background pt-6">
              <div className="text-center">
                <p className="text-[8px] font-['Press_Start_2P'] text-on-surface/50 mb-1">POWER</p>
                <p className="text-xl font-['Space_Grotesk'] font-extrabold text-tertiary">{user?.xp || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-['Press_Start_2P'] text-on-surface/50 mb-1">STREAK</p>
                <p className="text-xl font-['Space_Grotesk'] font-extrabold text-secondary-fixed-dim">{user?.currentStreak || 0} DAYS</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container shadow-[4px_4px_0_0_#150136] border-2 border-outline-variant p-6">
          <h3 className={`${fontRetro} text-primary text-[10px] mb-6 uppercase tracking-tight`}>Unlocked Artifacts</h3>
          <div className="grid grid-cols-3 gap-3">
            {[BookOpen, FlaskConical, Gem, Lock, Lock, Lock].map((Icon, i) => (
              <div key={i} className={`aspect-square bg-background border-2 border-outline-variant flex items-center justify-center ${i > 2 ? 'opacity-30' : 'cursor-pointer hover:border-tertiary transition-colors group'}`}>
                <Icon className={`w-6 h-6 ${i > 2 ? 'text-on-surface' : 'text-tertiary group-hover:scale-110 transition-transform'}`} />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 bg-background text-on-surface text-[10px] font-['Press_Start_2P'] hover:bg-surface-container-highest transition-colors">VIEW ALL</button>
        </section>
      </div>

      {/* Central Quest List */}
      <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
        <div className="mb-10">
          <h1 className="font-['Space_Grotesk'] text-4xl font-extrabold tracking-tighter text-on-surface mb-2 uppercase">Quest Log</h1>
          <div className="flex items-center gap-3">
            <span className="h-1 w-12 bg-primary" />
            <p className="text-primary font-['Press_Start_2P'] text-[10px]">Project: {project?.title || 'Loading...'}</p>
          </div>
        </div>

        <div className="space-y-6">
          {chapters.length === 0 && onGenerateFirstChapter && (
            <div className="bg-surface-container p-1 border-b-4 border-surface-container-lowest">
              <div className="bg-surface-container border-2 border-outline-variant p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-primary-container text-white">NEW</span>
                    <span className="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-background border text-tertiary border-tertiary">ELITE TIER</span>
                  </div>
                  <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-on-surface mb-2">Chapter 1: Getting Started</h2>
                  <p className="text-secondary/60 text-sm mb-6 leading-relaxed">Your journey begins here. Generate your first chapter to start learning and forging artifacts.</p>
                </div>
                <div className="w-full md:w-auto flex flex-col gap-3">
                  <button onClick={onGenerateFirstChapter} disabled={generating} className="bg-primary-container hover:translate-y-0.5 transition-transform text-white font-['Press_Start_2P'] text-[10px] py-4 px-8 border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                    {generating ? 'GENERATING...' : 'START CHAPTER'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {chapters.map((ch, idx) => {
            const isActive = ch.status === 'active';
            const isCompleted = ch.status === 'completed';
            const isLocked = ch.status === 'locked';
            const stepsTotal = 5;
            const stepsDone = isCompleted ? stepsTotal : isActive ? 3 : 0;
            const diffDots = isActive ? 3 : isCompleted ? 4 : 1;
            const reward = isCompleted ? 100 : isActive ? 450 : 200;
            const tier = isActive ? 'ELITE TIER' : isCompleted ? 'MASTER TIER' : 'NORMAL TIER';
            const tierColor = isActive ? 'text-tertiary border-tertiary' : isCompleted ? 'text-secondary border-secondary' : 'text-secondary-fixed-dim border-secondary-fixed-dim';

            return isCompleted ? (
              <div key={ch.id} className="bg-background p-4 border-2 border-outline-variant/30 flex items-center justify-between group cursor-pointer" onClick={() => onLearnChapter(ch)}>
                <div className="flex items-center gap-4">
                  <Swords className="text-tertiary w-6 h-6" />
                  <div>
                    <h4 className="text-on-surface/40 font-['Space_Grotesk'] font-bold text-lg uppercase tracking-wide line-through">{ch.title}</h4>
                    <p className="text-[8px] font-['Press_Start_2P'] text-tertiary">COMPLETED +{reward} XP</p>
                  </div>
                </div>
                <ChevronRight className="text-on-surface/40 group-hover:text-primary w-6 h-6" />
              </div>
            ) : (
              <div key={ch.id} className="bg-surface-container p-1 border-b-4 border-surface-container-lowest">
                <div className="bg-surface-container border-2 border-outline-variant p-6 flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isActive ? (
                        <span className="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-primary-container text-white">ACTIVE</span>
                      ) : (
                        <span className="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-background text-on-surface/60 border border-outline-variant">SUGGESTED</span>
                      )}
                      <span className={`text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-background border ${tierColor}`}>{tier}</span>
                    </div>
                    <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-on-surface mb-2">{ch.title}</h2>
                    <p className="text-secondary/60 text-sm mb-6 leading-relaxed">
                      {isActive ? 'Exorcise the null values and sanctify the schema of your fitness dataset. Purify 500 records to unlock the Sanitized badge.' : `Master the concepts of ${ch.title} to advance your project skills and forge a new artifact.`}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-[8px] font-['Press_Start_2P'] text-on-surface/40 mb-1">REWARD</p>
                        <div className="flex items-center gap-1 text-tertiary">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-bold text-sm">{reward} XP</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] font-['Press_Start_2P'] text-on-surface/40 mb-1">DIFFICULTY</p>
                        <div className="flex gap-0.5">
                          {[...Array(4)].map((_, i) => (
                            <span key={i} className={`w-2 h-2 ${i < diffDots ? (isActive ? 'bg-primary-container' : 'bg-secondary') : 'bg-background'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[8px] font-['Press_Start_2P'] text-on-surface/40 mb-1">PROGRESS ({stepsDone}/{stepsTotal} STEPS)</p>
                        <div className="h-2 bg-background w-full flex">
                          <div className="h-full bg-secondary-fixed-dim flex" style={{ width: `${(stepsDone/stepsTotal)*100}%` }}>
                            {[...Array(Math.max(1, stepsDone))].map((_, i) => <div key={i} className="w-1 h-full bg-background ml-1" />)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto flex flex-col gap-3">
                    {isActive ? (
                      <>
                        <button onClick={() => onLearnChapter(ch)} className="bg-primary-container hover:translate-y-0.5 transition-transform text-white font-['Press_Start_2P'] text-[10px] py-4 px-8 border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1">START CHAPTER</button>
                        <button className="bg-surface-container-highest hover:bg-surface-bright text-primary font-['Press_Start_2P'] text-[10px] py-4 px-8 border-b-4 border-background">REVIEW NOTES</button>
                      </>
                    ) : (
                      <button onClick={() => onGenerateFirstChapter && onGenerateFirstChapter()} className="bg-background text-on-surface font-['Press_Start_2P'] text-[10px] py-4 px-8 border-b-4 border-black hover:bg-surface-container-highest opacity-60 hover:opacity-100 transition-opacity">UNLOCK QUEST</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Boss Battle Card */}
          <div className="bg-surface-container p-1 border-b-4 border-surface-container-lowest">
            <div className="bg-surface-container border-2 border-outline-variant p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {bossBattle?.status === 'completed' ? (
                    <span className="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-secondary text-on-secondary">COMPLETED</span>
                  ) : canAccessBoss && (bossBattle?.status === 'active' || bossBattle?.status === 'in_progress') ? (
                    <span className="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-tertiary text-on-tertiary">ACTIVE</span>
                  ) : (
                    <span className="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-background text-on-surface/60 border border-outline-variant">LOCKED</span>
                  )}
                  <span className="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-background text-error border border-error">LEGENDARY</span>
                </div>
                <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-on-surface mb-2">Boss Battle: The Synthesis</h2>
                <p className="text-secondary/60 text-sm mb-6 leading-relaxed">
                  {canAccessBoss 
                    ? 'Combine all forged artifacts into a final working deliverable. Three stages. No room for error.' 
                    : 'Complete all chapters to unlock the Boss Battle. Forge your artifacts first.'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-[8px] font-['Press_Start_2P'] text-on-surface/40 mb-1">REWARD</p>
                    <div className="flex items-center gap-1 text-tertiary">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-bold text-sm">1200 XP</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-['Press_Start_2P'] text-on-surface/40 mb-1">DIFFICULTY</p>
                    <div className="flex gap-0.5">
                      {[...Array(4)].map((_, i) => <span key={i} className="w-2 h-2 bg-error" />)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto flex flex-col gap-3">
                {canAccessBoss && (bossBattle?.status === 'active' || bossBattle?.status === 'in_progress') && (
                  <button onClick={onResumeBattle} className="bg-tertiary hover:translate-y-0.5 transition-transform text-on-tertiary font-['Press_Start_2P'] text-[10px] py-4 px-8 border-b-4 border-on-tertiary-fixed-variant active:border-b-0 active:translate-y-1">RESUME BATTLE</button>
                )}
                {(!canAccessBoss || !bossBattle || bossBattle?.status === 'locked') && (
                  <button className="bg-background text-on-surface font-['Press_Start_2P'] text-[10px] py-4 px-8 border-b-4 border-black hover:bg-surface-container-highest opacity-60 hover:opacity-100 transition-opacity">LOCKED</button>
                )}
                {bossBattle?.status === 'completed' && (
                  <button className="bg-secondary hover:translate-y-0.5 transition-transform text-on-secondary font-['Press_Start_2P'] text-[10px] py-4 px-8 border-b-4 border-on-secondary-fixed-variant active:border-b-0 active:translate-y-1">REPLAY</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ARTIFACTS CONTENT
// ============================================
const ArtifactsContent = ({ artifacts, chapters, onLearnChapter, onStartBattle }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [mastered, setMastered] = useState({});

  const categories = ['ALL', 'PYTHON BASICS', 'DATA RITUALS', 'MATH INCANTATIONS'];

  const getArtifactMeta = (art, idx) => {
    const t = art.title?.toLowerCase() || '';
    const tagsLower = (art.tags || []).map(tag => tag.toLowerCase());
    let rarity = 'COMMON';
    if (tagsLower.includes('legendary') || idx === 0) rarity = 'LEGENDARY';
    else if (tagsLower.includes('epic') || idx === 1) rarity = 'EPIC';
    else if (tagsLower.includes('rare') || idx % 2 === 0) rarity = 'RARE';

    let cat = 'PYTHON BASICS';
    if (t.includes('data') || t.includes('pandas') || t.includes('csv') || t.includes('shell') || t.includes('terminal')) cat = 'DATA RITUALS';
    else if (t.includes('math') || t.includes('calc') || t.includes('visual') || t.includes('plot')) cat = 'MATH INCANTATIONS';

    return { rarity, category: cat };
  };

  const enriched = artifacts.map((art, idx) => ({ ...art, ...getArtifactMeta(art, idx), progress: 100 }));

  const filtered = enriched.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'ALL' || a.category === category;
    return matchesSearch && matchesCat;
  });

  React.useEffect(() => {
    if (!selected && filtered.length > 0) setSelected(filtered[0]);
    else if (selected && !filtered.find(a => a.id === selected.id) && filtered.length > 0) setSelected(filtered[0]);
  }, [filtered, selected]);

  const forgedCount = enriched.length;
  const totalSlots = Math.max(6, chapters.length);
  const lockedCount = Math.max(0, totalSlots - forgedCount);
  const nextChapter = chapters.find(c => c.status === 'active') || chapters.find(c => c.status === 'locked');

  const getRarityStyle = (rarity) => {
    switch (rarity) {
      case 'LEGENDARY': return { border: 'border-primary', badgeBg: 'bg-primary', badgeText: 'text-on-primary', glow: 'shadow-[0_0_0_2px_#1a063b,0_0_0_4px_#ffb1c4]', iconColor: 'text-primary' };
      case 'EPIC': return { border: 'border-tertiary', badgeBg: 'bg-tertiary', badgeText: 'text-on-tertiary', glow: 'shadow-[0_0_0_2px_#1a063b,0_0_0_4px_#e9c400]', iconColor: 'text-tertiary' };
      case 'RARE': return { border: 'border-surface-variant', badgeBg: 'bg-surface-variant', badgeText: 'text-primary', glow: 'shadow-[0_0_0_2px_#1a063b,0_0_0_4px_#3d2b5e]', iconColor: 'text-[#e5bcc5]' };
      default: return { border: 'border-secondary', badgeBg: 'bg-secondary', badgeText: 'text-on-secondary', glow: 'shadow-[0_0_0_2px_#1a063b,0_0_0_4px_#ddfcff]', iconColor: 'text-secondary' };
    }
  };

  const getArtifactIcon = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('pandas') || t.includes('data')) return Database;
    if (t.includes('shell') || t.includes('terminal')) return Terminal;
    return Code;
  };

  const studyArtifact = selected || filtered[0];

  const handleComplete = () => {
    if (studyArtifact) setMastered(prev => ({ ...prev, [studyArtifact.id]: true }));
  };

  return (
    <div className="flex flex-col gap-8">
      <style>{`
        .three-d-card {
          transform: perspective(1000px) rotateX(2deg);
          transition: transform 0.1s step-end;
        }
        .three-d-card:active {
          transform: perspective(1000px) rotateX(0deg) translateY(2px);
        }
      `}</style>

      {/* Filter Bar */}
      <section className="flex flex-wrap gap-4 items-center">
        <div className="bg-surface-container-low p-1 flex gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 font-game text-[10px] uppercase transition-colors ${
                category === cat ? 'bg-surface-container-highest text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center bg-surface-container px-4 py-2 gap-3 border-2 border-surface-variant">
          <Search className="text-secondary text-sm w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-surface-variant font-game text-[10px] uppercase w-48"
            placeholder="SEARCH ARCHIVES..."
          />
        </div>
      </section>

      {/* Main Split */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
        {/* Artifacts Grid */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((art) => {
              const style = getRarityStyle(art.rarity);
              const Icon = getArtifactIcon(art.title);
              return (
                <div
                  key={art.id}
                  onClick={() => setSelected(art)}
                  className={`three-d-card bg-surface-container border-2 ${style.border} group cursor-pointer relative ${selected?.id === art.id ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className={`absolute -top-3 -right-3 ${style.badgeBg} ${style.badgeText} font-game text-[8px] px-2 py-1 z-10`}>{art.rarity}</div>
                  <div className="p-6 flex flex-col items-center text-center gap-4">
                    <div className={`w-20 h-20 bg-surface-container-highest flex items-center justify-center relative ${style.glow}`}>
                      {art.rarity === 'LEGENDARY' && <div className="absolute inset-0 bg-primary/10 blur-xl" />}
                      <Icon className={`${style.iconColor} w-10 h-10`} />
                    </div>
                    <div>
                      <h3 className="font-game text-[12px] text-on-surface mb-2 uppercase leading-tight">{art.title}</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2">{art.summary || art.content?.slice(0, 100) || 'Knowledge artifact forged from chapter completion.'}</p>
                    </div>
                    <div className="w-full h-1 bg-surface-container-highest overflow-hidden">
                      <div className="h-full bg-primary w-full" />
                    </div>
                  </div>
                </div>
              );
            })}

            {Array.from({ length: Math.min(2, lockedCount) }).map((_, i) => (
              <div key={`locked-${i}`} className="three-d-card bg-surface-container border-2 border-surface-variant group cursor-pointer relative opacity-60">
                <div className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 bg-surface-container-highest flex items-center justify-center shadow-[0_0_0_2px_#1a063b,0_0_0_4px_#3d2b5e]">
                    <Lock className="text-surface-variant w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-game text-[12px] text-on-surface-variant mb-2 uppercase leading-tight">Encrypted Logs</h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2">Unlock higher levels to decode ancient patterns.</p>
                  </div>
                  <div className="w-full h-1 bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-surface-variant w-0" />
                  </div>
                </div>
              </div>
            ))}

            <div className="border-2 border-dashed border-surface-container-highest flex items-center justify-center p-6 bg-background/50">
              <div className="text-center">
                <div className="text-surface-container-highest text-3xl mb-2">+</div>
                <p className="font-game text-[8px] text-surface-variant uppercase">New Artifact</p>
              </div>
            </div>
          </div>
        </div>

        {/* Study Mode Panel */}
        <aside className="lg:col-span-5 xl:col-span-4">
          {studyArtifact ? (
            <>
              <div className="bg-surface-container p-1 border-4 border-primary shadow-[8px_8px_0_0_rgba(26,6,59,1)]">
                <div className="bg-background p-6 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-game text-[10px] text-primary uppercase">Study Mode</span>
                      <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-background mt-1 leading-tight">{studyArtifact.title}</h2>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors text-tertiary">
                        <Pin className="w-5 h-5" />
                      </button>
                      <button onClick={() => setSelected(null)} className="w-10 h-10 bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Terminal View */}
                  <div className="bg-surface-container-lowest p-4 font-mono text-sm leading-relaxed border-l-4 border-secondary/30">
                    <div className="flex items-center gap-2 mb-4 border-b border-surface-variant pb-2">
                      <div className="w-2 h-2 bg-error rounded-full" />
                      <div className="w-2 h-2 bg-tertiary rounded-full" />
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                      <span className="text-[10px] text-surface-variant ml-2">ARTIFACT-READER v1.0.4</span>
                    </div>
                    <div className="space-y-4">
                      {studyArtifact.content ? (
                        <div className="whitespace-pre-wrap text-secondary">{studyArtifact.content}</div>
                      ) : (
                        <>
                          <p className="text-primary-fixed"># {studyArtifact.title?.toUpperCase()}</p>
                          <p className="text-on-surface">{studyArtifact.summary || `This ${studyArtifact.rarity?.toLowerCase() || 'ancient'} artifact contains knowledge forged from your journey. Study it well.`}</p>
                          {studyArtifact.key_points && (
                            <ul className="list-disc list-inside text-secondary mt-2 space-y-1">
                              {studyArtifact.key_points.map((pt, i) => (
                                <li key={i}>{pt}</li>
                              ))}
                            </ul>
                          )}
                          <div className="bg-surface-container-highest p-3 mt-4">
                            <p className="text-xs text-on-surface mb-2">PRO TIP: <span className="text-primary">Review this artifact before tackling the next quest.</span> Mastering the basics makes the boss battle easier.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-surface-container p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${mastered[studyArtifact.id] ? 'text-tertiary' : 'text-on-surface-variant'}`} />
                        <span className="font-game text-[10px] uppercase">Artifact Mastered</span>
                      </div>
                      <button
                        onClick={() => setMastered(prev => ({ ...prev, [studyArtifact.id]: !prev[studyArtifact.id] }))}
                        className={`w-12 h-6 relative transition-colors ${mastered[studyArtifact.id] ? 'bg-tertiary' : 'bg-surface-container-highest'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 transition-all ${mastered[studyArtifact.id] ? 'left-7 bg-on-tertiary' : 'left-1 bg-surface-variant'}`} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="py-4 bg-surface-container-high border-2 border-secondary text-secondary font-game text-[10px] uppercase hover:bg-secondary hover:text-on-secondary transition-colors">
                        REVISE
                      </button>
                      <button
                        onClick={handleComplete}
                        className="py-4 bg-primary-container text-on-primary font-game text-[10px] uppercase shadow-[4px_4px_0_0_#8f0044] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                      >
                        COMPLETE
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Next */}
              <div className="mt-8 p-6 bg-surface-container-low border-2 border-surface-container-highest">
                <h4 className="font-game text-[10px] text-surface-variant uppercase mb-4">Recommended Next</h4>
                {nextChapter ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container flex items-center justify-center">
                      <Database className="text-secondary w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-headline font-bold text-on-background">{nextChapter.title}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase">30 XP • 15 MIN</p>
                    </div>
                    <button onClick={() => onLearnChapter && onLearnChapter(nextChapter)} className="ml-auto text-primary hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container flex items-center justify-center">
                      <Trophy className="text-tertiary w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-headline font-bold text-on-background">Boss Battle</p>
                      <p className="text-[10px] text-on-surface-variant uppercase">Final Challenge</p>
                    </div>
                    <button onClick={() => onStartBattle && onStartBattle()} className="ml-auto text-primary hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-surface-container-low border-2 border-dashed border-outline-variant">
              <FileText className="w-16 h-16 text-outline mx-auto mb-4 opacity-30" />
              <p className="font-game text-[10px] text-on-surface-variant">SELECT AN ARTIFACT</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

// ============================================
// RANKINGS CONTENT
// ============================================
const RankingsContent = ({ project, chapters, bossBattle }) => {
  const completed = chapters.filter(c => c.status === 'completed').length;
  const hasMastery = bossBattle?.badge_tier === 'mastery';

  const topHeroes = [
    { name: 'NEON_VALKYRIE', level: 52, title: 'GRANDMASTER', rank: 1, color: 'primary', glow: 'drop-shadow(0 0 10px #ff4a8d)', height: 'h-32', scale: 'scale-110', img: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=neon' },
    { name: 'CYBER_SAGE', level: 48, title: 'ARCHITECT', rank: 2, color: 'secondary', glow: 'drop-shadow(0 0 10px #00f1fe)', height: 'h-24', scale: '', img: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cyber' },
    { name: 'VOID_RUNNER', level: 45, title: 'VANGUARD', rank: 3, color: 'tertiary', glow: 'drop-shadow(0 0 10px #e9c400)', height: 'h-20', scale: '', img: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=void' },
  ];

  const tableHeroes = [
    { name: 'BYTE_KNIGHT', level: 41, progress: 88, wins: 12, img: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=byte' },
    { name: 'FLUX_MAGE', level: 39, progress: 75, wins: 9, img: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=flux' },
    { name: 'GLITCH_WALKER', level: 38, progress: 72, wins: 11, img: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=glitch' },
    { name: 'ZERO_VECTOR', level: 37, progress: 68, wins: 7, img: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=zero' },
  ];

  const guilds = [
    { name: 'SCRIPT_SORCERERS', members: 12, progress: 84, color: 'primary', icon: Sparkles },
    { name: 'DATA_DRAGONS', members: 15, progress: 79, color: 'secondary', icon: Database },
    { name: 'LOGIC_LORDS', members: 10, progress: 62, color: 'tertiary', icon: Code },
  ];

  return (
    <div className="space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b-4 border-surface-container pb-6">
        <div>
          <h1 className={`${fontRetro} text-2xl md:text-3xl text-primary tracking-tighter mb-2`}>HALL OF HEROES</h1>
          <p className="font-headline text-secondary opacity-70 uppercase tracking-widest text-sm">Quest: {project?.title || 'New Quest'}</p>
        </div>
        <div className="bg-surface-container px-4 py-2 flex items-center gap-3 border-r-4 border-b-4 border-surface-container-lowest">
          <Bot className="text-tertiary w-5 h-5" />
          <span className={`${fontRetro} text-[10px]`}>ALL GUILDS ACTIVE</span>
        </div>
      </div>

      {/* Spotlight: Top 3 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-8">
        {topHeroes.map((hero) => (
          <div key={hero.name} className={`${hero.rank === 1 ? 'order-1 md:order-2' : hero.rank === 2 ? 'order-2 md:order-1' : 'order-3'} flex flex-col items-center`}>
            <div className={`relative mb-4 group ${hero.scale}`}>
              <div className={`absolute -inset-4 blur-2xl transition-all ${hero.rank === 1 ? 'bg-primary/20 group-hover:bg-primary/30' : hero.rank === 2 ? 'bg-secondary/10 group-hover:bg-secondary/20' : 'bg-tertiary/10 group-hover:bg-tertiary/20'}`} />
              <img src={hero.img} alt={hero.name} className={`w-32 h-32 md:w-40 md:h-40 relative z-10 border-4 shadow-[10px_10px_0_0_#1a063b] ${hero.rank === 1 ? 'border-primary' : hero.rank === 2 ? 'border-secondary' : 'border-tertiary'}`} style={{ filter: hero.glow }} />
              <div className={`absolute -top-4 -left-4 ${hero.rank === 1 ? 'bg-primary text-on-primary text-sm p-3' : hero.rank === 2 ? 'bg-secondary text-on-secondary text-xs p-2' : 'bg-tertiary text-on-tertiary text-xs p-2'} font-game z-20`}>#{hero.rank}</div>
              {hero.rank === 1 && <Trophy className="absolute -top-8 left-1/2 -translate-x-1/2 text-tertiary w-10 h-10" style={{ filter: 'drop-shadow(0 0 10px #00f1fe)' }} />}
            </div>
            <div className={`w-full ${hero.height} bg-surface-container-highest border-t-4 ${hero.rank === 1 ? 'border-primary shadow-[0_15px_0_0_#1a063b]' : 'border-' + hero.color + ' shadow-[0_10px_0_0_#1a063b]'} flex flex-col items-center justify-center gap-1`}>
              <span className={`${fontRetro} ${hero.rank === 1 ? 'text-sm' : 'text-xs'} text-white`}>{hero.name}</span>
              <span className={`font-headline ${hero.rank === 1 ? 'text-xs' : 'text-[10px]'} text-${hero.color} tracking-widest uppercase`}>LVL {hero.level} {hero.title}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Detailed Ranking Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`${fontRetro} text-sm text-secondary uppercase`}>Hero Standings</h2>
            <div className="flex gap-2">
              <button className="bg-surface-container-highest px-3 py-1 font-game text-[8px] text-primary border-b-2 border-primary-container">Global</button>
              <button className="bg-surface-container px-3 py-1 font-game text-[8px] text-on-surface-variant hover:bg-surface-container-high transition-colors">Guild Only</button>
            </div>
          </div>
          <div className="bg-surface-container border-4 border-surface-container-lowest overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/50 font-game text-[9px] text-on-surface-variant">
                  <th className="p-4 border-b-2 border-surface-container-lowest">RANK</th>
                  <th className="p-4 border-b-2 border-surface-container-lowest">HERO</th>
                  <th className="p-4 border-b-2 border-surface-container-lowest">LVL</th>
                  <th className="p-4 border-b-2 border-surface-container-lowest">PROGRESS</th>
                  <th className="p-4 border-b-2 border-surface-container-lowest text-center">VICTORIES</th>
                </tr>
              </thead>
              <tbody className="font-headline text-sm">
                {tableHeroes.map((hero, idx) => (
                  <tr key={hero.name} className="hover:bg-surface-container-high transition-colors group">
                    <td className="p-4 font-game text-[10px] text-secondary">0{idx + 4}</td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-container-lowest border border-outline-variant overflow-hidden">
                        <img src={hero.img} alt={hero.name} className="w-full h-full" />
                      </div>
                      <span className="font-medium text-white group-hover:text-primary transition-colors">{hero.name}</span>
                    </td>
                    <td className="p-4 text-tertiary">{hero.level}</td>
                    <td className="p-4">
                      <div className="w-32 h-3 bg-surface-container-lowest border border-outline-variant p-0.5">
                        <div className="h-full bg-secondary xp-bar-segment" style={{ width: `${hero.progress}%` }} />
                      </div>
                    </td>
                    <td className="p-4 text-center font-game text-[10px]">{hero.wins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 text-center border-t-2 border-surface-container-lowest">
              <button className={`${fontRetro} text-[8px] text-on-surface-variant hover:text-white transition-colors uppercase`}>View Entire Leaderboard</button>
            </div>
          </div>
        </div>

        {/* Sidebar: Project Guilds */}
        <aside className="lg:col-span-4 space-y-6">
          <h2 className={`${fontRetro} text-sm text-tertiary uppercase`}>Guild Rankings</h2>
          <div className="space-y-4">
            {guilds.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.name} className={`bg-surface-container p-4 border-l-4 border-${g.color} flex items-center justify-between group cursor-pointer hover:bg-surface-container-high transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-container-lowest flex items-center justify-center border-2 border-outline-variant">
                      <Icon className={`text-${g.color} w-5 h-5`} />
                    </div>
                    <div>
                      <div className={`${fontRetro} text-[10px] text-white`}>{g.name}</div>
                      <div className="font-headline text-[10px] text-on-surface-variant uppercase tracking-widest">{g.members} Members</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${fontRetro} text-[10px] text-${g.color}`}>{g.progress}%</div>
                    <div className="font-headline text-[8px] text-on-surface-variant uppercase">COMPLETION</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly Bounty */}
          <div className="bg-surface-container-lowest p-6 border-4 border-dashed border-outline-variant relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Trophy className="w-24 h-24 text-tertiary" />
            </div>
            <div className="relative z-10 space-y-3">
              <h3 className={`${fontRetro} text-[10px] text-tertiary uppercase`}>Weekly Bounty</h3>
              <p className="font-headline text-xs text-on-surface-variant leading-relaxed">Reach Top 10 by Friday to unlock the <span className="text-primary">Neon Serpent</span> avatar skin.</p>
              <div className="pt-2">
                <div className="w-full h-1 bg-surface-container-highest">
                  <div className="h-full bg-tertiary" style={{ width: '40%' }} />
                </div>
                <p className={`${fontRetro} text-[8px] mt-2 text-tertiary`}>2D 14H REMAINING</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Your Standing Widget */}
      <div className="fixed bottom-20 md:bottom-0 left-0 md:left-64 right-0 z-40 bg-surface-container-highest border-t-4 border-primary p-4 shadow-[0_-10px_20px_rgba(255,177,196,0.1)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className={`${fontRetro} text-xs text-primary`}>YOUR RANK:</span>
              <span className={`${fontRetro} text-lg text-white`}>#42</span>
            </div>
            <div className="hidden md:flex items-center gap-4 border-l-2 border-surface-container px-6">
              <div className="w-10 h-10 border-2 border-outline overflow-hidden">
                <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=you" alt="You" className="w-full h-full" />
              </div>
              <div>
                <div className={`${fontRetro} text-[10px] text-white uppercase`}>CURRENT_USER</div>
                <div className="font-headline text-[9px] text-secondary-fixed uppercase tracking-widest">Level 18 Script-Kiddie</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="flex-1 md:w-64 space-y-1">
              <div className="flex justify-between font-game text-[8px] text-on-surface-variant">
                <span>XP TO LEVEL 19</span>
                <span>740/1000</span>
              </div>
              <div className="w-full h-3 bg-surface-container-lowest p-0.5 border border-outline-variant">
                <div className="h-full bg-primary-container xp-bar-segment" style={{ width: '74%' }} />
              </div>
            </div>
            <button className="bg-primary text-on-primary px-6 py-2 font-game text-[10px] active:translate-y-1 shadow-[0_4px_0_0_#8f0044] hover:bg-primary-fixed-dim transition-all whitespace-nowrap">
              BOOST RANK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function Newquest() {
  const navigate = useNavigate();
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [bossBattle, setBossBattle] = useState(null);
  const [battleState, setBattleState] = useState(null);
  const [view, setView] = useState('hub'); // hub | battle | learn
  const [tab, setTab] = useState('quests'); // skilltree | quests | artifacts | rankings
  const [activeChapter, setActiveChapter] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bossFocusModal, setBossFocusModal] = useState(false);
  const [bossFocus, setBossFocus] = useState('');
  const [topicModal, setTopicModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const autoStartedRef = useRef(false);

  const TOPIC_PRESETS = [
    { id: 'english', label: 'English Language', icon: 'menu_book', desc: 'Grammar, writing & storytelling', color: 'border-primary text-primary' },
    { id: 'python', label: 'Python Programming', icon: 'terminal', desc: 'Code, data & automation', color: 'border-secondary text-secondary' },
    { id: 'math', label: 'Mathematics', icon: 'calculate', desc: 'Algebra, geometry & logic', color: 'border-tertiary text-tertiary' },
    { id: 'science', label: 'Science', icon: 'science', desc: 'Physics, chemistry & biology', color: 'border-primary-container text-primary-container' },
    { id: 'history', label: 'History', icon: 'account_balance', desc: 'Events, people & cultures', color: 'border-secondary-container text-secondary-container' },
    { id: 'custom', label: 'Custom Topic', icon: 'edit', desc: 'Anything you want to learn', color: 'border-tertiary-container text-tertiary-container' },
  ];

  useEffect(() => {
    initData();
  }, []);

  // Auto-close topic modal whenever a project is loaded
  useEffect(() => {
    if (project) {
      setTopicModal(false);
    }
  }, [project]);

  // Auto-start first chapter for brand new projects (no chapters yet)
  useEffect(() => {
    if (project && chapters.length === 0 && !generating && !loading && view === 'hub' && !autoStartedRef.current) {
      autoStartedRef.current = true;
      console.log('[autoStart] new project has no chapters, auto-generating first chapter');
      handleGenerateFirstChapter();
    }
  }, [project, chapters.length, generating, loading, view]);

  const initData = async () => {
    setLoading(true);
    autoStartedRef.current = false;
    try {
      let proj = null;
      try {
        const res = await newquestAPI.getProjects('active');
        if (res.data?.projects?.length > 0) proj = res.data.projects[0];
      } catch (e) {
        console.error('[initData] getProjects error:', e);
        setError('Failed to load projects. Please refresh.');
      }

      if (!proj) {
        console.log('[initData] no active project found, showing topic modal');
        setTopicModal(true);
        setLoading(false);
        return;
      }

      console.log('[initData] loaded project:', proj.id, proj.title);
      setTopicModal(false);
      setProject(proj);
      await loadProjectData(proj.id);
    } catch (err) {
      console.error('[initData] error:', err);
      setError('Failed to initialize Newquest');
    } finally {
      setLoading(false);
    }
  };

  const createProjectWithTopic = async (topic, goal, subject) => {
    setLoading(true);
    try {
      const createRes = await newquestAPI.createProject({ topic, goal, subject });
      const proj = createRes.data?.project;
      if (!proj) {
        console.error('[createProjectWithTopic] no project in response:', createRes.data);
        setError('Project creation failed: invalid response');
        return;
      }
      console.log('[createProjectWithTopic] project created:', proj.id, proj.title);
      autoStartedRef.current = false;
      setProject(proj);
      setTopicModal(false);
      await loadProjectData(proj.id);
    } catch (err) {
      console.error('[createProjectWithTopic] error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (preset) => {
    if (preset.id === 'custom') {
      if (!selectedTopic.trim()) {
        setError('Please enter a topic');
        return;
      }
      createProjectWithTopic(
        selectedTopic,
        `Learn ${selectedTopic} through an interactive project-based journey`,
        'General'
      );
    } else if (preset.id === 'english') {
      createProjectWithTopic(
        'English Mastery Quest',
        'Master English grammar, vocabulary, and writing through narrative challenges',
        'English'
      );
    } else if (preset.id === 'python') {
      createProjectWithTopic(
        'Python Fitness Analyzer',
        'Learn Python by building a health dashboard that analyzes fitness data',
        'Programming'
      );
    } else if (preset.id === 'math') {
      createProjectWithTopic(
        'Math Adventure',
        'Explore mathematics through puzzles, patterns, and real-world problem solving',
        'Mathematics'
      );
    } else if (preset.id === 'science') {
      createProjectWithTopic(
        'Science Explorer',
        'Discover scientific principles through experiments and investigations',
        'Science'
      );
    } else if (preset.id === 'history') {
      createProjectWithTopic(
        'History Chronicles',
        'Journey through time exploring key events, people, and civilizations',
        'History'
      );
    }
  };

  const loadProjectData = async (projectId) => {
    try {
      // Clear stale state before loading new project data
      setChapters([]);
      setArtifacts([]);
      setBossBattle(null);
      setBattleState(null);
      setActiveChapter(null);
      
      const [chRes, artRes, bbRes] = await Promise.all([
        newquestAPI.getChapters(projectId).catch((e) => { console.error('[loadProjectData] chapters error:', e); return { data: { chapters: [] } }; }),
        newquestAPI.getArtifacts(projectId).catch((e) => { console.error('[loadProjectData] artifacts error:', e); return { data: { artifacts: [] } }; }),
        api.get(`/boss-battles?projectId=${projectId}`).catch((e) => { console.error('[loadProjectData] boss battles error:', e); return { data: { battles: [] } }; })
      ]);
      
      let chs = chRes.data.chapters || [];
      // Normalize backend statuses to frontend statuses
      chs = chs.map(ch => ({
        ...ch,
        status: ch.status === 'available' || ch.status === 'in_progress' ? 'active' : ch.status
      }));
      setChapters(chs);
      setArtifacts(artRes.data.artifacts || []);
      
      const battles = bbRes.data.battles || [];
      console.log('[loadProjectData] loaded battles:', battles.length, 'for project', projectId);
      const active = battles.find(b => b.status === 'active' || b.status === 'in_progress');
      const completed = battles.find(b => b.status === 'completed');
      if (active) {
        console.log('[loadProjectData] found active battle:', active.id, active.title);
        setBossBattle(active);
        await loadBossBattle(active.id);
      } else if (completed) {
        console.log('[loadProjectData] found completed battle:', completed.id, completed.title);
        setBossBattle(completed);
      } else {
        console.log('[loadProjectData] no battles found for project', projectId);
        setBossBattle(null);
        setBattleState(null);
      }
    } catch (e) {
      console.error('[loadProjectData] error:', e);
    }
  };

  const handleGenerateFirstChapter = async () => {
    console.log('[handleGenerateFirstChapter] called, project:', project?.id, 'generating:', generating);
    if (!project || generating) {
      console.warn('[handleGenerateFirstChapter] blocked — no project or already generating');
      return;
    }
    setGenerating(true);
    try {
      console.log('[handleGenerateFirstChapter] calling API /chapters/generate with projectId:', project.id);
      const res = await newquestAPI.generateChapter({ projectId: project.id });
      console.log('[handleGenerateFirstChapter] API success:', res.data);
      const newChapter = {
        ...res.data.chapter,
        status: 'active'
      };
      setChapters(prev => [...prev, newChapter]);
      setActiveChapter(newChapter);
      setView('learn');
    } catch (err) {
      console.error('[handleGenerateFirstChapter] API error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate chapter');
    } finally {
      setGenerating(false);
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

  const startBossBattle = async (focus = '') => {
    if (!project) return;
    setLoading(true);
    try {
      const res = await newquestAPI.startBossBattle(project.id, focus);
      await loadBossBattle(res.data.bossBattle.id);
      setView('battle');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start battle');
    } finally {
      setLoading(false);
      setBossFocusModal(false);
      setBossFocus('');
    }
  };

  const openBossFocusModal = () => {
    const allChaptersCompleted = chapters.length > 0 && chapters.every(c => c.status === 'completed');
    if (!allChaptersCompleted) {
      setError('Complete all chapters before starting the Boss Battle');
      return;
    }
    setBossFocus('');
    setBossFocusModal(true);
  };

  const canResumeBossBattle = () => {
    const allChaptersCompleted = chapters.length > 0 && chapters.every(c => c.status === 'completed');
    return allChaptersCompleted || bossBattle?.status === 'completed';
  };

  const resumeBattle = async () => {
    if (!bossBattle) return;
    if (!canResumeBossBattle()) {
      setError('Complete all chapters before resuming the Boss Battle');
      return;
    }
    await loadBossBattle(bossBattle.id);
    setView('battle');
  };

  const handleStageSubmit = async (result) => {
    if (!bossBattle) return;
    setTimeout(async () => {
      await loadBossBattle(bossBattle.id);
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

  const handleNavClick = (id) => {
    const item = defaultNavItems.find(i => i.id === id);
    if (item?.href) navigate(item.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="text-center">
          <Swords className="w-12 h-12 mb-4 animate-pulse text-primary mx-auto" />
          <p className={`${fontRetro} text-[10px] text-primary`}>Loading Newquest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <TopAppBar title="NEWQUEST" onMenuClick={() => setSidebarOpen(true)} user={user} />
      <SideNavBar
        items={defaultNavItems}
        activeItem="newquest"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onItemClick={handleNavClick}
        user={user}
      />
      <BottomNavBar
        items={defaultNavItems.filter(i => i.category === 'main').slice(0, 4)}
        activeItem="newquest"
        onItemClick={handleNavClick}
      />

      <main className="lg:pl-64 pt-20 pb-24 md:pb-8 min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'hub' && (
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 md:px-8">
              <HubView
                user={user}
                project={project}
                chapters={chapters}
                artifacts={artifacts}
                bossBattle={bossBattle}
                activeTab={tab}
                onTabChange={setTab}
                onStartBattle={openBossFocusModal}
                onResumeBattle={resumeBattle}
                onRetake={handleRetake}
                onLearnChapter={handleLearnChapter}
                onGenerateFirstChapter={handleGenerateFirstChapter}
                onStartNewQuest={() => setTopicModal(true)}
                generating={generating}
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
      </main>

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

      {/* Topic Selection Modal */}
      <AnimatePresence>
        {topicModal && !project && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-background flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full"
            >
              <div className="text-center mb-10">
                <h1 className={`${fontRetro} text-2xl text-primary mb-4`}>CHOOSE YOUR QUEST</h1>
                <p className="font-body text-on-surface-variant text-lg">What do you want to learn today?</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {TOPIC_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectTopic(preset)}
                    disabled={loading}
                    className={`bg-surface-container p-6 border-4 ${preset.color.split(' ')[0]} text-left hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[4px_4px_0_0_#1a063b] disabled:opacity-50`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-surface-container-lowest border-2 ${preset.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined ${preset.color.split(' ')[1]}`} style={{fontSize: '24px'}}>{preset.icon}</span>
                      </div>
                      <div>
                        <h3 className={`${fontRetro} text-[10px] ${preset.color.split(' ')[1]} mb-1`}>{preset.label.toUpperCase()}</h3>
                        <p className="text-xs text-on-surface-variant">{preset.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="bg-surface-container p-6 border-2 border-outline-variant">
                <label className={`${fontRetro} text-[10px] text-secondary mb-3 block`}>CUSTOM TOPIC</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    placeholder="Type anything: Photography, Chess, Japanese, Music Theory..."
                    className="flex-1 bg-surface-container-lowest border-2 border-outline-variant px-4 py-3 font-body text-sm text-on-surface focus:border-primary focus:ring-0"
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectTopic(TOPIC_PRESETS.find(t => t.id === 'custom'))}
                  />
                  <button
                    onClick={() => handleSelectTopic(TOPIC_PRESETS.find(t => t.id === 'custom'))}
                    disabled={loading || !selectedTopic.trim()}
                    className="bg-primary-container text-on-primary px-6 py-3 font-game text-[10px] border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all uppercase disabled:opacity-50"
                  >
                    {loading ? 'CREATING...' : 'BEGIN'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boss Battle Focus Modal */}
      <AnimatePresence>
        {bossFocusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container border-4 border-primary max-w-lg w-full p-6 shadow-[8px_8px_0_0_#1a063b]"
            >
              <div className="flex items-center gap-3 mb-6">
                <Swords className="w-6 h-6 text-primary" />
                <h2 className={`${fontRetro} text-sm text-primary`}>PREPARE FOR BATTLE</h2>
              </div>
              
              <p className="font-body text-on-surface mb-4 text-sm leading-relaxed">
                Before entering the Boss Battle, tell us what you'd like to focus on or what you want to learn from this challenge.
              </p>
              
              <textarea
                value={bossFocus}
                onChange={(e) => setBossFocus(e.target.value)}
                placeholder="e.g., I want to practice data cleaning with pandas, or I want to learn how to merge datasets..."
                className="w-full bg-surface-container-lowest border-2 border-outline-variant p-4 font-mono text-sm text-on-surface focus:border-primary focus:ring-0 resize-none h-32 mb-6"
              />
              
              <div className="flex gap-4">
                <button
                  onClick={() => startBossBattle(bossFocus)}
                  disabled={loading}
                  className="flex-1 bg-primary-container text-on-primary py-3 font-game text-[10px] border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all uppercase disabled:opacity-50"
                >
                  {loading ? 'SUMMONING...' : 'START BOSS BATTLE'}
                </button>
                <button
                  onClick={() => { setBossFocusModal(false); setBossFocus(''); }}
                  disabled={loading}
                  className="px-6 bg-surface-container-highest text-on-surface py-3 font-game text-[10px] border-b-4 border-background active:translate-y-1 active:border-b-0 transition-all uppercase disabled:opacity-50"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
