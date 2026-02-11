import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { studentAPI } from '../../utils/api';
import { Trophy, Target, Book, Star, Clock, TrendingUp, Zap } from 'lucide-react';

// Pixel Art CSS styles
const pixelStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  
  .font-pixel {
    font-family: 'Press Start 2P', cursive;
  }
  
  .pixel-border {
    box-shadow: 
      0 4px 0 0 #000,
      0 -4px 0 0 #000,
      4px 0 0 0 #000,
      -4px 0 0 0 #000,
      4px 4px 0 0 #000,
      -4px 4px 0 0 #000,
      4px -4px 0 0 #000,
      -4px -4px 0 0 #000;
  }
  
  .pixel-border-sm {
    box-shadow: 
      0 2px 0 0 #000,
      0 -2px 0 0 #000,
      2px 0 0 0 #000,
      -2px 0 0 0 #000,
      2px 2px 0 0 #000,
      -2px 2px 0 0 #000,
      2px -2px 0 0 #000,
      -2px -2px 0 0 #000;
  }
  
  .pixel-border-gold {
    box-shadow: 
      0 4px 0 0 #b8860b,
      0 -4px 0 0 #b8860b,
      4px 0 0 0 #b8860b,
      -4px 0 0 0 #b8860b,
      4px 4px 0 0 #000,
      -4px 4px 0 0 #000,
      4px -4px 0 0 #000,
      -4px -4px 0 0 #000;
  }
  
  .pixel-btn {
    image-rendering: pixelated;
    transition: transform 0.1s;
  }
  
  .pixel-btn:hover {
    transform: translateY(-2px);
  }
  
  .pixel-btn:active {
    transform: translateY(2px);
  }
  
  .pixel-progress-bar {
    background: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 8px,
      rgba(0,0,0,0.1) 8px,
      rgba(0,0,0,0.1) 16px
    );
  }
  
  .scanlines {
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.1) 2px,
      rgba(0,0,0,0.1) 4px
    );
  }
  
  .pixel-glow {
    animation: pixelGlow 2s ease-in-out infinite;
  }
  
  @keyframes pixelGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
  }
  
  .bounce-pixel {
    animation: bouncePixel 0.5s steps(4) infinite;
  }
  
  @keyframes bouncePixel {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  
  .blink-pixel {
    animation: blinkPixel 1s steps(2) infinite;
  }
  
  @keyframes blinkPixel {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

// Pixel Card Component
const PixelCard = ({ title, icon, children, color = 'gray' }) => {
  const colorClasses = {
    gray: 'bg-gray-800 border-gray-600',
    gold: 'bg-yellow-900 border-yellow-600',
    green: 'bg-green-900 border-green-600',
    blue: 'bg-blue-900 border-blue-600',
    purple: 'bg-purple-900 border-purple-600',
    red: 'bg-red-900 border-red-600',
  };

  return (
    <div className={`${colorClasses[color]} border-4 pixel-border relative`}>
      {/* Decorative corner pixels */}
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-white"></div>
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-white"></div>
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white"></div>
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white"></div>
      
      {/* Header */}
      {title && (
        <div className="bg-black/30 border-b-4 border-black px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="font-pixel text-xs text-white uppercase tracking-wider">{title}</h2>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 scanlines">
        {children}
      </div>
    </div>
  );
};

// Pixel Stat Box Component
const PixelStatBox = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    yellow: 'bg-yellow-500 text-yellow-900',
    green: 'bg-green-500 text-green-900',
    blue: 'bg-blue-500 text-blue-900',
    purple: 'bg-purple-500 text-purple-900',
  };

  const borderColors = {
    yellow: 'border-yellow-300',
    green: 'border-green-300',
    blue: 'border-blue-300',
    purple: 'border-purple-300',
  };

  return (
    <div className={`bg-gray-900 border-4 ${borderColors[color]} pixel-border-sm p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`${colorClasses[color]} p-2 pixel-border-sm`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-pixel text-[8px] text-gray-400 uppercase">{label}</span>
      </div>
      <p className={`font-pixel text-2xl ${colorClasses[color].split(' ')[0].replace('bg-', 'text-')}`}>
        {value}
      </p>
    </div>
  );
};

// Pixel Button Component
const PixelButton = ({ onClick, children, color = 'green', size = 'md', className = '' }) => {
  const colorClasses = {
    green: 'bg-green-500 hover:bg-green-400 border-green-700',
    blue: 'bg-blue-500 hover:bg-blue-400 border-blue-700',
    purple: 'bg-purple-500 hover:bg-purple-400 border-purple-700',
    gold: 'bg-yellow-500 hover:bg-yellow-400 border-yellow-700',
    red: 'bg-red-500 hover:bg-red-400 border-red-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-[8px]',
    md: 'px-4 py-3 text-[10px]',
    lg: 'px-6 py-4 text-xs',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${colorClasses[color]} 
        ${sizeClasses[size]}
        font-pixel text-white uppercase tracking-wider
        border-b-4 border-r-4
        pixel-btn
        active:border-b-0 active:border-r-0 active:border-t-4 active:border-l-4
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// XP Bar Component
const XPBar = ({ current, max, level }) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-pixel text-[10px] text-yellow-400">LVL {level}</span>
        <span className="font-pixel text-[10px] text-yellow-400">LVL {level + 1}</span>
      </div>
      
      <div className="h-6 bg-gray-900 border-4 border-gray-600 pixel-border-sm relative overflow-hidden">
        {/* XP Fill */}
        <div 
          className="h-full bg-yellow-500 pixel-progress-bar transition-all duration-500 relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/50 to-transparent h-1/2"></div>
        </div>
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,0.3) calc(10% + 2px))'
          }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="font-pixel text-[8px] text-gray-400">{current} / {max} XP</span>
        <span className="font-pixel text-[8px] text-gray-500">{max - current} XP TO GO!</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsRes = await studentAPI.getStats();
      const studentStats = statsRes.data.student;
      
      setStats(studentStats);
      setSessions(studentStats.recent_sessions || []); 

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudySession = () => {
    navigate('/study-timer');
  };

  // Loading state
  if (loading) {
    return (
      <>
        <style>{pixelStyles}</style>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            {/* Pixel Art Loading Animation */}
            <div className="mb-6">
              <div className="inline-block">
                {/* Pixelated hourglass */}
                <div className="relative w-16 h-20 mx-auto">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl bounce-pixel">⏳</div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="font-pixel text-yellow-400 text-sm mb-4">LOADING...</p>
            
            {/* Pixel loading bar */}
            <div className="w-48 h-4 bg-gray-800 border-2 border-gray-600 mx-auto overflow-hidden">
              <div className="h-full bg-yellow-500 animate-pulse" style={{ width: '60%' }}></div>
            </div>
            
            <p className="font-pixel text-gray-500 text-[8px] mt-4">FETCHING QUEST DATA</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <style>{pixelStyles}</style>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <PixelCard color="red" title="ERROR!" icon="💀">
            <div className="text-center py-4">
              <div className="text-6xl mb-4">☠️</div>
              <p className="font-pixel text-[10px] text-white mb-6 leading-relaxed">
                {error}
              </p>
              <PixelButton onClick={fetchDashboardData} color="gold">
                ↻ RETRY
              </PixelButton>
            </div>
          </PixelCard>
        </div>
      </>
    );
  }

  // Calculate XP progress
  const currentLevelXP = (stats?.xp || 0) % 100;
  const currentLevel = stats?.level || user?.level || 1;

  // Calculate stats
  const totalSessions = sessions.length;
  const totalStudyTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const todaySessions = sessions.filter(s => {
    const today = new Date().toDateString();
    const sessionDate = new Date(s.started_at).toDateString();
    return today === sessionDate;
  }).length;

  return (
    <>
      <style>{pixelStyles}</style>
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        {/* Pixel Grid Background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px'
          }}
        ></div>
        
        {/* Floating Pixels Background */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-yellow-500 opacity-20 blink-pixel"></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-green-500 opacity-20 blink-pixel" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-4 h-4 bg-blue-500 opacity-20 blink-pixel" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-purple-500 opacity-20 blink-pixel" style={{ animationDelay: '0.3s' }}></div>

        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="bg-gray-800 border-4 border-yellow-500 pixel-border-gold p-6 relative">
              {/* Decorative corners */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-500"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-500"></div>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="text-4xl bounce-pixel">👾</div>
                <div>
                  <h1 className="font-pixel text-lg text-yellow-400 mb-2">
                    WELCOME BACK!
                  </h1>
                  <p className="font-pixel text-sm text-white">
                    {user?.username || 'PLAYER 1'}
                  </p>
                </div>
              </div>
              <p className="font-pixel text-[10px] text-gray-400 mt-4">
                ► READY TO CONTINUE YOUR QUEST? ◄
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <PixelStatBox 
              icon={Trophy}
              label="Level"
              value={currentLevel}
              color="yellow"
            />
            <PixelStatBox 
              icon={Star}
              label="Total XP"
              value={stats?.xp || 0}
              color="green"
            />
            <PixelStatBox 
              icon={Target}
              label="Sessions"
              value={totalSessions}
              color="blue"
            />
            <PixelStatBox 
              icon={Clock}
              label="Minutes"
              value={totalStudyTime}
              color="purple"
            />
          </div>

          {/* Level Progress */}
          <div className="mb-8">
            <PixelCard title="EXP PROGRESS" icon="⚡" color="gold">
              <XPBar 
                current={currentLevelXP} 
                max={100} 
                level={currentLevel}
              />
            </PixelCard>
          </div>

          {/* Today's Progress */}
          <div className="mb-8">
            <PixelCard title="TODAY'S STATUS" icon="📊" color="blue">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sessions Today */}
                <div className="bg-gray-900 border-2 border-blue-500 p-4 text-center">
                  <div className="text-3xl mb-2">📚</div>
                  <p className="font-pixel text-[8px] text-gray-400 mb-2">SESSIONS</p>
                  <p className="font-pixel text-xl text-blue-400">{todaySessions}</p>
                </div>
                
                {/* Current Streak */}
                <div className="bg-gray-900 border-2 border-orange-500 p-4 text-center">
                  <div className="text-3xl mb-2 pixel-glow">🔥</div>
                  <p className="font-pixel text-[8px] text-gray-400 mb-2">STREAK</p>
                  <p className="font-pixel text-xl text-orange-400">{stats?.current_streak || 0}</p>
                </div>
                
                {/* Best Streak */}
                <div className="bg-gray-900 border-2 border-yellow-500 p-4 text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="font-pixel text-[8px] text-gray-400 mb-2">BEST</p>
                  <p className="font-pixel text-xl text-yellow-400">{stats?.longest_streak || 0}</p>
                </div>
              </div>
            </PixelCard>
          </div>

          {/* Recent Sessions */}
          <div className="mb-8">
            <PixelCard title="QUEST LOG" icon="📜" color="green">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4 bounce-pixel">📖</div>
                  <p className="font-pixel text-[10px] text-white mb-2">
                    NO QUESTS COMPLETED!
                  </p>
                  <p className="font-pixel text-[8px] text-gray-500 mb-6">
                    START YOUR ADVENTURE NOW
                  </p>
                  <PixelButton onClick={handleStartStudySession} color="green" size="lg">
                    🚀 BEGIN QUEST
                  </PixelButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session, index) => (
                    <div
                      key={session.id}
                      className="bg-gray-900 border-2 border-gray-600 hover:border-yellow-500 p-3 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-pixel text-[10px] text-white mb-1">
                            {session.subject || 'GENERAL STUDY'}
                          </p>
                          <p className="font-pixel text-[8px] text-gray-500">
                            {new Date(session.started_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-pixel text-sm text-yellow-400">
                            +{session.xp_earned || 0} XP
                          </p>
                          <p className="font-pixel text-[8px] text-gray-500">
                            {session.duration || 0} MIN
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {sessions.length > 5 && (
                    <button
                      onClick={() => navigate('/sessions')}
                      className="w-full border-2 border-dashed border-yellow-500 py-3 font-pixel text-[10px] text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                    >
                      ► VIEW ALL QUESTS ◄
                    </button>
                  )}
                </div>
              )}
            </PixelCard>
          </div>

          {/* Quick Actions */}
          <PixelCard title="COMMAND CENTER" icon="🎮" color="purple">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Start Study Session */}
              <button
                onClick={handleStartStudySession}
                className="bg-green-800 border-4 border-green-500 p-6 hover:bg-green-700 transition-colors pixel-btn group"
              >
                <div className="text-5xl mb-3 group-hover:bounce-pixel">🎯</div>
                <h3 className="font-pixel text-[10px] text-white mb-2">START QUEST</h3>
                <p className="font-pixel text-[8px] text-green-300">EARN XP NOW!</p>
                <div className="mt-3 flex justify-center gap-1">
                  <div className="w-2 h-2 bg-green-400"></div>
                  <div className="w-2 h-2 bg-green-400"></div>
                  <div className="w-2 h-2 bg-green-400"></div>
                </div>
              </button>
              
              {/* Achievements */}
              <button
                onClick={() => navigate('/achievements')}
                className="bg-purple-800 border-4 border-purple-500 p-6 hover:bg-purple-700 transition-colors pixel-btn group"
              >
                <div className="text-5xl mb-3 group-hover:bounce-pixel">🏆</div>
                <h3 className="font-pixel text-[10px] text-white mb-2">ACHIEVEMENTS</h3>
                <p className="font-pixel text-[8px] text-purple-300">VIEW BADGES</p>
                <div className="mt-3 flex justify-center gap-1">
                  <div className="w-2 h-2 bg-purple-400"></div>
                  <div className="w-2 h-2 bg-purple-400"></div>
                  <div className="w-2 h-2 bg-purple-400"></div>
                </div>
              </button>

              {/* Parent Portal */}
              <button
                onClick={() => navigate('/portal')}
                className="bg-blue-800 border-4 border-blue-500 p-6 hover:bg-blue-700 transition-colors pixel-btn group"
              >
                <div className="text-5xl mb-3 group-hover:bounce-pixel">👨‍👩‍👧‍👦</div>
                <h3 className="font-pixel text-[10px] text-white mb-2">PARENT HQ</h3>
                <p className="font-pixel text-[8px] text-blue-300">CONNECT</p>
                <div className="mt-3 flex justify-center gap-1">
                  <div className="w-2 h-2 bg-blue-400"></div>
                  <div className="w-2 h-2 bg-blue-400"></div>
                  <div className="w-2 h-2 bg-blue-400"></div>
                </div>
              </button>
            </div>
          </PixelCard>

          {/* Footer decoration */}
          <div className="mt-8 text-center">
            <div className="flex justify-center gap-2 mb-2">
              {['❤️', '❤️', '❤️'].map((heart, i) => (
                <span key={i} className="text-xl pixel-glow" style={{ animationDelay: `${i * 0.2}s` }}>
                  {heart}
                </span>
              ))}
            </div>
            <p className="font-pixel text-[8px] text-gray-600">
              ★ STUDY QUEST v1.0 ★
            </p>
          </div>
        </div>
      </div>
    </>
  );
}