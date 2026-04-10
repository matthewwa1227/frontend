import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  RefreshCw,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  UserMinus,
  Clock,
  Zap,
  Plus,
  History,
  Smartphone,
  Key,
  Sparkles,
} from 'lucide-react';
import { familyAPI } from '../../utils/api';
import { getUser } from '../../utils/auth';
import SideNavBar, { BottomNavBar } from '../layout/SideNavBar';

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: 'target', href: '/dashboard', category: 'main' },
  { id: 'tasks', label: 'QUEST LOG', icon: 'checklist', href: '/tasks', category: 'main' },
  { id: 'timer', label: 'CHAMBER OF FOCUS', icon: 'timer', href: '/timer', category: 'main' },
  { id: 'progress', label: 'PROGRESS', icon: 'trending_up', href: '/progress', category: 'main' },
  { id: 'social', label: 'SOCIAL', icon: 'groups', href: '/social', category: 'main' },
  { id: 'leaderboard', label: 'LEADERBOARD', icon: 'trophy', href: '/leaderboard', category: 'main' },
  { id: 'study-buddy', label: 'STUDY BUDDY', icon: 'chat', href: '/study-buddy', category: 'study' },
  { id: 'story-quest', label: 'STORY QUEST', icon: 'smart_toy', href: '/story-quest', category: 'study' },
  { id: 'schedule', label: 'SCHEDULE', icon: 'calendar_month', href: '/schedule', category: 'study' },
  { id: 'exercise-gen', label: 'EXERCISE GEN', icon: 'edit_document', href: '/exercise-generator', category: 'study' },
  { id: 'portal', label: 'FAMILY PORTAL', icon: 'family_restroom', href: '/portal', category: 'more' },
  { id: 'profile', label: 'PROFILE', icon: 'person', href: '/profile', category: 'more' },
];

