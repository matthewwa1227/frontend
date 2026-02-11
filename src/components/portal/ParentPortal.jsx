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
  Clock
} from 'lucide-react';
import { familyAPI } from '../../utils/api';
import { getUser } from '../../utils/auth';
import PixelCard from '../shared/PixelCard';

// Pixel-styled Button Component
const PixelButton = ({ onClick, children, variant = "primary", className = "", disabled = false, type = "button" }) => {
  const variants = {
    primary: "bg-indigo-600 border-white hover:bg-indigo-500",
    success: "bg-pixel-success border-white hover:bg-green-600",
    secondary: "bg-pixel-primary border-pixel-accent hover:bg-gray-700",
    danger: "bg-red-800 border-red-500 hover:bg-red-700",
    gold: "bg-pixel-gold border-white hover:bg-yellow-500 text-black"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-3 font-pixel text-xs uppercase tracking-wider
        border-4 ${variants[variant]}
        transition-colors flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Main Component - Student Only
export default function FamilyPortal() {
  const user = getUser();
  const [inviteCode, setInviteCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [guardians, setGuardians] = useState([]);
  const [loadingGuardians, setLoadingGuardians] = useState(true);
  const [error, setError] = useState('');

  // Fetch guardians on mount
  useEffect(() => {
    fetchGuardians();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (expirySeconds > 0) {
      const timer = setInterval(() => setExpirySeconds(s => s - 1), 1000);
      return () => clearInterval(timer);
    } else if (expirySeconds === 0 && inviteCode) {
      setInviteCode(null);
    }
  }, [expirySeconds, inviteCode]);

  const fetchGuardians = async () => {
    try {
      setLoadingGuardians(true);
      const response = await familyAPI.getGuardians();
      if (response.data.success) {
        setGuardians(response.data.guardians);
      }
    } catch (err) {
      console.error('Failed to fetch guardians:', err);
      setError('Failed to load guardians');
    } finally {
      setLoadingGuardians(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError('');
      
      const response = await familyAPI.generateCode();
      
      if (response.data.success) {
        setInviteCode(response.data.code);
        const expiresAt = new Date(response.data.expiresAt);
        const now = new Date();
        const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setExpirySeconds(secondsLeft);
      }
    } catch (err) {
      console.error('Failed to generate code:', err);
      setError(err.response?.data?.message || 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRemove = async (linkId, guardianName) => {
    if (!window.confirm(`Remove ${guardianName} as your guardian?`)) {
      return;
    }

    try {
      await familyAPI.removeGuardian(linkId);
      setGuardians(prev => prev.filter(g => g.linkId !== linkId));
    } catch (err) {
      console.error('Failed to remove guardian:', err);
      alert(err.response?.data?.message || 'Failed to remove guardian');
    }
  };

  // Loading state
  if (loadingGuardians) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pixel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-pixel text-sm">Loading Guardian Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-pixel text-white mb-2">
          Family Portal 👨‍👩‍👧‍👦
        </h1>
        <p className="text-sm font-pixel text-gray-400">
          Connect with your guardians to share your progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Generate Invite Code */}
        <PixelCard title="Invite Guardian" icon="🔗">
          <div className="flex flex-col items-center space-y-6 py-4">
            <p className="text-gray-400 text-center font-pixel text-xs">
              Generate a temporary code to share with your parent or guardian.
            </p>

            {/* Error Display */}
            {error && (
              <div className="w-full p-3 bg-red-900 border-2 border-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-200 font-pixel text-xs">{error}</span>
              </div>
            )}

            {/* Code Display */}
            <div className="w-full">
              {inviteCode ? (
                <div className="bg-black border-4 border-pixel-gold p-6 text-center relative overflow-hidden">
                  {/* Scanline effect */}
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                    }} 
                  />
                  <span className="text-pixel-gold font-pixel text-xs uppercase tracking-widest block mb-2">
                    Your Code
                  </span>
                  <div 
                    className="text-4xl font-pixel text-pixel-success tracking-widest mb-3"
                    style={{ textShadow: '0 0 10px rgba(74,222,128,0.5)' }}
                  >
                    {inviteCode}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-pixel-warning">
                    <Clock className="w-4 h-4" />
                    <span className="font-pixel text-sm">{formatTime(expirySeconds)}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-pixel-dark border-4 border-dashed border-pixel-accent p-8 text-center">
                  <div className="text-gray-500 font-pixel text-xs">[ NO ACTIVE CODE ]</div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex w-full gap-3">
              {inviteCode ? (
                <>
                  <PixelButton onClick={handleCopy} variant="success" className="flex-1">
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "Copied!" : "Copy Code"}
                  </PixelButton>
                  <PixelButton onClick={handleGenerate} variant="secondary" disabled={isGenerating}>
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </PixelButton>
                </>
              ) : (
                <PixelButton onClick={handleGenerate} variant="gold" className="w-full" disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Generate Code
                </PixelButton>
              )}
            </div>
          </div>
        </PixelCard>

        {/* Connected Guardians */}
        <PixelCard title="Connected Guardians" icon="🛡️">
          {guardians.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-white font-pixel text-sm mb-2">
                No guardians connected
              </p>
              <p className="text-gray-400 font-pixel text-xs">
                Share your code to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {guardians.map((g) => (
                <div 
                  key={g.linkId} 
                  className="bg-pixel-dark border-2 border-pixel-accent p-4 hover:border-pixel-gold transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center text-white font-pixel text-lg">
                        {g.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h4 className="font-pixel text-sm text-white">{g.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400">{g.email}</span>
                          <span className="px-2 py-0.5 bg-indigo-900 border border-indigo-500 text-indigo-300 font-pixel text-xs">
                            {g.relationship}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(g.linkId, g.name)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900 border-2 border-transparent hover:border-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PixelCard>
      </div>

      {/* Privacy Info */}
      <div className="mt-6 bg-blue-900 border-4 border-blue-500 p-4 flex gap-3">
        <Shield className="w-5 h-5 text-blue-400 shrink-0" />
        <p className="font-pixel text-xs text-blue-200">
          <span className="text-blue-400">[INFO]</span> Guardians can view your study stats and achievements. They cannot access private notes or messages.
        </p>
      </div>

      {/* Quick Action - Back to Dashboard */}
      <div className="mt-6">
        <PixelCard title="Quick Actions" icon="⚡">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-pixel-primary border-4 border-pixel-accent p-6 hover:bg-gray-700 transition-colors"
            >
              <div className="text-4xl mb-2">🏠</div>
              <h3 className="font-pixel text-sm text-white mb-1">Back to Dashboard</h3>
              <p className="text-xs font-mono text-gray-300">Return to main view</p>
            </button>
            
            <button
              onClick={() => window.location.href = '/sessions/new'}
              className="bg-pixel-success border-4 border-white p-6 hover:bg-green-600 transition-colors"
            >
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-pixel text-sm text-white mb-1">Start Study Session</h3>
              <p className="text-xs font-mono text-gray-300">Begin earning XP now</p>
            </button>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}