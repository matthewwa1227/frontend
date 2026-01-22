import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  RefreshCw,
  Shield,
  Check,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  UserMinus,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable UI Components ---

const QuestCard = ({ children, className = "", title, icon: Icon, color = "indigo", action }) => {
  const colors = {
    indigo: { border: "border-indigo-900", header: "bg-indigo-100 text-indigo-900" },
    emerald: { border: "border-emerald-900", header: "bg-emerald-100 text-emerald-900" },
    slate: { border: "border-slate-900", header: "bg-slate-100 text-slate-900" },
    amber: { border: "border-amber-900", header: "bg-amber-100 text-amber-900" }
  };
  const c = colors[color] || colors.slate;

  return (
    <div className={`bg-white border-4 ${c.border} rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden ${className}`}>
      {title && (
        <div className={`${c.header} border-b-4 ${c.border} p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5" />}
            <h3 className="font-bold text-base uppercase tracking-wide">{title}</h3>
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

const QuestButton = ({ onClick, children, variant = "primary", className = "", disabled = false, type = "button" }) => {
  const base = "px-4 py-3 font-bold uppercase tracking-wider text-sm rounded-lg border-2 transition-all flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white border-indigo-900 shadow-[0px_4px_0px_0px_rgba(49,46,129,1)] hover:bg-indigo-500 active:translate-y-1 active:shadow-none disabled:bg-indigo-400",
    success: "bg-emerald-600 text-white border-emerald-900 shadow-[0px_4px_0px_0px_rgba(6,78,59,1)] hover:bg-emerald-500 active:translate-y-1 active:shadow-none disabled:bg-emerald-400",
    secondary: "bg-white text-slate-900 border-slate-300 shadow-[0px_3px_0px_0px_rgba(203,213,225,1)] hover:bg-slate-50 active:translate-y-1 active:shadow-none",
    danger: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 shadow-none",
    ghost: "bg-transparent text-slate-600 border-transparent hover:bg-slate-100 shadow-none"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className} ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      {children}
    </button>
  );
};

const StatBadge = ({ icon: Icon, label, value, color = "slate" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200"
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-3 text-center`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Icon className="w-3.5 h-3.5 opacity-70" />
        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};

// --- Main Component ---

export default function FamilyPortal() {
  const [activeRole, setActiveRole] = useState("student");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Users className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Family Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {activeRole === 'student' ? 'Guardian Management' : 'Student Dashboard'}
            </h1>
          </div>

          {/* Role Toggle */}
          <div className="bg-white p-1.5 rounded-xl border-2 border-slate-200 shadow-sm inline-flex">
            <button
              onClick={() => setActiveRole('student')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeRole === 'student' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setActiveRole('parent')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeRole === 'parent' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Parent
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeRole === 'student' ? (
            <motion.div
              key="student"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <StudentView />
            </motion.div>
          ) : (
            <motion.div
              key="parent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ParentView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Student View ---
function StudentView() {
  const [inviteCode, setInviteCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [guardians, setGuardians] = useState([
    { id: 1, name: "Sarah Connor", relation: "Mother", email: "sarah@example.com" }
  ]);

  // Countdown timer
  useEffect(() => {
    if (expirySeconds > 0) {
      const timer = setInterval(() => setExpirySeconds(s => s - 1), 1000);
      return () => clearInterval(timer);
    } else if (expirySeconds === 0 && inviteCode) {
      setInviteCode(null);
    }
  }, [expirySeconds, inviteCode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      setInviteCode(code);
      setExpirySeconds(900); // 15 minutes
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRemove = (id) => {
    setGuardians(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Generate Code */}
      <div className="lg:col-span-2">
        <QuestCard title="Invite Guardian" icon={LinkIcon} color="indigo" className="h-full">
          <div className="flex flex-col items-center space-y-6 py-4">
            <p className="text-slate-600 text-center text-sm">
              Generate a temporary code to share with your parent or guardian.
            </p>

            {/* Code Display */}
            <div className="w-full">
              {inviteCode ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-indigo-200 rounded-xl rotate-1"></div>
                  <div className="relative bg-white border-2 border-indigo-500 rounded-xl p-6 text-center">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-2">
                      Your Code
                    </span>
                    <div className="text-4xl font-black text-slate-900 tracking-widest font-mono mb-3">
                      {inviteCode}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-amber-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-bold font-mono">{formatTime(expirySeconds)}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
                  <div className="text-slate-400 text-sm font-medium">No active code</div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex w-full gap-3">
              {inviteCode ? (
                <>
                  <QuestButton onClick={handleCopy} variant="primary" className="flex-1">
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "Copied!" : "Copy"}
                  </QuestButton>
                  <QuestButton onClick={handleGenerate} variant="secondary" disabled={isGenerating}>
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </QuestButton>
                </>
              ) : (
                <QuestButton onClick={handleGenerate} variant="primary" className="w-full" disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Generate Code
                </QuestButton>
              )}
            </div>
          </div>
        </QuestCard>
      </div>

      {/* Right: Connected Guardians */}
      <div className="lg:col-span-3 space-y-4">
        <QuestCard title="Connected Guardians" icon={Shield} color="slate">
          {guardians.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No guardians connected</p>
              <p className="text-sm mt-1">Share your code to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {guardians.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg group hover:border-indigo-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                      {g.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{g.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{g.email}</span>
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded font-semibold">{g.relation}</span>
                      </div>
                    </div>
                  </div>
                  <QuestButton onClick={() => handleRemove(g.id)} variant="danger" className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UserMinus className="w-4 h-4" />
                  </QuestButton>
                </div>
              ))}
            </div>
          )}
        </QuestCard>

        {/* Privacy Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Privacy:</strong> Guardians can view your study stats and achievements. They cannot access private notes or messages.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Parent View ---
function ParentView() {
  const [inputCode, setInputCode] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [students, setStudents] = useState([
    { id: 1, name: "Alex Johnson", level: 12, points: 4500, streak: 14, studyMinutes: 1240 }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCode.length !== 6) return;

    setStatus({ type: 'loading', message: '' });
    setTimeout(() => {
      if (inputCode.toUpperCase() === "TEST00") {
        setStatus({ type: 'error', message: 'Invalid or expired code.' });
      } else {
        setStatus({ type: 'success', message: 'Successfully connected!' });
        setStudents(prev => [...prev, {
          id: Date.now(),
          name: "Sam Student",
          level: 5,
          points: 1200,
          streak: 3,
          studyMinutes: 340
        }]);
        setInputCode('');
        setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
      }
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Link Form */}
      <div className="lg:col-span-2">
        <QuestCard title="Link Student" icon={LinkIcon} color="emerald" className="h-full">
          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6 py-4">
            <p className="text-slate-600 text-center text-sm">
              Enter the 6-character code from your student's account.
            </p>

            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="w-full text-center text-3xl font-mono font-bold tracking-widest py-4 border-b-4 border-slate-200 focus:border-emerald-500 outline-none transition-colors uppercase placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-base placeholder:font-sans bg-transparent"
            />

            <AnimatePresence>
              {status.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`w-full p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
                    status.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {status.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <QuestButton
              type="submit"
              variant="success"
              className="w-full"
              disabled={status.type === 'loading' || inputCode.length !== 6}
            >
              {status.type === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  Connect
                </>
              )}
            </QuestButton>
          </form>
        </QuestCard>
      </div>

      {/* Right: Students List */}
      <div className="lg:col-span-3">
        <QuestCard title="Your Students" icon={Users} color="slate">
          {students.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No students linked yet</p>
              <p className="text-sm mt-1">Use a code to connect</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((s) => (
                <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-emerald-200">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{s.name}</h4>
                        <p className="text-xs text-slate-500">Level {s.level} Scholar</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <StatBadge icon={Clock} label="Study" value={`${Math.floor(s.studyMinutes / 60)}h`} color="indigo" />
                    <StatBadge icon={Award} label="Points" value={s.points.toLocaleString()} color="amber" />
                    <StatBadge icon={TrendingUp} label="Streak" value={`${s.streak}d`} color="emerald" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </QuestCard>
      </div>
    </div>
  );
}