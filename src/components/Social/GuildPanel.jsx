import React from 'react';
import { cn } from '../../utils/cn';
import PlayerCard from './PlayerCard';

/**
 * GuildPanel - Guild management and member display
 * Shows guild stats, member list, and activity feed
 * 
 * @param {Object} props
 * @param {Object} props.guild - Guild data
 * @param {Array} props.members - Guild members
 * @param {Array} props.activities - Recent guild activities
 * @param {string} props.className - Additional CSS classes
 */
const GuildPanel = ({
  guild,
  members = [],
  activities = [],
  className = '',
}) => {
  const guildData = guild || {
    name: 'NEON SCHOLARS',
    tag: 'NS',
    rank: 3,
    league: 'S4',
    totalXP: 45000,
    memberCount: 12,
    maxMembers: 20,
    weeklyGoal: 5000,
    weeklyProgress: 4550,
  };

  const defaultMembers = [
    { id: 1, name: 'GUILD_MASTER', level: 85, power: 15000, status: 'online', role: 'LEADER', specialty: 'MATH' },
    { id: 2, name: 'VOID_WALKER', level: 72, power: 12800, status: 'studying', role: 'OFFICER', specialty: 'SCIENCE' },
    { id: 3, name: 'CYBER_SCRIBE', level: 68, power: 11200, status: 'online', role: 'OFFICER', specialty: 'ENGLISH' },
    { id: 4, name: 'PIXEL_MAGE', level: 55, power: 8900, status: 'idle', role: 'MEMBER', specialty: 'HISTORY' },
    { id: 5, name: 'STUDY_WARRIOR', level: 42, power: 7200, status: 'offline', role: 'MEMBER', specialty: 'MATH' },
    { id: 6, name: 'CODE_NINJA', level: 38, power: 6500, status: 'online', role: 'MEMBER', specialty: 'SCIENCE' },
  ];

  const memberList = members.length > 0 ? members : defaultMembers;

  const defaultActivities = [
    { id: 1, type: 'achievement', user: 'VOID_WALKER', text: 'completed Calculus Trial!', xp: 500, time: '2 min ago' },
    { id: 2, type: 'levelup', user: 'ARCHMAGE_DEB', text: 'reached Level 42!', time: '15 min ago' },
    { id: 3, type: 'join', user: 'PIXEL_MAGE', text: 'joined the guild!', time: '1 hour ago' },
    { id: 4, type: 'quest', user: 'CYBER_SCRIBE', text: 'completed a LEGENDARY quest!', xp: 300, time: '2 hours ago' },
  ];

  const activityFeed = activities.length > 0 ? activities : defaultActivities;

  // Role styling
  const roleStyles = {
    LEADER: { color: 'text-tertiary', bg: 'bg-tertiary/20', label: 'LEADER' },
    OFFICER: { color: 'text-primary', bg: 'bg-primary/20', label: 'OFFICER' },
    MEMBER: { color: 'text-secondary', bg: 'bg-secondary/20', label: 'MEMBER' },
  };

  // Activity type icons
  const activityIcons = {
    achievement: 'emoji_events',
    levelup: 'trending_up',
    join: 'person_add',
    quest: 'scroll',
  };

  return (
    <div className={cn("grid grid-cols-12 gap-6", className)}>
      {/* Left Column - Guild Stats & Members */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Guild Header */}
        <div className="bg-surface-container border-2 border-outline-variant p-6 shadow-[4px_4px_0px_0px_#150136]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Guild Info */}
            <div className="flex items-center gap-4">
              {/* Guild Emblem */}
              <div className="w-16 h-16 bg-tertiary/20 border-4 border-tertiary flex items-center justify-center shadow-[4px_4px_0px_0px_#4c3f00]">
                <span className="material-symbols-outlined text-3xl text-tertiary">shield</span>
              </div>
              
              <div>
                <h2 className="font-['Press_Start_2P'] text-lg text-tertiary mb-1">
                  {guildData.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="font-['Press_Start_2P'] text-[8px] text-secondary">
                    RANK #{guildData.rank} IN {guildData.league} LEAGUE
                  </span>
                  <span className="text-on-surface-variant">•</span>
                  <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">
                    {guildData.memberCount}/{guildData.maxMembers} MEMBERS
                  </span>
                </div>
              </div>
            </div>

            {/* Guild XP */}
            <div className="text-right">
              <div className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant mb-1">
                COLLECTIVE POWER
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="material-symbols-outlined text-tertiary">bolt</span>
                <span className="font-['Press_Start_2P'] text-xl text-tertiary">
                  {guildData.totalXP.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="mt-6 pt-6 border-t border-outline-variant">
            <div className="flex justify-between items-center mb-2">
              <span className="font-['Press_Start_2P'] text-[8px] text-secondary">
                WEEKLY GUILD GOAL
              </span>
              <span className="font-['Press_Start_2P'] text-[8px] text-tertiary">
                {guildData.weeklyProgress.toLocaleString()} / {guildData.weeklyGoal.toLocaleString()} XP
              </span>
            </div>
            <div className="h-3 bg-surface-container-lowest border border-outline-variant overflow-hidden">
              <div 
                className="h-full bg-tertiary pixel-segmented transition-all duration-500"
                style={{ width: `${(guildData.weeklyProgress / guildData.weeklyGoal) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-right">
              <span className="font-['Press_Start_2P'] text-[8px] text-primary">
                {guildData.weeklyGoal - guildData.weeklyProgress} XP AWAY FROM RANK #{guildData.rank - 1}
              </span>
            </div>
          </div>
        </div>

        {/* Member List */}
        <div className="bg-surface-container border-2 border-outline-variant">
          <div className="p-4 border-b-2 border-outline-variant bg-surface-container-high">
            <h3 className="font-['Press_Start_2P'] text-[10px] text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined">groups</span>
              MEMBERS ({memberList.length})
            </h3>
          </div>
          
          <div className="divide-y divide-outline-variant/30">
            {memberList.map((member) => {
              const roleStyle = roleStyles[member.role] || roleStyles.MEMBER;
              
              return (
                <div 
                  key={member.id}
                  className="p-4 flex items-center gap-4 hover:bg-surface-container-high transition-colors"
                >
                  {/* Avatar & Info */}
                  <div className="flex-1">
                    <PlayerCard player={member} size="small" />
                  </div>

                  {/* Role Badge */}
                  <div className={cn("px-2 py-1 font-['Press_Start_2P'] text-[6px] uppercase border", roleStyle.color, roleStyle.bg, `border-${roleStyle.color.replace('text-', '')}`)}>
                    {roleStyle.label}
                  </div>

                  {/* Action */}
                  {member.status === 'online' && (
                    <button className="px-3 py-2 bg-primary/20 text-primary font-['Press_Start_2P'] text-[6px] border border-primary hover:bg-primary hover:text-on-primary transition-colors">
                      INVITE TO STUDY
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column - Activity Feed */}
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-surface-container border-2 border-outline-variant h-full max-h-[600px] flex flex-col shadow-[4px_4px_0px_0px_#150136]">
          <div className="p-4 border-b-2 border-outline-variant bg-surface-container-high">
            <h3 className="font-['Press_Start_2P'] text-[10px] text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined">chat</span>
              GUILD ACTIVITY
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-pixel">
            {activityFeed.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center flex-shrink-0",
                  activity.type === 'achievement' && "bg-tertiary/20 border border-tertiary",
                  activity.type === 'levelup' && "bg-primary/20 border border-primary",
                  activity.type === 'join' && "bg-secondary/20 border border-secondary",
                  activity.type === 'quest' && "bg-primary-container border border-primary"
                )}>
                  <span className={cn(
                    "material-symbols-outlined text-sm",
                    activity.type === 'achievement' && "text-tertiary",
                    activity.type === 'levelup' && "text-primary",
                    activity.type === 'join' && "text-secondary",
                    activity.type === 'quest' && "text-primary"
                  )}>
                    {activityIcons[activity.type] || 'notifications'}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-on-surface">
                    <span className="font-bold text-primary">{activity.user}</span>
                    {' '}{activity.text}
                  </p>
                  {activity.xp && (
                    <p className="font-['Press_Start_2P'] text-[8px] text-tertiary mt-1">
                      +{activity.xp} XP
                    </p>
                  )}
                  <p className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuildPanel;
