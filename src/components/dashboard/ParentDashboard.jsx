import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Trophy, 
  Flame, 
  Clock, 
  BookOpen,
  ChevronRight,
  TrendingUp,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';

// Mock Data for the Chart
const activityData = [
  { day: 'MON', hours: 2.5 },
  { day: 'TUE', hours: 1.8 },
  { day: 'WED', hours: 3.2 },
  { day: 'THU', hours: 4.0 },
  { day: 'FRI', hours: 1.5 },
  { day: 'SAT', hours: 0.5 },
  { day: 'SUN', hours: 2.0 },
];

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'link'
  const [linkCode, setLinkCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState(null);
  const [linkSuccess, setLinkSuccess] = useState(false);

  // Mock Connected Children
  const [children, setChildren] = useState([
    {
      id: 1,
      name: "ALEX",
      level: 12,
      xp: 4500,
      streak: 14,
      lastActive: "2 HRS AGO",
      recentAchievement: "MATH MASTER",
      avatarColor: "bg-blue-600"
    }
  ]);

  const handleLinkChild = (e) => {
    e.preventDefault();
    setIsLinking(true);
    setLinkError(null);
    setLinkSuccess(false);

    setTimeout(() => {
      if (linkCode.length < 6) {
        setLinkError("INVALID CODE FORMAT");
        setIsLinking(false);
        return;
      }

      const newChild = {
        id: Date.now(),
        name: "JAMIE",
        level: 1,
        xp: 0,
        streak: 0,
        lastActive: "ONLINE NOW",
        recentAchievement: "NEW PLAYER",
        avatarColor: "bg-purple-600"
      };

      setChildren([...children, newChild]);
      setLinkSuccess(true);
      setLinkCode('');
      setIsLinking(false);
      
      setTimeout(() => {
        setLinkSuccess(false);
        setActiveTab('dashboard');
      }, 2000);

    }, 1500);
  };

  // Custom Tooltip for Retro Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-mono font-bold">{label}</p>
          <p className="font-mono text-indigo-600">{payload[0].value} HRS</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-yellow-50 font-mono text-slate-900 flex flex-col lg:flex-row">
      
      {/* RETRO SIDEBAR */}
      <aside className="w-full lg:w-72 bg-slate-100 border-b-4 lg:border-b-0 lg:border-r-4 border-black flex flex-col relative z-10">
        <div className="p-6 border-b-4 border-black bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              P
            </div>
            <span className="font-bold text-xl tracking-tighter">PARENT_OS</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-4 border-2 border-black transition-all active:translate-y-1 active:shadow-none ${
              activeTab === 'dashboard' 
                ? 'bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white hover:bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-bold">OVERVIEW</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('link')}
            className={`w-full flex items-center gap-3 p-4 border-2 border-black transition-all active:translate-y-1 active:shadow-none ${
              activeTab === 'link' 
                ? 'bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white hover:bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
            }`}
          >
            <UserPlus size={20} />
            <span className="font-bold">LINK CHILD</span>
          </button>
        </nav>

        <div className="p-4 border-t-4 border-black bg-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center">
              JD
            </div>
            <div>
              <p className="font-bold text-sm">GUARDIAN #1</p>
              <p className="text-xs text-slate-500">STATUS: ONLINE</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-6">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight">Command Center</h1>
                <p className="text-slate-600 font-bold mt-1">:: MONITORING STUDENT PROGRESS ::</p>
              </div>
              <button 
                onClick={() => setActiveTab('link')}
                className="bg-indigo-600 text-white border-2 border-black px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
              >
                <UserPlus size={18} />
                ADD_NEW_UNIT
              </button>
            </header>

            {/* Children Cards Loop */}
            {children.map(child => (
              <div key={child.id} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                {/* Child Header */}
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b-2 border-dashed border-slate-300 pb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 ${child.avatarColor} border-4 border-black flex items-center justify-center text-white text-3xl font-bold`}>
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase">{child.name}</h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-slate-200 border-2 border-black text-xs font-bold">LVL {child.level}</span>
                        <span className="px-2 py-1 bg-green-200 border-2 border-black text-xs font-bold">{child.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                     <div className="flex-1 px-4 py-2 bg-orange-100 border-2 border-black flex flex-col items-center justify-center min-w-[100px]">
                        <Flame size={24} className="mb-1 text-orange-600" />
                        <span className="font-bold text-lg">{child.streak}</span>
                        <span className="text-[10px] font-bold uppercase">Streak</span>
                     </div>
                     <div className="flex-1 px-4 py-2 bg-yellow-100 border-2 border-black flex flex-col items-center justify-center min-w-[100px]">
                        <Trophy size={24} className="mb-1 text-yellow-600" />
                        <span className="font-bold text-lg">{child.xp}</span>
                        <span className="text-[10px] font-bold uppercase">Total XP</span>
                     </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Chart Section */}
                  <div className="md:col-span-2 bg-slate-50 border-2 border-black p-4">
                    <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
                      <h3 className="font-bold flex items-center gap-2 uppercase">
                        <TrendingUp size={18} /> Activity Log
                      </h3>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                          <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fontFamily: 'monospace', fill: '#000'}} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fontFamily: 'monospace', fill: '#000'}} 
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                          <Bar dataKey="hours" fill="#4f46e5" stroke="#000" strokeWidth={2} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Activity / Achievements */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                      <h3 className="text-xs font-bold text-slate-500 mb-3 border-b-2 border-slate-200 pb-1">LATEST UNLOCK</h3>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-300 border-2 border-black">
                          <Trophy size={20} className="text-black" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{child.recentAchievement}</p>
                          <p className="text-xs text-slate-500">YESTERDAY</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                      <h3 className="text-xs font-bold text-slate-500 mb-3 border-b-2 border-slate-200 pb-1">FOCUS AREA</h3>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-300 border-2 border-black">
                          <BookOpen size={20} className="text-black" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">MATHEMATICS</p>
                          <p className="text-xs text-slate-500">ACCURACY: 85%</p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-3 text-sm bg-slate-100 hover:bg-slate-200 border-2 border-black font-bold transition-colors flex items-center justify-center gap-2 group">
                      FULL REPORT <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: LINK ACCOUNT */}
        {activeTab === 'link' && (
          <div className="max-w-xl mx-auto mt-10">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 relative">
              
              {/* Decorative Corner Screws */}
              <div className="absolute top-2 left-2 w-3 h-3 border border-black rounded-full bg-slate-300 flex items-center justify-center"><div className="w-1.5 h-px bg-black rotate-45"></div></div>
              <div className="absolute top-2 right-2 w-3 h-3 border border-black rounded-full bg-slate-300 flex items-center justify-center"><div className="w-1.5 h-px bg-black rotate-45"></div></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 border border-black rounded-full bg-slate-300 flex items-center justify-center"><div className="w-1.5 h-px bg-black rotate-45"></div></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 border border-black rounded-full bg-slate-300 flex items-center justify-center"><div className="w-1.5 h-px bg-black rotate-45"></div></div>

              <div className="text-center mb-8 mt-4">
                <div className="w-20 h-20 bg-indigo-600 border-4 border-black text-white flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <UserPlus size={40} />
                </div>
                <h1 className="text-2xl font-black uppercase">Link Child Account</h1>
                <p className="text-slate-600 mt-2 font-bold text-sm">
                  ENTER THE 6-DIGIT SYNC CODE
                </p>
              </div>

              {linkSuccess ? (
                <div className="bg-green-100 border-4 border-black p-6 text-center animate-pulse">
                  <Check className="w-16 h-16 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-black uppercase text-green-800">CONNECTION ESTABLISHED</h3>
                  <p className="text-green-800 font-bold mt-2">REDIRECTING TO DASHBOARD...</p>
                </div>
              ) : (
                <form onSubmit={handleLinkChild} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Invitation Code
                    </label>
                    <input 
                      type="text" 
                      value={linkCode}
                      onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                      placeholder="P7X-9K2"
                      className="w-full text-center text-3xl font-mono tracking-[0.5em] p-4 border-4 border-black focus:bg-yellow-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase placeholder:text-slate-300"
                      maxLength={10}
                    />
                  </div>

                  {linkError && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-100 border-2 border-red-600 p-3 font-bold text-sm">
                      <AlertTriangle size={18} />
                      {linkError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLinking || !linkCode}
                    className="w-full py-4 bg-black text-white hover:bg-slate-800 border-2 border-transparent hover:border-black hover:bg-white hover:text-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLinking ? (
                      <>
                        <Clock className="animate-spin" /> VERIFYING...
                      </>
                    ) : (
                      "CONNECT_ACCOUNT"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}