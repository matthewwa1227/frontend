import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Gem, Bookmark, AlignLeft, Network,
  Zap, Sparkles, Flame, ArrowLeft, Trash2, RotateCcw, Save,
  AlertTriangle, CheckCircle, Loader2, X, ChevronRight,
  Swords, GraduationCap, User, BookOpen
} from 'lucide-react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import SideNavBar, { BottomNavBar } from '../layout/SideNavBar';

// ============================================
// API
// ============================================
const archiveAPI = {
  upload: (formData) => api.post('/archive/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000
  }),
  url: (url) => api.post('/archive/url', { url }, { timeout: 90000 }),
  list: () => api.get('/archive'),
  get: (id) => api.get(`/archive/${id}`),
  delete: (id) => api.delete(`/archive/${id}`),
  regenerate: (id) => api.post(`/archive/${id}/regenerate`),
};

const fontRetro = "font-['Press_Start_2P']";
const fontHeadline = "font-['Space_Grotesk']";

// ============================================
// PIXEL BUTTON
// ============================================
const PixelBtn = ({ onClick, children, variant = 'primary', icon: Icon, disabled, className = '' }) => {
  const base = 'flex items-center justify-center gap-2 transition-all duration-0 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: `${base} bg-primary-container text-on-primary border-b-4 border-on-primary-fixed-variant hover:brightness-110`,
    secondary: `${base} bg-secondary text-on-secondary border-b-4 border-on-secondary-fixed-variant hover:brightness-110`,
    tertiary: `${base} bg-tertiary text-on-tertiary border-b-4 border-on-tertiary-fixed-variant hover:brightness-110`,
    ghost: `${base} bg-surface-container-highest text-on-surface border-b-4 border-background hover:bg-surface-container`,
    danger: `${base} bg-error text-on-error border-b-4 border-error-container hover:brightness-110`,
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// ============================================
// FLASHCARD RELIC
// ============================================
const FlashcardRelic = ({ card, index }) => {
  const [revealed, setRevealed] = useState(false);
  const diffColor = card.difficulty === 'hard' ? 'text-error' : card.difficulty === 'medium' ? 'text-tertiary' : 'text-secondary';
  return (
    <div className="bg-surface-container-low p-5 relative group border-l-4 border-primary" style={{ boxShadow: '2px 2px 0px 0px #150136' }}>
      <div className="absolute -right-2 -top-2 w-8 h-8 bg-surface-container flex items-center justify-center border-2 border-primary z-10 shadow-sm">
        <Bookmark className="text-primary w-4 h-4" />
      </div>
      <h4 className={`${fontRetro} text-[10px] text-primary mb-3 uppercase tracking-wider`}>Flashcard {index + 1}</h4>
      <p className="font-body text-base font-medium mb-4">{card.question}</p>
      <div className="h-[1px] w-full bg-surface-container-highest my-3" />
      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <p className="font-body text-sm text-on-surface-variant italic">{card.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-4 flex gap-2 items-center">
        <button
          onClick={() => setRevealed(!revealed)}
          className="bg-surface-container-highest hover:bg-surface-bright text-on-surface p-2 font-label text-[8px] flex-1 border border-outline-variant transition-colors"
        >
          {revealed ? 'HIDE' : 'REVEAL'}
        </button>
        <span className={`text-[10px] font-bold uppercase ${diffColor}`}>{card.difficulty}</span>
      </div>
    </div>
  );
};

// ============================================
// MASTER ARTIFACT
// ============================================
const MasterArtifact = ({ artifact }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="p-1 border border-tertiary border-opacity-30 relative mt-8" style={{ background: 'rgba(61, 43, 94, 0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(255, 177, 196, 0.1)' }}>
      <div className="absolute -top-3 -left-3 bg-tertiary text-on-tertiary font-label text-[8px] px-2 py-1 shadow-[2px_2px_0px_0px_#1a063b] z-20 uppercase">
        Master Artifact
      </div>
      <div
        onClick={() => setExpanded(!expanded)}
        className="bg-surface-container-lowest h-32 relative overflow-hidden flex items-center justify-center group cursor-pointer border border-tertiary border-opacity-20"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-60" />
        <Network className="w-16 h-16 text-tertiary opacity-20 group-hover:opacity-40 transition-opacity absolute" />
        <div className="relative z-20 text-center pointer-events-none">
          <div className={`${fontHeadline} text-tertiary font-bold uppercase tracking-widest mb-1`}>{artifact.title || 'Concept Map'}</div>
          <div className={`${fontRetro} text-[8px] text-secondary`}>{expanded ? 'CLICK TO COLLAPSE' : 'CLICK TO EXPAND'}</div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-4 bg-surface-container-lowest">
              <p className="font-body text-sm text-on-surface mb-4">{artifact.description}</p>
              {artifact.keyRelationships && artifact.keyRelationships.length > 0 && (
                <div className="space-y-2">
                  <h5 className={`${fontRetro} text-[8px] text-secondary mb-2`}>KEY RELATIONSHIPS</h5>
                  {artifact.keyRelationships.map((rel, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-primary font-bold">{rel.from}</span>
                      <ChevronRight className="w-3 h-3 text-on-surface-variant" />
                      <span className="text-tertiary font-bold">{rel.to}</span>
                      <span className="text-on-surface-variant">— {rel.relationship}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// UPLOAD VIEW
// ============================================
const UploadView = ({ onSessionSelect }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ show: false, name: '', percent: 0 });
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await archiveAPI.list();
      setSessions(res.data.sessions || []);
    } catch (e) {
      console.error('Failed to load sessions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    setUploadProgress({ show: true, name: file.name, percent: 10 });

    const formData = new FormData();
    formData.append('document', file);

    try {
      setUploadProgress(p => ({ ...p, percent: 30 }));
      const res = await archiveAPI.upload(formData);
      setUploadProgress(p => ({ ...p, percent: 100 }));
      setTimeout(() => {
        setUploadProgress({ show: false, name: '', percent: 0 });
        setUploading(false);
        if (res.data.sessionId) {
          onSessionSelect(res.data.sessionId);
        }
        loadSessions();
      }, 800);
    } catch (err) {
      setUploading(false);
      setUploadProgress({ show: false, name: '', percent: 0 });
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    setError(null);
    setUploading(true);
    setUploadProgress({ show: true, name: urlInput, percent: 20 });

    try {
      const res = await archiveAPI.url(urlInput.trim());
      setUploadProgress({ show: false, name: '', percent: 0 });
      setUploading(false);
      setUrlInput('');
      if (res.data.sessionId) {
        onSessionSelect(res.data.sessionId);
      }
      loadSessions();
    } catch (err) {
      setUploading(false);
      setUploadProgress({ show: false, name: '', percent: 0 });
      setError(err.response?.data?.message || 'URL processing failed.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const totalSize = sessions.reduce((acc, s) => acc + (s.char_count || 0), 0);
  const sizeMb = (totalSize / (1024 * 1024)).toFixed(1);
  const todayCount = sessions.filter(s => {
    const d = new Date(s.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="flex-1 p-4 md:p-8 z-10 relative flex flex-col xl:flex-row gap-8">
      {/* Left Column: The Altar */}
      <div className="flex-1 flex flex-col gap-8 max-w-4xl mx-auto w-full">
        {/* Upload Zone */}
        <div
          className={`bg-surface-container p-[0.4rem] relative group ${dragOver ? 'ring-2 ring-primary' : ''}`}
          style={{ boxShadow: '2px 2px 0px 0px #150136' }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf,.docx,.pptx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-outline-variant/30 h-full p-8 md:p-12 flex flex-col items-center justify-center text-center border-dashed bg-surface-container-low transition-colors duration-0 hover:bg-surface-container hover:border-primary/50 cursor-pointer min-h-[400px]"
          >
            <div className="w-24 h-24 mb-6 bg-surface-variant flex items-center justify-center border-2 border-outline-variant relative hover:border-primary transition-colors" style={{ boxShadow: '4px 4px 0px 0px #150136' }}>
              <Upload className="w-12 h-12 text-primary" />
            </div>
            <h3 className={`${fontHeadline} text-2xl font-bold text-on-surface mb-4 uppercase tracking-wide`}>Cast Artifact Here</h3>
            <p className="font-body text-on-surface-variant max-w-md mb-8 leading-relaxed">
              Drag and drop mysterious PDF scrolls, DOCX grimoires, or PPT tomes to begin the transmutation process.
            </p>
            <div className="flex items-center gap-4 w-full max-w-sm">
              <div className="h-[1px] flex-1 bg-outline-variant/50" />
              <span className={`${fontRetro} text-[10px] text-tertiary`}>OR PASTE URL</span>
              <div className="h-[1px] flex-1 bg-outline-variant/50" />
            </div>
            <div className="mt-6 w-full max-w-md flex relative">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder="https://..."
                type="text"
                className="w-full bg-surface-container-lowest border-2 border-outline-variant text-on-surface px-4 py-3 font-body focus:outline-none focus:border-secondary focus:ring-0 placeholder:text-outline-variant placeholder:font-label placeholder:text-[10px]"
              />
              <button
                onClick={(e) => { e.stopPropagation(); handleUrlSubmit(); }}
                disabled={uploading || !urlInput.trim()}
                className="absolute right-0 top-0 bottom-0 px-4 bg-secondary text-on-secondary font-label text-[10px] border-y-2 border-r-2 border-secondary hover:bg-secondary-container transition-colors disabled:opacity-50"
              >
                SUMMON
              </button>
            </div>
          </div>
        </div>

        {/* Active Ritual (Progress) */}
        <AnimatePresence>
          {uploadProgress.show && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-surface-variant/60 backdrop-blur-[20px] p-[0.4rem] border border-outline-variant/20"
              style={{ boxShadow: '2px 2px 0px 0px #150136' }}
            >
              <div className="p-6">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h4 className={`${fontRetro} text-[10px] text-primary mb-2`}>TRANSMUTATION RITUAL ACTIVE</h4>
                    <p className="font-body text-sm text-on-surface font-medium truncate max-w-[200px] md:max-w-md">{uploadProgress.name}</p>
                  </div>
                  <span className={`${fontRetro} text-[10px] text-secondary`}>{uploadProgress.percent}%</span>
                </div>
                <div className="w-full h-6 bg-surface-container-highest relative overflow-hidden p-[2px]" style={{ boxShadow: '2px 2px 0px 0px #150136' }}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary-container pixelated border-r-[4px] border-background"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress.percent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="font-body text-xs text-on-surface-variant mt-3 opacity-70">
                  {uploadProgress.percent < 100 ? 'Deciphering runes... extracting metadata...' : 'Transmutation complete! Opening vault...'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-error-container text-error px-4 py-3 border-2 border-error max-w-sm shadow-lg"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className={`${fontRetro} text-[8px] leading-relaxed`}>{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-xs underline mt-2 hover:text-white">Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Sidebar Stats & History */}
      <div className="w-full xl:w-80 flex flex-col gap-6">
        {/* Vault Status */}
        <div className="bg-surface-container p-[0.4rem]" style={{ boxShadow: '2px 2px 0px 0px #150136' }}>
          <div className="border border-outline-variant/30 p-5 bg-surface-container-lowest">
            <h3 className={`${fontRetro} text-[10px] text-tertiary mb-4 border-b border-outline-variant/50 pb-2`}>VAULT STATUS</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-body text-on-surface mb-1">
                  <span>Storage Capacity</span>
                  <span className="text-secondary font-mono">{sizeMb} / 100 MB</span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest">
                  <div className="h-full bg-secondary pixelated" style={{ width: `${Math.min(100, (parseFloat(sizeMb) / 100) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-body text-on-surface mb-1">
                  <span>Daily Transmutations</span>
                  <span className="text-tertiary font-mono">{todayCount} / 5</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Flame key={i} className={`w-4 h-4 ${i < todayCount ? 'text-tertiary' : 'text-surface-container-highest'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tomes */}
        <div className="bg-surface-container flex-1 p-[0.4rem] flex flex-col min-h-[300px]" style={{ boxShadow: '2px 2px 0px 0px #150136' }}>
          <div className="border border-outline-variant/30 p-0 bg-surface-container-lowest h-full flex flex-col">
            <h3 className={`${fontRetro} text-[10px] text-on-surface p-5 border-b border-outline-variant/50 bg-surface-container`}>RECENT TOMES</h3>
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <p className="text-xs text-on-surface-variant text-center">No tomes in your vault yet.<br />Upload your first artifact!</p>
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto divide-y divide-outline-variant/20 p-2 space-y-2">
                {sessions.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => onSessionSelect(s.id)}
                    className="bg-surface-container-low p-[0.9rem] flex items-start gap-3 hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    {s.status === 'completed' ? (
                      <Swords className="text-tertiary w-4 h-4 mt-1 flex-shrink-0" />
                    ) : s.status === 'processing' ? (
                      <Loader2 className="text-secondary w-4 h-4 mt-1 flex-shrink-0 animate-spin" />
                    ) : (
                      <AlertTriangle className="text-error w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-body text-sm text-on-surface font-medium mb-1 truncate">{s.title}</p>
                      <p className="font-body text-xs text-on-surface-variant opacity-70">
                        {s.source_type === 'url' ? 'Web Scroll' : s.original_name || 'Upload'} • {new Date(s.created_at).toLocaleDateString()}
                      </p>
                      {s.status === 'completed' && s.xp_earned > 0 && (
                        <span className={`${fontRetro} text-[8px] text-tertiary mt-1 inline-block`}>+{s.xp_earned} XP</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// OUTPUT VIEW
// ============================================
const OutputView = ({ sessionId, onBack }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSession = useCallback(async () => {
    try {
      const res = await archiveAPI.get(sessionId);
      setSession(res.data.session);
    } catch (e) {
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Poll while processing
  useEffect(() => {
    if (!session || session.status === 'completed' || session.status === 'failed') return;
    const interval = setInterval(() => {
      loadSession();
    }, 3000);
    return () => clearInterval(interval);
  }, [session, loadSession]);

  const handleDelete = async () => {
    if (!window.confirm('Banish this tome from your vault?')) return;
    try {
      await archiveAPI.delete(sessionId);
      onBack();
    } catch (e) {
      setError('Failed to delete');
    }
  };

  const handleRegenerate = async () => {
    try {
      await archiveAPI.regenerate(sessionId);
      setSession(prev => prev ? { ...prev, status: 'processing' } : prev);
    } catch (e) {
      setError('Failed to restart transmutation');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className={`${fontRetro} text-[10px] text-secondary`}>SUMMONING SCROLL...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
          <p className={`${fontRetro} text-[10px] text-error mb-4`}>{error || 'Tome not found'}</p>
          <PixelBtn onClick={onBack} variant="ghost">RETURN TO ALTAR</PixelBtn>
        </div>
      </div>
    );
  }

  const notes = session.generated_notes || {};
  const flashcards = session.flashcards || [];
  const summary = session.summary || '';
  const artifact = session.master_artifact || {};
  const sections = notes.sections || [];

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface/70 hover:text-primary transition-colors px-3 py-2 bg-surface-container border-2 border-outline-variant/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className={`${fontRetro} text-[10px] uppercase`}>Back to Altar</span>
        </button>
      </div>

      {/* Status Banner */}
      {session.status === 'processing' && (
        <div className="w-full bg-primary/10 border-y-2 border-primary p-3 flex items-center justify-center gap-3 z-20 sticky top-0">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <p className={`${fontRetro} text-[10px] text-primary`}>TRANSMUTATION IN PROGRESS — AI IS FORGING YOUR STUDY MATERIALS</p>
        </div>
      )}

      {/* Failed state */}
      {session.status === 'failed' && (
        <div className="w-full bg-error-container text-error px-4 py-3 border-y-2 border-error z-20 flex items-center justify-between sticky top-0">
          <div>
            <p className={`${fontRetro} text-[8px]`}>TRANSMUTATION FAILED</p>
            <p className="text-xs">{session.error_message || 'Unknown error'}</p>
          </div>
          <PixelBtn onClick={handleRegenerate} variant="primary" icon={RotateCcw} className="text-[8px] py-2 px-3">RETRY</PixelBtn>
        </div>
      )}

      <div className="p-4 md:p-8 flex flex-col md:flex-row gap-8 relative">
        {/* Left Pane: The Scroll */}
        <section className="flex-1 flex flex-col z-10 relative mt-12 md:mt-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={`${fontHeadline} text-xl font-bold uppercase tracking-wide text-primary flex items-center gap-2`}>
              <FileText className="text-primary w-5 h-5" />
              {session.status === 'completed' ? 'The Scroll' : 'Original Text'}
            </h2>
            <div className={`${fontRetro} text-[8px] ${session.status === 'completed' ? 'text-secondary' : 'text-primary'} border ${session.status === 'completed' ? 'border-secondary' : 'border-primary'} px-2 py-1 opacity-60`}>
              {session.status === 'completed' ? 'TRANSMUTED' : 'RAW DATA'}
            </div>
          </div>

          <div className="bg-surface-container flex-1 border-4 border-outline-variant/15 relative p-6 font-body text-on-surface leading-relaxed overflow-y-auto min-h-[500px]" style={{ boxShadow: '2px 2px 0px 0px #150136' }}>
            {session.status === 'processing' || session.status === 'failed' ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <h1 className={`${fontHeadline} text-3xl font-black text-on-background uppercase mb-8 border-b-2 border-surface-container-highest pb-4`}>
                  {session.title}
                </h1>
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {session.original_text}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                <h1 className={`${fontHeadline} text-3xl font-black text-on-background uppercase mb-8 border-b-2 border-surface-container-highest pb-4`}>
                  {notes.title || session.title}
                </h1>

                {sections.map((section, idx) => (
                  <div key={idx}>
                    {section.highlight && (
                      <div className="bg-surface-container-highest p-4 border-l-4 border-secondary my-6 relative">
                        <Zap className="absolute top-2 right-2 text-secondary opacity-30 w-8 h-8" />
                        <h3 className={`${fontHeadline} font-bold text-secondary mb-2 uppercase`}>{section.heading}</h3>
                        <p className="text-sm">{section.highlight}</p>
                      </div>
                    )}
                    {!section.highlight && section.heading && (
                      <h3 className={`${fontHeadline} font-bold text-primary mb-2 uppercase text-lg`}>{section.heading}</h3>
                    )}
                    {section.body && (
                      <div className="text-base leading-relaxed whitespace-pre-wrap">
                        {section.body.split('**').map((part, i) =>
                          i % 2 === 1 ? <strong key={i} className="text-primary">{part}</strong> : part
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {sections.length === 0 && (
                  <p className="text-on-surface-variant">No structured notes available yet.</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Pane: Knowledge Relics */}
        <section className="w-full md:w-[400px] lg:w-[480px] flex flex-col z-10 relative">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={`${fontHeadline} text-xl font-bold uppercase tracking-wide text-tertiary flex items-center gap-2`}>
              <Gem className="text-tertiary w-5 h-5" />
              Relics
            </h2>
            <span className="bg-surface-container-high text-on-surface px-2 py-1 font-label text-[8px]">
              {session.status === 'completed' ? flashcards.length + (summary ? 1 : 0) + (artifact.title ? 1 : 0) : '...'} EXTRACTED
            </span>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {session.status === 'processing' && (
              <div className="bg-surface-container-low p-5 border-l-4 border-primary animate-pulse">
                <h4 className={`${fontRetro} text-[10px] text-primary mb-2`}>FORGING RELICS...</h4>
                <p className="text-sm text-on-surface-variant">The Alchemist is analyzing your document and creating flashcards, summaries, and concept maps.</p>
              </div>
            )}

            {/* Summary Relic */}
            {summary && (
              <div className="bg-surface-container-low p-5 relative border-l-4 border-secondary" style={{ boxShadow: '2px 2px 0px 0px #150136' }}>
                <div className="absolute -right-2 -top-2 w-8 h-8 bg-surface-container flex items-center justify-center border-2 border-secondary z-10 shadow-sm">
                  <AlignLeft className="text-secondary w-4 h-4" />
                </div>
                <h4 className={`${fontRetro} text-[10px] text-secondary mb-3 uppercase tracking-wider`}>Core Summary</h4>
                <div className="font-body text-sm leading-relaxed text-on-surface opacity-90">
                  {summary}
                </div>
              </div>
            )}

            {/* Flashcard Relics */}
            {flashcards.map((card, idx) => (
              <FlashcardRelic key={idx} card={card} index={idx} />
            ))}

            {/* Master Artifact */}
            {artifact.title && <MasterArtifact artifact={artifact} />}
          </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <PixelBtn onClick={handleRegenerate} variant="secondary" icon={RotateCcw} className="flex-1 text-[10px] py-3">
            REGENERATE
          </PixelBtn>
          <PixelBtn onClick={handleDelete} variant="danger" icon={Trash2} className="text-[10px] py-3 px-4">
            DELETE
          </PixelBtn>
        </div>
      </section>
    </div>
  </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const ArchiveAlchemist = () => {
  const [view, setView] = useState('upload');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSessionSelect = (id) => {
    setActiveSessionId(id);
    setView('output');
  };

  const handleBack = () => {
    setActiveSessionId(null);
    setView('upload');
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col md:flex-row overflow-x-hidden selection:bg-primary selection:text-on-primary">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-background uppercase tracking-widest border-b-4 border-surface flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50" style={{ boxShadow: '4px 4px 0px 0px #000000' }}>
        <div className="text-xl font-black text-primary tracking-tighter font-headline">ARCHIVE ALCHEMIST</div>
        <div className="flex gap-4">
          <button className="text-primary hover:bg-primary hover:text-background transition-all p-2">
            <GraduationCap className="w-5 h-5" />
          </button>
          <button className="text-primary hover:bg-primary hover:text-background transition-all p-2">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* SideNavBar (Desktop) */}
      <div className="hidden md:block">
        <SideNavBar activeItem="archive" />
      </div>

      {/* Mobile SideNav */}
      <SideNavBar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="archive"
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-h-screen lg:ml-64">
        {/* Ambient Decor */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary opacity-5 blur-[100px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-tertiary opacity-5 blur-[80px] rounded-full mix-blend-screen" />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-8 z-10 relative">
          <h1 className={`${fontHeadline} text-4xl font-black text-primary tracking-tighter uppercase`} style={{ textShadow: '4px 4px 0px #150136' }}>
            {view === 'upload' ? 'The Altar of Ingestion' : 'The Transmuted Scroll'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className={`${fontRetro} text-[10px] text-secondary mb-1`}>MANA LEVEL</span>
              <div className="w-32 h-4 bg-surface-container-highest relative overflow-hidden p-[2px]" style={{ boxShadow: '2px 2px 0px 0px #150136' }}>
                <div className="h-full bg-gradient-to-r from-secondary to-secondary-container w-[75%] pixelated border-r-2 border-background" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'upload' ? (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <UploadView onSessionSelect={handleSessionSelect} />
            </motion.div>
          ) : (
            <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <OutputView sessionId={activeSessionId} onBack={handleBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom HUD */}
      <div className="h-16 bg-surface-container-lowest border-t-2 border-surface-container flex items-center justify-between px-6 z-50 sticky bottom-0 relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
        <div className="flex items-center gap-4">
          <Sparkles className="text-tertiary w-6 h-6" />
          <div>
            <div className={`${fontRetro} text-[8px] text-secondary mb-1`}>TRANSMUTATION XP</div>
            <div className="text-tertiary font-headline font-bold text-lg">+150 XP</div>
          </div>
        </div>
        <div className="w-1/3 max-w-md mx-4 hidden sm:block">
          <div className="flex justify-between font-label text-[8px] mb-1">
            <span className="text-secondary">MANA LEVEL</span>
            <span className="text-secondary">85%</span>
          </div>
          <div className="h-4 bg-surface-container-highest border border-outline-variant p-[2px]">
            <div
              className="h-full"
              style={{ width: '85%', background: 'repeating-linear-gradient(to right, #00f1fe, #00f1fe 4px, #006a70 4px, #006a70 8px)' }}
            />
          </div>
        </div>
        <PixelBtn variant="primary" icon={Save} className="text-[10px] py-2 px-4">
          SAVE SESSION
        </PixelBtn>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNavBar activeItem="archive" />
      </div>
    </div>
  );
};

export default ArchiveAlchemist;
