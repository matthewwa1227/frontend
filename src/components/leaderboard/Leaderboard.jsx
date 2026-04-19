import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { leaderboardAPI } from '../../utils/api';

// Layout Components
import TopAppBar from '../layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../layout/SideNavBar';

const Leaderboard = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [user, setUser] = useState(currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'weekly', 'monthly'
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation items
  const navItems = [
    // Main Navigation
    { id: 'dashboard', label: 'DASHBOARD', icon: 'target', href: '/dashboard', category: 'main' },
    { id: 'tasks', label: 'QUEST LOG', icon: 'checklist', href: '/tasks', category: 'main' },
    { id: 'timer', label: 'CHAMBER OF FOCUS', icon: 'timer', href: '/timer', category: 'main' },
    { id: 'progress', label: 'PROGRESS', icon: 'trending_up', href: '/progress', category: 'main' },
    { id: 'social', label: 'SOCIAL', icon: 'groups', href: '/social', category: 'main' },
    { id: 'leaderboard', label: 'LEADERBOARD', icon: 'trophy', href: '/leaderboard', category: 'main' },
    
    // Study Tools
    { id: 'study-buddy', label: 'STUDY BUDDY', icon: 'chat', href: '/study-buddy', category: 'study' },
    { id: 'newquest', label: 'NEWQUEST', icon: 'smart_toy', href: '/newquest', category: 'study' },
    { id: 'archive', label: 'ARCHIVE', icon: 'book-open', href: '/archive-alchemist', category: 'study' },
    { id: 'schedule', label: 'SCHEDULE', icon: 'calendar_month', href: '/schedule', category: 'study' },
    { id: 'exercise-gen', label: 'EXERCISE GEN', icon: 'edit_document', href: '/exercise-generator', category: 'study' },
    
    // More
    { id: 'portal', label: 'PARENTS', icon: 'family_restroom', href: '/portal', category: 'more' },
    { id: 'profile', label: 'PROFILE', icon: 'person', href: '/profile', category: 'more' },
  ];

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getLeaderboard({
        timeFilter,
        limit: 10
      });

      const data = response.data?.leaderboard || getDefaultLeaderboard();
      setLeaderboard(data);
      
      // Find user's rank
      const userEntry = data.find(p => p.id === currentUser?.id);
      if (userEntry) {
        setUserRank(userEntry);
      } else {
        setUserRank({
          rank: 14,
          username: currentUser?.username || 'NeonScholar',
          level: currentUser?.level || 45,
          xp: currentUser?.xp || 12450,
          total_study_minutes: 5292
        });
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard(getDefaultLeaderboard());
      setUserRank({
        rank: 14,
        username: currentUser?.username || 'NeonScholar',
        level: 45,
        xp: 12450,
        total_study_minutes: 5292
      });
    } finally {
      setLoading(false);
    }
  };

  // Default leaderboard data
  const getDefaultLeaderboard = () => [
    { id: 1, rank: 1, username: 'ARCH_SCRIBE', level: 99, xp: 98500, total_study_minutes: 4520, specialty: 'HISTORY' },
    { id: 2, rank: 2, username: 'CYBERMAGE_9', level: 88, xp: 82100, total_study_minutes: 3890, specialty: 'MATH' },
    { id: 3, rank: 3, username: 'PIXEL_REAPER', level: 74, xp: 76400, total_study_minutes: 3240, specialty: 'SCIENCE' },
    { id: 4, rank: 4, username: 'TECHNO_KNIGHT', level: 62, xp: 42500, total_study_minutes: 9260, specialty: 'MATH' },
    { id: 5, rank: 5, username: 'DATA_DRIFTER', level: 59, xp: 39120, total_study_minutes: 8535, specialty: 'ENGLISH' },
    { id: 6, rank: 6, username: 'BINARY_BARD', level: 55, xp: 35900, total_study_minutes: 8320, specialty: 'COMPUTING' },
  ];

  // Get top 3 for podium
  const topThree = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);

  // Format study time
  const formatStudyTime = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format XP
  const formatXP = (xp) => {
    return xp?.toLocaleString() || '0';
  };

  // Get podium colors
  const getPodiumColor = (rank) => {
    switch (rank) {
      case 1: return { border: 'border-tertiary', bg: 'bg-tertiary', text: 'text-tertiary', height: 'h-48' };
      case 2: return { border: 'border-secondary', bg: 'bg-secondary', text: 'text-secondary', height: 'h-32' };
      case 3: return { border: 'border-error', bg: 'bg-error', text: 'text-error', height: 'h-24' };
      default: return { border: 'border-outline', bg: 'bg-outline', text: 'text-outline', height: 'h-16' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar title="HALL OF HEROES" user={currentUser} />
        <main className="lg:ml-64 pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-surface-container w-full" />
              <div className="h-64 bg-surface-container w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopAppBar 
        title="HALL OF HEROES" 
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation */}
      <SideNavBar 
        items={navItems} 
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeItem="leaderboard"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item && item.href) {
            navigate(item.href);
          }
        }}
      />

      {/* Main Content Canvas */}
      <main className="lg:ml-64 pt-24 px-4 md:px-8 pb-32 lg:pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
          {/* Header Section */}
          <header className="col-span-12 flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black font-headline text-primary uppercase tracking-tighter mb-2 italic">
                Hall of Heroes
              </h1>
              <p className="text-secondary font-body font-medium opacity-80">
                The eternal ranking of the realm's most disciplined scholars.
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="FIND SCHOLAR..."
                  className="w-full bg-surface-container-low border-2 border-outline-variant p-3 font-retro text-[10px] text-on-surface focus:border-primary focus:ring-0 outline-none placeholder:opacity-40"
                />
                <span className="material-symbols-outlined absolute right-3 top-3 text-primary-fixed-dim">search</span>
              </div>
              {/* Filter Tabs */}
              <div className="flex bg-surface-container-highest p-1 border-2 border-outline-variant">
                {['all', 'weekly', 'monthly'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-2 font-retro text-[8px] uppercase transition-colors ${
                      timeFilter === filter
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {filter === 'all' ? 'ALL TIME' : filter}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Hall of Fame (Podiums) & Ranking Table */}
          <section className="col-span-12 lg:col-span-9">
            {/* Podium Section */}
            {topThree.length >= 3 && (
              <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-12">
                {/* Rank 2 */}
                <div className="flex flex-col items-center order-2 md:order-1 flex-1">
                  <div className="mb-4 relative">
                    <div className="w-16 h-16 bg-surface-container-highest p-2 border-4 border-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-secondary">workspace_premium</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container border-t-4 border-l-4 border-r-4 border-secondary p-4 flex flex-col items-center">
                    <span className="font-retro text-[10px] text-secondary mb-1">{topThree[1]?.username}</span>
                    <span className="font-retro text-[8px] opacity-60">LVL {topThree[1]?.level}</span>
                  </div>
                  <div className="w-full h-32 bg-surface-container-highest border-4 border-secondary flex flex-col items-center justify-center">
                    <span className="font-retro text-4xl text-secondary opacity-20">2</span>
                  </div>
                </div>

                {/* Rank 1 */}
                <div className="flex flex-col items-center order-1 md:order-2 flex-1 relative -top-6">
                  <div className="mb-4 relative">
                    <div className="absolute -inset-4 bg-tertiary opacity-10 blur-xl"></div>
                    <div className="w-24 h-24 bg-surface-container-highest p-4 border-4 border-tertiary flex items-center justify-center relative">
                      <span className="material-symbols-outlined text-6xl text-tertiary">emoji_events</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container border-t-4 border-l-4 border-r-4 border-tertiary p-6 flex flex-col items-center">
                    <span className="font-retro text-[12px] text-tertiary mb-1">{topThree[0]?.username}</span>
                    <span className="font-retro text-[10px] opacity-60">LVL {topThree[0]?.level}</span>
                  </div>
                  <div className="w-full h-48 bg-surface-container-highest border-4 border-tertiary flex flex-col items-center justify-center">
                    <span className="font-retro text-6xl text-tertiary opacity-30">1</span>
                  </div>
                </div>

                {/* Rank 3 */}
                <div className="flex flex-col items-center order-3 flex-1">
                  <div className="mb-4 relative">
                    <div className="w-16 h-16 bg-surface-container-highest p-2 border-4 border-error flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-error">workspace_premium</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container border-t-4 border-l-4 border-r-4 border-error p-4 flex flex-col items-center">
                    <span className="font-retro text-[10px] text-error mb-1">{topThree[2]?.username}</span>
                    <span className="font-retro text-[8px] opacity-60">LVL {topThree[2]?.level}</span>
                  </div>
                  <div className="w-full h-24 bg-surface-container-highest border-4 border-error flex flex-col items-center justify-center">
                    <span className="font-retro text-3xl text-error opacity-20">3</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ranking Table */}
            <div className="overflow-x-auto border-4 border-surface-container">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container text-primary font-retro text-[10px] uppercase">
                  <tr>
                    <th className="p-4">Rank</th>
                    <th className="p-4">Scholar</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Experience</th>
                    <th className="p-4">Study Time</th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm divide-y-4 divide-surface-container">
                  {restOfList.map((player, index) => {
                    const rank = index + 4;
                    const isCurrentUser = player.id === currentUser?.id;
                    
                    return (
                      <tr 
                        key={player.id} 
                        className={`${isCurrentUser ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low hover:bg-surface-container-high'} transition-colors`}
                      >
                        <td className="p-4 font-retro text-[10px] text-secondary">#{rank}</td>
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-surface-container-highest"></div>
                          <span className={`font-headline font-bold ${isCurrentUser ? '' : 'text-on-surface'}`}>
                            {player.username} {isCurrentUser && '(YOU)'}
                          </span>
                        </td>
                        <td className={`p-4 ${isCurrentUser ? '' : 'text-tertiary'}`}>LVL {player.level}</td>
                        <td className="p-4">{formatXP(player.xp || player.total_points)} XP</td>
                        <td className={`p-4 ${isCurrentUser ? '' : 'opacity-70'}`}>{formatStudyTime(player.total_study_minutes)}</td>
                      </tr>
                    );
                  })}
                  
                  {/* User's row if not in top list */}
                  {userRank && !restOfList.find(p => p.id === currentUser?.id) && (
                    <tr className="bg-primary-container text-on-primary border-y-4 border-primary">
                      <td className="p-4 font-retro text-[10px]">#{userRank.rank || 14}</td>
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-on-primary"></div>
                        <span className="font-headline font-bold">{userRank.username || currentUser?.username} (YOU)</span>
                      </td>
                      <td className="p-4">LVL {userRank.level || currentUser?.level}</td>
                      <td className="p-4">{formatXP(userRank.xp || userRank.total_points || currentUser?.xp)} XP</td>
                      <td className="p-4 font-medium">{formatStudyTime(userRank.total_study_minutes)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            {/* Your Status Widget */}
            {userRank && (
              <div className="bg-surface-container p-6 relative overflow-hidden border-4 border-primary-container">
                <div className="absolute top-0 right-0 p-2 bg-primary-container text-on-primary font-retro text-[8px]">ACTIVE</div>
                <h3 className="font-retro text-[10px] text-primary mb-6">YOUR STANDING</h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black font-headline text-secondary tracking-tighter">#{userRank.rank || 14}</span>
                  <span className="font-retro text-[8px] text-on-surface opacity-50 mb-1">IN REALM</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between font-retro text-[8px] mb-2">
                      <span>NEXT RANK</span>
                      <span>85%</span>
                    </div>
                    <div className="h-4 w-full bg-surface-container-highest">
                      <div className="h-full bg-gradient-to-r from-secondary to-secondary-container segmented-progress" style={{ width: '85%' }}></div>
                    </div>
                    <p className="mt-2 font-body text-xs text-on-surface-variant italic">Only 1,200 XP until Rank #{Math.max(1, (userRank.rank || 14) - 1)}!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Guild Standings */}
            <div className="bg-surface-container p-6 border-l-4 border-tertiary">
              <h3 className="font-retro text-[10px] text-tertiary mb-6">GUILD STANDINGS</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="font-retro text-[12px] text-secondary">01</span>
                  <div>
                    <div className="font-headline font-bold text-on-surface uppercase tracking-wide">VOID WALKERS</div>
                    <div className="font-retro text-[8px] text-tertiary">1.2M TOTAL XP</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-retro text-[12px] text-secondary opacity-60">02</span>
                  <div>
                    <div className="font-headline font-bold text-on-surface uppercase tracking-wide">NEON ARCHIVES</div>
                    <div className="font-retro text-[8px] text-tertiary">980K TOTAL XP</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-retro text-[12px] text-secondary opacity-40">03</span>
                  <div>
                    <div className="font-headline font-bold text-on-surface uppercase tracking-wide">PIXEL PALADINS</div>
                    <div className="font-retro text-[8px] text-tertiary">845K TOTAL XP</div>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-2 border-2 border-tertiary text-tertiary font-retro text-[8px] hover:bg-tertiary hover:text-on-tertiary transition-colors">
                VIEW ALL GUILDS
              </button>
            </div>

            {/* Ad/Teaser */}
            <div className="relative group cursor-pointer bg-surface-container-highest h-48 flex items-center justify-center border-4 border-outline-variant overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-tertiary/20 opacity-30 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative text-center p-4">
                <div className="font-retro text-[10px] text-primary mb-2">END OF SEASON REWARD</div>
                <div className="font-headline font-black text-2xl uppercase italic">The Relic Blade</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavBar 
        items={navItems.filter(i => ['dashboard', 'tasks', 'timer', 'social'].includes(i.id))} 
        activeItem="leaderboard"
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />
    </div>
  );
};

export default Leaderboard;
