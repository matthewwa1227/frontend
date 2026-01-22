import React, { useState, useEffect } from 'react';
import {
  Shield,
  Link as LinkIcon,
  Copy,
  AlertCircle,
  User,
  Check,
  Loader2,
  Users,
  Trash2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function GuardianManagement() {
  // State for code generation
  const [inviteCode, setInviteCode] = useState(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expirySeconds, setExpirySeconds] = useState(0);

  // State for the list of guardians
  const [guardians, setGuardians] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Countdown timer for code expiry
  useEffect(() => {
    if (expirySeconds > 0) {
      const timer = setInterval(() => {
        setExpirySeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (expirySeconds === 0 && inviteCode) {
      setInviteCode(null);
    }
  }, [expirySeconds, inviteCode]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Simulate fetching guardians when component loads
  useEffect(() => {
    const fetchGuardians = async () => {
      setIsLoadingList(true);
      // Simulate API call: GET /api/family/guardians
      setTimeout(() => {
        setGuardians([
          { id: 1, name: "Sarah Connor", email: "sarah@example.com", relation: "Mother", connectedAt: "2025-01-15" },
          { id: 2, name: "Kyle Reese", email: "kyle@example.com", relation: "Father", connectedAt: "2025-01-10" }
        ]);
        setIsLoadingList(false);
      }, 1000);
    };

    fetchGuardians();
  }, []);

  // Generate a new invite code
  const generateCode = async () => {
    setIsLoadingCode(true);
    setError(null);
    setInviteCode(null);
    setCopied(false);

    // Simulate API call: POST /api/family/generate-code
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate for demo

      if (isSuccess) {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setInviteCode(code);
        setExpirySeconds(900); // 15 minutes
        setIsLoadingCode(false);
      } else {
        setError("Failed to generate code. Please try again.");
        setIsLoadingCode(false);
      }
    }, 1200);
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Remove a guardian
  const handleRemove = (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} as a guardian?`)) {
      // Simulate API call: DELETE /api/family/guardians/:id
      setGuardians((prev) => prev.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Student Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Guardian Management
          </h1>
          <p className="text-slate-600">
            Manage who can view your study progress and achievements.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Generate Invite Code */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-indigo-900">Invite Guardian</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-slate-600 text-sm">
                Generate a unique code and share it with your parent or guardian. They can use this code to link their account to yours.
              </p>

              {/* Code Display Area */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center min-h-36 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {inviteCode ? (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-3"
                    >
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                        Active Code
                      </span>
                      <div className="text-4xl font-mono font-black text-slate-900 tracking-widest select-all">
                        {inviteCode}
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy Code"}
                      </button>
                      <div className="flex items-center justify-center gap-1 text-amber-600 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Expires in {formatTime(expirySeconds)}</span>
                      </div>
                    </motion.div>
                  ) : isLoadingCode ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3 text-indigo-600"
                    >
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-sm font-medium">Generating code...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-slate-400"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <LinkIcon className="w-6 h-6 opacity-50" />
                      </div>
                      <p className="text-sm font-medium">No active code</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={generateCode}
                  disabled={isLoadingCode}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    inviteCode
                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isLoadingCode ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {inviteCode ? 'Regenerate' : 'Generate Code'}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Connected Guardians */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-emerald-900">Connected Guardians</h2>
              </div>
              {guardians.length > 0 && (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  {guardians.length} linked
                </span>
              )}
            </div>

            <div className="p-6">
              {isLoadingList ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              ) : guardians.length > 0 ? (
                <ul className="space-y-3">
                  {guardians.map((guardian) => (
                    <motion.li
                      key={guardian.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                          {guardian.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{guardian.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">{guardian.email}</span>
                            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                              {guardian.relation}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(guardian.id, guardian.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Remove Guardian"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 opacity-30" />
                  </div>
                  <p className="font-semibold text-slate-600">No guardians connected</p>
                  <p className="text-sm mt-1 max-w-xs mx-auto">
                    Generate a code and share it with your parent to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Privacy Information</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Connected guardians can view your study statistics, achievements, current level, and streak progress. 
              They <span className="font-semibold underline">cannot</span> access your private notes, messages, or change your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuardianManagement;