import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Link as LinkIcon, 
  Copy, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Award,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// NOTE: In a real app, you would get the user role from your Auth Context
// For this demo, toggle this boolean to see the different views.
const IS_PARENT_VIEW = true; 

const FamilyPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for Parent View
  const [inviteCode, setInviteCode] = useState('');
  const [linkStatus, setLinkStatus] = useState({ type: '', message: '' });
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for Student View
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);

  // --- API SIMULATION (Replace with real fetch calls) ---
  
  // 1. Fetch Children (Parent View)
  useEffect(() => {
    if (IS_PARENT_VIEW) {
      // fetch('/api/family/children-stats')
      //   .then(res => res.json())
      //   .then(data => setLinkedChildren(data.children));
      
      // MOCK DATA based on your schema
      setTimeout(() => {
        setLinkedChildren([
          {
            id: 'uuid-1',
            full_name: 'Alex Student',
            current_level: 12,
            total_points: 4500,
            streak_days: 14,
            total_study_minutes: 1240,
            avatar_url: null
          },
          {
            id: 'uuid-2',
            full_name: 'Sam Student',
            current_level: 5,
            total_points: 1200,
            streak_days: 3,
            total_study_minutes: 340,
            avatar_url: null
          }
        ]);
      }, 500);
    }
  }, []);

  // 2. Generate Code (Student View)
  const handleGenerateCode = async () => {
    setIsLoading(true);
    // const res = await fetch('/api/family/generate-code', { method: 'POST' });
    // const data = await res.json();
    // setGeneratedCode(data.code);
    
    setTimeout(() => {
      setGeneratedCode('X9B2K1');
      setCodeExpiry(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hrs
      setIsLoading(false);
    }, 800);
  };

  // 3. Link Child (Parent View)
  const handleLinkChild = async (e) => {
    e.preventDefault();
    if (inviteCode.length < 6) return;
    
    setIsLoading(true);
    setLinkStatus({ type: '', message: '' });

    // const res = await fetch('/api/family/link-child', { 
    //   method: 'POST', 
    //   body: JSON.stringify({ code: inviteCode }) 
    // });
    
    setTimeout(() => {
      setIsLoading(false);
      setLinkStatus({ type: 'success', message: 'Successfully linked to Alex!' });
      setInviteCode('');
      // Refresh list here
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Family Portal</h1>
            <p className="text-slate-500 mt-1">
              {IS_PARENT_VIEW 
                ? "Monitor your children's learning progress" 
                : "Connect with your parents to share progress"}
            </p>
          </div>
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-2">Current Role</span>
            <div className="font-bold text-indigo-600 px-2">
              {IS_PARENT_VIEW ? 'Parent Account' : 'Student Account'}
            </div>
          </div>
        </div>

        {/* --- PARENT VIEW --- */}
        {IS_PARENT_VIEW && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Link New Child */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-lg">Add Child</h2>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Enter the 6-character code generated from your child's account.
                </p>
                
                <form onSubmit={handleLinkChild} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="w-full text-center text-2xl font-mono tracking-widest p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || inviteCode.length !== 6}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                    Link Account
                  </button>
                </form>

                {linkStatus.message && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                      linkStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {linkStatus.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                    {linkStatus.message}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Column: Children Stats List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-xl text-slate-800">Your Children</h2>
              
              {linkedChildren.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                  No children linked yet. Use the code from their account to get started.
                </div>
              ) : (
                <div className="grid gap-4">
                  {linkedChildren.map((child) => (
                    <motion.div 
                      key={child.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
                              {child.full_name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-slate-900">{child.full_name}</h3>
                              <p className="text-sm text-slate-500">Level {child.current_level} Scholar</p>
                            </div>
                          </div>
                          <button className="text-sm text-indigo-600 font-medium hover:underline">
                            View Details
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {/* Stat 1: Study Time */}
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-semibold uppercase">Study Time</span>
                            </div>
                            <div className="text-xl font-bold text-slate-800">
                              {Math.floor(child.total_study_minutes / 60)}h {child.total_study_minutes % 60}m
                            </div>
                          </div>

                          {/* Stat 2: Points */}
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                              <Award className="w-4 h-4" />
                              <span className="text-xs font-semibold uppercase">Total Points</span>
                            </div>
                            <div className="text-xl font-bold text-slate-800">
                              {child.total_points.toLocaleString()}
                            </div>
                          </div>

                          {/* Stat 3: Streak */}
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-xs font-semibold uppercase">Streak</span>
                            </div>
                            <div className="text-xl font-bold text-slate-800 flex items-center gap-1">
                              {child.streak_days} <span className="text-sm font-normal text-slate-500">days</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- STUDENT VIEW --- */}
        {!IS_PARENT_VIEW && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-indigo-600 p-6 text-white text-center">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h2 className="text-2xl font-bold">Connect Parent</h2>
                <p className="text-indigo-100 text-sm mt-2">
                  Generate a code to let your parent view your study stats.
                </p>
              </div>

              <div className="p-8">
                {!generatedCode ? (
                  <div className="text-center space-y-6">
                    <p className="text-slate-600">
                      Click below to create a temporary connection code. Give this code to your parent.
                    </p>
                    <button
                      onClick={handleGenerateCode}
                      disabled={isLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                      {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Generate Code'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-500 mb-2">Your Connection Code</p>
                      <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-6 relative group cursor-pointer hover:border-indigo-400 transition-colors">
                        <div className="text-4xl font-mono font-bold text-slate-800 tracking-widest">
                          {generatedCode}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Copy className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      <p className="text-xs text-red-500 mt-3 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires in 24 hours
                      </p>
                    </div>

                    <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg flex gap-3">
                      <div className="mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
                      <p>
                        Share this code with your parent. Once they enter it in their portal, they will be linked to your account instantly.
                      </p>
                    </div>

                    <button
                      onClick={() => setGeneratedCode('')}
                      className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium py-2"
                    >
                      Generate New Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FamilyPortal;