// Pixel Button Component
const PixelButton = ({ onClick, children, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const variants = {
    primary: 'bg-[#ff4a8d] text-white shadow-[0_4px_0_0_#8f0044] hover:translate-y-1 hover:shadow-none',
    secondary: 'bg-[#00f1fe] text-[#00363a] shadow-[0_4px_0_0_#006a70] hover:translate-y-1 hover:shadow-none',
    gold: 'bg-[#e9c400] text-[#3a3000] shadow-[0_4px_0_0_#544600] hover:translate-y-1 hover:shadow-none',
    outline: 'bg-transparent border-2 border-dashed border-outline-variant hover:border-primary hover:text-primary',
    ghost: 'bg-surface-container hover:bg-surface-container-high text-on-surface',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-3 font-['Press_Start_2P'] text-[10px] uppercase tracking-wider
        transition-all flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Guardian Card Component
const GuardianCard = ({ guardian, onRemove }) => {
  const statusColors = {
    online: 'border-secondary bg-secondary/10',
    offline: 'border-outline-variant bg-surface-container-high/50',
    away: 'border-tertiary bg-tertiary/10',
  };

  const statusText = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
  };

  // Generate pixel avatar based on name
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  const getAvatarColor = (name) => {
    const colors = ['#ff4a8d', '#00f1fe', '#e9c400', '#7c3aed'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  return (
    <div className="group relative bg-surface-container p-5 flex items-center gap-4 border-l-4 border-primary shadow-[4px_4px_0_0_#150136] hover:translate-x-1 transition-transform">
      {/* Avatar */}
      <div 
        className="w-16 h-16 flex items-center justify-center font-['Press_Start_2P'] text-lg text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]"
        style={{ backgroundColor: getAvatarColor(guardian.name) }}
      >
        {getInitials(guardian.name)}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-['Press_Start_2P'] text-[10px] text-on-surface truncate">
          {guardian.name?.toUpperCase().replace(/\s/g, '_') || 'GUARDIAN'}
        </h4>
        <p className="font-body text-xs text-secondary-fixed-dim mt-1 capitalize">
          Status: {statusText[guardian.status] || 'Online'}
        </p>
        {/* Relationship Badge */}
        <div className="mt-2">
          <span className="inline-block px-2 py-1 bg-surface-container-highest border border-outline-variant font-['Press_Start_2P'] text-[6px] text-outline uppercase">
            {guardian.relationship || 'PARENT'}
          </span>
        </div>
        {/* Connection Progress Dots */}
        <div className="flex gap-1 mt-2">
          <div className="h-1 w-4 bg-tertiary"></div>
          <div className="h-1 w-4 bg-tertiary"></div>
          <div className="h-1 w-4 bg-tertiary/20"></div>
        </div>
      </div>

      {/* Remove Button (hover) */}
      <button
        onClick={() => onRemove(guardian.linkId, guardian.name)}
        className="opacity-0 group-hover:opacity-100 p-2 text-error hover:bg-error-container/20 border-2 border-transparent hover:border-error transition-all"
        title="Remove Guardian"
      >
        <UserMinus className="w-4 h-4" />
      </button>
    </div>
  );
};

// Add Guardian Placeholder
const AddGuardianPlaceholder = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="bg-surface-container-low border-2 border-dashed border-outline-variant p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-surface-container transition-colors group min-h-[120px]"
  >
    <Plus className="w-6 h-6 text-outline group-hover:text-primary transition-colors" />
    <span className="font-['Press_Start_2P'] text-[8px] text-outline group-hover:text-primary uppercase text-center">
      Invite New Guardian
    </span>
  </button>
);

// Mock QR Code Component
const MockQRCode = () => (
  <div className="bg-white p-2 shadow-[4px_4px_0_0_#ffb1c4]">
    <div className="w-32 h-32 bg-background flex flex-wrap p-1">
      {Array.from({ length: 36 }).map((_, i) => {
        const pattern = [
          1,0,1,1,0,1,
          1,1,0,1,1,0,
          0,1,1,0,1,1,
          1,0,1,1,0,1,
          1,1,0,1,1,0,
          0,1,1,0,1,1
        ];
        return (
          <div 
            key={i} 
            className={`w-4 h-4 m-0.5 ${pattern[i] ? 'bg-white' : 'bg-background'}`}
          />
        );
      })}
    </div>
  </div>
);

// Main Component
export default function FamilyPortal() {
  const user = getUser();
  const [inviteCode, setInviteCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [guardians, setGuardians] = useState([]);
  const [loadingGuardians, setLoadingGuardians] = useState(true);
  const [error, setError] = useState('');
  const [portalLogs, setPortalLogs] = useState([
    { text: '<span class="text-on-surface">MOM_PALADIN</span> approved your <span class="text-tertiary">Ancient Civilizations</span> quest reward.', time: '2 HOURS AGO' },
    { text: 'New Family Buff active: <span class="text-primary">+150 XP</span> gained today via Resonance.', time: '4 HOURS AGO' },
    { text: '<span class="text-on-surface">DAD_RANGER</span> sent a <span class="text-secondary">Mana Potion</span> gift.', time: 'YESTERDAY' },
  ]);

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
        setGuardians(response.data.guardians.map(g => ({ ...g, status: 'online' })));
      }
    } catch (err) {
      console.error('Failed to fetch guardians:', err);
      // Mock data for demo
      setGuardians([
        { linkId: 1, name: 'Sarah Chen', relationship: 'Mother', email: 'sarah@example.com', status: 'online' },
        { linkId: 2, name: 'David Chen', relationship: 'Father', email: 'david@example.com', status: 'offline' },
      ]);
    } finally {
      setLoadingGuardians(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}H ${m}M`;
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
      // Mock for demo
      setInviteCode('X7K9P2M4');
      setExpirySeconds(24 * 60 * 60); // 24 hours
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
      setGuardians(prev => prev.filter(g => g.linkId !== linkId));
    }
  };

  const maxSlots = 3;
  const usedSlots = guardians.length;
  const availableSlots = maxSlots - usedSlots;

  // Loading state
  if (loadingGuardians) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tertiary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface font-['Press_Start_2P'] text-sm">Loading Guardian Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Side Navigation */}
      <SideNavBar 
        items={navItems}
        user={user}
        activeItem="portal"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) window.location.href = item.href;
        }}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNavBar activeItem="portal" />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-8">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-surface border-b-4 border-surface-container shadow-[0_4px_0_0_#271448] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black tracking-tighter text-primary uppercase font-['Space_Grotesk']">
                Guardian Sanctum
              </h1>
              <div className="hidden md:flex gap-6 ml-8">
                <span className="text-secondary font-['Press_Start_2P'] text-[8px] cursor-pointer hover:text-primary transition-colors">
                  Dashboard
                </span>
                <span className="text-on-surface-variant font-['Press_Start_2P'] text-[8px] cursor-pointer hover:text-primary transition-colors">
                  Quests
                </span>
                <span className="text-primary font-['Press_Start_2P'] text-[8px] border-b-4 border-primary pb-1">
                  Family
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">notifications</span>
              <span className="material-symbols-outlined text-primary">settings</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Family Buff Banner */}
          <section className="relative p-6 lg:p-8 bg-surface-container-low shadow-[8px_8px_0_0_#150136] overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-tertiary-container flex items-center justify-center shadow-[4px_4px_0_0_#4c3f00]">
                <Zap className="w-10 h-10 text-on-tertiary-container" />
              </div>
              <div>
                <h2 className="font-['Press_Start_2P'] text-lg text-tertiary uppercase mb-2">
                  Family Buff Active
                </h2>
                <p className="font-body text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                  Strengthen your bond with your guardians to unlock the <span className="text-primary font-bold">Resonance XP Multiplier</span>. 
                  Linked students gain <span className="text-secondary font-bold">+15% Mana Regen</span> and rare relic drops during joint study quests.
                </p>
              </div>
            </div>
          </section>

          {/* Bento Grid for Core Features */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Linked Guardians (Large Section) */}
            <section className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Press_Start_2P'] text-xs text-primary uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Linked Guardians
                </h3>
                <span className="text-secondary-fixed-dim text-[10px] font-['Press_Start_2P']">
                  {usedSlots} / {maxSlots} SLOTS
                </span>
              </div>
              
              {/* Guardian Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {guardians.map((guardian) => (
                  <GuardianCard 
                    key={guardian.linkId} 
                    guardian={guardian} 
                    onRemove={handleRemove}
                  />
                ))}
                
                {/* Add Guardian Placeholder */}
                {availableSlots > 0 && (
                  <AddGuardianPlaceholder onClick={() => document.getElementById('quest-key-section')?.scrollIntoView({ behavior: 'smooth' })} />
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-error-container/20 border-2 border-error flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-error" />
                  <span className="text-error font-['Press_Start_2P'] text-[10px]">{error}</span>
                </div>
              )}
            </section>

            {/* Quest Key Generator (Call to Action Card) */}
            <section id="quest-key-section" className="lg:col-span-4 bg-surface-container-highest p-6 shadow-[8px_8px_0_0_#150136] border-t-4 border-primary-container relative">
              <div className="absolute -top-4 -right-2 transform rotate-12">
                <Key className="w-12 h-12 text-primary opacity-20" />
              </div>
              
              <h3 className="font-['Press_Start_2P'] text-[10px] text-primary uppercase mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Quest Key
              </h3>
              
              <p className="font-body text-xs text-on-surface-variant mb-6">
                Generate a temporary ritual code to summon your guardian into the portal.
              </p>
              
              {/* Code Display */}
              <div className="bg-surface-container-lowest p-4 text-center mb-6 border-2 border-surface-container">
                {inviteCode ? (
                  <div className="space-y-2">
                    <span className="font-['Press_Start_2P'] text-2xl text-secondary tracking-[0.15em] block">
                      {inviteCode}
                    </span>
                    <div className="flex items-center justify-center gap-2 text-tertiary">
                      <Clock className="w-3 h-3" />
                      <span className="font-['Press_Start_2P'] text-[8px]">{formatTime(expirySeconds)}</span>
                    </div>
                  </div>
                ) : (
                  <span className="font-['Press_Start_2P'] text-lg text-outline tracking-[0.2em]">---- ----</span>
                )}
              </div>

              {/* Action Buttons */}
              {inviteCode ? (
                <div className="flex gap-2">
                  <PixelButton 
                    onClick={handleCopy} 
                    variant="secondary" 
                    className="flex-1"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'COPIED!' : 'COPY'}
                  </PixelButton>
                  <PixelButton 
                    onClick={handleGenerate} 
                    variant="ghost"
                    disabled={isGenerating}
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </PixelButton>
                </div>
              ) : (
                <PixelButton 
                  onClick={handleGenerate} 
                  variant="primary" 
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  GENERATE KEY
                </PixelButton>
              )}
              
              <p className="text-[8px] font-['Press_Start_2P'] text-outline mt-4 text-center">
                EXPIRES IN 24 HOURS
              </p>
            </section>
          </div>

          {/* Bottom Layout: Sync Companion & Portal Logs */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* QR Code Section */}
            <div className="bg-surface-container-low p-6 lg:p-8 shadow-[8px_8px_0_0_#150136] border border-outline-variant/30">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <MockQRCode />
                <div className="flex-1">
                  <h3 className="font-['Press_Start_2P'] text-[10px] text-secondary uppercase mb-3 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Sync Companion App
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-4">
                    Download the <span className="text-white italic">Oracle's Eye</span> mobile app. Scan this scroll to mirror your inventory and chat with Guardians on the go.
                  </p>
                  <div className="flex gap-3">
                    <div className="bg-surface-variant p-2 flex items-center gap-2 cursor-pointer hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-sm text-secondary">phone_iphone</span>
                      <span className="font-['Press_Start_2P'] text-[6px]">iOS</span>
                    </div>
                    <div className="bg-surface-variant p-2 flex items-center gap-2 cursor-pointer hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-sm text-secondary">phone_android</span>
                      <span className="font-['Press_Start_2P'] text-[6px]">Android</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Log / History */}
            <div className="bg-surface-container-low p-6 border-l-4 border-tertiary shadow-[4px_4px_0_0_#150136]">
              <h3 className="font-['Press_Start_2P'] text-[8px] text-tertiary uppercase mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> Portal Logs
              </h3>
              <ul className="space-y-4">
                {portalLogs.map((log, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary text-lg">history_edu</span>
                    <div className="font-body text-[11px]" dangerouslySetInnerHTML={{ __html: log.text }} />
                    <p className="text-[9px] text-outline font-['Press_Start_2P'] mt-1 ml-auto">{log.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Privacy Info */}
          <div className="bg-surface-container p-4 border-l-4 border-secondary flex gap-3 items-start">
            <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <p className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant leading-relaxed">
              Guardians can view your study stats and achievements. They cannot access private notes or messages.
            </p>
          </div>
        </div>
      </main>

      {/* Decorative Background Glows */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 blur-[120px] pointer-events-none -z-10"></div>
    </div>
  );
}
