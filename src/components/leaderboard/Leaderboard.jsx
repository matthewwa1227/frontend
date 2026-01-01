// frontend/src/components/leaderboard/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { getUser } from '../../utils/auth';
import { leaderboardAPI } from '../../utils/api';
import PixelCard from '../shared/PixelCard';
import { 
  Trophy, 
  Medal, 
  Star, 
  Clock, 
  Flame, 
  Users,
  TrendingUp,
  Crown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

export default function Leaderboard() {
  const currentUser = getUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'weekly', 'monthly'
  const [sortBy, setSortBy] = useState('points'); // 'points', 'study_time', 'streak'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter, sortBy, currentPage]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await leaderboardAPI.getLeaderboard({
        timeFilter,
        sortBy,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      });

      setLeaderboard(response.data.leaderboard || []);
      setUserRank(response.data.userRank || null);
      setTotalPages(response.data.totalPages || 1);

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="font-pixel text-lg text-gray-400">#{rank}</span>;
    }
  };

  const getRankBorderColor = (rank) => {
    switch (rank) {
      case 1:
        return 'border-yellow-400 bg-yellow-400/10';
      case 2:
        return 'border-gray-300 bg-gray-300/10';
      case 3:
        return 'border-amber-600 bg-amber-600/10';
      default:
        return 'border-pixel-accent';
    }
  };

  const getAvatarUrl = (user) => {
    if (user?.avatar_url) return user.avatar_url;
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'F7DC6F', 'BB8FCE', '58D68D'];
    const colorIndex = (user?.username || 'user').charCodeAt(0) % colors.length;
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.username || 'user'}&backgroundColor=${colors[colorIndex]}`;
  };

  const formatStudyTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'points':
        return 'Total Points';
      case 'study_time':
        return 'Study Time';
      case 'streak':
        return 'Current Streak';
      default:
        return 'Points';
    }
  };

  const getTimeLabel = () => {
    switch (timeFilter) {
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      default:
        return 'All Time';
    }
  };

  const filteredLeaderboard = leaderboard.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pixel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-pixel text-sm">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-dark px-4">
        <div className="bg-red-900 border-4 border-red-600 p-8 max-w-md">
          <p className="text-white font-pixel text-sm mb-4">⚠️ {error}</p>
          <button
            onClick={fetchLeaderboard}
            className="w-full bg-pixel-gold border-4 border-white py-2 font-pixel text-sm hover:bg-yellow-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-pixel text-white mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-pixel-gold" />
          Leaderboard
          <Trophy className="w-8 h-8 text-pixel-gold" />
        </h1>
        <p className="text-sm font-pixel text-gray-400">
          Compete with fellow students and climb the ranks!
        </p>
      </div>

      {/* User's Current Rank Card */}
      {userRank && (
        <PixelCard className="mb-8 border-pixel-gold">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-pixel-gold overflow-hidden">
                <img 
                  src={getAvatarUrl(currentUser)} 
                  alt="Your Avatar"
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div>
                <p className="font-pixel text-sm text-white">Your Ranking</p>
                <p className="font-mono text-xs text-gray-400">@{currentUser?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-pixel text-pixel-gold">#{userRank.rank}</p>
                <p className="text-xs font-pixel text-gray-400">Rank</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-pixel text-pixel-success">{userRank.total_points}</p>
                <p className="text-xs font-pixel text-gray-400">Points</p>
              </div>
              <div className="text-center hidden sm:block">
                <p className="text-xl font-pixel text-pixel-info">
                  {formatStudyTime(userRank.total_study_minutes)}
                </p>
                <p className="text-xs font-pixel text-gray-400">Study Time</p>
              </div>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full bg-pixel-primary border-2 border-pixel-accent pl-10 pr-4 py-2 text-white font-mono text-sm focus:border-pixel-gold outline-none"
          />
        </div>

        {/* Time Filter */}
        <div className="flex gap-2">
          {['all', 'weekly', 'monthly'].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setTimeFilter(filter);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 font-pixel text-xs border-2 transition-colors ${
                timeFilter === filter
                  ? 'bg-pixel-gold border-white text-black'
                  : 'bg-pixel-primary border-pixel-accent text-gray-400 hover:border-pixel-gold'
              }`}
            >
              {filter === 'all' ? 'All Time' : filter === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-pixel text-gray-400">Sort by:</span>
        {['points', 'study_time', 'streak'].map((sort) => (
          <button
            key={sort}
            onClick={() => {
              setSortBy(sort);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 font-pixel text-xs border-2 transition-colors ${
              sortBy === sort
                ? 'bg-pixel-info border-white text-white'
                : 'bg-pixel-dark border-pixel-accent text-gray-400 hover:border-pixel-info'
            }`}
          >
            {sort === 'points' ? 'Points' : sort === 'study_time' ? 'Time' : 'Streak'}
          </button>
        ))}
      </div>

      {/* Top 3 Podium (only on first page with no search) */}
      {currentPage === 1 && !searchQuery && filteredLeaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Second Place */}
          <div className="order-1 mt-8">
            <div className="bg-pixel-primary border-4 border-gray-300 p-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 mx-auto border-2 border-gray-300 overflow-hidden mb-2">
                  <img 
                    src={getAvatarUrl(filteredLeaderboard[1])} 
                    alt="2nd Place"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <Medal className="w-6 h-6 text-gray-300 absolute -top-2 -right-2" />
              </div>
              <p className="font-pixel text-sm text-white truncate">
                {filteredLeaderboard[1]?.username}
              </p>
              <p className="font-pixel text-lg text-gray-300">
                {filteredLeaderboard[1]?.total_points} pts
              </p>
              <p className="text-xs font-mono text-gray-400">2nd Place</p>
            </div>
          </div>

          {/* First Place */}
          <div className="order-2">
            <div className="bg-pixel-primary border-4 border-yellow-400 p-4 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="relative mt-4">
                <div className="w-20 h-20 mx-auto border-2 border-yellow-400 overflow-hidden mb-2">
                  <img 
                    src={getAvatarUrl(filteredLeaderboard[0])} 
                    alt="1st Place"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
              <p className="font-pixel text-sm text-white truncate">
                {filteredLeaderboard[0]?.username}
              </p>
              <p className="font-pixel text-xl text-yellow-400">
                {filteredLeaderboard[0]?.total_points} pts
              </p>
              <p className="text-xs font-mono text-yellow-400">🏆 Champion</p>
            </div>
          </div>

          {/* Third Place */}
          <div className="order-3 mt-12">
            <div className="bg-pixel-primary border-4 border-amber-600 p-4 text-center">
              <div className="relative">
                <div className="w-14 h-14 mx-auto border-2 border-amber-600 overflow-hidden mb-2">
                  <img 
                    src={getAvatarUrl(filteredLeaderboard[2])} 
                    alt="3rd Place"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <Medal className="w-5 h-5 text-amber-600 absolute -top-1 -right-1" />
              </div>
              <p className="font-pixel text-xs text-white truncate">
                {filteredLeaderboard[2]?.username}
              </p>
              <p className="font-pixel text-md text-amber-600">
                {filteredLeaderboard[2]?.total_points} pts
              </p>
              <p className="text-xs font-mono text-gray-400">3rd Place</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <PixelCard title={`${getTimeLabel()} Rankings - ${getSortLabel()}`} icon="📊">
        {filteredLeaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white font-pixel text-sm mb-2">No players found</p>
            <p className="text-gray-400 font-pixel text-xs">
              {searchQuery ? 'Try a different search term' : 'Be the first to join!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLeaderboard.map((player, index) => {
              const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
              const isCurrentUser = player.id === currentUser?.id;
              
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 p-4 border-2 transition-all ${
                    isCurrentUser 
                      ? 'border-pixel-gold bg-pixel-gold/10' 
                      : getRankBorderColor(rank)
                  } hover:border-pixel-gold`}
                >
                  {/* Rank */}
                  <div className="w-12 flex justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 border-2 border-pixel-accent overflow-hidden flex-shrink-0">
                      <img 
                        src={getAvatarUrl(player)} 
                        alt={player.username}
                        className="w-full h-full object-cover"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-pixel text-sm text-white truncate">
                        {player.full_name || player.username}
                        {isCurrentUser && <span className="text-pixel-gold ml-2">(You)</span>}
                      </p>
                      <p className="text-xs font-mono text-gray-400">
                        Level {player.current_level || 1} • @{player.username}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-pixel-info" />
                        <span className="font-mono text-xs text-gray-400">
                          {formatStudyTime(player.total_study_minutes)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="hidden md:block">
                      <div className="flex items-center gap-1 justify-end">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="font-mono text-xs text-gray-400">
                          {player.streak_days || 0}d
                        </span>
                      </div>
                    </div>

                    <div className="min-w-16 text-right">
                      <p className="font-pixel text-lg text-pixel-gold">
                        {sortBy === 'points' && player.total_points}
                        {sortBy === 'study_time' && formatStudyTime(player.total_study_minutes)}
                        {sortBy === 'streak' && `${player.streak_days}d`}
                      </p>
                      <p className="text-xs font-mono text-gray-500">
                        {sortBy === 'points' && 'pts'}
                        {sortBy === 'study_time' && 'studied'}
                        {sortBy === 'streak' && 'streak'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t-2 border-pixel-accent">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 font-pixel text-xs border-2 border-pixel-accent text-gray-400 hover:border-pixel-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 font-pixel text-xs border-2 ${
                      currentPage === pageNum
                        ? 'bg-pixel-gold border-white text-black'
                        : 'border-pixel-accent text-gray-400 hover:border-pixel-gold'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 font-pixel text-xs border-2 border-pixel-accent text-gray-400 hover:border-pixel-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </PixelCard>

      {/* Legend */}
      <div className="mt-6 p-4 bg-pixel-primary border-2 border-pixel-accent">
        <p className="font-pixel text-xs text-gray-400 mb-2">🎮 How to Climb:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-pixel-gold" />
            <span>Earn XP from study sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Maintain daily streaks</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-pixel-success" />
            <span>Unlock achievements</span>
          </div>
        </div>
      </div>
    </div>
  );
}