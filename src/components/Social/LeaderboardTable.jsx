import React from 'react';
import { cn } from '../../utils/cn';
import PlayerCard from './PlayerCard';

/**
 * LeaderboardTable - Displays ranked list of players
 * Top 3 have special styling (gold/silver/bronze)
 * 
 * @param {Object} props
 * @param {Array} props.players - Array of player data
 * @param {number} props.myRank - Current user's rank
 * @param {string} props.className - Additional CSS classes
 */
const LeaderboardTable = ({
  players = [],
  myRank = 14,
  className = '',
}) => {
  // Status configuration
  const statusConfig = {
    online: { color: 'bg-secondary', label: 'ONLINE' },
    idle: { color: 'bg-tertiary', label: 'IDLE' },
    studying: { color: 'bg-primary', label: 'STUDYING' },
    offline: { color: 'bg-outline-variant', label: 'OFFLINE' },
  };

  // Get rank styling
  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return {
          row: 'bg-tertiary/10 border-l-4 border-tertiary',
          rank: 'text-tertiary font-bold',
          icon: '👑',
          glow: 'shadow-[0_0_20px_rgba(233,196,0,0.2)]',
        };
      case 2:
        return {
          row: 'bg-secondary/10 border-l-4 border-secondary',
          rank: 'text-secondary font-bold',
          icon: '🥈',
          glow: '',
        };
      case 3:
        return {
          row: 'bg-primary/10 border-l-4 border-primary',
          rank: 'text-primary font-bold',
          icon: '🥉',
          glow: '',
        };
      default:
        return {
          row: 'hover:bg-surface-container-high',
          rank: 'text-on-surface-variant',
          icon: rank,
          glow: '',
        };
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Leaderboard Table */}
      <div className="bg-surface-container border-2 border-outline-variant overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b-2 border-outline-variant bg-surface-container-high font-['Press_Start_2P'] text-[8px] text-on-surface-variant">
          <div className="col-span-1">RANK</div>
          <div className="col-span-5">HERO</div>
          <div className="col-span-2">SPECIALTY</div>
          <div className="col-span-2">POWER</div>
          <div className="col-span-2">STATUS</div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b-2 border-outline-variant bg-surface-container-high font-['Press_Start_2P'] text-[8px] text-on-surface-variant">
          LEADERBOARD
        </div>

        {/* Table Body */}
        <div className="divide-y divide-outline-variant/30">
          {players.map((player, index) => {
            const style = getRankStyle(player.rank || index + 1);
            const status = statusConfig[player.status] || statusConfig.offline;
            
            return (
              <div
                key={player.id || index}
                className={cn(
                  "transition-all duration-200",
                  style.row,
                  style.glow
                )}
              >
                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                  {/* Rank */}
                  <div className={cn("col-span-1 font-['Press_Start_2P'] text-lg", style.rank)}>
                    {typeof style.icon === 'string' && style.icon.length > 1 
                      ? style.icon 
                      : `#${player.rank || index + 1}`}
                  </div>

                  {/* Hero */}
                  <div className="col-span-5">
                    <PlayerCard 
                      player={player} 
                      size="small" 
                      showStatus={false}
                    />
                  </div>

                  {/* Specialty */}
                  <div className="col-span-2">
                    <span className="font-['Press_Start_2P'] text-[8px] text-secondary uppercase">
                      {player.specialty}
                    </span>
                  </div>

                  {/* Power */}
                  <div className="col-span-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-tertiary text-sm">bolt</span>
                    <span className="font-['Press_Start_2P'] text-[10px] text-tertiary">
                      {player.power?.toLocaleString()}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className={cn("w-2 h-2", status.color, player.status === 'online' && "animate-pulse")} />
                    <span className={cn(
                      "font-['Press_Start_2P'] text-[8px] uppercase",
                      player.status === 'online' ? 'text-secondary' : 'text-on-surface-variant'
                    )}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden p-4">
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className={cn("font-['Press_Start_2P'] text-lg w-10", style.rank)}>
                      {player.rank || index + 1}
                    </div>
                    
                    {/* Player Info */}
                    <div className="flex-1">
                      <PlayerCard player={player} size="small" />
                    </div>
                    
                    {/* Power */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="material-symbols-outlined text-tertiary text-sm">bolt</span>
                        <span className="font-['Press_Start_2P'] text-[10px] text-tertiary">
                          {player.power?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <div className={cn("w-1.5 h-1.5", status.color)} />
                        <span className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant uppercase">
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Your Rank Widget */}
      <div className="bg-surface-container border-2 border-primary p-4 shadow-[4px_4px_0px_0px_#65002e]">
        <div className="text-center mb-4">
          <div className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant mb-1">
            YOUR RANK
          </div>
          <div className="font-['Press_Start_2P'] text-4xl text-primary">
            #{myRank}
          </div>
        </div>

        {/* Gap to top 10 */}
        <div className="bg-surface-container-high p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">
              TO TOP 10
            </span>
            <span className="font-['Press_Start_2P'] text-[10px] text-tertiary">
              1,240 HP
            </span>
          </div>
          <div className="h-2 bg-surface-container-lowest border border-outline-variant overflow-hidden">
            <div 
              className="h-full bg-primary pixel-segmented"
              style={{ width: '65%' }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full py-3 bg-primary-container text-on-primary-container font-['Press_Start_2P'] text-[10px] border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all hover:brightness-110">
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">sports_esports</span>
            ENTER ARENA
          </span>
        </button>
      </div>
    </div>
  );
};

/**
 * MVPSpotlight - Weekly top performer spotlight card
 */
export const MVPSpotlight = ({ player, className = '' }) => {
  if (!player) return null;

  return (
    <div className={cn(
      "bg-surface-container border-l-8 border-primary-container p-6 relative overflow-hidden",
      className
    )}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex flex-col md:flex-row items-center gap-6">
        {/* MVP Badge */}
        <div className="absolute -top-2 -left-2 md:static md:mb-0">
          <div className="bg-tertiary text-on-tertiary px-3 py-1 font-['Press_Start_2P'] text-[8px] border-2 border-on-tertiary shadow-[0_0_15px_#e9c400]">
            ⭐ MVP
          </div>
        </div>

        {/* Player Card (Large) */}
        <PlayerCard player={player} size="large" className="flex-1 bg-transparent border-none shadow-none" />

        {/* Extra Stats */}
        <div className="md:w-48 space-y-3">
          <div className="bg-surface-container-high p-3 border border-outline-variant">
            <div className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant mb-1">WEEKLY XP</div>
            <div className="font-['Press_Start_2P'] text-lg text-tertiary">
              +{player.weeklyXP?.toLocaleString() || '2,450'}
            </div>
          </div>
          
          <div className="bg-surface-container-high p-3 border border-outline-variant">
            <div className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant mb-1">SESSIONS</div>
            <div className="font-['Press_Start_2P'] text-lg text-secondary">
              {player.weeklySessions || 23}
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-4 right-4 hidden md:block">
        <span className="font-['Press_Start_2P'] text-[10px] text-primary opacity-50">
          LOREMASTER OF THE WEEK
        </span>
      </div>
    </div>
  );
};

export default LeaderboardTable;
